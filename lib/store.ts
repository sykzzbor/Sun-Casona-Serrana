"use client";

import { useSyncExternalStore } from "react";
import { addDays, todayISO, uid, type Block, type BookingRequest, type DB, type Settings, type SyncConfig } from "./booking";

// Persistencia local de la demo. En producción este módulo se reemplaza por una API
// (mismas funciones, mismos tipos) y la web pública no cambia.
const KEY = "sun-casona:v1";

function seed(): DB {
  const t = todayISO();
  const y = Number(t.slice(0, 4));
  const summerYear = Number(t.slice(5, 7)) >= 3 ? y : y - 1;
  const winterYear = Number(t.slice(5, 7)) >= 8 ? y + 1 : y;

  const settings: Settings = {
    baseNightly: 300000,
    baseMinNights: 2,
    weekendPct: 10,
    cleaningFee: 60000,
    longStayNights: 7,
    longStayPct: 10,
    dayGuestFee: 15000,
    depositPct: 30,
    maxGuests: 12,
    seasons: [
      { id: uid(), name: "Temporada de verano", start: `${summerYear}-12-15`, end: `${summerYear + 1}-02-28`, nightly: 420000, minNights: 3 },
      { id: uid(), name: "Fiestas de fin de año", start: `${summerYear}-12-23`, end: `${summerYear + 1}-01-02`, nightly: 520000, minNights: 4 },
      { id: uid(), name: "Vacaciones de invierno", start: `${winterYear}-07-06`, end: `${winterYear}-07-26`, nightly: 360000, minNights: 3 },
    ],
  };

  const ranges: [number, number][] = [[3, 5], [10, 12], [17, 20], [31, 34], [45, 47], [52, 55], [66, 70], [79, 81], [94, 101]];
  const blocks: Block[] = ranges.map(([a, b]) => ({ id: uid(), start: addDays(t, a), end: addDays(t, b), note: "Ocupado (dato de ejemplo)", source: "ejemplo" }));

  const requests: BookingRequest[] = [
    {
      id: uid(), code: "SUN-DEMO-01", createdAt: new Date().toISOString(), checkIn: addDays(t, 24), checkOut: addDays(t, 27),
      adults: 8, children: 3, infants: 0, pets: true, dayGuests: 0, name: "Familia de ejemplo", email: "ejemplo@correo.com",
      phone: "+54 9 351 000 0000", city: "Córdoba", arrival: "16 a 18 h", message: "Solicitud de muestra para ver el panel.",
      total: 1050000, status: "pendiente", demo: true,
    },
  ];

  const sync: SyncConfig = { airbnbIcal: "", bookingIcal: "", bookingUrl: "", lastImport: null };
  return { version: 1, settings, blocks, requests, sync };
}

let cache: DB | null = null;
const listeners = new Set<() => void>();

function read(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as DB) : seed();
    if (!raw) localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    cache = seed();
  }
  return cache;
}

function write(next: DB) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* almacenamiento bloqueado: la demo sigue en memoria */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** null en el servidor y en la hidratación; el DB real apenas monta el cliente. */
export function useDB(): DB | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

const update = (fn: (db: DB) => DB) => write(fn(read()));

export const actions = {
  saveSettings: (settings: Settings) => update((db) => ({ ...db, settings })),
  addBlock: (b: Omit<Block, "id">) => update((db) => ({ ...db, blocks: [...db.blocks, { ...b, id: uid() }] })),
  addBlocks: (bs: Omit<Block, "id">[]) => update((db) => ({ ...db, blocks: [...db.blocks, ...bs.map((b) => ({ ...b, id: uid() }))] })),
  removeBlock: (id: string) => update((db) => ({ ...db, blocks: db.blocks.filter((b) => b.id !== id) })),
  addRequest: (r: BookingRequest) => update((db) => ({ ...db, requests: [r, ...db.requests] })),
  setStatus: (id: string, status: BookingRequest["status"]) =>
    update((db) => ({ ...db, requests: db.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
  removeRequest: (id: string) => update((db) => ({ ...db, requests: db.requests.filter((r) => r.id !== id) })),
  saveSync: (sync: SyncConfig) => update((db) => ({ ...db, sync })),
  reset: () => write(seed()),
};
