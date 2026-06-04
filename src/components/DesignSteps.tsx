"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./DesignSteps.module.css";

const steps = [
  { num: 1, label: "Choose your diamond shape and carat size" },
  { num: 2, label: "Select your metal type and ring setting" },
  { num: 3, label: "Preview your design and receive instant pricing" },
];

export default function DesignSteps() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Left: Text */}
        <motion.div
          className={styles.textSide}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.overline}>Create Your Ring</span>
          <h2 className={styles.heading}>
            Design Her Ring.<br />
            <span>Step by Step.</span>
          </h2>
          <p className={styles.desc}>
            Pick your diamond. Pick your setting.<br />
            See the price instantly — no pressure, no guessing.
          </p>

          <ul className={styles.stepList}>
            {steps.map((step, i) => (
              <motion.li
                key={step.num}
                className={styles.stepItem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              >
                <div className={styles.stepNum}>{step.num}</div>
                <span>{step.label}</span>
              </motion.li>
            ))}
          </ul>

          <Link href="/rings" className={styles.cta}>
            <span>Shop Engagement Rings</span>
          </Link>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          className={styles.imageSide}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <div className={styles.imageFrame}>
            <img
              src="/ring_step_showcase.png"
              alt="Luxury engagement ring step by step"
              className={styles.image}
            />
            {/* Decorative gold corner accents */}
            <div className={`${styles.corner} ${styles.tl}`} />
            <div className={`${styles.corner} ${styles.br}`} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
