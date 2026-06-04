"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProductModal.module.css';
import CustomDesignModal from './CustomDesignModal';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string | number;
  image: string;
  category?: string;
  jewelry_type?: string;
  features?: string;
  subdescription?: string;
  price_subdescription?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  type?: "product" | "theme" | "jewelry" | "diamond";
}

export default function ProductModal({ product, isOpen, onClose, type = "product" }: ProductModalProps) {
  const [isDesignModalOpen, setIsDesignModalOpen] = React.useState(false);

  if (!product) return null;

  const phoneNumber = "03308577538"; // Standard Nexora WhatsApp
  const featuresList = product.features ? product.features.split('\n').filter(f => f.trim() !== '') : [];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className={styles.modalOverlay} onClick={onClose}>
            <motion.div 
              className={styles.modalContent} 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.closeButtonContainer}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.modalImageSide}>
                  <img src={product.image || '/Images/placeholder1.jpg'} alt={product.title} />
                </div>
                
                <div className={styles.modalInfoSide}>
                  <span className={styles.modalCategory}>{product.category || product.jewelry_type || "Exclusive Design"}</span>
                  <h2 className={styles.modalTitle}>{product.title}</h2>
                  
                  <p className={styles.modalDescription}>{product.description}</p>
                  
                  <div className={styles.modalPriceContainer}>
                    <div className={styles.modalPrice}>
                      {product.price && product.price !== "0" && product.price !== 0 ? `$${product.price}` : 'Price on Request'}
                    </div>
                    {product.price_subdescription && (
                      <p className={styles.priceSubDesc}>{product.price_subdescription}</p>
                    )}
                  </div>

                  <div className={styles.modalDivider}></div>

                  {featuresList.length > 0 && (
                    <div className={styles.featuresSection}>
                      <h4>Key Features</h4>
                      <ul className={styles.featuresList}>
                        {featuresList.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.subdescription && (
                    <p className={styles.modalSubDescription}>{product.subdescription}</p>
                  )}
                  
                  <div className={styles.modalActions}>
                    <button 
                      onClick={() => setIsDesignModalOpen(true)}
                      className={styles.secondaryCta}
                    >
                      Request 3D Design
                    </button>
                    <a 
                      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(`Hello! I'm interested in the design: ${product.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.premiumCta}
                    >
                      Discuss on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CustomDesignModal 
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        productTitle={product.title}
        productCategory={product.category || product.jewelry_type}
      />
    </>
  );
}
