"use client";

import { MotionConfig } from "framer-motion";
import Booking from "@/components/Booking";
import Casona from "@/components/Casona";
import { Footer, Location } from "@/components/Closing";
import Reviews from "@/components/Reviews";
import Experience from "@/components/Experience";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import { StayProvider } from "@/components/booking-state";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <StayProvider>
        <Nav />
        <main>
          <Hero />
          <Casona />
          <Gallery />
          <Experience />
          <Booking />
          <Reviews />
          <Location />
        </main>
        <Footer />
      </StayProvider>
    </MotionConfig>
  );
}
