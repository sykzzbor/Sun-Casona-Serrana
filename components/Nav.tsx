"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import Logo from "./Logo";

const LINKS = [
  ["La casona", "#casona"],
  ["Galería", "#galeria"],
  ["Un día en SUN", "#experiencia"],
  ["Reseñas", "#resenas"],
  ["Ubicación", "#ubicacion"],
] as const;

/** Arco del sol: el punto recorre el cielo de este a oeste a medida que se baja por la página. */
export function SunArc({ progress, className = "" }: { progress: import("framer-motion").MotionValue<number>; className?: string }) {
  const cx = useTransform(progress, (p) => 20 + 16 * Math.cos(Math.PI * (1 - p)));
  const cy = useTransform(progress, (p) => 20 - 16 * Math.sin(Math.PI * (1 - p)));
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden="true">
      <path d="M4 20a16 16 0 0 1 32 0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2.5" />
      <path d="M1 20h38" stroke="currentColor" strokeWidth="1" />
      <motion.circle cx={cx} cy={cy} r="3" fill="#a85a3c" />
    </svg>
  );
}

export default function Nav() {
  const { scrollYProgress, scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled || open ? "bg-cal/95 shadow-[0_1px_0_var(--color-linea)] backdrop-blur" : "bg-cal"}`}>
      <motion.span aria-hidden="true" style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 bottom-0 h-px origin-left bg-ladrillo" />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8" aria-label="Principal">
        <a href="#top" aria-label="SUN Casona Serrana, inicio" className="relative">
          <Logo />
        </a>
        <ul className="hidden items-center gap-7 text-sm lg:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="group relative py-1 text-tinta/75 transition-colors hover:text-tinta">
                {label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ladrillo transition-transform duration-300 ease-(--ease-sol) group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href="#reservar" className="rounded-full bg-oliva px-4 py-2 text-sm text-cal transition-colors hover:bg-oliva-2 active:scale-[0.97]">
            Reservar
          </a>
          <button
            type="button"
            className="relative grid size-10 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute h-px w-5 bg-tinta transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`} />
            <span className={`absolute h-px w-5 bg-tinta transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul
            id="menu-movil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-linea px-4 lg:hidden"
          >
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} onClick={() => setOpen(false)} className="block border-b border-linea py-4 font-display text-2xl">
                  {label}
                </a>
              </li>
            ))}
            <li className="py-5">
              <a href="#reservar" onClick={() => setOpen(false)} className="block rounded-full bg-oliva px-4 py-3.5 text-center text-cal">
                Ver fechas y precios
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
