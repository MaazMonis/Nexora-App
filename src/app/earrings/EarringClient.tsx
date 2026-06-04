"use client";

import { useState, useMemo } from 'react';
import styles from '../rings/page.module.css'; // Reuse rings styles
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from "@/components/ProductModal";
import CustomDropdown from "@/components/CustomDropdown";

const THEME_CATEGORIES = [
  "All Earrings",
  "Earrings",
  "Studs",
  "Hoops",
  "Drops",
  "Chandeliers"
];

export default function EarringClient({ initialThemes }: { initialThemes: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All Earrings");
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 6;
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const filteredThemes = useMemo(() => {
    if (selectedCategory === "All Earrings") return initialThemes;
    return initialThemes.filter(item => 
      item.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, initialThemes]);

  const visibleThemes = showAll ? filteredThemes : filteredThemes.slice(0, INITIAL_LIMIT);
  const hasMore = filteredThemes.length > INITIAL_LIMIT;

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.title}
        >
          {selectedCategory === "All Earrings" ? "Earring Collections" : `${selectedCategory}`}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Handpicked earrings crafted for your luxury collection.
        </motion.p>
      </div>

      <div className={styles.filterBar}>
        {/* Desktop Filter Bar */}
        <div className={styles.desktopFilters}>
          {THEME_CATEGORIES.map((cat) => (
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
            options={THEME_CATEGORIES}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {visibleThemes.map((item) => (
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
        
        {filteredThemes.length === 0 && (
          <div className={styles.empty}>
            <p>No earrings found in this category.</p>
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
            {showAll ? '↑ Show Less' : `View Full Collection (${filteredThemes.length - INITIAL_LIMIT} more)`}
          </motion.button>
        </div>
      )}

      <ProductModal 
        product={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        type="theme"
      />
    </div>
  );
}
