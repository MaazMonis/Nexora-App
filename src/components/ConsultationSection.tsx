import { motion } from "framer-motion";
import WhatsAppCtaButton from "@/components/WhatsAppCtaButton";
import styles from "./ConsultationSection.module.css";

type ConsultationSectionProps = {
  title?: string;
  message: string;
};

export default function ConsultationSection({
  title = "Get Your Jewelry Designed",
  message,
}: ConsultationSectionProps) {
  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.content}>
            <span className={styles.overline}>Premium Consultation</span>
            <h2 className={styles.heading}>
              {title.split(" ").map((w, idx) => (
                <span key={idx}>
                  {w}
                  {idx === title.split(" ").length - 1 ? "" : " "}
                </span>
              ))}
            </h2>
            <p className={styles.sub}>
              Share your preferences and timeline. Our concierge will guide you
              from concept to a refined custom design.
            </p>
          </div>

          <div className={styles.actions}>
            <WhatsAppCtaButton
              label="Discuss on WhatsApp"
              message={message}
              className={`btn-primary ${styles.whatsBtn}`}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

