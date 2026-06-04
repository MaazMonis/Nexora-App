"use client";

import { motion } from "framer-motion";
import styles from "./FeatureGrid.module.css";
import Link from "next/link";

const categories = [
  { id: 1, name: "Engagement Rings", count: "120+ Styles", image: "/Images/engagement_rings.png", link: "/rings" },
  { id: 2, name: "Elegant Necklaces", count: "85+ Styles", image: "/Images/necklaces.png", link: "/diamonds" },
  { id: 3, name: "Luxury Earrings", count: "60+ Styles", image: "/Images/earrings_card.png", link: "/earrings" },
  { id: 4, name: "Bespoke Jewelry", count: "Custom", image: "/Images/bespoke.png", link: "/bespoke" }
];

export default function FeatureGrid() {
  return (
    <section className={styles.gridSection}>
      <h2 className="section-title">Discover <span>Collections</span></h2>
      <div className={styles.grid}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <Link href={cat.link} className={styles.cardLink}>
              <div
                className={styles.cardBg}
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className={styles.overlay} />
              <div className={styles.cardContent}>
                <h3>{cat.name}</h3>
                <p>{cat.count}</p>
                <span className={styles.explore}>Explore Collection</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
