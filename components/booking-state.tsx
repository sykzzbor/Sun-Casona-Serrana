"use client";

import { createContext, useContext, useState } from "react";
import type { ISO } from "@/lib/booking";

export type Stay = { checkIn: ISO | null; checkOut: ISO | null; adults: number; children: number; infants: number; pets: boolean };

const initial: Stay = { checkIn: null, checkOut: null, adults: 2, children: 0, infants: 0, pets: false };
const Ctx = createContext<{ stay: Stay; setStay: (s: Partial<Stay>) => void } | null>(null);

/** Estado compartido entre el buscador del hero y la sección de reservas. */
export function StayProvider({ children }: { children: React.ReactNode }) {
  const [stay, set] = useState<Stay>(initial);
  return <Ctx.Provider value={{ stay, setStay: (s) => set((prev) => ({ ...prev, ...s })) }}>{children}</Ctx.Provider>;
}

export function useStay() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStay fuera de StayProvider");
  return c;
}

export function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-sm text-musgo">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Quitar ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-9 place-items-center rounded-full ring-1 ring-tinta/20 transition hover:ring-tinta disabled:opacity-30 disabled:hover:ring-tinta/20"
        >
          <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8" /></svg>
        </button>
        <span className="w-5 text-center tabular" aria-live="polite">{value}</span>
        <button
          type="button"
          aria-label={`Sumar ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid size-9 place-items-center rounded-full ring-1 ring-tinta/20 transition hover:ring-tinta disabled:opacity-30 disabled:hover:ring-tinta/20"
        >
          <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2v8" /></svg>
        </button>
      </div>
    </div>
  );
}

export function GuestFields({ cap }: { cap: number }) {
  const { stay, setStay } = useStay();
  const counted = stay.adults + stay.children;
  return (
    <div className="divide-y divide-linea">
      <Stepper label="Adultos" hint="13 años o más" value={stay.adults} min={1} max={cap - stay.children} onChange={(adults) => setStay({ adults })} />
      <Stepper label="Niños" hint="De 2 a 12 años" value={stay.children} min={0} max={cap - stay.adults} onChange={(children) => setStay({ children })} />
      <Stepper label="Bebés" hint="No suman al cupo" value={stay.infants} min={0} max={4} onChange={(infants) => setStay({ infants })} />
      <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
        <span>
          <span className="block text-sm font-medium">Viajo con mascota</span>
          <span className="block text-sm text-musgo">La casa las recibe</span>
        </span>
        <span className="group relative inline-flex w-11 shrink-0 rounded-full bg-tinta/15 p-0.5 outline-offset-2 outline-ladrillo transition-colors duration-200 has-checked:bg-oliva has-focus-visible:outline-2">
          <span className="aspect-square w-1/2 rounded-full bg-blanco shadow-xs ring-1 ring-tinta/5 transition-transform duration-200 group-has-checked:translate-x-full" />
          <input
            type="checkbox"
            name="mascota"
            checked={stay.pets}
            onChange={(e) => setStay({ pets: e.target.checked })}
            className="absolute inset-0 size-full cursor-pointer appearance-none focus:outline-hidden"
          />
        </span>
      </label>
      {counted >= cap && <p className="py-3 text-sm text-musgo">Llegaste al máximo de {cap} huéspedes de la casona.</p>}
    </div>
  );
}
