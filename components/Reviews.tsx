"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { LINKS, RATING, REVIEWS, type Review } from "@/lib/content";
import { useDB } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;
const TONES = ["bg-oliva text-cal", "bg-ladrillo text-cal", "bg-kraft text-cal", "bg-salvia text-monte", "bg-arcilla text-monte"];

// Dos cintas que se mueven solas en sentidos opuestos: arriba las reseñas largas, abajo las breves.
const LONG = REVIEWS.filter((r) => r.text.length > 140);
const SHORT = REVIEWS.filter((r) => r.text.length <= 140);

function Star({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path fill="currentColor" d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
    </svg>
  );
}

function Card({ r, wide }: { r: Review; wide: boolean }) {
  const i = REVIEWS.indexOf(r);
  return (
    <figure className={`flex shrink-0 flex-col justify-between rounded-3xl bg-blanco p-6 ring-1 ring-tinta/5 transition-shadow duration-300 hover:shadow-[0_24px_50px_-28px_rgb(35_44_18/0.45)] sm:p-7 ${wide ? "w-[21rem] sm:w-[34rem]" : "w-[18rem] sm:w-[24rem]"}`}>
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex gap-0.5 text-ladrillo" aria-label="5 de 5 estrellas">
            {Array.from({ length: 5 }, (_, k) => (
              <Star key={k} />
            ))}
          </span>
          {r.trip && <span className="rounded-full bg-cal px-2.5 py-1 text-xs text-musgo">{r.trip}</span>}
        </div>
        <blockquote className={`mt-4 text-pretty ${wide ? "font-display text-lg leading-relaxed sm:text-xl sm:leading-relaxed" : "font-display text-xl leading-snug"}`}>
          <p>“{r.text}”</p>
        </blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3 text-sm">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-lg ${TONES[i % TONES.length]}`}>{r.name[0]}</span>
        <span>
          <span className="block font-medium">{r.name}</span>
          <span className="text-musgo">{r.from} · {r.date}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Ribbon({ items, wide, reverse, seconds }: { items: Review[]; wide: boolean; reverse?: boolean; seconds: number }) {
  return (
    <div className="cinta group flex overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1}
          className={`flex shrink-0 items-stretch gap-4 pr-4 motion-safe:animate-[desfile_var(--t)_linear_infinite] group-hover:[animation-play-state:paused] ${reverse ? "[animation-direction:reverse]" : ""} ${copy === 1 ? "motion-reduce:hidden" : ""}`}
          style={{ "--t": `${seconds}s` } as React.CSSProperties}
        >
          {items.map((r) => (
            <li key={r.name} className="flex">
              <Card r={r} wide={wide} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const c = animate(0, to, { duration: 1.6, ease, onUpdate: (v) => ref.current && (ref.current.textContent = v.toFixed(1).replace(".", ",")) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{to.toFixed(1).replace(".", ",")}</span>;
}

export default function Reviews() {
  const db = useDB();
  const bookingUrl = db?.sync.bookingUrl || LINKS.booking;

  return (
    <section id="resenas" className="relative overflow-hidden bg-cal py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-3 text-sm text-musgo">
              <span className="h-px w-8 bg-ladrillo" />
              Reseñas verificadas en Airbnb
            </p>
            <h2 className="mt-4 max-w-[18ch] font-display text-4xl tracking-tight text-balance sm:text-5xl">
              Once estadías, <em className="text-oliva">once cinco estrellas.</em>
            </h2>
          </div>
          <p className="max-w-[40ch] text-pretty text-tinta/70">Textos completos, tal como los escribieron los huéspedes. Pasá el mouse por una reseña para frenarla.</p>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <Ribbon items={LONG} wide seconds={70} />
        <Ribbon items={SHORT} wide={false} reverse seconds={55} />
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 rounded-[2rem] bg-oliva p-7 text-cal sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <div className="flex items-end gap-4">
              <p className="font-display text-8xl leading-none tracking-tight tabular">
                <CountUp to={5} />
              </p>
              <div className="pb-2">
                <span className="flex gap-0.5 text-[#f0b49d]">
                  {Array.from({ length: 5 }, (_, k) => (
                    <motion.span key={k} initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.3 + k * 0.07 }}>
                      <Star className="size-5" />
                    </motion.span>
                  ))}
                </span>
                <p className="mt-2 text-sm text-cal/75">{RATING.count} evaluaciones</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-cal/75">Distinción “Favorito entre huéspedes” de Airbnb: el 100 % de las evaluaciones son de 5 estrellas.</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:col-span-5">
            {RATING.categories.map((c, i) => {
              const v = parseFloat(c.value.replace(",", "."));
              return (
                <div key={c.label}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <dt className="text-cal/75">{c.label}</dt>
                    <dd className="tabular">{c.value}</dd>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-cal/15">
                    <motion.div className="h-full origin-left rounded-full bg-cal" initial={{ scaleX: 0 }} whileInView={{ scaleX: v / 5 }} viewport={{ once: true }} transition={{ duration: 1.1, ease, delay: 0.2 + i * 0.08 }} />
                  </div>
                </div>
              );
            })}
          </dl>

          <div className="flex flex-col gap-3 lg:col-span-3 lg:items-end">
            <a
              href={LINKS.airbnbReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-cal py-3.5 pr-5 pl-6 text-sm text-oliva transition-colors hover:bg-blanco active:scale-[0.98]"
            >
              Leer las {RATING.count} en Airbnb
              <svg viewBox="0 0 12 12" className="size-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 2h6v6M10 2 3 9" /></svg>
            </a>
            {bookingUrl ? (
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-full px-6 py-3.5 text-sm ring-1 ring-cal/35 transition hover:bg-cal/10">
                Ver en Booking
              </a>
            ) : (
              <span className="text-center text-sm text-cal/60 lg:text-right">Booking: perfil próximamente</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
