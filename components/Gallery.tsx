"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { photos, type Photo } from "@/lib/photos";

const ease = [0.22, 1, 0.36, 1] as const;

const FILTERS: { id: string; label: string; note: string; test: (p: Photo) => boolean }[] = [
  { id: "todas", label: "Todas", note: "Todo el recorrido, de la tranquera a los dormitorios.", test: () => true },
  { id: "exterior", label: "Casona y parque", note: "Muros de cal, galerías de columnas y cortaderas.", test: (p) => p.cat === "exterior" },
  { id: "pileta", label: "Pileta", note: "Deck de madera y la sierra de fondo.", test: (p) => p.cat === "pileta" || p.id === 112 || p.id === 107 },
  { id: "ala-uno", label: "Ala Uno", note: "Suite, hogar a leña y comedor con vigas.", test: (p) => p.cat === "ala-uno" },
  { id: "ala-dos", label: "Ala Dos", note: "La galería vidriada y sus cuatro camas.", test: (p) => p.cat === "ala-dos" },
  { id: "dormitorios", label: "Dormitorios", note: "Cuatro dormitorios y diez camas.", test: (p) => !!p.dormitorio || p.id === 108 },
  { id: "momentos", label: "Momentos", note: "Lo que comparte SUN en su Instagram.", test: (p) => p.cat === "momentos" },
];

/** Filas justificadas: todas las fotos enteras, en su proporción, llenando el ancho. */
function justify(list: Photo[], width: number, target: number, gap: number) {
  const out: { p: Photo; w: number; h: number }[] = [];
  let row: Photo[] = [];
  let sum = 0;
  const flush = (last: boolean) => {
    const free = width - gap * (row.length - 1);
    const h = last ? Math.min(target, free / sum) : free / sum;
    row.forEach((p) => out.push({ p, w: Math.floor(h * (p.w / p.h) * 100) / 100, h }));
    row = [];
    sum = 0;
  };
  for (const p of list) {
    row.push(p);
    sum += p.w / p.h;
    if (sum * target + gap * (row.length - 1) >= width) flush(false);
  }
  if (row.length) flush(true);
  return out;
}

