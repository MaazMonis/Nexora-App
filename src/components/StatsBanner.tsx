"use client";

import { motion } from "framer-motion";
import styles from "./StatsBanner.module.css";

const stats = [
  { label: "Bespoke Designs", value: "5,000+" },
  { label: "Happy Clients", value: "12,000+" },
  { label: "Global Stores", value: "15" },
  { label: "Legacy Years", value: "28" }
];

export default function StatsBanner() {
  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className={styles.statItem}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <h2 className={styles.value}>{stat.value}</h2>
            <p className={styles.label}>{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
