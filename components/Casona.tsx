"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AMENITIES, BEDROOMS, FACTS, GOOD_TO_KNOW } from "@/lib/content";
import { photo } from "@/lib/photos";
import Reveal from "./Reveal";

const WINGS = [
  {
    id: "uno",
    name: "Ala Uno",
    who: "Para seis huéspedes",
    photo: 5,
    lines: [
      "Suite con baño propio, cama doble y de una plaza, y puerta ventana a la pileta",
      "Dormitorio con dos camas de una plaza",
      "Sala de estar con hogar a leña, mesa ratona y mecedora",
      "Comedor para seis y cocina completa",
    ],
  },
  {
    id: "dos",
    name: "Ala Dos",
    who: "Para seis huéspedes",
    photo: 27,
    lines: [
      "Galería vidriada de punta a punta, con sillón y comedor",
      "Dormitorio con cama doble y cama de una plaza",
      "Dormitorio con cuatro camas de una plaza",
      "Cocina completa y dos baños completos",
    ],
  },
  {
    id: "parque",
    name: "Parque y pileta",
    who: "Compartido por las dos alas",
    photo: 13,
    lines: [
      "Pileta con deck de madera",
      "Galería abierta de columnas blancas",
      "Parrilla, fogonero y comedor al aire libre",
      "Estacionamiento techado, baño y ducha exteriores",
    ],
  },
] as const;

function Plan({ active }: { active: string }) {
  const on = (id: string) => (active === id ? "fill-oliva stroke-oliva" : "fill-transparent stroke-tinta/40");
  return (
    <figure>
      <svg viewBox="0 0 220 170" className="w-full max-w-xs" role="img" aria-label={`Esquema de la casona con ${WINGS.find((w) => w.id === active)?.name} resaltada`}>
        <rect x="14" y="14" width="124" height="38" className={`${on("uno")} transition-colors duration-500`} strokeWidth="1.2" />
        <rect x="160" y="14" width="40" height="128" className={`${on("dos")} transition-colors duration-500`} strokeWidth="1.2" />
        <path d="M14 60h124" className="stroke-tinta/40" strokeDasharray="2 3" />
        <path d="M152 14v128" className="stroke-tinta/40" strokeDasharray="2 3" />
        <rect x="36" y="96" width="78" height="28" className={`${active === "parque" ? "fill-oliva stroke-oliva" : "fill-transparent stroke-tinta/40"} transition-colors duration-500`} strokeWidth="1.2" />
        <text x="76" y="37" textAnchor="middle" className={`text-[9px] ${active === "uno" ? "fill-cal" : "fill-tinta/60"}`}>Ala Uno</text>
        <text x="180" y="80" textAnchor="middle" className={`text-[9px] ${active === "dos" ? "fill-cal" : "fill-tinta/60"}`} transform="rotate(90 180 80)">Ala Dos</text>
        <text x="75" y="113" textAnchor="middle" className={`text-[9px] ${active === "parque" ? "fill-cal" : "fill-tinta/60"}`}>Pileta</text>
      </svg>
      <figcaption className="mt-2 text-sm text-musgo">Esquema ilustrativo, sin escala: dos bloques en ángulo con galerías hacia el parque.</figcaption>
    </figure>
  );
}

export default function Casona() {
  const [wing, setWing] = useState<(typeof WINGS)[number]["id"]>("uno");
  const w = WINGS.find((x) => x.id === wing)!;
  const ph = photo(w.photo);

  return (
    <section id="casona" className="bg-cal pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5 lg:pt-10">
            <p className="text-sm text-musgo">La casona</p>
            <h2 className="mt-3 max-w-[16ch] font-display text-4xl tracking-tight text-balance sm:text-5xl">Dos alas en ángulo y un mismo parque.</h2>
            <p className="mt-6 max-w-[52ch] text-pretty text-tinta/80">
              Muros de cal, aberturas de madera, mosaicos calcáreos y galerías que miran al verde. SUN es una casa colonial de una sola planta, pensada para familias y grupos de amigos: cada ala tiene su
              cocina y su comedor, y las dos se encuentran en la pileta.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-y-6 border-t border-linea pt-6 sm:grid-cols-4 lg:grid-cols-2">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl tabular">{f.n}</span>
                    <span className="text-sm text-musgo">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="relative lg:col-span-7" delay={0.1}>
            <Image src="/fotos/sun-18.jpg" alt="Galería de columnas blancas de la casona sobre el parque" width={1024} height={768} sizes="(min-width: 1024px) 55vw, 100vw" className="h-auto w-full" />
            <div className="relative -mt-16 ml-auto w-[55%] bg-cal p-1.5 sm:-mt-24 sm:w-[46%] lg:absolute lg:-bottom-20 lg:-left-16 lg:mt-0 lg:ml-0 lg:w-[42%]">
              <Image src="/fotos/sun-05.jpg" alt="Sala del Ala Uno con hogar a leña y mecedora" width={1024} height={682} sizes="(min-width: 1024px) 24vw, 50vw" className="h-auto w-full" />
            </div>
          </Reveal>
        </div>

        <div className="mt-28 grid gap-10 border-t border-linea pt-12 lg:mt-36 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h3 className="font-display text-3xl tracking-tight">Recorré la casa</h3>
            <div role="tablist" aria-label="Partes de la casona" className="mt-6 flex flex-wrap gap-2">
              {WINGS.map((x) => (
                <button
                  key={x.id}
                  role="tab"
                  type="button"
                  id={`tab-${x.id}`}
                  aria-selected={wing === x.id}
                  aria-controls="panel-ala"
                  onClick={() => setWing(x.id)}
                  className={`rounded-full px-4 py-2.5 text-sm transition-colors ${wing === x.id ? "bg-oliva text-cal" : "ring-1 ring-tinta/20 hover:ring-tinta"}`}
                >
                  {x.name}
                </button>
              ))}
            </div>
            <div id="panel-ala" role="tabpanel" aria-labelledby={`tab-${wing}`} className="mt-8">
              <p className="text-sm text-musgo">{w.who}</p>
              <ul className="mt-3 divide-y divide-linea border-y border-linea">
                {w.lines.map((l) => (
                  <li key={l} className="py-3 text-pretty">
                    {l}
                  </li>
                ))}
              </ul>
              <div className="mt-8 hidden sm:block">
                <Plan active={wing} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden bg-linea" style={{ aspectRatio: `${ph.w} / ${ph.h}` }}>
              <AnimatePresence initial={false}>
                <motion.div key={ph.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                  <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="mt-3 text-sm text-musgo">{ph.alt}</p>
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-linea pt-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="font-display text-3xl tracking-tight">Dormitorios</h3>
            <ul className="mt-6 space-y-5">
              {BEDROOMS.map((b) => (
                <li key={b.name}>
                  <p className="font-medium">{b.name}</p>
                  <p className="mt-1 text-pretty text-tinta/70">{b.beds}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <h3 className="font-display text-3xl tracking-tight">Lo que hay en la casa</h3>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {AMENITIES.map((g) => (
                <div key={g.group}>
                  <p className="text-sm text-musgo">{g.group}</p>
                  <ul className="mt-3 space-y-2">
                    {g.items.map((i) => (
                      <li key={i} className="text-pretty">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 bg-blanco p-5 ring-1 ring-tinta/5 sm:p-6">
              <p className="font-medium">Para saber antes de venir</p>
              <ul className="mt-3 grid gap-x-8 gap-y-2 text-tinta/75 sm:grid-cols-2">
                {GOOD_TO_KNOW.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
