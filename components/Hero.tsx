"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Calendar from "./Calendar";
import { GuestFields, useStay } from "./booking-state";
import { bookedNights, fmtDay, todayISO } from "@/lib/booking";
import { useDB } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

const TITLE: [string, boolean][] = [
  ["Elegí", false],
  ["tu", false],
  ["forma", false],
  ["de", false],
  ["habitar", true],
  ["las", true],
  ["sierras.", true],
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <section ref={ref} id="top" className="relative bg-cal pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center pt-8 text-center sm:pt-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="flex items-center gap-3 text-sm text-musgo">
            <span className="h-px w-8 bg-ladrillo" />
            Río Ceballos · Sierras Chicas · Córdoba
            <span className="h-px w-8 bg-ladrillo" />
          </motion.p>
          <h1 className="mt-5 max-w-[20ch] font-display text-5xl tracking-tight text-balance sm:text-6xl xl:text-7xl">
            {TITLE.map(([w, it], i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.12em] align-top">
                <motion.span className={`inline-block ${it ? "text-oliva italic" : ""}`} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 0.25 + i * 0.07 }}>
                  {w}
                </motion.span>
                {i < TITLE.length - 1 && "\u00a0"}
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.7 }} className="mt-6 max-w-[52ch] text-lg text-pretty text-tinta/75">
            Casona colonial de dos alas para 12 huéspedes, con pileta, galerías y parque, en el alto de Río Ceballos.
          </motion.p>
        </div>

        <motion.div
          initial={{ clipPath: "inset(0 12% 0 12% round 2rem)" }}
          animate={{ clipPath: "inset(0 0% 0 0% round 2rem)" }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
          className="relative mt-9 h-[52svh] overflow-hidden rounded-[2rem] sm:h-[60svh] lg:h-[clamp(20rem,calc(100svh-30rem),46rem)]"
        >
          <motion.div style={{ y }} className="absolute inset-x-0 -top-[8%] -bottom-[16%]">
            <Image
              src="/fotos/sun-11.jpg"
              alt="La casona al atardecer, con las galerías iluminadas y el cielo rosado sobre la sierra"
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="hero-zoom object-cover object-[50%_62%]"
            />
          </motion.div>
        </motion.div>

        <SearchBar />
        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }} className="mt-6 flex flex-wrap justify-center gap-2 pb-4 text-sm">
          <li className="flex items-center gap-1.5 rounded-full bg-blanco px-3.5 py-2 ring-1 ring-tinta/5">
            <svg viewBox="0 0 20 20" className="size-3.5 text-ladrillo" aria-hidden="true"><path fill="currentColor" d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" /></svg>
            5,0 en Airbnb
          </li>
          <li className="rounded-full bg-blanco px-3.5 py-2 ring-1 ring-tinta/5">Hasta 12 huéspedes</li>
          <li className="rounded-full bg-blanco px-3.5 py-2 ring-1 ring-tinta/5">Pileta propia</li>
          <li className="rounded-full bg-blanco px-3.5 py-2 ring-1 ring-tinta/5">Mascotas bienvenidas</li>
        </motion.ul>
      </div>
    </section>
  );
}

function SearchBar() {
  const db = useDB();
  const { stay, setStay } = useStay();
  const [open, setOpen] = useState<null | "fechas" | "huespedes">(null);
  const ref = useRef<HTMLDivElement>(null);
  const booked = useMemo(() => (db ? bookedNights(db) : new Set<string>()), [db]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const guests = stay.adults + stay.children;
  const go = () => {
    setOpen(null);
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={ref} className="relative z-20 mx-auto -mt-10 max-w-4xl px-3 sm:-mt-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 1 }}
        className="grid overflow-hidden rounded-[2rem] bg-oliva text-cal shadow-[0_30px_60px_-30px_rgb(35_44_18/0.6)] sm:grid-cols-[1fr_1fr_1fr_auto]"
      >
        {(
          [
            ["Llegada", stay.checkIn ? fmtDay(stay.checkIn) : "Elegir fecha", "fechas"],
            ["Salida", stay.checkOut ? fmtDay(stay.checkOut) : "Elegir fecha", "fechas"],
            ["Huéspedes", `${guests} ${guests === 1 ? "persona" : "personas"}${stay.pets ? " · mascota" : ""}`, "huespedes"],
          ] as const
        ).map(([label, value, panel], i) => (
          <button
            key={label}
            type="button"
            aria-expanded={open === panel}
            onClick={() => setOpen(open === panel ? null : panel)}
            className={`px-5 py-4 text-left transition-colors hover:bg-oliva-2 sm:py-5 ${i > 0 ? "border-t border-cal/15 sm:border-t-0 sm:border-l" : ""}`}
          >
            <span className="block text-sm text-cal/60">{label}</span>
            <span className="mt-1 block first-letter:uppercase">{value}</span>
          </button>
        ))}
        <button type="button" onClick={go} className="m-2 rounded-full bg-cal px-6 py-4 text-oliva transition-colors hover:bg-blanco active:scale-[0.98]">
          Ver disponibilidad
        </button>
      </motion.div>

      <AnimatePresence>
        {open && db && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease }}
            className="absolute inset-x-3 top-full z-30 mt-2 rounded-3xl bg-blanco p-4 text-tinta shadow-[0_30px_80px_-30px_rgb(34_36_26/0.45)] ring-1 ring-tinta/5 sm:inset-x-6 sm:p-6"
          >
            {open === "fechas" ? (
              <>
                <Calendar
                  checkIn={stay.checkIn}
                  checkOut={stay.checkOut}
                  onChange={(checkIn, checkOut) => setStay({ checkIn, checkOut })}
                  booked={booked}
                  settings={db.settings}
                  today={todayISO()}
                  showPrices={false}
                />
                <div className="mt-4 flex items-center justify-between border-t border-linea pt-4 text-sm">
                  <button type="button" className="text-musgo underline decoration-linea underline-offset-4" onClick={() => setStay({ checkIn: null, checkOut: null })}>
                    Borrar fechas
                  </button>
                  <button type="button" onClick={go} disabled={!stay.checkOut} className="rounded-full bg-oliva px-4 py-2.5 text-cal disabled:opacity-40">
                    Ver precio
                  </button>
                </div>
              </>
            ) : (
              <div className="sm:max-w-sm">
                <GuestFields cap={db.settings.maxGuests} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
