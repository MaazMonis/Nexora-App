"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import ProductModal from "@/components/ProductModal";

interface BespokeItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  status: string;
  category: string;
}

export default function BespokeClient({ initialItems }: { initialItems: BespokeItem[] }) {
  const [selectedItem, setSelectedItem] = useState<BespokeItem | null>(null);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 6;

  const visibleItems = showAll ? initialItems : initialItems.slice(0, INITIAL_LIMIT);
  const hasMore = initialItems.length > INITIAL_LIMIT;

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Bespoke <span>Collections</span></h1>
      <p className={styles.pageDesc}>Exclusively handcrafted masterpieces tailored to your vision.</p>

      <div className={styles.productGrid}>
        {visibleItems.map((item) => (
          <motion.div 
            key={item.id} 
            className={`glass-panel ${styles.productCard}`}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedItem(item)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className={styles.imageContainer}
              style={{ 
                backgroundImage: `url(${item.image || '/Images/placeholder1.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className={styles.statusBadge} style={{ background: item.status === 'Active' ? '#10b981' : '#6b7280' }}>
                {item.status}
              </span>
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{item.title}</h3>
              <p className={styles.productDesc}>{item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
              <div className={styles.productFooter}>
                <span className={styles.productPrice}>{item.price && item.price !== "0" ? `$${item.price}` : 'Price on Request'}</span>
                <span className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Details</span>
              </div>
            </div>
          </motion.div>
        ))}
        {initialItems.length === 0 && (
          <div className={styles.empty}>
            <p>Our bespoke collection is currently being updated. Check back soon!</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className={styles.showAllWrapper}>
          <motion.button
            className={styles.showAllBtn}
            onClick={() => setShowAll(prev => !prev)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {showAll ? '↑ Show Less' : `View Full Collection (${initialItems.length - INITIAL_LIMIT} more)`}
          </motion.button>
        </div>
      )}

      <ProductModal 
        product={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        type="product"
      />
    </div>
  );
}
