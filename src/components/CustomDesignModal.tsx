"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Gem, Settings, Image as ImageIcon, CheckCircle, 
  ChevronRight, ChevronLeft, Upload, X 
} from 'lucide-react';
import styles from './CustomDesignModal.module.css';
import CustomDropdown from './CustomDropdown';

interface CustomDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  productCategory?: string;
}

const STEPS = [
  { id: 1, title: 'Customer Info', icon: <User size={18} /> },
  { id: 2, title: 'Jewelry Type', icon: <Gem size={18} /> },
  { id: 3, title: 'Materials', icon: <Settings size={18} /> },
  { id: 4, title: 'Customization', icon: <ImageIcon size={18} /> },
  { id: 5, title: 'Review', icon: <CheckCircle size={18} /> }
];

const JEWELRY_TYPES = ['Engagement Ring', 'Wedding Ring', 'Bridal Set', 'Earrings', 'Necklace', 'Bracelet', 'Pendant', 'Custom Piece'];
const DIAMOND_SHAPES = ['Round', 'Oval', 'Princess', 'Emerald', 'Cushion', 'Pear', 'Marquise', 'Radiant'];
const DIAMOND_SIZES = ['0.5 CT', '1 CT', '2 CT', '3 CT', 'Custom'];
const DIAMOND_QUALITIES = ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
const DIAMOND_COLORS = ['D', 'E', 'F', 'G', 'H'];
const STONE_TYPES = ['Diamond', 'Moissanite', 'Ruby', 'Emerald', 'Sapphire'];
const METAL_TYPES = ['18K Gold', '22K Gold', 'Platinum', 'White Gold', 'Rose Gold'];
const METAL_FINISHES = ['Glossy', 'Matte', 'Polished', 'Brushed'];
const METAL_COLORS = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver'];
const JEWELRY_STYLES = ['Modern', 'Minimal', 'Vintage', 'Royal', 'Luxury', 'Arabic'];
const OCCASIONS = ['Engagement', 'Wedding', 'Anniversary', 'Gift', 'Personal Collection'];
const TIMELINES = ['Urgent', 'Standard', 'Flexible'];
const CONTACT_METHODS = ['WhatsApp', 'Email', 'Phone Call'];

