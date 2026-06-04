"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HeroSlider.module.css";
import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Elegance in Every Detail",
    subtitle: "Discover our handcrafted diamond collection.",
    image: "/hero_jewelry_1_1777271928566.png",
    cta: "Shop Diamonds",
    link: "/diamonds"
  },
  {
    id: 2,
    title: "Timeless Proposals",
    subtitle: "Find the ring that marks your forever.",
    image: "/hero_jewelry_2_1777271971622.png",
    cta: "Browse Rings",
    link: "/rings"
  },
  {
    id: 3,
    title: "Luxury Earrings",
    subtitle: "Every piece tells a unique story of excellence.",
    image: "/Images/earrings_card.png",
    cta: "Shop Earrings",
    link: "/earrings"
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.sliderContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className={styles.slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div
            className={styles.imageBg}
            style={{ backgroundImage: `url(${slides[index].image})` }}
          />
          <div className={styles.overlay} />

          <div className={styles.content}>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {slides[index].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {slides[index].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link href={slides[index].link} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                {slides[index].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button className={styles.navBtnPrev} onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={32} />
      </button>
      <button className={styles.navBtnNext} onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={32} />
      </button>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i === index ? styles.activeDot : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
