"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import {
  addDays,
  diffDays,
  fmtMonth,
  fromISO,
  maxCheckout,
  minNightsFor,
  moneyShort,
  nightlyRate,
  seasonFor,
  toISO,
  type ISO,
  type Settings,
} from "@/lib/booking";

type Props = {
  checkIn: ISO | null;
  checkOut: ISO | null;
  onChange: (checkIn: ISO | null, checkOut: ISO | null) => void;
  booked: Set<ISO>;
  settings: Settings;
  today: ISO;
  /** admin: permite elegir cualquier rango para bloquear o liberar */
  mode?: "huesped" | "admin";
  showPrices?: boolean;
  onHint?: (msg: string | null) => void;
  onHover?: (d: ISO | null) => void;
};

const WEEK = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];
const ease = [0.22, 1, 0.36, 1] as const;
const monthStart = (d: ISO) => `${d.slice(0, 7)}-01`;
const addMonths = (m: ISO, n: number) => {
  const d = fromISO(m);
  d.setMonth(d.getMonth() + n, 1);
  return toISO(d);
};

function monthCells(m: ISO): (ISO | null)[] {
  const first = fromISO(m);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => addDays(m, i))];
}

export default function Calendar({ checkIn, checkOut, onChange, booked, settings, today, mode = "huesped", showPrices = true, onHint, onHover }: Props) {
  const [view, setView] = useState<ISO>(() => monthStart(checkIn ?? today));
  const [dir, setDir] = useState(1);
  const [hover, setHoverState] = useState<ISO | null>(null);
  const group = useId();
  const admin = mode === "admin";
  const picking = !!checkIn && !checkOut;

  const setHover = (d: ISO | null) => {
    setHoverState(d);
    onHover?.(d);
  };

  const limit = useMemo(() => (picking && !admin ? maxCheckout(checkIn!, booked) : null), [picking, admin, checkIn, booked]);
  const minN = checkIn ? minNightsFor(checkIn, settings) : settings.baseMinNights;

  const canCheckout = (d: ISO) => {
    if (!checkIn || d <= checkIn) return false;
    if (admin) return true;
    return d <= limit! && diffDays(checkIn, d) >= minN;
  };

  const click = (d: ISO) => {
    if (d < today) return;
    if (picking && canCheckout(d)) {
      onChange(checkIn, d);
      onHint?.(null);
      return;
    }
    if (picking && !admin && d > checkIn! && d <= limit! && diffDays(checkIn!, d) < minN) {
      const se = seasonFor(checkIn!, settings);
      onHint?.(`Desde esa fecha la estadía mínima es de ${minN} noches${se ? ` (${se.name.toLowerCase()})` : ""}.`);
      return;
    }
    if (!admin && booked.has(d)) {
      onHint?.("Esa noche ya está ocupada. Elegí otra fecha de llegada.");
      return;
    }
    if (!admin && diffDays(d, maxCheckout(d, booked)) < minNightsFor(d, settings)) {
      onHint?.(`Desde ese día no hay ${minNightsFor(d, settings)} noches libres seguidas. Probá con otra fecha de llegada.`);
      return;
    }
    onChange(d, null);
    onHint?.(null);
  };

  const move = (n: number) => {
    setDir(n);
    setView(addMonths(view, n));
  };

  const prevDisabled = view <= monthStart(today);
  const months = [view, addMonths(view, 1)];
  const rangeEnd = checkOut ?? (picking && hover && canCheckout(hover) ? hover : null);

  return (
    <LayoutGroup id={group}>
      <div className="select-none" onMouseLeave={() => setHover(null)}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={prevDisabled}
            aria-label="Mes anterior"
            className="grid size-10 place-items-center rounded-full text-tinta ring-1 ring-tinta/10 transition hover:bg-oliva hover:text-cal active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-tinta"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <div className="relative flex flex-1 justify-around overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              {months.map((m, i) => (
                <motion.p
                  key={m}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -30 }}
                  transition={{ duration: 0.3, ease }}
                  className={`font-display text-xl first-letter:uppercase ${i === 1 ? "hidden md:block" : ""}`}
                >
                  {fmtMonth(m)}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Mes siguiente"
            className="grid size-10 place-items-center rounded-full text-tinta ring-1 ring-tinta/10 transition hover:bg-oliva hover:text-cal active:scale-95"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>

        <div className="relative mt-4 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={view}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.35, ease }}
              className="grid gap-8 md:grid-cols-2"
            >
              {months.map((m, mi) => (
                <div key={m} className={mi === 1 ? "hidden md:block" : ""}>
                  <div className="grid grid-cols-7 pb-2 text-center text-xs text-musgo">
                    {WEEK.map((w) => (
                      <span key={w}>{w}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1">
                    {monthCells(m).map((d, i) => {
                      if (!d) return <span key={`e${i}`} />;
                      const past = d < today;
                      const isBooked = booked.has(d);
                      const isStart = d === checkIn;
                      const isEnd = d === checkOut;
                      const inRange = !!checkIn && !!rangeEnd && d > checkIn && d < rangeEnd;
                      const checkoutOnly = picking && !admin && isBooked && canCheckout(d);
                      const blockedForPick = picking && !admin && d > checkIn! && !canCheckout(d);
                      const disabled = past || (!admin && isBooked && !checkoutOnly);
                      const selected = isStart || isEnd;
                      const season = !past && !isBooked ? seasonFor(d, settings) : null;
                      const label = `${fromISO(d).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}${
                        isBooked ? (checkoutOnly ? ", disponible solo para salida" : ", ocupado") : ""
                      }`;
                      return (
                        <div
                          key={d}
                          className={`relative ${inRange || (isStart && rangeEnd) ? "bg-oliva/12" : ""} ${isStart && rangeEnd ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full bg-oliva/12" : ""}`}
                        >
                          <button
                            type="button"
                            aria-label={label}
                            aria-pressed={selected}
                            disabled={disabled}
                            onClick={() => click(d)}
                            onMouseEnter={() => setHover(d)}
                            onFocus={() => setHover(d)}
                            className={[
                              "group relative mx-auto flex aspect-square w-full max-w-14 flex-col items-center justify-center rounded-full text-sm tabular transition-colors duration-150 active:scale-95",
                              selected ? "text-cal" : "",
                              !selected && !disabled ? "hover:bg-blanco hover:ring-1 hover:ring-oliva" : "",
                              past ? "text-tinta/25" : "",
                              isBooked && !selected && !past ? "ocupado text-tinta/40 line-through decoration-ladrillo/60" : "",
                              blockedForPick && !isBooked && !past ? "text-tinta/35" : "",
                            ].join(" ")}
                          >
                            {isStart && <motion.span layoutId="inicio" className="absolute inset-0 rounded-full bg-oliva shadow-[0_8px_18px_-8px_rgb(87_110_40/0.8)]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                            {isEnd && <motion.span layoutId="fin" className="absolute inset-0 rounded-full bg-oliva shadow-[0_8px_18px_-8px_rgb(87_110_40/0.8)]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                            <span className="relative">{fromISO(d).getDate()}</span>
                            {showPrices && !past && !isBooked && !admin && (
                              <span className={`relative hidden text-[10px] leading-none sm:block ${selected ? "text-cal/75" : season ? "text-ladrillo" : "text-musgo"}`}>{moneyShort(nightlyRate(d, settings))}</span>
                            )}
                            {d === today && <span className="absolute bottom-1 size-1 rounded-full bg-ladrillo" aria-hidden="true" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  );
}

/** Primer rango libre desde hoy que cumple la estadía mínima (opcionalmente arrancando un viernes). */
export function findWindow(booked: Set<ISO>, settings: Settings, today: ISO, nights: number, friday = false): [ISO, ISO] | null {
  for (let i = 0; i < 365; i++) {
    const start = addDays(today, i);
    if (friday && fromISO(start).getDay() !== 5) continue;
    const n = Math.max(nights, minNightsFor(start, settings));
    let ok = true;
    for (let k = 0; k < n; k++) if (booked.has(addDays(start, k))) ok = false;
    if (ok) return [start, addDays(start, n)];
  }
  return null;
}