export default function CustomDesignModal({ isOpen, onClose, productTitle, productCategory }: CustomDesignModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    country: 'Select Country',


    contactMethod: 'WhatsApp',
    
    jewelryType: productCategory || 'Engagement Ring',
    jewelryStyle: 'Modern',
    occasionType: 'Engagement',
    
    diamondShape: 'Round',
    diamondSize: '1 CT',
    diamondQuality: 'VVS1',
    diamondColor: 'D',
    stoneType: 'Diamond',
    metalType: '18K Gold',
    metalFinish: 'Polished',
    metalColor: 'White Gold',
    ringSize: '',
    
    budgetRange: 5000,
    deliveryTimeline: 'Standard',
    customEngraving: false,
    engravingText: '',
    previewRequested: false,
    notes: '',
    referenceImages: [] as string[]
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (formData.referenceImages.length >= 5) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).slice(0, 5 - formData.referenceImages.length).map(async (file) => {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        const result = await res.json();
        return result.url;
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        referenceImages: [...prev.referenceImages, ...urls.filter(u => !!u)]
      }));
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/custom-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          whatsapp_number: formData.whatsappNumber,
          email_address: formData.email,
          jewelry_type: formData.jewelryType,
          budget_range: `$${formData.budgetRange}`,
          material_preference: `${formData.metalType} (${formData.metalColor}, ${formData.metalFinish})`,
          diamond_type: formData.diamondShape,
          ring_size: formData.ringSize,
          reference_image_url: formData.referenceImages[0] || null,
          reference_image_urls: formData.referenceImages,
          additional_notes: formData.notes,
          product_title: productTitle,
          product_kind: productCategory,
          
          contact_method: formData.contactMethod,
          jewelry_style: formData.jewelryStyle,
          occasion_type: formData.occasionType,
          diamond_size: formData.diamondSize,
          diamond_quality: formData.diamondQuality,
          diamond_color: formData.diamondColor,
          stone_type: formData.stoneType,
          metal_finish: formData.metalFinish,
          metal_color: formData.metalColor,
          delivery_timeline: formData.deliveryTimeline,
          custom_engraving: formData.customEngraving,
          engraving_text: formData.engravingText,
          preview_requested: formData.previewRequested,
          country: formData.country
        })
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  const SummaryPanel = () => (
    <div className={styles.summaryPanel}>
      <h3 className={styles.summaryTitle}>Design Summary</h3>
      <div className={styles.summaryList}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Jewelry</span>
          <span className={styles.summaryValue}>{formData.jewelryType}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Style</span>
          <span className={styles.summaryValue}>{formData.jewelryStyle}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Stone</span>
          <span className={styles.summaryValue}>{formData.diamondShape} {formData.stoneType} ({formData.diamondSize})</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Metal</span>
          <span className={styles.summaryValue}>{formData.metalType} - {formData.metalColor}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Budget</span>
          <span className={styles.summaryValue}>${formData.budgetRange}</span>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay} onClick={onClose}>
        <motion.div 
          className={styles.modalContent} 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Luxury <span>Customization</span></h2>
            <p className={styles.subtitle}>Curate your masterpiece with Nexora master craftsmen.</p>
            <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
          </div>

          {!submitted && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
              <div className={styles.stepIndicators}>
                {STEPS.map(step => (
                  <span key={step.id} className={`${styles.stepLabel} ${currentStep >= step.id ? styles.activeStepLabel : ''}`}>
                    {step.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!submitted ? (
            <div className={styles.formContainer}>
              <div className={styles.formMain}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 1 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Client Identification</h3>
                        <div className={styles.grid}>
                          <div className={styles.inputGroup}>
                            <label>Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter your full name" />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>WhatsApp Number</label>
                            <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required placeholder="+1 234 567 890" />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Country / Region</label>
                            <CustomDropdown 
                              options={[
                                'Select Country', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 
                                'United Kingdom', 'United States', 'Canada', 'Australia', 
                                'Switzerland', 'France', 'Italy', 'Germany', 
                                'India', 'Pakistan', 'Singapore', 'Hong Kong', 'Other'
                              ]}

                              selected={formData.country}
                              onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                            />
                          </div>
                        </div>
                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                          <label>Preferred Contact Method</label>
                          <div className={styles.radioGrid}>
                            {CONTACT_METHODS.map(method => (
                              <div 
                                key={method} 
                                className={`${styles.radioCard} ${formData.contactMethod === method ? styles.radioCardActive : ''}`}
                                onClick={() => setFormData({ ...formData, contactMethod: method })}
                              >
                                {method}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Design Foundation</h3>
                        <div className={styles.grid}>
                          <div className={styles.inputGroup}>
                            <label>Jewelry Type</label>
                            <CustomDropdown options={JEWELRY_TYPES} selected={formData.jewelryType} onChange={(v) => setFormData({...formData, jewelryType: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Jewelry Style</label>
                            <CustomDropdown options={JEWELRY_STYLES} selected={formData.jewelryStyle} onChange={(v) => setFormData({...formData, jewelryStyle: v})} />
                          </div>
                        </div>
                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                          <label>Occasion</label>
                          <div className={styles.radioGrid}>
                            {OCCASIONS.map(occ => (
                              <div 
                                key={occ} 
                                className={`${styles.radioCard} ${formData.occasionType === occ ? styles.radioCardActive : ''}`}
                                onClick={() => setFormData({ ...formData, occasionType: occ })}
                              >
                                {occ}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Master Materials</h3>
                        <div className={styles.grid}>
                          <div className={styles.inputGroup}>
                            <label>Stone Type</label>
                            <CustomDropdown options={STONE_TYPES} selected={formData.stoneType} onChange={(v) => setFormData({...formData, stoneType: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Diamond Shape</label>
                            <CustomDropdown options={DIAMOND_SHAPES} selected={formData.diamondShape} onChange={(v) => setFormData({...formData, diamondShape: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Carat Size</label>
                            <CustomDropdown options={DIAMOND_SIZES} selected={formData.diamondSize} onChange={(v) => setFormData({...formData, diamondSize: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Quality Grade</label>
                            <CustomDropdown options={DIAMOND_QUALITIES} selected={formData.diamondQuality} onChange={(v) => setFormData({...formData, diamondQuality: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Metal Type</label>
                            <CustomDropdown options={METAL_TYPES} selected={formData.metalType} onChange={(v) => setFormData({...formData, metalType: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Metal Color</label>
                            <CustomDropdown options={METAL_COLORS} selected={formData.metalColor} onChange={(v) => setFormData({...formData, metalColor: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Metal Finish</label>
                            <CustomDropdown options={METAL_FINISHES} selected={formData.metalFinish} onChange={(v) => setFormData({...formData, metalFinish: v})} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Ring Size (if applicable)</label>
                            <input type="text" name="ringSize" value={formData.ringSize} onChange={handleChange} placeholder="e.g. 7" />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Personal Touches</h3>
                        <div className={styles.inputGroup}>
                          <label>Investment Range: ${formData.budgetRange}</label>
                          <input 
                            type="range" 
                            min="1000" 
                            max="50000" 
                            step="500" 
                            value={formData.budgetRange} 
                            onChange={(e) => setFormData({...formData, budgetRange: parseInt(e.target.value)})}
                            className={styles.rangeInput}
                          />
                        </div>
                        
                        <div className={styles.toggleGroup}>
                          <label className={styles.switch}>
                            <input type="checkbox" name="customEngraving" checked={formData.customEngraving} onChange={handleChange} />
                            <span className={styles.slider}></span>
                          </label>
                          <span>Add Custom Engraving</span>
                        </div>

                        {formData.customEngraving && (
                          <div className={styles.inputGroup}>
                            <label>Engraving Text</label>
                            <input type="text" name="engravingText" value={formData.engravingText} onChange={handleChange} placeholder="Enter your text here" />
                          </div>
                        )}

                        <div className={styles.toggleGroup}>
                          <label className={styles.switch}>
                            <input type="checkbox" name="previewRequested" checked={formData.previewRequested} onChange={handleChange} />
                            <span className={styles.slider}></span>
                          </label>
                          <span>Request 3D Preview before production</span>
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Timeline</label>
                          <div className={styles.radioGrid}>
                            {TIMELINES.map(t => (
                              <div 
                                key={t} 
                                className={`${styles.radioCard} ${formData.deliveryTimeline === t ? styles.radioCardActive : ''}`}
                                onClick={() => setFormData({ ...formData, deliveryTimeline: t })}
                              >
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                          <label>Reference Images (Max 5)</label>
                          <div className={styles.imageGrid}>
                            {formData.referenceImages.map((url, idx) => (
                              <div key={idx} className={styles.imageItem} style={{ position: 'relative' }}>
                                <img src={url} className={styles.imagePreview} alt="Ref" />
                                <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}>&times;</button>
                              </div>
                            ))}
                            {formData.referenceImages.length < 5 && (
                              <label className={styles.uploadPlaceholder}>
                                <input type="file" hidden multiple onChange={handleFileUpload} accept="image/*" />
                                <Upload size={24} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Final Review</h3>
                        <div className={styles.reviewGrid}>
                          <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Full Name</span>
                            <span className={styles.summaryValue}>{formData.fullName}</span>
                          </div>
                          <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Investment</span>
                            <span className={styles.summaryValue}>${formData.budgetRange}</span>
                          </div>
                          <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Stone Detail</span>
                            <span className={styles.summaryValue}>{formData.diamondShape} {formData.stoneType} ({formData.diamondSize}, {formData.diamondQuality})</span>
                          </div>
                        </div>
                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                          <label>Additional Instructions</label>
                          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Anything else our craftsmen should know?" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className={styles.navButtons}>
                  {currentStep > 1 && (
                    <button onClick={prevStep} className={styles.prevBtn}>Back</button>
                  )}
                  {currentStep < STEPS.length ? (
                    <button onClick={nextStep} className={styles.nextBtn}>Continue <ChevronRight size={18} /></button>
                  ) : (
                    <button onClick={handleSubmit} className={styles.nextBtn} disabled={loading}>
                      {loading ? 'Processing...' : 'Secure Your Request'}
                    </button>
                  )}
                </div>
              </div>
              
              <SummaryPanel />
            </div>
          ) : (
            <div className={styles.successScreen}>
              <div className={styles.successIcon}><CheckCircle size={48} /></div>
              <h3>Commission Submitted</h3>
              <p>Your bespoke jewelry vision has been received. Our master designers will evaluate your requirements and contact you via your preferred method ({formData.contactMethod}) within 24 hours.</p>
              <div className={styles.successActions}>
                <a href={`https://wa.me/03308577538`} target="_blank" rel="noopener noreferrer" className={styles.whatsappContinue}>
                  Finalize on WhatsApp
                </a>
                <button className={styles.closeSuccess} onClick={onClose}>Return to Collection</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
