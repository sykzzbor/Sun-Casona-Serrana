"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ADDRESS, LINKS } from "@/lib/content";
import Logo, { SunMark } from "./Logo";
import Reveal from "./Reveal";

const NEAR = [
  ["Dique La Quebrada", "Por la misma avenida, sierra arriba"],
  ["Centro de Río Ceballos", "Por Av. San Martín, hacia el sur"],
  ["Aeropuerto de Córdoba", "Aprox. 30 km por ruta"],
  ["Ciudad de Córdoba", "Aprox. 40 km por ruta"],
];

export function Location() {
  return (
    <section id="ubicacion" className="bg-cal py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5 lg:order-2">
          <p className="flex items-center gap-3 text-sm text-musgo"><span className="h-px w-8 bg-ladrillo" />Ubicación</p>
          <h2 className="mt-3 max-w-[16ch] font-display text-4xl tracking-tight text-balance sm:text-5xl">En el alto de Río Ceballos, camino al dique.</h2>
          <p className="mt-6 max-w-[48ch] text-pretty text-tinta/80">
            Río Ceballos es la puerta de las Sierras Chicas: arroyos, senderos y el Dique La Quebrada a pocos minutos. La casona queda sobre la avenida principal, con acceso por ruta, pero el predio se
            siente aparte.
          </p>
          <dl className="mt-8 divide-y divide-linea border-y border-linea">
            {NEAR.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6">
                <dt>{k}</dt>
                <dd className="text-tinta/65">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 rounded-2xl bg-blanco p-5 ring-1 ring-tinta/5">
            <p className="font-medium">{ADDRESS}</p>
            <p className="mt-1 text-sm text-tinta/70">El mapa de algunas plataformas muestra una ubicación aproximada. Para llegar, usá esta dirección.</p>
            <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full px-4 py-2.5 text-sm ring-1 ring-oliva transition-colors hover:bg-oliva hover:text-cal">
              Abrir en Google Maps
            </a>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:order-1" delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-linea ring-1 ring-tinta/5 sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[36rem]">
            <iframe
              title="Mapa de SUN Casona Serrana en Río Ceballos"
              src="https://www.google.com/maps?q=Sun%20Casona%20Serrana%2C%20Av.%20San%20Mart%C3%ADn%207818%2C%20R%C3%ADo%20Ceballos%2C%20C%C3%B3rdoba&z=13&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 [filter:sepia(0.25)_saturate(0.75)_contrast(0.95)]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const IG = [112, 105, 107, 109, 110, 108].map((n) => `/fotos/ig-${String(n - 100).padStart(2, "0")}.jpg`);
const ease = [0.22, 1, 0.36, 1] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-oliva text-cal">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-8 sm:pt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }} className="lg:col-span-7">
            <SunMark className="h-12 w-20" leaf="#c9d3a8" sun="#e58a6e" />
            <p className="mt-6 max-w-[16ch] font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Elegí tu forma de <em className="text-[#f0c3ad]">habitar las sierras.</em>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#reservar" className="group inline-flex items-center gap-2 rounded-full bg-cal py-3.5 pr-5 pl-6 text-oliva transition-colors hover:bg-blanco active:scale-[0.98]">
                Ver fechas y precios
                <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </a>
              <a href={LINKS.instagramDM} target="_blank" rel="noopener noreferrer" className="rounded-full px-6 py-3.5 ring-1 ring-cal/35 transition hover:bg-cal/10">
                Escribir por Instagram
              </a>
            </div>
          </motion.div>

          <div className="lg:col-span-5">
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
                @sun.casonaserrana
              </span>
              <span className="text-cal/60 transition-colors group-hover:text-cal">2.069 seguidores →</span>
            </a>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {IG.map((src, i) => (
                <motion.li key={src} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: i * 0.06 }}>
                  <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-lg" aria-label="Ver publicación en Instagram">
                    <Image src={src} alt="" fill sizes="(min-width: 1024px) 13vw, 30vw" className="object-cover transition-transform duration-700 ease-(--ease-sol) group-hover:scale-110" />
                    <span className="absolute inset-0 bg-monte/0 transition-colors duration-300 group-hover:bg-monte/30" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-cal/15 pt-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-cal/55">Reservas</p>
            <ul className="mt-4 space-y-3">
              <li><a href="#reservar" className="hover:underline">Consultar disponibilidad</a></li>
              <li><a href={LINKS.airbnb} target="_blank" rel="noopener noreferrer" className="hover:underline">Anuncio en Airbnb</a></li>
              <li className="text-cal/70">Check-in desde las 14 h</li>
            </ul>
          </div>
          <div>
            <p className="text-cal/55">Contacto</p>
            <ul className="mt-4 space-y-3">
              <li><a href={LINKS.instagramDM} target="_blank" rel="noopener noreferrer" className="hover:underline">Mensaje directo en Instagram</a></li>
              <li><a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="hover:underline">{ADDRESS}</a></li>
            </ul>
          </div>
          <div>
            <p className="text-cal/55">La casona</p>
            <ul className="mt-4 space-y-3 text-cal/85">
              <li>Dos alas para 6 huéspedes cada una</li>
              <li>Pileta, parque y parrilla</li>
              <li>Mascotas bienvenidas</li>
            </ul>
          </div>
          <div>
            <p className="text-cal/55">Explorar</p>
            <ul className="mt-4 space-y-3">
              <li><a href="#casona" className="hover:underline">La casona</a></li>
              <li><a href="#galeria" className="hover:underline">Galería</a></li>
              <li><a href="#resenas" className="hover:underline">Reseñas</a></li>
              <li><Link href="/admin" className="hover:underline">Panel de la propietaria</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-8 border-t border-cal/15 py-12 sm:flex-row sm:justify-between">
          <Logo tone="light" />
          <p className="text-center text-sm text-cal/55">Demo comercial · Fotos de Airbnb e Instagram · Tarifas de ejemplo</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group grid size-12 place-items-center rounded-full ring-1 ring-cal/30 transition hover:bg-cal hover:text-oliva active:scale-95"
            aria-label="Volver arriba"
          >
            <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 13V3M4 7l4-4 4 4" /></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
