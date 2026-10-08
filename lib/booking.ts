// Fechas, tarifas y disponibilidad. Las fechas viajan como "YYYY-MM-DD" (hora local)
// y una estadía [checkIn, checkOut) ocupa las noches desde checkIn hasta el día anterior a checkOut.
export type ISO = string;

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date): ISO => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: ISO) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());
export const addDays = (s: ISO, n: number) => {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const diffDays = (a: ISO, b: ISO) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);
export const nightsOf = (checkIn: ISO, checkOut: ISO) => {
  const out: ISO[] = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) out.push(d);
  return out;
};

export const fmtDay = (s: ISO, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  fromISO(s).toLocaleDateString("es-AR", opts).replace(/\./g, "");
export const fmtMonth = (s: ISO) => fromISO(s).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
export const money = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
export const moneyShort = (n: number) => `$${Math.round(n / 1000)}k`;

export type Season = { id: string; name: string; start: ISO; end: ISO; nightly: number; minNights: number };

export type Settings = {
  baseNightly: number;
  baseMinNights: number;
  weekendPct: number;
  cleaningFee: number;
  longStayNights: number;
  longStayPct: number;
  dayGuestFee: number;
  depositPct: number;
  maxGuests: number;
  seasons: Season[];
};

export type Block = { id: string; start: ISO; end: ISO; note: string; source: "manual" | "ical" | "ejemplo" };

export type RequestStatus = "pendiente" | "confirmada" | "rechazada";

export type BookingRequest = {
  id: string;
  code: string;
  createdAt: string;
  checkIn: ISO;
  checkOut: ISO;
  adults: number;
  children: number;
  infants: number;
  pets: boolean;
  dayGuests: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  arrival: string;
  message: string;
  total: number;
  status: RequestStatus;
  demo?: boolean;
};

export type SyncConfig = { airbnbIcal: string; bookingIcal: string; bookingUrl: string; lastImport: string | null };

export type DB = { version: 1; settings: Settings; blocks: Block[]; requests: BookingRequest[]; sync: SyncConfig };

/** Noches ocupadas: bloqueos + solicitudes pendientes o confirmadas. */
export function bookedNights(db: DB): Set<ISO> {
  const set = new Set<ISO>();
  for (const b of db.blocks) nightsOf(b.start, b.end).forEach((n) => set.add(n));
  for (const r of db.requests) if (r.status !== "rechazada") nightsOf(r.checkIn, r.checkOut).forEach((n) => set.add(n));
  return set;
}

export function seasonFor(night: ISO, s: Settings): Season | null {
  let best: Season | null = null;
  for (const se of s.seasons) if (se.start <= night && night <= se.end && (!best || se.nightly > best.nightly)) best = se;
  return best;
}

const isWeekendNight = (night: ISO) => {
  const wd = fromISO(night).getDay();
  return wd === 5 || wd === 6;
};

export function nightlyRate(night: ISO, s: Settings) {
  const season = seasonFor(night, s);
  const base = season ? season.nightly : s.baseNightly;
  return isWeekendNight(night) ? Math.round(base * (1 + s.weekendPct / 100)) : base;
}

export const minNightsFor = (checkIn: ISO, s: Settings) => seasonFor(checkIn, s)?.minNights ?? s.baseMinNights;

/** Último día posible de salida: la primera noche ocupada después de la llegada. */
export function maxCheckout(checkIn: ISO, booked: Set<ISO>, horizon = 400): ISO {
  for (let i = 1; i <= horizon; i++) {
    const d = addDays(checkIn, i);
    if (booked.has(d)) return d;
  }
  return addDays(checkIn, horizon);
}

export type QuoteLine = { label: string; nights: number; amount: number };
export type Quote = {
  nights: number;
  lines: QuoteLine[];
  weekendNights: number;
  lodging: number;
  discount: number;
  cleaning: number;
  dayGuests: number;
  dayGuestsAmount: number;
  total: number;
  deposit: number;
};

export function quote(checkIn: ISO, checkOut: ISO, s: Settings, dayGuests = 0): Quote {
  const nights = nightsOf(checkIn, checkOut);
  const byLabel = new Map<string, QuoteLine>();
  let weekendNights = 0;
  for (const n of nights) {
    const label = seasonFor(n, s)?.name ?? "Tarifa general";
    const line = byLabel.get(label) ?? { label, nights: 0, amount: 0 };
    line.nights += 1;
    line.amount += nightlyRate(n, s);
    byLabel.set(label, line);
    if (isWeekendNight(n)) weekendNights++;
  }
  const lodging = [...byLabel.values()].reduce((a, l) => a + l.amount, 0);
  const discount = nights.length >= s.longStayNights ? Math.round((lodging * s.longStayPct) / 100) : 0;
  const dayGuestsAmount = dayGuests * s.dayGuestFee;
  const total = lodging - discount + s.cleaningFee + dayGuestsAmount;
  return {
    nights: nights.length,
    lines: [...byLabel.values()],
    weekendNights,
    lodging,
    discount,
    cleaning: s.cleaningFee,
    dayGuests,
    dayGuestsAmount,
    total,
    deposit: Math.round((total * s.depositPct) / 100),
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);
