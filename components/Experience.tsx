"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { photo } from "@/lib/photos";

const ease = [0.22, 1, 0.36, 1] as const;

// Un día en la casona, de la mañana a la noche: la foto grande queda fija y cambia con la hora.
const MOMENTS = [
  {
    hour: "08:30",
    part: "Mañana",
    title: "Mate en la galería vidriada",
    text: "La luz entra por los ventanales de hierro del Ala Dos y se queda en los mosaicos. Se desayuna mirando el parque, sin apuro.",
    photo: 22,
    detail: 110,
    angle: 150,
    sun: "#f3c98b",
  },
  {
    hour: "12:30",
    part: "Mediodía",
    title: "La pileta",
    text: "Una de las pocas casas de la zona con pileta propia: deck de madera, la sierra de fondo y lugar para que los chicos no salgan del agua.",
    photo: 13,
    detail: 107,
    angle: 92,
    sun: "#f7e3a1",
  },
  {
    hour: "16:00",
    part: "Tarde",
    title: "Parque y silencio",
    text: "En el alto, camino al Dique La Quebrada. Se llega fácil por ruta y, una vez adentro, el predio se siente íntimo.",
    photo: 18,
    detail: 109,
    angle: 48,
    sun: "#eaa35f",
  },
  {
    hour: "19:40",
    part: "Atardecer",
    title: "Las galerías se encienden",
    text: "El cielo se pone rosa sobre la sierra, se prenden los apliques de las columnas y aparece la parrilla.",
    photo: 12,
    detail: 105,
    angle: 10,
    sun: "#e5735a",
  },
  {
    hour: "22:00",
    part: "Noche",
    title: "Hogar a leña y mesa larga",
    text: "Dos cocinas completas, dos comedores para seis y una sala con hogar para cerrar el día entre todos.",
    photo: 5,
    detail: 1,
    angle: -24,
    sun: "#e5735a",
  },
];

function Dial({ i }: { i: number }) {
  const m = MOMENTS[i];
  const r = (m.angle * Math.PI) / 180;
  const night = m.angle < 0;
  return (
    <svg viewBox="0 0 120 64" className="h-16 w-30 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id="sobre-horizonte">
          <rect x="0" y="0" width="120" height="56" />
        </clipPath>
      </defs>
      <path d="M12 56a48 48 0 0 1 96 0" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 4" />
      <g clipPath="url(#sobre-horizonte)">
        <motion.circle r="6" initial={false} animate={{ cx: 60 + 48 * Math.cos(r), cy: 56 - 48 * Math.sin(r), fill: m.sun }} transition={{ duration: 0.9, ease }} />
      </g>
      <motion.path
        d="M22 14a7 7 0 1 0 8 9 5.5 5.5 0 1 1-8-9Z"
        fill="#f4eee2"
        initial={false}
        animate={{ opacity: night ? 1 : 0, scale: night ? 1 : 0.6 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        transition={{ duration: 0.6 }}
      />
      <path d="M0 56h120" stroke="currentColor" strokeOpacity="0.6" />
    </svg>
  );
}

export default function Experience() {
  const [active, setActive] = useState(0);
  const m = MOMENTS[active];
  const main = photo(m.photo);

  return (
    <section id="experiencia" className="relative bg-monte py-20 text-cal sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-sm text-cal/60">
              <span className="h-px w-8 bg-ladrillo" />
              La experiencia
            </p>
            <h2 className="mt-4 max-w-[16ch] font-display text-4xl tracking-tight text-balance sm:text-6xl">
              Un día en SUN, <em className="text-[#f0b49d]">de sol a sol.</em>
            </h2>
          </div>
          <p className="max-w-[44ch] text-pretty text-cal/70 lg:col-span-5">Cinco momentos de una jornada en la casona, contados con fotos de la propia casa.</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Escena fija (desktop) */}
          <div className="hidden lg:col-span-8 lg:block">
            <div className="sticky top-24">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-oliva">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={main.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 0.8 }, scale: { duration: 2.4, ease } }}
                  >
                    <Image src={main.src} alt={main.alt} fill sizes="(min-width: 1280px) 820px, 66vw" className="object-cover" />
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={m.part}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="absolute top-5 left-5 rounded-full bg-monte/70 px-3.5 py-1.5 text-sm backdrop-blur"
                  >
                    {m.part}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="mt-6 flex items-center gap-6">
                <Dial i={active} />
                <div className="min-w-0 flex-1">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={m.hour}
                      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                      transition={{ duration: 0.4, ease }}
                      className="font-display text-6xl leading-none tabular"
                    >
                      {m.hour}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <ol className="flex gap-1.5" aria-hidden="true">
                  {MOMENTS.map((x, k) => (
                    <li key={x.hour} className="h-8 w-1 overflow-hidden rounded-full bg-cal/15">
                      <motion.span className="block size-full origin-bottom rounded-full bg-cal" initial={false} animate={{ scaleY: k <= active ? 1 : 0 }} transition={{ duration: 0.5, ease }} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Relato */}
          <ol className="lg:col-span-4">
            {MOMENTS.map((mo, i) => {
              const p = photo(mo.photo);
              const d = photo(mo.detail);
              return (
                <motion.li
                  key={mo.hour}
                  onViewportEnter={() => setActive(i)}
                  viewport={{ amount: 0.6 }}
                  className="flex flex-col justify-center border-t border-cal/10 py-12 first:border-t-0 first:pt-0 lg:min-h-[78svh] lg:border-t-0 lg:py-0"
                >
                  <div className="relative mb-6 overflow-hidden rounded-2xl lg:hidden" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
                    <Image src={p.src} alt={p.alt} fill sizes="100vw" className="object-cover" />
                    <span className="absolute top-4 left-4 rounded-full bg-monte/70 px-3 py-1 text-sm backdrop-blur">
                      {mo.hour} · {mo.part}
                    </span>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.9, ease }}>
                    <p className="hidden items-center gap-3 text-sm text-cal/60 lg:flex">
                      <span className="tabular">{mo.hour}</span>
                      <span className="h-px w-10 bg-cal/30" />
                      {mo.part}
                    </p>
                    <h3 className="mt-3 font-display text-3xl tracking-tight text-balance sm:text-4xl">{mo.title}</h3>
                    <p className="mt-4 max-w-[44ch] text-pretty text-cal/75">{mo.text}</p>
                    <figure className="mt-8 w-40 sm:w-48">
                      <div className="relative overflow-hidden rounded-xl ring-1 ring-cal/10" style={{ aspectRatio: `${d.w} / ${d.h}` }}>
                        <Image src={d.src} alt={d.alt} fill sizes="192px" className="object-cover transition-transform duration-700 ease-(--ease-sol) hover:scale-105" />
                      </div>
                      <figcaption className="mt-2 text-xs text-cal/55">{d.alt}</figcaption>
                    </figure>
                  </motion.div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
