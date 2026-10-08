"use client";

import Link from "next/link";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Calendar, { findWindow } from "./Calendar";
import { GuestFields, useStay } from "./booking-state";
import {
  bookedNights,
  diffDays,
  fmtDay,
  nightlyRate,
  seasonFor,
  money,
  nightsOf,
  quote,
  todayISO,
  uid,
  type BookingRequest,
  type DB,
  type Quote,
} from "@/lib/booking";
import { actions, useDB } from "@/lib/store";
import { buildICS, downloadFile } from "@/lib/ical";

type Step = "fechas" | "datos" | "enviada";
type Form = { name: string; email: string; phone: string; city: string; arrival: string; dayGuests: number; message: string; terms: boolean };
const emptyForm: Form = { name: "", email: "", phone: "", city: "", arrival: "", dayGuests: 0, message: "", terms: false };
const ARRIVALS = ["14 a 16 h", "16 a 18 h", "18 a 20 h", "Después de las 20 h"];

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().split(/\s+/).filter((w) => w.length > 1).length < 2) e.name = "Escribí tu nombre y apellido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Revisá el email: tiene que ser del tipo nombre@correo.com.";
  if (f.phone.replace(/\D/g, "").length < 8) e.phone = "Ingresá un teléfono con código de área (al menos 8 números).";
  if (!f.arrival) e.arrival = "Elegí un horario estimado de llegada.";
  if (!f.terms) e.terms = "Para enviar la solicitud, aceptá las normas de la casa.";
  return e;
}

export default function Booking() {
  const db = useDB();
  return (
    <section id="reservar" className="bg-cal py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-sm text-musgo">Disponibilidad y reservas</p>
            <h2 className="mt-3 max-w-[20ch] font-display text-4xl tracking-tight text-balance sm:text-5xl">
              Mirá las fechas libres y el precio final, <em>antes de escribir.</em>
            </h2>
          </div>
          <p className="max-w-[48ch] text-pretty text-tinta/75 lg:col-span-5">
            Elegí llegada y salida, sumá a tu grupo y enviá la solicitud. No se cobra nada ahora: la anfitriona confirma y te pasa los datos de la seña.
          </p>
        </div>
        {db ? <BookingFlow db={db} /> : <div className="mt-12 h-[34rem] animate-pulse bg-blanco/60" aria-hidden="true" />}
      </div>
    </section>
  );
}

