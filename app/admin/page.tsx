"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Calendar from "@/components/Calendar";
import { bookedNights, diffDays, fmtDay, money, todayISO, uid, type DB, type ISO, type RequestStatus, type Settings } from "@/lib/booking";
import { buildICS, downloadFile, parseICS } from "@/lib/ical";
import { actions, useDB } from "@/lib/store";

const TABS = [
  ["solicitudes", "Solicitudes"],
  ["calendario", "Calendario"],
  ["tarifas", "Tarifas"],
  ["sincronizacion", "Sincronización"],
] as const;
type Tab = (typeof TABS)[number][0];

const STATUS: Record<RequestStatus, string> = {
  pendiente: "bg-arcilla/50 text-tinta",
  confirmada: "bg-oliva text-cal",
  rechazada: "bg-tinta/10 text-tinta/60",
};

export default function Admin() {
  const db = useDB();
  const [tab, setTab] = useState<Tab>("solicitudes");
  const pending = db?.requests.filter((r) => r.status === "pendiente").length ?? 0;

  return (
    <div className="min-h-svh bg-cal">
      <header className="border-b border-linea bg-blanco">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div>
            <p className="font-display text-2xl tracking-[0.18em]">SUN <span className="text-base tracking-normal text-musgo">· panel</span></p>
            <p className="text-sm text-musgo">Demo sin login: los datos viven en este navegador.</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => confirm("¿Volver a los datos de ejemplo? Se borran solicitudes, bloqueos y tarifas cargados.") && actions.reset()}
              className="rounded-full px-3 py-2 text-tinta/70 ring-1 ring-tinta/15 hover:ring-tinta/50"
            >
              Restablecer demo
            </button>
            <Link href="/" className="rounded-full bg-oliva px-3 py-2 text-cal hover:bg-oliva-2">
              Ver la web
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-8" aria-label="Secciones del panel">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-sm ${tab === id ? "border-oliva text-tinta" : "border-transparent text-tinta/55 hover:text-tinta"}`}
            >
              {label}
              {id === "solicitudes" && pending > 0 && <span className="ml-2 rounded-full bg-ladrillo px-1.5 py-0.5 text-xs text-blanco tabular">{pending}</span>}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {!db ? (
          <div className="h-96 animate-pulse bg-blanco/60" />
        ) : tab === "solicitudes" ? (
          <Requests db={db} />
        ) : tab === "calendario" ? (
          <Blocks db={db} />
        ) : tab === "tarifas" ? (
          <Rates key={JSON.stringify(db.settings)} initial={db.settings} />
        ) : (
          <Sync db={db} />
        )}
      </main>
    </div>
  );
}

