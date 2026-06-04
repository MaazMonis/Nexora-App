"use client";

import { useState, useMemo } from 'react';
import styles from './page.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from "@/components/ProductModal";
import CustomDropdown from "@/components/CustomDropdown";

const CATEGORIES = [
  "All Collections",
  "Engagement Rings",
  "Bridal Rings",
  "Wedding Rings",
  "Diamond Rings",
  "Luxury Rings"
];

export default function RingsClient({ initialJewelry }: { initialJewelry: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All Collections");
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 6;
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const filteredJewelry = useMemo(() => {
    if (selectedCategory === "All Collections") return initialJewelry;
    return initialJewelry.filter(item => 
      item.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, initialJewelry]);

  const visibleJewelry = showAll ? filteredJewelry : filteredJewelry.slice(0, INITIAL_LIMIT);
  const hasMore = filteredJewelry.length > INITIAL_LIMIT;

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.title}
        >
          {selectedCategory === "All Collections" ? "Luxury Rings" : selectedCategory}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Exquisite masterpieces crafted for your most precious moments.
        </motion.p>
      </div>

      <div className={styles.filterBar}>
        {/* Desktop Filter Bar */}
        <div className={styles.desktopFilters}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${selectedCategory === cat ? styles.activeFilter : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Filter Dropdown */}
        <div className={styles.mobileFilters}>
          <CustomDropdown 
            options={CATEGORIES}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {visibleJewelry.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass-panel ${styles.card}`}
              onClick={() => setSelectedItem(item)}
              style={{ cursor: 'pointer' }}
            >
              <div 
                className={styles.imageBox}
                style={{ 
                  backgroundImage: `url(${item.image || '/Images/placeholder1.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span className={styles.statusBadge} style={{ background: item.status === 'Active' ? '#10b981' : '#6b7280', position: 'static' }}>
                    {item.status}
                  </span>
                  <span className={styles.categoryBadge}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.description}>{item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>${item.price}</span>
                  <span className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Details</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredJewelry.length === 0 && (
          <div className={styles.empty}>
            <p>No rings found in this category.</p>
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
            {showAll ? '↑ Show Less' : `View Full Collection (${filteredJewelry.length - INITIAL_LIMIT} more)`}
          </motion.button>
        </div>
      )}

      <ProductModal 
        product={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        type="jewelry"
      />
    </div>
  );
}
