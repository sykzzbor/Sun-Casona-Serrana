// Datos publicados por SUN en Airbnb e Instagram (relevados en octubre de 2026).
// Reseñas: texto completo de Airbnb, solo con tildes y puntuación normalizadas.
export const LINKS = {
  airbnb: "https://www.airbnb.com.ar/rooms/994839124804959700",
  airbnbReviews: "https://www.airbnb.com.ar/rooms/994839124804959700/reviews",
  instagram: "https://www.instagram.com/sun.casonaserrana/",
  instagramDM: "https://ig.me/m/sun.casonaserrana",
  maps: "https://maps.app.goo.gl/C6Ju311hkvo4a41c8",
  // Sin perfil público en Booking al momento del relevamiento: se completa desde el panel cuando exista.
  booking: null as string | null,
};

export const ADDRESS = "Av. San Martín 7818, Río Ceballos, Córdoba";

export const FACTS = [
  { n: "12", label: "huéspedes" },
  { n: "4", label: "dormitorios" },
  { n: "10", label: "camas" },
  { n: "3+1", label: "baños + baño exterior" },
];

export const BEDROOMS = [
  { name: "Suite principal · Ala Uno", beds: "1 cama doble y 1 de una plaza, baño en suite y puerta ventana a la pileta" },
  { name: "Dormitorio · Ala Uno", beds: "2 camas de una plaza" },
  { name: "Dormitorio matrimonial · Ala Dos", beds: "1 cama doble y 1 de una plaza" },
  { name: "Dormitorio grande · Ala Dos", beds: "4 camas de una plaza" },
];

export const AMENITIES: { group: string; items: string[] }[] = [
  { group: "Afuera", items: ["Pileta con deck", "Parque y patio", "Parrilla y utensilios", "Lugar para fogatas", "Comedor al aire libre", "Ducha exterior", "Estacionamiento gratis en la propiedad"] },
  { group: "Adentro", items: ["Dos cocinas completas", "Dos comedores para seis", "Chimenea y hogar a leña", "Calefacción", "Wifi", "Casa de una sola planta"] },
  { group: "Descanso", items: ["Sábanas, toallas y blancos", "Almohadas y mantas extra", "Cortinas que oscurecen", "Agua caliente", "Productos de limpieza"] },
  { group: "Servicios", items: ["Mascotas bienvenidas", "Guarda de equipaje", "Estadías largas (28 noches o más)"] },
];

export const GOOD_TO_KNOW = [
  "Check-in a partir de las 14 h",
  "Máximo 12 huéspedes",
  "Sin televisión, lavarropas ni aire acondicionado",
  "Invitados por el día con cargo por persona",
];

export const RATING = {
  overall: "5,0",
  count: 11,
  categories: [
    { label: "Limpieza", value: "5,0" },
    { label: "Veracidad", value: "4,9" },
    { label: "Check-in", value: "4,8" },
    { label: "Ubicación", value: "4,8" },
    { label: "Precio según calidad", value: "4,8" },
    { label: "Comunicación", value: "4,7" },
  ],
};

export type Review = { name: string; from: string; date: string; trip?: string; text: string };

export const REVIEWS: Review[] = [
  {
    name: "Gustavo",
    from: "Troy, Nueva York",
    date: "febrero de 2026",
    trip: "Viaje en grupo",
    text: "La casona es un gran lugar para grupos o reuniones familiares. Son en realidad dos bloques separados (uno con galería cerrada y otra abierta) dispuestos en ángulo, ambos con cocinas. El entorno es muy tranquilo, aunque está al lado de la calle principal, cerca del dique, el predio se siente muy íntimo. Al llegar, la casa estaba limpia, el jardín y la pileta bien mantenida. Las camas muy buenas y bien provistas. La comunicación fue fluida y genuina. El proceso de checkin flexible. Muy recomendable. Esperamos volver.",
  },
  {
    name: "Stephani",
    from: "7 años en Airbnb",
    date: "enero de 2024",
    trip: "Estadía con niños",
    text: "La estadía en Río Ceballos fue espectacular. Fui con familia y amigos, éramos 11, tenía todas las comodidades, súper cómoda y con todo lo necesario para pasar unos días espectaculares. Disfrutamos de la piscina (es ideal para ir con niños). Evelyn súper atenta y preocupada. ¡Volveríamos sin pensarlo!",
  },
  {
    name: "Cecilia",
    from: "3 años en Airbnb",
    date: "septiembre de 2024",
    trip: "Viaje en grupo",
    text: "La casa cómoda y fresca para días de calor. Éramos 14 personas y estábamos súper cómodos todos. Cumple con todos los servicios. La atención tanto de Evelyn como Coti muy buena, siempre atentas a si necesitábamos algo. ¡Súper recomendada! Y ni hablar que volveríamos a ir.",
  },
  {
    name: "Juan",
    from: "Maldonado, Uruguay",
    date: "julio de 2024",
    trip: "Viaje en grupo",
    text: "La casa es hermosa, dan ganas de quedarse mucho tiempo allí, la limpieza al llegar excelente y Coti quien nos recibió muy amable.",
  },
  {
    name: "Julián",
    from: "La Tablada, Argentina",
    date: "diciembre de 2023",
    trip: "Viaje en grupo",
    text: "Todo 10 puntos. Excelente ubicación; muy buen parque y piscina. Las instalaciones en muy buen estado.",
  },
  {
    name: "Marcos",
    from: "Córdoba, Argentina",
    date: "marzo de 2024",
    trip: "Viaje en grupo",
    text: "Todo excelente. Muy buena predisposición, comodísima, bien ubicada. Súper recomendable. ¡La atención de Coty una genia! ¡Volveremos, gracias!",
  },
  {
    name: "Emilio",
    from: "Azul, Argentina",
    date: "enero de 2025",
    trip: "Estadía con niños",
    text: "Muy linda casa, más si vas en grupo como fuimos nosotros, muy tranquila la zona. Lo único para mejorar es la ubicación que marca la aplicación, ya que es errónea. Después, excelente atención de Evelyn, Coti y Cielo. Muy agradecidos.",
  },
  {
    name: "Eugenia",
    from: "Córdoba, Argentina",
    date: "agosto de 2024",
    trip: "Estadía de una noche",
    text: "Hermosa casa en entorno natural y zona tranquila. Recomiendo al anfitrión.",
  },
  {
    name: "Nicolás",
    from: "6 años en Airbnb",
    date: "junio de 2024",
    trip: "Viaje en grupo",
    text: "Todo tal cual en las fotos y muy buena atención de la propietaria. Volvería.",
  },
  { name: "Mario", from: "4 años en Airbnb", date: "diciembre de 2024", trip: "Viaje en grupo", text: "Muy lindo lugar. Ideal para descanso." },
  { name: "Diana", from: "Lake Worth Beach, Florida", date: "diciembre de 2024", trip: "Estadía con niños", text: "Un lugar increíble." },
];