function Requests({ db }: { db: DB }) {
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<RequestStatus | "todas">("todas");
  const list = db.requests.filter((r) => filter === "todas" || r.status === filter);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Solicitudes de reserva</h1>
          <p className="mt-1 text-sm text-musgo">Las pendientes y confirmadas ocupan las fechas en la web. Rechazar una solicitud las libera.</p>
        </div>
        <div className="flex gap-1 text-sm">
          {(["todas", "pendiente", "confirmada", "rechazada"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 capitalize ${filter === f ? "bg-oliva text-cal" : "ring-1 ring-tinta/15 hover:ring-tinta/40"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 bg-blanco p-8 text-center ring-1 ring-tinta/5">
          <p className="font-medium">No hay solicitudes {filter !== "todas" ? `con estado ${filter}` : "todavía"}.</p>
          <p className="mt-1 text-sm text-musgo">Hacé una reserva de prueba desde la web y aparece acá al instante.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-linea bg-blanco ring-1 ring-tinta/5">
          {list.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} className="grid w-full gap-2 px-4 py-4 text-left text-sm hover:bg-cal/50 sm:grid-cols-[7rem_1fr_11rem_7rem_6.5rem] sm:items-center sm:gap-4">
                <span className="tabular text-musgo">{r.code}</span>
                <span>
                  <span className="font-medium">{r.name}</span>
                  {r.demo && <span className="ml-2 text-xs text-musgo">ejemplo</span>}
                  <span className="block text-tinta/60">{r.adults + r.children} huéspedes{r.pets ? " · mascota" : ""}</span>
                </span>
                <span className="capitalize tabular">
                  {fmtDay(r.checkIn)} → {fmtDay(r.checkOut)}
                  <span className="block text-tinta/60 normal-case">{diffDays(r.checkIn, r.checkOut)} noches</span>
                </span>
                <span className="tabular sm:text-right">{money(r.total)}</span>
                <span className={`justify-self-start rounded-full px-2.5 py-1 text-xs capitalize sm:justify-self-end ${STATUS[r.status]}`}>{r.status}</span>
              </button>
              {open === r.id && (
                <div className="grid gap-6 border-t border-linea bg-cal/40 px-4 py-5 text-sm sm:grid-cols-2">
                  <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
                    <dt className="text-musgo">Email</dt><dd><a className="underline underline-offset-4" href={`mailto:${r.email}?subject=Tu solicitud ${r.code} en SUN Casona Serrana`}>{r.email}</a></dd>
                    <dt className="text-musgo">Teléfono</dt><dd><a className="underline underline-offset-4" href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">{r.phone}</a></dd>
                    <dt className="text-musgo">Viajan desde</dt><dd>{r.city || "—"}</dd>
                    <dt className="text-musgo">Llegada</dt><dd>{r.arrival}</dd>
                    <dt className="text-musgo">Grupo</dt><dd>{r.adults} adultos · {r.children} niños · {r.infants} bebés</dd>
                    <dt className="text-musgo">Por el día</dt><dd>{r.dayGuests} invitados</dd>
                  </dl>
                  <div>
                    <p className="text-musgo">Mensaje</p>
                    <p className="mt-1 text-pretty">{r.message || "Sin mensaje."}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {r.status !== "confirmada" && <button type="button" onClick={() => actions.setStatus(r.id, "confirmada")} className="rounded-full bg-oliva px-3 py-2 text-cal hover:bg-oliva-2">Confirmar</button>}
                      {r.status !== "rechazada" && <button type="button" onClick={() => actions.setStatus(r.id, "rechazada")} className="rounded-full px-3 py-2 ring-1 ring-tinta/20 hover:ring-tinta/50">Rechazar y liberar fechas</button>}
                      {r.status === "rechazada" && <button type="button" onClick={() => actions.setStatus(r.id, "pendiente")} className="rounded-full px-3 py-2 ring-1 ring-tinta/20 hover:ring-tinta/50">Volver a pendiente</button>}
                      <button type="button" onClick={() => confirm(`¿Eliminar la solicitud ${r.code}?`) && actions.removeRequest(r.id)} className="rounded-full px-3 py-2 text-ladrillo hover:bg-ladrillo/10">Eliminar</button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Blocks({ db }: { db: DB }) {
  const [range, setRange] = useState<{ a: ISO | null; b: ISO | null }>({ a: null, b: null });
  const [note, setNote] = useState("");
  const booked = useMemo(() => bookedNights(db), [db]);
  const today = todayISO();
  const blocks = [...db.blocks].filter((b) => b.end > today).sort((x, y) => x.start.localeCompare(y.start));

  const add = () => {
    if (!range.a || !range.b) return;
    actions.addBlock({ start: range.a, end: range.b, note: note.trim() || "Bloqueo manual", source: "manual" });
    setRange({ a: null, b: null });
    setNote("");
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="bg-blanco p-4 ring-1 ring-tinta/5 sm:p-6">
        <h1 className="font-display text-3xl">Bloquear fechas</h1>
        <p className="mt-1 mb-6 text-sm text-musgo">Elegí el primer día y el día de salida: se bloquean las noches entre ambos.</p>
        <Calendar checkIn={range.a} checkOut={range.b} onChange={(a, b) => setRange({ a, b })} booked={booked} settings={db.settings} today={today} mode="admin" showPrices={false} />
        <div className="mt-6 flex flex-col gap-3 border-t border-linea pt-5 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm">
            <span className="font-medium">Motivo (opcional)</span>
            <input name="motivo" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mantenimiento, uso familiar, reserva por teléfono…" className="mt-2 block w-full rounded-lg bg-blanco px-3 py-2.5 ring-1 ring-tinta/15 focus:outline-2 focus:-outline-offset-1 focus:outline-oliva" />
          </label>
          <button type="button" disabled={!range.b} onClick={add} className="rounded-full bg-oliva px-4 py-2.5 text-sm text-cal disabled:opacity-40">
            {range.a && range.b ? `Bloquear ${diffDays(range.a, range.b)} noches` : "Elegí un rango"}
          </button>
        </div>
      </div>
      <div>
        <h2 className="font-medium">Próximos bloqueos</h2>
        {blocks.length === 0 ? (
          <p className="mt-3 text-sm text-musgo">No hay fechas bloqueadas. Todo el calendario está libre.</p>
        ) : (
          <ul className="mt-3 divide-y divide-linea bg-blanco text-sm ring-1 ring-tinta/5">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="capitalize tabular">{fmtDay(b.start)} → {fmtDay(b.end)}</span>
                  <span className="block text-tinta/60">{b.note}{b.source === "ical" ? " · importado" : ""}</span>
                </span>
                <button type="button" onClick={() => actions.removeBlock(b.id)} className="shrink-0 rounded-full px-2.5 py-1.5 text-ladrillo hover:bg-ladrillo/10">
                  Liberar
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-musgo">Las reservas pendientes y confirmadas también ocupan el calendario; se gestionan en Solicitudes.</p>
      </div>
    </section>
  );
}

const num = "block w-full rounded-lg bg-blanco px-3 py-2 tabular ring-1 ring-tinta/15 focus:outline-2 focus:-outline-offset-1 focus:outline-oliva";

function Rates({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<Settings>) => {
    setS((x) => ({ ...x, ...patch }));
    setSaved(false);
  };
  const setSeason = (id: string, patch: Partial<Settings["seasons"][number]>) => set({ seasons: s.seasons.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const invalid = s.seasons.find((x) => !x.name.trim() || !x.start || !x.end || x.end < x.start || x.nightly <= 0);

  const fields: [keyof Settings, string, string][] = [
    ["baseNightly", "Tarifa general por noche", "$"],
    ["baseMinNights", "Estadía mínima general", "noches"],
    ["weekendPct", "Recargo viernes y sábado", "%"],
    ["cleaningFee", "Limpieza final", "$"],
    ["longStayNights", "Descuento desde", "noches"],
    ["longStayPct", "Descuento por estadía larga", "%"],
    ["dayGuestFee", "Invitado por el día", "$ c/u"],
    ["depositPct", "Seña para confirmar", "%"],
  ];

  return (
    <section>
      <h1 className="font-display text-3xl">Tarifas y temporadas</h1>
      <p className="mt-1 text-sm text-musgo">Los cambios se reflejan al instante en el calendario y en el precio de la web. Si dos temporadas se superponen, se aplica la de mayor tarifa.</p>
      <div className="mt-6 grid gap-x-6 gap-y-5 bg-blanco p-5 ring-1 ring-tinta/5 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map(([k, label, unit]) => (
          <label key={k} className="text-sm">
            <span className="font-medium">{label}</span>
            <span className="mt-2 flex items-center gap-2">
              <input name={k} type="number" min={0} value={s[k] as number} onChange={(e) => set({ [k]: Math.max(0, Number(e.target.value)) } as Partial<Settings>)} className={num} />
              <span className="shrink-0 text-musgo">{unit}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <h2 className="font-medium">Temporadas</h2>
        <button
          type="button"
          onClick={() => set({ seasons: [...s.seasons, { id: uid(), name: "Nueva temporada", start: todayISO(), end: todayISO(), nightly: s.baseNightly, minNights: s.baseMinNights }] })}
          className="rounded-full px-3 py-2 text-sm ring-1 ring-tinta/20 hover:ring-tinta/50"
        >
          Agregar temporada
        </button>
      </div>
      <div className="mt-3 overflow-x-auto bg-blanco ring-1 ring-tinta/5">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-linea text-musgo">
            <tr>
              <th className="px-4 py-3 font-normal">Nombre</th>
              <th className="px-4 py-3 font-normal">Desde</th>
              <th className="px-4 py-3 font-normal">Hasta (inclusive)</th>
              <th className="px-4 py-3 font-normal">Por noche</th>
              <th className="px-4 py-3 font-normal">Mínimo</th>
              <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {s.seasons.map((x) => (
              <tr key={x.id}>
                <td className="px-4 py-2"><input aria-label="Nombre de la temporada" name="nombre" value={x.name} onChange={(e) => setSeason(x.id, { name: e.target.value })} className={num} /></td>
                <td className="px-4 py-2"><input aria-label="Desde" name="desde" type="date" value={x.start} onChange={(e) => setSeason(x.id, { start: e.target.value })} className={num} /></td>
                <td className="px-4 py-2"><input aria-label="Hasta" name="hasta" type="date" value={x.end} onChange={(e) => setSeason(x.id, { end: e.target.value })} className={num} /></td>
                <td className="px-4 py-2"><input aria-label="Tarifa por noche" name="tarifa" type="number" min={0} value={x.nightly} onChange={(e) => setSeason(x.id, { nightly: Number(e.target.value) })} className={num} /></td>
                <td className="px-4 py-2"><input aria-label="Noches mínimas" name="minimo" type="number" min={1} value={x.minNights} onChange={(e) => setSeason(x.id, { minNights: Math.max(1, Number(e.target.value)) })} className={`${num} w-20`} /></td>
                <td className="px-4 py-2 text-right"><button type="button" onClick={() => set({ seasons: s.seasons.filter((y) => y.id !== x.id) })} className="rounded-full px-2.5 py-1.5 text-ladrillo hover:bg-ladrillo/10">Quitar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" disabled={!!invalid} onClick={() => { actions.saveSettings(s); setSaved(true); }} className="rounded-full bg-oliva px-4 py-2.5 text-sm text-cal disabled:opacity-40">
          Guardar tarifas
        </button>
        <p role="status" className={`text-sm ${invalid ? "text-ladrillo" : "text-musgo"}`}>
          {invalid ? `Revisá “${invalid.name || "sin nombre"}”: necesita nombre, fechas en orden y una tarifa mayor a cero.` : saved ? "Tarifas guardadas. La web ya usa los valores nuevos." : "Tarifas de ejemplo: reemplazalas por las reales antes de publicar."}
        </p>
      </div>
    </section>
  );
}

function Sync({ db }: { db: DB }) {
  const [form, setForm] = useState(db.sync);
  const [msg, setMsg] = useState<string | null>(null);

  const exportICS = () => {
    const events = [
      ...db.blocks.map((b) => ({ start: b.start, end: b.end, summary: b.note || "Bloqueado", uid: b.id })),
      ...db.requests.filter((r) => r.status !== "rechazada").map((r) => ({ start: r.checkIn, end: r.checkOut, summary: `Reserva directa ${r.code}`, uid: r.id })),
    ];
    downloadFile("sun-casona-serrana.ics", buildICS(events));
    setMsg(`Exportamos ${events.length} períodos ocupados en sun-casona-serrana.ics.`);
  };

  const importICS = async (file: File | undefined) => {
    if (!file) return;
    const events = parseICS(await file.text()).filter((e) => e.end > todayISO());
    if (!events.length) {
      setMsg("El archivo no tiene fechas ocupadas a futuro. Revisá que sea el .ics exportado desde Airbnb o Booking.");
      return;
    }
    actions.addBlocks(events.map((e) => ({ start: e.start, end: e.end, note: e.summary, source: "ical" as const })));
    actions.saveSync({ ...form, lastImport: new Date().toISOString() });
    setMsg(`Importamos ${events.length} períodos de ${file.name}. Ya aparecen como ocupados en la web.`);
  };

  return (
    <section className="max-w-3xl">
      <h1 className="font-display text-3xl">Sincronización con Airbnb y Booking</h1>
      <p className="mt-2 text-pretty text-tinta/75">
        Airbnb y Booking comparten disponibilidad con calendarios iCal (.ics). Esta demo ya lee y genera ese formato; la sincronización automática cada pocas horas necesita un servidor, que es el
        siguiente paso del proyecto.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="bg-blanco p-5 ring-1 ring-tinta/5">
          <p className="font-medium">Importar ocupación</p>
          <p className="mt-1 text-sm text-musgo">Subí el .ics exportado desde Airbnb o Booking para bloquear esas fechas acá.</p>
          <label className="mt-4 inline-block cursor-pointer rounded-full bg-oliva px-4 py-2.5 text-sm text-cal hover:bg-oliva-2">
            Elegir archivo .ics
            <input type="file" name="ics" accept=".ics,text/calendar" className="sr-only" onChange={(e) => importICS(e.target.files?.[0])} />
          </label>
        </div>
        <div className="bg-blanco p-5 ring-1 ring-tinta/5">
          <p className="font-medium">Exportar ocupación</p>
          <p className="mt-1 text-sm text-musgo">Descargá bloqueos y reservas directas en .ics para cargarlos en otras plataformas.</p>
          <button type="button" onClick={exportICS} className="mt-4 rounded-full px-4 py-2.5 text-sm ring-1 ring-oliva hover:bg-oliva hover:text-cal">
            Descargar .ics
          </button>
        </div>
      </div>
      {msg && <p role="status" className="mt-4 text-sm text-oliva">{msg}</p>}

      <div className="mt-10 bg-blanco p-5 ring-1 ring-tinta/5">
        <p className="font-medium">Enlaces para la sincronización automática</p>
        <p className="mt-1 text-sm text-musgo">Se guardan para cuando se active el servidor. Estado: sin conectar.</p>
        <div className="mt-5 space-y-4 text-sm">
          {(
            [
              ["airbnbIcal", "URL de exportación iCal de Airbnb", "https://www.airbnb.com.ar/calendar/ical/….ics"],
              ["bookingIcal", "URL de exportación iCal de Booking", "https://admin.booking.com/hotel/hoteladmin/ical.html?t=…"],
              ["bookingUrl", "Página pública en Booking (para el enlace de reseñas)", "https://www.booking.com/hotel/ar/…"],
            ] as const
          ).map(([k, label, ph]) => (
            <label key={k} className="block">
              <span className="font-medium">{label}</span>
              <input name={k} type="url" value={form[k]} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-2 block w-full rounded-lg bg-blanco px-3 py-2.5 ring-1 ring-tinta/15 focus:outline-2 focus:-outline-offset-1 focus:outline-oliva" />
            </label>
          ))}
        </div>
        <button type="button" onClick={() => { actions.saveSync(form); setMsg("Enlaces guardados."); }} className="mt-5 rounded-full bg-oliva px-4 py-2.5 text-sm text-cal hover:bg-oliva-2">
          Guardar enlaces
        </button>
        {db.sync.lastImport && <p className="mt-3 text-sm text-musgo">Última importación: {new Date(db.sync.lastImport).toLocaleString("es-AR")}</p>}
      </div>
    </section>
  );
}