function BookingFlow({ db }: { db: DB }) {
  const { stay, setStay } = useStay();
  const [step, setStep] = useState<Step>("fechas");
  const [hint, setHint] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState<BookingRequest | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const today = todayISO();
  const booked = useMemo(() => bookedNights(db), [db]);
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const { settings } = db;

  const ready = !!stay.checkIn && !!stay.checkOut;
  const q = ready ? quote(stay.checkIn!, stay.checkOut!, settings, form.dayGuests) : null;
  const stillFree = ready && nightsOf(stay.checkIn!, stay.checkOut!).every((n) => !booked.has(n));

  const goto = (s: Step) => {
    setStep(s);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    if (!stillFree || !q) {
      setHint("Mientras completabas tus datos, esas fechas se ocuparon. Elegí otras.");
      setStay({ checkIn: null, checkOut: null });
      goto("fechas");
      return;
    }
    const req: BookingRequest = {
      id: uid(),
      code: `SUN-${stay.checkIn!.slice(2, 4)}${stay.checkIn!.slice(5, 7)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      checkIn: stay.checkIn!,
      checkOut: stay.checkOut!,
      adults: stay.adults,
      children: stay.children,
      infants: stay.infants,
      pets: stay.pets,
      dayGuests: form.dayGuests,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      arrival: form.arrival,
      message: form.message.trim(),
      total: q.total,
      status: "pendiente",
    };
    actions.addRequest(req);
    setSent(req);
    goto("enviada");
  };

  const restart = () => {
    setSent(null);
    setForm(emptyForm);
    setStay({ checkIn: null, checkOut: null });
    goto("fechas");
  };

  return (
    <div ref={top} className="mt-12 scroll-mt-24">
      <div className="relative">
        <ol className="flex flex-wrap gap-x-8 gap-y-2 pb-4 text-sm" aria-label="Pasos de la reserva">
          {(["Fechas y huéspedes", "Tus datos", "Solicitud enviada"] as const).map((label, i) => {
            const idx = ["fechas", "datos", "enviada"].indexOf(step);
            return (
              <li key={label} aria-current={i === idx ? "step" : undefined} className={`flex items-center gap-2 transition-colors duration-300 ${i === idx ? "text-tinta" : "text-tinta/45"}`}>
                <span className={`grid size-7 place-items-center rounded-full text-xs tabular transition-colors duration-300 ${i < idx ? "bg-oliva text-cal" : i === idx ? "bg-ladrillo text-cal" : "ring-1 ring-tinta/25"}`}>
                  {i < idx ? (
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m2.5 6.5 2.2 2.2 4.8-5" /></svg>
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <span className="absolute inset-x-0 bottom-0 h-px bg-linea" />
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 origin-left bg-ladrillo"
          style={{ width: "100%" }}
          animate={{ scaleX: (["fechas", "datos", "enviada"].indexOf(step) + 1) / 3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === "enviada" && sent ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <Confirmation req={sent} onRestart={restart} />
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-10"
          >
            {step === "fechas" ? (
              <div className="rounded-3xl bg-blanco p-4 shadow-[0_30px_60px_-40px_rgb(35_44_18/0.35)] ring-1 ring-tinta/5 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-linea pb-5">
                  <span className="mr-1 text-sm text-musgo">Atajos:</span>
                  {(
                    [
                      ["Próximo finde libre", 2, true],
                      ["Escapada de 3 noches", 3, false],
                      ["Una semana", 7, false],
                    ] as const
                  ).map(([label, n, fri]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const w = findWindow(booked, settings, today, n, fri);
                        if (w) {
                          setStay({ checkIn: w[0], checkOut: w[1] });
                          setHint(`Encontramos ${diffDays(w[0], w[1])} noches libres desde el ${fmtDay(w[0], { weekday: "long", day: "numeric", month: "long" })}.`);
                        } else setHint("No encontramos fechas libres para ese atajo en el próximo año.");
                      }}
                      className="rounded-full px-3.5 py-1.5 text-sm ring-1 ring-tinta/15 transition hover:bg-oliva hover:text-cal hover:ring-oliva active:scale-[0.97]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Calendar
                  checkIn={stay.checkIn}
                  checkOut={stay.checkOut}
                  onChange={(checkIn, checkOut) => setStay({ checkIn, checkOut })}
                  booked={booked}
                  settings={settings}
                  today={today}
                  onHint={setHint}
                  onHover={setHoverDay}
                />
                <div className="mt-5 h-6 text-sm" aria-hidden="true">
                  <AnimatePresence mode="wait">
                    {hoverDay && hoverDay >= today && !booked.has(hoverDay) && (
                      <motion.p key={hoverDay} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-tinta/75">
                        <span className="first-letter:uppercase">{fmtDay(hoverDay, { weekday: "long", day: "numeric", month: "long" })}</span> ·{" "}
                        <span className="font-medium text-tinta">{money(nightlyRate(hoverDay, settings))}</span> la noche · {seasonFor(hoverDay, settings)?.name ?? "Tarifa general"}
                        {[5, 6].includes(new Date(hoverDay + "T12:00").getDay()) ? " + fin de semana" : ""}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-linea pt-4 text-sm text-tinta/70">
                  <span className="flex items-center gap-2"><span className="size-3 rounded-full ring-1 ring-oliva" />Disponible</span>
                  <span className="flex items-center gap-2"><span className="ocupado size-3 rounded-full ring-1 ring-ladrillo/40" />Ocupado</span>
                  <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-oliva" />Tu estadía</span>
                  <span className="flex items-center gap-2"><span className="text-[10px] text-ladrillo">$k</span>Temporada especial</span>
                  <span className="text-musgo">Precios por noche, casona completa</span>
                </div>
                <p role="status" aria-live="polite" className={`mt-3 min-h-6 text-sm ${hint ? "text-ladrillo" : "text-musgo"}`}>
                  {hint ??
                    (stay.checkIn && !stay.checkOut
                      ? "Ahora elegí el día de salida."
                      : !stay.checkIn
                        ? "Tocá el día de llegada para empezar."
                        : `${diffDays(stay.checkIn, stay.checkOut!)} noches seleccionadas. Podés cambiarlas tocando otra fecha.`)}
                </p>
              </div>
            ) : (
              <DetailsForm form={form} errors={errors} set={set} onSubmit={submit} onBack={() => goto("fechas")} settings={settings} />
            )}

            <Summary
              q={q}
              step={step}
              cap={settings.maxGuests}
              depositPct={settings.depositPct}
              onContinue={() => (ready && stillFree ? goto("datos") : setHint("Elegí llegada y salida en el calendario."))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Summary({ q, step, cap, depositPct, onContinue }: { q: Quote | null; step: Step; cap: number; depositPct: number; onContinue: () => void }) {
  const { stay } = useStay();
  const guests = stay.adults + stay.children;
  const guestLabel = [
    `${stay.adults} ${stay.adults === 1 ? "adulto" : "adultos"}`,
    stay.children ? `${stay.children} ${stay.children === 1 ? "niño" : "niños"}` : null,
    stay.infants ? `${stay.infants} ${stay.infants === 1 ? "bebé" : "bebés"}` : null,
    stay.pets ? "mascota" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <aside className="relative self-start overflow-hidden rounded-3xl bg-oliva p-6 text-cal sm:p-8 lg:sticky lg:top-24" aria-label="Resumen de tu estadía">
      <p className="font-display text-2xl">Tu estadía</p>
      <dl className="mt-5 grid grid-cols-2 border-y border-cal/15">
        <div className="py-4 pr-4">
          <dt className="text-sm text-cal/60">Llegada</dt>
          <dd className="mt-1 first-letter:uppercase">{stay.checkIn ? fmtDay(stay.checkIn) : "—"}</dd>
        </div>
        <div className="border-l border-cal/15 py-4 pl-4">
          <dt className="text-sm text-cal/60">Salida</dt>
          <dd className="mt-1 first-letter:uppercase">{stay.checkOut ? fmtDay(stay.checkOut) : "—"}</dd>
        </div>
      </dl>

      {step === "fechas" ? (
        <details className="group border-b border-cal/15 [&_.text-musgo]:text-cal/60 [&_.divide-linea]:divide-cal/15 [&_button]:ring-cal/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-sm text-cal/60">Huéspedes</span>
              <span className="mt-1 block">{guestLabel}</span>
            </span>
            <svg viewBox="0 0 12 12" className="size-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m2 4 4 4 4-4" /></svg>
          </summary>
          <div className="pb-2">
            <GuestFields cap={cap} />
          </div>
        </details>
      ) : (
        <div className="border-b border-cal/15 py-4">
          <p className="text-sm text-cal/60">Huéspedes</p>
          <p className="mt-1">{guestLabel}</p>
        </div>
      )}

      {q ? (
        <div className="mt-5 tabular">
          <ul className="space-y-2 text-sm">
            {q.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-4">
                <span className="text-cal/75">{l.label} · {l.nights} {l.nights === 1 ? "noche" : "noches"}</span>
                <span>{money(l.amount)}</span>
              </li>
            ))}
            {q.discount > 0 && (
              <li className="flex justify-between gap-4">
                <span className="text-cal/75">Descuento estadía larga</span>
                <span>−{money(q.discount)}</span>
              </li>
            )}
            <li className="flex justify-between gap-4">
              <span className="text-cal/75">Limpieza final</span>
              <span>{money(q.cleaning)}</span>
            </li>
            {q.dayGuests > 0 && (
              <li className="flex justify-between gap-4">
                <span className="text-cal/75">Invitados por el día · {q.dayGuests}</span>
                <span>{money(q.dayGuestsAmount)}</span>
              </li>
            )}
          </ul>
          {q.weekendNights > 0 && <p className="mt-2 text-sm text-cal/55">Las noches de viernes y sábado tienen recargo.</p>}
          <div className="mt-5 flex items-baseline justify-between border-t border-cal/15 pt-5">
            <span>Total · {q.nights} {q.nights === 1 ? "noche" : "noches"}</span>
            <Money value={q.total} className="font-display text-3xl tabular" />
          </div>
          <p className="mt-1 flex justify-between text-sm text-cal/70">
            <span>Seña para confirmar ({depositPct}%)</span>
            <Money value={q.deposit} />
          </p>
        </div>
      ) : (
        <p className="mt-5 text-sm text-cal/70">Elegí las fechas para ver el precio total, con limpieza y recargos incluidos.</p>
      )}

      {step === "fechas" ? (
        <button
          type="button"
          onClick={onContinue}
          disabled={!q}
          className="mt-6 w-full rounded-full bg-cal px-4 py-3.5 text-oliva transition-colors hover:bg-blanco disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cal"
        >
          Continuar con mis datos
        </button>
      ) : (
        <button type="submit" form="reserva-form" className="mt-6 w-full rounded-full bg-cal px-4 py-3.5 text-oliva transition-colors hover:bg-blanco">
          Enviar solicitud de reserva
        </button>
      )}
      <p className="mt-4 text-sm text-cal/60">
        {guests} de {cap} lugares · Tarifas de demostración, editables desde el{" "}
        <Link href="/admin" className="underline decoration-cal/30 underline-offset-4 hover:decoration-cal">
          panel
        </Link>
        .
      </p>
    </aside>
  );
}

function Field({ id, label, error, children, className = "" }: { id: string; label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={`f-${id}`} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`e-${id}`} className="mt-2 text-sm text-ladrillo">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (bad?: string) =>
  `block w-full rounded-xl bg-blanco px-4 py-3 text-base ring-1 transition-shadow placeholder:text-tinta/35 focus:outline-2 focus:-outline-offset-1 focus:outline-oliva ${
    bad ? "ring-ladrillo" : "ring-tinta/15"
  }`;

function DetailsForm({
  form,
  errors,
  set,
  onSubmit,
  onBack,
  settings,
}: {
  form: Form;
  errors: Partial<Record<keyof Form, string>>;
  set: <K extends keyof Form>(k: K, v: Form[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  settings: DB["settings"];
}) {
  const aria = (k: keyof Form) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });
  return (
    <form id="reserva-form" noValidate onSubmit={onSubmit} className="rounded-3xl bg-blanco p-5 shadow-[0_30px_60px_-40px_rgb(35_44_18/0.35)] ring-1 ring-tinta/5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-2xl">Tus datos</p>
        <button type="button" onClick={onBack} className="text-sm text-musgo underline decoration-linea underline-offset-4 hover:text-tinta">
          Cambiar fechas
        </button>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Nombre y apellido" error={errors.name} className="sm:col-span-2">
          <input id="f-name" name="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} {...aria("name")} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} {...aria("email")} />
        </Field>
        <Field id="phone" label="Teléfono o WhatsApp" error={errors.phone}>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="351 555 1234" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(errors.phone)} {...aria("phone")} />
        </Field>
        <Field id="city" label="Desde dónde viajan (opcional)">
          <input id="f-city" name="city" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls()} />
        </Field>
        <Field id="arrival" label="Llegada estimada" error={errors.arrival}>
          <div className="inline-grid w-full grid-cols-[1fr_--spacing(10)]">
            <select id="f-arrival" name="arrival" value={form.arrival} onChange={(e) => set("arrival", e.target.value)} className={`${inputCls(errors.arrival)} col-span-full row-start-1 appearance-none pr-10`} {...aria("arrival")}>
              <option value="">Elegí un horario</option>
              {ARRIVALS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <svg viewBox="0 0 8 5" width="8" height="5" fill="none" className="pointer-events-none col-start-2 row-start-1 place-self-center" aria-hidden="true">
              <path d="M.5.5 4 4 7.5.5" stroke="currentcolor" />
            </svg>
          </div>
        </Field>
        <Field id="dayGuests" label={`Invitados por el día (${money(settings.dayGuestFee)} c/u)`} className="sm:col-span-2">
          <input
            id="f-dayGuests"
            name="dayGuests"
            type="number"
            min={0}
            max={30}
            inputMode="numeric"
            value={form.dayGuests}
            onChange={(e) => set("dayGuests", Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
            className={`${inputCls()} sm:max-w-40`}
          />
        </Field>
        <Field id="message" label="Algo que quieras contarnos (opcional)" className="sm:col-span-2">
          <textarea id="f-message" name="message" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Un cumpleaños, horarios, quién viaja…" className={inputCls()} />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3">
            <span className="flex h-lh items-center text-base">
              <span className="group inline-grid size-5 grid-cols-1 sm:size-4">
                <input
                  id="f-terms"
                  name="terms"
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => set("terms", e.target.checked)}
                  {...aria("terms")}
                  className="col-start-1 row-start-1 appearance-none rounded-[4px] border border-tinta/30 bg-blanco checked:border-oliva checked:bg-oliva focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oliva forced-colors:appearance-auto"
                />
                <svg viewBox="0 0 14 14" fill="none" className="pointer-events-none col-start-1 row-start-1 size-7/8 self-center justify-self-center stroke-cal">
                  <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-not-has-checked:opacity-0" />
                </svg>
              </span>
            </span>
            <span className="text-base text-tinta/80">
              Acepto las normas de la casa: check-in desde las 14 h, hasta {settings.maxGuests} huéspedes y cuidado de la casona como propia.
            </span>
          </label>
          {errors.terms && (
            <p id="e-terms" className="mt-2 text-sm text-ladrillo">
              {errors.terms}
            </p>
          )}
        </div>
      </div>
      <button type="submit" className="mt-8 w-full rounded-full bg-oliva px-4 py-3.5 text-cal transition-colors hover:bg-oliva-2 lg:hidden">
        Enviar solicitud de reserva
      </button>
    </form>
  );
}

function Confirmation({ req, onRestart }: { req: BookingRequest; onRestart: () => void }) {
  const first = req.name.split(" ")[0];
  const nights = diffDays(req.checkIn, req.checkOut);
  const ics = () =>
    downloadFile(
      `sun-${req.code}.ics`,
      buildICS([{ start: req.checkIn, end: req.checkOut, summary: `Estadía en SUN Casona Serrana (${req.code})`, uid: req.id }], "Mi estadía en SUN"),
    );
  return (
    <div className="mt-8 grid gap-10 rounded-3xl bg-blanco p-6 ring-1 ring-tinta/5 sm:p-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <svg viewBox="0 0 120 64" className="h-20 w-40 text-oliva" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <motion.path key={i} d="M60 46 L60 20" stroke="#b24d3a" strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: "60px 46px", rotate: -80 + i * 20 }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 1.2 + i * 0.05 }} />
          ))}
          <motion.circle cx="60" cy="56" r="14" fill="#a85a3c" initial={{ cy: 76 }} animate={{ cy: 46 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
          <rect x="0" y="56" width="120" height="8" fill="#fffdf9" />
          <path d="M4 56h112" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <h3 className="mt-6 font-display text-4xl tracking-tight text-balance">Listo, {first}. Recibimos tu solicitud.</h3>
        <p className="mt-4 max-w-[52ch] text-pretty text-tinta/75">
          Las fechas quedan reservadas a tu nombre mientras la anfitriona revisa la solicitud. Te va a escribir a <strong className="font-medium text-tinta">{req.email}</strong> o al{" "}
          <strong className="font-medium text-tinta">{req.phone}</strong> con los datos para la seña.
        </p>
        <ol className="mt-8 space-y-4 border-t border-linea pt-6">
          {[
            "La anfitriona confirma la disponibilidad y el total.",
            "Te envía los datos para transferir la seña.",
            "Con la seña acreditada, la estadía queda confirmada.",
          ].map((t, i) => (
            <li key={t} className="flex gap-4">
              <span className="grid size-6 shrink-0 place-items-center rounded-full text-xs tabular ring-1 ring-tinta/25">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={ics} className="rounded-full bg-oliva px-4 py-3 text-cal transition-colors hover:bg-oliva-2">
            Agregar a mi calendario
          </button>
          <button type="button" onClick={onRestart} className="rounded-full px-4 py-3 ring-1 ring-tinta/20 transition hover:ring-tinta">
            Consultar otras fechas
          </button>
        </div>
      </div>
      <dl className="self-start border-t border-linea text-sm lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-10">
        {[
          ["Código", req.code],
          ["Llegada", fmtDay(req.checkIn, { weekday: "long", day: "numeric", month: "long" }) + " · desde las 14 h"],
          ["Salida", fmtDay(req.checkOut, { weekday: "long", day: "numeric", month: "long" })],
          ["Noches", String(nights)],
          ["Huéspedes", `${req.adults + req.children}${req.infants ? ` + ${req.infants} bebé${req.infants > 1 ? "s" : ""}` : ""}${req.pets ? " · con mascota" : ""}`],
          ["Total estimado", money(req.total)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 border-b border-linea py-3.5">
            <dt className="text-musgo">{k}</dt>
            <dd className="text-right tabular first-letter:uppercase">{v}</dd>
          </div>
        ))}
        <p className="mt-4 text-musgo">
          Demo: la solicitud quedó guardada en este navegador y ya aparece en el{" "}
          <Link href="/admin" className="text-tinta underline decoration-linea underline-offset-4 hover:decoration-tinta">
            panel de la propietaria
          </Link>
          .
        </p>
      </dl>
    </div>
  );
}

/** Total que rueda hasta el valor nuevo cuando cambian fechas o huéspedes. */
function Money({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => ref.current && (ref.current.textContent = money(Math.round(v))) });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {money(value)}
    </span>
  );
}
