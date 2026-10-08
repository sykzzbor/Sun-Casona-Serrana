// iCalendar (RFC 5545), el formato que Airbnb y Booking usan para exportar e importar
// disponibilidad. Fechas de día completo: DTEND es exclusivo (= día de salida).
import { addDays, type ISO } from "./booking";

export type IcsEvent = { start: ISO; end: ISO; summary: string; uid?: string };

const toICSDate = (d: ISO) => d.replaceAll("-", "");
const fromICSDate = (v: string): ISO | null => {
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

export function buildICS(events: IcsEvent[], calName = "SUN Casona Serrana"): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SUN Casona Serrana//Reservas//ES",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${calName}`,
    ...events.flatMap((e, i) => [
      "BEGIN:VEVENT",
      `UID:${e.uid ?? `${e.start}-${i}`}@suncasonaserrana`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toICSDate(e.start)}`,
      `DTEND;VALUE=DATE:${toICSDate(e.end)}`,
      `SUMMARY:${e.summary.replace(/[,;]/g, " ")}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function parseICS(text: string): IcsEvent[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const events: IcsEvent[] = [];
  for (const chunk of unfolded.split("BEGIN:VEVENT").slice(1)) {
    const body = chunk.split("END:VEVENT")[0];
    const field = (name: string) => body.match(new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, "m"))?.[1]?.trim();
    const start = fromICSDate(field("DTSTART") ?? "");
    if (!start) continue;
    const end = fromICSDate(field("DTEND") ?? "") ?? addDays(start, 1);
    events.push({ start, end: end > start ? end : addDays(start, 1), summary: field("SUMMARY") ?? "Bloqueado", uid: field("UID") });
  }
  return events;
}

export function downloadFile(filename: string, content: string, type = "text/calendar") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
