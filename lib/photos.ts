// Fotos reales del anuncio oficial de SUN en Airbnb (rooms/994839124804959700).
export type PhotoCat = "exterior" | "pileta" | "ala-uno" | "ala-dos" | "momentos";

export type Photo = {
  id: number;
  src: string;
  w: number;
  h: number;
  alt: string;
  cat: PhotoCat;
  dormitorio?: boolean;
};

const p = (id: number, w: number, h: number, cat: PhotoCat, alt: string, dormitorio = false): Photo => ({
  id,
  src: id > 100 ? `/fotos/ig-${String(id - 100).padStart(2, "0")}.jpg` : `/fotos/sun-${String(id).padStart(2, "0")}.jpg`,
  w,
  h,
  cat,
  alt,
  dormitorio,
});

export const photos: Photo[] = [
  p(11, 1024, 768, "exterior", "La casona al atardecer, con las galerías encendidas"),
  p(12, 1024, 682, "exterior", "Galería abierta con columnas y cortaderas"),
  p(13, 1024, 682, "pileta", "La casa y la pileta desde el parque"),
  p(14, 1024, 682, "exterior", "Fachada del Ala Dos con sus ventanales de hierro"),
  p(15, 1024, 683, "exterior", "Fogonero y parrilla en el parque"),
  p(16, 1024, 768, "exterior", "Ladrillo visto, alero y puerta de madera"),
  p(17, 1024, 682, "exterior", "Frente con frontis colonial"),
  p(18, 1024, 768, "exterior", "Galería de columnas blancas sobre el parque"),
  p(19, 576, 1024, "pileta", "La pileta y el deck de madera"),
  p(20, 576, 1024, "pileta", "Pileta con vista a la sierra"),
  p(21, 768, 1024, "pileta", "Deck de madera junto al agua"),
  p(1, 1023, 682, "ala-uno", "Comedor del Ala Uno visto desde la puerta de madera"),
  p(2, 768, 1024, "ala-uno", "Comedor con techo de vigas"),
  p(3, 768, 1024, "ala-uno", "Cocina completa del Ala Uno"),
  p(4, 768, 1024, "ala-uno", "Cocina con heladera y anafe"),
  p(5, 1024, 682, "ala-uno", "Sala con hogar a leña, mesa ratona y mecedora"),
  p(6, 1024, 682, "ala-uno", "Dormitorio con dos camas de una plaza", true),
  p(7, 1024, 682, "ala-uno", "Suite con cama matrimonial y salida a la pileta", true),
  p(8, 1024, 683, "ala-uno", "Suite principal con cama matrimonial y cama simple", true),
  p(9, 1024, 678, "ala-uno", "Mecedora junto a la puerta ventana", true),
  p(10, 768, 1024, "ala-uno", "Baño completo con ducha del Ala Uno"),
  p(27, 1200, 1500, "ala-dos", "Galería vidriada del Ala Dos, de punta a punta"),
  p(22, 1200, 900, "ala-dos", "Galería con estufa, sillón y mesa"),
  p(24, 1200, 1500, "ala-dos", "Comedor junto al ventanal"),
  p(25, 1200, 900, "ala-dos", "Sillón bajo los ventanales de hierro"),
  p(23, 1200, 1500, "ala-dos", "Mesa de madera para seis"),
  p(26, 1200, 900, "ala-dos", "Comedor con tapices tejidos"),
  p(30, 1200, 1500, "ala-dos", "Cocina completa del Ala Dos"),
  p(31, 1200, 1500, "ala-dos", "Dormitorio matrimonial del Ala Dos", true),
  p(32, 1200, 1500, "ala-dos", "Cama matrimonial con blancos listos", true),
  p(35, 1200, 1500, "ala-dos", "Dormitorio de cuatro camas", true),
  p(36, 1200, 1500, "ala-dos", "Dormitorio de cuatro camas con salida al parque", true),
  p(28, 768, 1024, "ala-dos", "Baño del Ala Dos con bacha de apoyo"),
  p(29, 768, 1024, "ala-dos", "Ducha del Ala Dos"),
  p(33, 1200, 1500, "ala-dos", "Baño completo con revestimiento de cemento"),
  p(34, 1200, 1600, "ala-dos", "Baño con espejo redondo"),
  // Fotos publicadas por SUN en Instagram (@sun.casonaserrana)
  p(112, 640, 480, "momentos", "Reposeras sobre el deck, con la sierra de fondo"),
  p(105, 480, 640, "momentos", "Flores del parque al atardecer"),
  p(107, 361, 640, "momentos", "Los pies en el agua de la pileta"),
  p(109, 640, 427, "momentos", "Un árbol joven y una alfombra tejida en el parque"),
  p(110, 512, 640, "momentos", "Desayuno en bandeja, con té para dos"),
  p(108, 480, 640, "momentos", "Dormitorio con mosaicos calcáreos y tres camas"),
];

export const photo = (id: number) => photos.find((x) => x.id === id)!;
