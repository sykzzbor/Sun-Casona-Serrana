import type { Metadata, Viewport } from "next";
import { Albert_Sans, Ibarra_Real_Nova } from "next/font/google";
import "./globals.css";

const ibarra = Ibarra_Real_Nova({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-ibarra",
  display: "swap",
});

const albert = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-albert",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUN Casona Serrana · Río Ceballos, Córdoba",
  description:
    "Casona colonial de dos alas para 12 huéspedes, con pileta, galerías y parque en el alto de Río Ceballos. Consultá disponibilidad y reservá directo.",
  openGraph: {
    title: "SUN Casona Serrana",
    description: "Casona colonial con pileta para 12 huéspedes en Río Ceballos, Sierras Chicas.",
    images: ["/fotos/sun-11.jpg"],
    locale: "es_AR",
  },
};

export const viewport: Viewport = { themeColor: "#2e3322" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${ibarra.variable} ${albert.variable}`}>
      <body>{children}</body>
    </html>
  );
}
