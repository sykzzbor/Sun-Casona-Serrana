# SUN Casona Serrana — demo web con reservas directas

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion. Sin backend: todo corre en el navegador.

```bash
npm install
npm run dev        # http://localhost:3007
npm run build && npm start
```

## Rutas

| Ruta | Qué hay |
|---|---|
| `/` | Hero con buscador de fechas, La casona (alas, dormitorios, comodidades), Galería (36 fotos, filtros, lightbox con teclado y swipe), Un día en SUN, Disponibilidad y reservas, Reseñas, Ubicación |
| `/admin` | Panel de la propietaria: solicitudes (confirmar / rechazar / eliminar), bloqueo de fechas, tarifas y temporadas, sincronización iCal |

## Origen de los datos

- **Fotos** (`public/fotos/`): las 36 del anuncio oficial en Airbnb (`rooms/994839124804959700`). Ninguna inventada.
- **Descripción, distribución, comodidades, normas, dirección**: anuncio de Airbnb y bio de Instagram (@sun.casonaserrana), relevados en octubre de 2026. Dirección: Av. San Martín 7818, Río Ceballos (link de Google Maps de la bio).
- **Reseñas** (`lib/content.ts`): las 11 evaluaciones de Airbnb (5,0), texto completo con tildes y puntuación normalizadas.
- **Booking**: no se encontró perfil público. El enlace se carga desde `/admin → Sincronización` y aparece solo en Reseñas.
- **Tarifas**: valores de ejemplo, marcados como tales en la web. No son precios publicados por SUN; se reemplazan desde `/admin → Tarifas`.
- **Fechas ocupadas**: datos de ejemplo generados relativos al día de hoy, marcados como "ejemplo" en el panel.

## Cómo funciona la reserva

- `lib/booking.ts`: fechas `YYYY-MM-DD`, una estadía `[checkIn, checkOut)` ocupa las noches entre ambos. Tarifa por temporada (si se superponen, gana la mayor), recargo viernes/sábado, estadía mínima por temporada, limpieza, descuento por estadía larga, invitados por el día y seña.
- `lib/store.ts`: persistencia en `localStorage` con `useSyncExternalStore`. Las solicitudes pendientes y confirmadas bloquean fechas; rechazar las libera. Los cambios del panel se ven al instante, incluso en otra pestaña.
- `lib/ical.ts`: lectura y escritura de iCalendar (RFC 5545), el formato que usan Airbnb y Booking.

## Próximo paso: sincronización real con Airbnb / Booking

1. Reemplazar `lib/store.ts` por una API (mismas funciones y tipos) sobre una base de datos.
2. Exponer `GET /api/calendar.ics` con `buildICS()` → pegar esa URL en Airbnb y Booking para que importen las reservas directas.
3. Un cron cada 1–3 h que descargue las URLs iCal guardadas en `/admin → Sincronización`, las procese con `parseICS()` y actualice los bloqueos con `source: "ical"`.
4. Agregar login al panel y notificación (email o WhatsApp) al recibir una solicitud.
