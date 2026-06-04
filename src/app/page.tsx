"use client";

import { motion } from "framer-motion";
import styles from "./page.module.css";
import HeroSlider from "@/components/HeroSlider";
import FeatureGrid from "@/components/FeatureGrid";
import StatsBanner from "@/components/StatsBanner";
import Link from "next/link";
import ConsultationSection from "@/components/ConsultationSection";
import DesignSteps from "@/components/DesignSteps";

export default function Home() {
  return (
    <div className={styles.homeWrapper}>
      {/* 1. Premium Hero Slider */}
      <HeroSlider />

      <div className="container">
        {/* 2. Collections Grid */}
        <FeatureGrid />

        {/* 3. Craftsmanship Section */}
        <section className={styles.splitSection}>
          <motion.div
            className={styles.imageBox}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src="/craftsmanship_jewelry_1777272037467.png" alt="Craftsmanship" />
          </motion.div>
          <motion.div
            className={styles.textBox}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className={styles.overline}>Mastering the Art</span>
            <h2 className={styles.sectionHeading}>Timeless <span>Craftsmanship</span></h2>
            <p>
              At Nexora, every piece begins as a vision in our design studio, but it is brought to life by master artisans with decades of experience. We blend futuristic technology with traditional goldsmithing techniques to create jewelry that transcends generations.
            </p>
            <Link href="/about" className="btn-secondary">Explore Our Heritage</Link>
          </motion.div>
        </section>
      </div>

      {/* 4. Stats Banner (New) */}
      <StatsBanner />

      {/* 5. Design Step-by-Step Section */}
      <DesignSteps />

      {/* Premium Inquiry / Consultation CTA */}
      <ConsultationSection
        title="Book a Consultation"
        message="Hi, I am interested in custom jewelry design and would like to book a consultation."
      />

      {/* 7. Footer Teaser (New Section) */}
      <section className={styles.footerTeaser}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <h3 className="logo">Nexora</h3>
              <p>Redefining luxury through digital innovation and artisan excellence.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Discover</h4>
              <ul>
                <li><Link href="/rings">Luxury Rings</Link></li>
                <li><Link href="/diamonds">Diamonds</Link></li>
                <li><Link href="/bespoke">Bespoke</Link></li>
                <li><Link href="/earrings">Earrings</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <p>officialnexora853@gmail.com</p>
              <p>+92 (3308577538) NEXORA</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