export default function Gallery() {
  const [filter, setFilter] = useState("todas");
  const [open, setOpen] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const [all, setAll] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const f = FILTERS.find((x) => x.id === filter)!;
  const list = photos.filter(f.test);
  const LIMIT = 15;
  const shown = all || list.length <= LIMIT + 3 ? list : list.slice(0, LIMIT);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mobile = width < 640;
  const gap = mobile ? 6 : 12;
  const tiles = width ? justify(shown, width, mobile ? 150 : width < 1024 ? 230 : 290, gap) : [];

  // Cursor "Ver" que sigue al puntero sobre la grilla (solo con mouse).
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const sx = useSpring(mx, { stiffness: 500, damping: 40 });
  const sy = useSpring(my, { stiffness: 500, damping: 40 });
  const [hovering, setHovering] = useState(false);

  return (
    <section id="galeria" className="relative overflow-hidden bg-blanco py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 text-sm text-musgo">
              <span className="h-px w-8 bg-ladrillo" />
              Galería · {photos.length} fotos reales
            </p>
            <h2 className="mt-4 max-w-[16ch] font-display text-4xl tracking-tight text-balance sm:text-5xl">
              Recorrela antes de <em className="text-oliva">llegar.</em>
            </h2>
          </div>
          <div className="lg:col-span-6">
            <LayoutGroup id="filtros">
              <div role="radiogroup" aria-label="Filtrar fotos" className="flex flex-wrap gap-1.5 lg:justify-end">
                {FILTERS.map((x) => {
                  const on = filter === x.id;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setFilter(x.id);
                        setAll(false);
                      }}
                      className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-200 ${on ? "text-cal" : "text-tinta/70 hover:text-tinta"}`}
                    >
                      {on && <motion.span layoutId="filtro-activo" className="absolute inset-0 rounded-full bg-oliva" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                      <span className="relative">
                        {x.label} <span className={`tabular ${on ? "text-cal/65" : "text-tinta/35"}`}>{photos.filter(x.test).length}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
            <AnimatePresence mode="wait">
              <motion.p
                key={f.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-4 text-sm text-musgo lg:text-right"
              >
                {f.note}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div
          ref={box}
          className="relative mt-10 min-h-[40rem] [@media(hover:hover)]:cursor-none"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
        >
          <LayoutGroup id="galeria">
            <motion.ul layout className="flex flex-wrap" style={{ gap }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {tiles.map(({ p, w, h }, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.55, ease, delay: Math.min(i, 12) * 0.025 }}
                    style={{ width: w, height: h }}
                  >
                    <button type="button" onClick={() => setOpen(p.id)} className="group relative block size-full overflow-hidden rounded-md bg-linea" aria-label={`Ampliar: ${p.alt}`}>
                      <motion.div layoutId={`foto-${p.id}`} className="absolute inset-0" transition={{ duration: 0.5, ease }}>
                        <Image src={p.src} alt={p.alt} fill sizes={`${Math.ceil(w)}px`} className="object-cover transition-transform duration-700 ease-(--ease-sol) group-hover:scale-[1.04]" />
                      </motion.div>
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-monte/80 to-transparent px-3 pt-10 pb-3 text-left text-sm text-cal opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {p.alt}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            <AnimatePresence>{open !== null && <Lightbox list={list} id={open} setId={setOpen} />}</AnimatePresence>
          </LayoutGroup>

          <motion.span
            aria-hidden="true"
            style={{ x: sx, y: sy }}
            animate={{ scale: hovering && open === null ? 1 : 0, opacity: hovering && open === null ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute top-0 left-0 z-10 -mt-9 -ml-9 hidden size-18 place-items-center rounded-full bg-ladrillo text-sm text-cal [@media(hover:hover)]:grid"
          >
            Ver
          </motion.span>
        </div>
        {shown.length < list.length && (
          <div className="relative -mt-40 flex justify-center bg-linear-to-t from-blanco via-blanco/90 to-transparent pt-32">
            <button type="button" onClick={() => setAll(true)} className="group inline-flex items-center gap-2 rounded-full bg-oliva py-3.5 pr-5 pl-6 text-cal transition-colors hover:bg-oliva-2 active:scale-[0.98]">
              Ver las {list.length} fotos
              <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" /></svg>
            </button>
          </div>
        )}
        <p className="mt-6 flex flex-wrap gap-x-4 text-sm text-musgo">
          <span>Fotos del anuncio oficial en Airbnb y del Instagram @sun.casonaserrana.</span>
          <span className="hidden sm:inline">Tocá una foto para verla grande · ← → para recorrer.</span>
        </p>
      </div>
    </section>
  );
}

function Lightbox({ list, id, setId }: { list: Photo[]; id: number; setId: (id: number | null) => void }) {
  const index = Math.max(0, list.findIndex((p) => p.id === id));
  const p = list[index];
  const [dir, setDir] = useState(0);
  const [first, setFirst] = useState(true);

  const go = useCallback(
    (d: number) => {
      setFirst(false);
      setDir(d);
      setId(list[(index + d + list.length) % list.length].id);
    },
    [index, list, setId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setId(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, setId]);

  const ratio = p.w / p.h;

  return (
    <div role="dialog" aria-modal="true" aria-label="Galería ampliada" className="fixed inset-0 z-50">
      <motion.div className="absolute inset-0 bg-monte/95 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={() => setId(null)} />
      <div className="pointer-events-none absolute inset-0 flex flex-col text-cal">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-auto flex items-center justify-between px-4 py-4 sm:px-8">
          <p className="text-sm tabular text-cal/70">
            <span className="text-cal">{String(index + 1).padStart(2, "0")}</span> / {String(list.length).padStart(2, "0")}
          </p>
          <button type="button" autoFocus onClick={() => setId(null)} className="rounded-full px-4 py-2 text-sm ring-1 ring-cal/30 transition hover:bg-cal hover:text-monte">
            Cerrar
          </button>
        </motion.div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-24">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={p.id}
              layoutId={first ? `foto-${p.id}` : undefined}
              custom={dir}
              initial={first ? undefined : { opacity: 0, x: dir * 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -80, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, ease }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -400) go(1);
                else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
              }}
              className="pointer-events-auto relative overflow-hidden rounded-md shadow-2xl"
              style={{ width: `min(92vw, calc((100svh - 11rem) * ${ratio}))`, aspectRatio: `${p.w} / ${p.h}` }}
            >
              <Image src={p.src} alt={p.alt} fill sizes="92vw" quality={90} className="pointer-events-none object-cover" priority />
            </motion.div>
          </AnimatePresence>
          <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="pointer-events-auto absolute top-1/2 left-4 hidden size-12 -translate-y-1/2 place-items-center rounded-full ring-1 ring-cal/30 transition hover:bg-cal hover:text-monte sm:grid">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="pointer-events-auto absolute top-1/2 right-4 hidden size-12 -translate-y-1/2 place-items-center rounded-full ring-1 ring-cal/30 transition hover:bg-cal hover:text-monte sm:grid">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="px-4 py-5 text-center font-display text-lg text-pretty sm:text-xl">
            {p.alt}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
