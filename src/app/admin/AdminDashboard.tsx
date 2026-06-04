"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Activity, Users, MessageSquare,
  BarChart2, Settings, LogOut, Search,
  Filter, MoreVertical, Eye, Trash2,
  Mail, Phone, Plus, ChevronDown, Clock,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useModal } from "@/context/ModalContext";
import CustomDropdown from '@/components/CustomDropdown';
import styles from './AdminDashboard.module.css';

type TabType = "analytics" | "products" | "requests" | "customers" | "messages" | "settings";

export default function AdminDashboard() {
  const { confirm, showAlert } = useModal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [jewelry, setJewelry] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [bespoke, setBespoke] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Filter States
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('All');
  const [requestPriorityFilter, setRequestPriorityFilter] = useState('All');

  // Selected entities for Detail View
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState('All');

  // Account States
  const [adminUser, setAdminUser] = useState<any>(null);
  const [sUsername, setSUsername] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sCurrentPass, setSCurrentPass] = useState('');
  const [sNewPass, setSNewPass] = useState('');
  const [sConfirmPass, setSConfirmPass] = useState('');
  const [sProfileImage, setSProfileImage] = useState('');

  useEffect(() => {
    fetchAllData();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      if (data.user) {
        setAdminUser(data.user);
        setSUsername(data.user.username);
        setSEmail(data.user.email);
        setSProfileImage(data.user.profile_image || '');
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: sUsername,
          email: sEmail,
          profileImage: sProfileImage
        })
      });
      if (res.ok) {
        triggerSuccess();
        fetchProfile();
      } else {
        const data = await res.json();
        showAlert({ title: "Update Failed", message: data.error || "Could not update profile.", type: "danger" });
      }
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sNewPass !== sConfirmPass) {
      showAlert({ title: "Error", message: "New passwords do not match.", type: "danger" });
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: sCurrentPass,
          newPassword: sNewPass
        })
      });
      if (res.ok) {
        triggerSuccess();
        setSCurrentPass(''); setSNewPass(''); setSConfirmPass('');
      } else {
        const data = await res.json();
        showAlert({ title: "Update Failed", message: data.error || "Could not update password.", type: "danger" });
      }
    } catch (err) {
      console.error("Password update error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAllData = () => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/jewelry').then(res => res.json()),
      fetch('/api/themes').then(res => res.json()),
      fetch('/api/bespoke').then(res => res.json()),
      fetch('/api/custom-design').then(res => res.json()),
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/messages').then(res => res.json())
    ]).then(([prod, jew, thm, besp, cust, crm, msg]) => {
      setProducts(prod.products || []);
      setJewelry(jew.jewelry || []);
      setThemes(thm.themes || []);
      setBespoke(besp.bespoke || []);
      setRequests(cust.requests || []);
      setEvents(cust.events || []);
      setCustomers(crm.customers || []);
      setMessages(msg.messages || []);
    }).catch(err => console.error("Failed to fetch dashboard data:", err));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  };

  const updateRequestStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/custom-design/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchAllData();
      triggerSuccess();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    }
  };

  const updateRequestPriority = async (id: number, priority: string) => {
    const res = await fetch(`/api/custom-design/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    if (res.ok) {
      fetchAllData();
      triggerSuccess();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, priority });
      }
    }
  };

  const updateAdminNotes = async (id: number, notes: string) => {
    const res = await fetch(`/api/custom-design/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_notes: notes }),
    });
    if (res.ok) {
      fetchAllData();
      triggerSuccess();
    }
  };

  const deleteRequest = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Delete Request",
      message: "Are you sure you want to permanently delete this request?",
      confirmLabel: "Delete",
      type: "danger"
    });
    if (!isConfirmed) return;

    const res = await fetch(`/api/custom-design/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAllData();
      setSelectedRequest(null);
      triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateCustomerNotes = async (id: number, notes: string) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...selectedCustomer, internal_notes: notes })
    });
    if (res.ok) {
      fetchAllData();
      triggerSuccess();
    }
  };

  const markMessageAsRead = async (id: number) => {
    const res = await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true })
    });
    if (res.ok) {
      fetchAllData();
    }
  };

  const [replyContent, setReplyContent] = useState('');
  const handleMessageReply = async (customerId: number) => {
    if (!replyContent.trim()) return;
    setIsUploading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          content: replyContent,
          message_type: 'reply'
        })
      });
      if (res.ok) {
        setReplyContent('');
        fetchAllData();
        triggerSuccess();
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Memoized Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.full_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
        r.email_address.toLowerCase().includes(requestSearch.toLowerCase());
      const matchesStatus = requestStatusFilter === 'All' || r.status === requestStatusFilter;
      const matchesPriority = requestPriorityFilter === 'All' || r.priority === requestPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, requestSearch, requestStatusFilter, requestPriorityFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesFilter = messageFilter === 'All' || 
        (messageFilter === 'Unread' && !m.is_read) ||
        (messageFilter === 'Requests' && m.message_type === 'custom_design') ||
        (messageFilter === 'Support' && m.message_type === 'support');
      return matchesFilter;
    });
  }, [messages, messageFilter]);

  const stats = useMemo(() => {
    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'Pending').length,
      designingRequests: requests.filter(r => r.status === 'Designing').length,
      totalInventory: products.length + jewelry.length + themes.length + bespoke.length
    };
  }, [requests, products, jewelry, themes, bespoke]);

  // --- PRODUCT MANAGEMENT LOGIC ---
  const [activeProductSubTab, setActiveProductSubTab] = useState<"jewelry" | "products" | "themes" | "bespoke">("jewelry");
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fImage, setFImage] = useState('/Images/placeholder1.jpg');
  const [fStatus, setFStatus] = useState('Active');
  const [fCategory, setFCategory] = useState('');
  const [fFeatures, setFFeatures] = useState('');
  const [fSubDesc, setFSubDesc] = useState('');
  const [fPriceSubDesc, setFPriceSubDesc] = useState('');

  const jewelryCategories = ["Engagement Rings", "Bridal Rings", "Wedding Rings", "Diamond Rings", "Luxury Rings"];
  const diamondCategories = ["Solitaire", "Halo", "Vintage", "Three-Stone", "Modern Luxury"];
  const themeCategories = ["Earrings", "Studs", "Hoops", "Drops", "Chandeliers"];
  const bespokeCategories = ["Bespoke Rings", "Bespoke Necklaces", "Bespoke Bracelets", "Bespoke Earrings", "Custom Sets"];

  const currentCategories = useMemo(() => {
    if (activeProductSubTab === 'jewelry') return jewelryCategories;
    if (activeProductSubTab === 'products') return diamondCategories;
    if (activeProductSubTab === 'themes') return themeCategories;
    return bespokeCategories;
  }, [activeProductSubTab]);

  useEffect(() => {
    if (!editingItem) {
      setFCategory(currentCategories[0]);
    }
  }, [currentCategories, editingItem]);

  const resetForm = () => {
    setEditingItem(null);
    setFTitle(''); setFDesc(''); setFPrice(''); setFImage('/Images/placeholder1.jpg');
    setFStatus('Active'); setFCategory(currentCategories[0]);
    setFFeatures(''); setFSubDesc(''); setFPriceSubDesc('');
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setIsUploading(false);
      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      setIsUploading(false);
      return null;
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = activeProductSubTab === 'jewelry' ? 'jewelry' : activeProductSubTab === 'products' ? 'products' : activeProductSubTab === 'themes' ? 'themes' : 'bespoke';
    const url = editingItem ? `/api/${endpoint}/${editingItem.id}` : `/api/${endpoint}`;
    const method = editingItem ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fTitle,
        description: fDesc,
        price: parseFloat(fPrice) || 0,
        image: fImage,
        status: fStatus,
        category: fCategory,
        features: fFeatures,
        subdescription: fSubDesc,
        price_subdescription: fPriceSubDesc
      })
    });
    if (res.ok) {
      fetchAllData();
      resetForm();
      triggerSuccess();
    }
  };

  const deleteItem = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Delete Item",
      message: "Are you sure you want to remove this piece from the collection?",
      confirmLabel: "Delete",
      type: "danger"
    });
    if (!isConfirmed) return;
    const endpoint = activeProductSubTab === 'jewelry' ? 'jewelry' : activeProductSubTab === 'products' ? 'products' : activeProductSubTab === 'themes' ? 'themes' : 'bespoke';
    const res = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAllData();
      triggerSuccess();
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFTitle(item.title); setFDesc(item.description); setFPrice(item.price.toString());
    setFImage(item.image); setFStatus(item.status || 'Active'); setFCategory(item.category || currentCategories[0]);
    setFFeatures(item.features || ''); setFSubDesc(item.subdescription || ''); setFPriceSubDesc(item.price_subdescription || '');
    // scroll to top of content area
    const contentArea = document.querySelector(`.${styles.content}`);
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderAnalytics = () => (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37' }}><Activity /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Requests</span>
            <span className={styles.statValue}>{stats.totalRequests}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}><Clock /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Reviews</span>
            <span className={styles.statValue}>{stats.pendingRequests}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Plus /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Designs</span>
            <span className={styles.statValue}>{stats.designingRequests}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}><Package /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Inventory Items</span>
            <span className={styles.statValue}>{stats.totalInventory}</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardColumn}>
          <div className={styles.cardHeader}>
            <h3>Recent Requests</h3>
            <button onClick={() => setActiveTab('requests')} className={styles.textBtn}>View All</button>
          </div>
          <div className={styles.miniList}>
            {requests.slice(0, 5).map(r => (
              <div key={r.id} className={styles.miniItem} onClick={() => { setSelectedRequest(r); setActiveTab('requests'); }}>
                <div className={styles.miniItemInfo}>
                  <p className={styles.miniItemTitle}>{r.full_name}</p>
                  <p className={styles.miniItemSub}>{r.jewelry_type} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[r.status.toLowerCase().replace(' ', '')]}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.dashboardColumn}>
          <div className={styles.cardHeader}>
            <h3>Quick Actions</h3>
          </div>
          <div className={styles.actionGrid}>
            <button className={styles.actionBtn} onClick={() => setActiveTab('products')}><Package /> Add Product</button>
            <button className={styles.actionBtn} onClick={() => setActiveTab('settings')}><Settings /> System Check</button>
            <button className={styles.actionBtn} onClick={() => router.push('/')}><Eye /> View Website</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={requestSearch}
            onChange={(e) => setRequestSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <CustomDropdown 
            options={['All', 'Pending', 'In Review', 'Designing', 'Completed', 'Cancelled']}
            selected={requestStatusFilter}
            onChange={setRequestStatusFilter}
          />
          <CustomDropdown 
            options={['All', 'Urgent', 'High', 'Medium', 'Low']}
            selected={requestPriorityFilter}
            onChange={setRequestPriorityFilter}
          />
        </div>
      </div>

      <div className={styles.requestsContainer}>
        <div className={styles.requestsList}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Jewelry Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(r => (
                <tr key={r.id} className={selectedRequest?.id === r.id ? styles.selectedRow : ''} onClick={() => setSelectedRequest(r)}>
                  <td>
                    <div className={styles.customerCell}>
                      <span className={styles.name}>{r.full_name}</span>
                      <span className={styles.email}>{r.email_address}</span>
                    </div>
                  </td>
                  <td>{r.jewelry_type}</td>
                  <td>
                    <span className={`${styles.priorityBadge} ${styles[r.priority.toLowerCase()]}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[r.status.toLowerCase().replace(' ', '')]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className={styles.iconBtn}><MoreVertical /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedRequest && (
          <div className={styles.requestDetail}>
            <div className={styles.detailHeader}>
              <h3>Request Details</h3>
              <div className={styles.detailHeaderActions}>
                <span className={styles.requestId}>ID: #{selectedRequest.id.toString().padStart(5, '0')}</span>
                <button className={styles.closeDetail} onClick={() => setSelectedRequest(null)}>&times;</button>
              </div>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailSection}>
                <label>Customer Details</label>
                <div className={styles.detailInfo}>
                  <p><strong>Name:</strong> {selectedRequest.full_name}</p>
                  <p><strong>Email:</strong> {selectedRequest.email_address}</p>
                  <p><strong>WhatsApp:</strong> {selectedRequest.whatsapp_number}</p>
                  <p><strong>Location:</strong> {selectedRequest.country || 'Not specified'}</p>
                  <p><strong>Pref. Contact:</strong> {selectedRequest.contact_method || 'WhatsApp'}</p>
                </div>
                <div className={styles.detailActions}>
                  <a href={`mailto:${selectedRequest.email_address}`} className={styles.secondaryBtn}><Mail /> Email</a>
                  <a href={buildWhatsAppUrl(selectedRequest.whatsapp_number, `Hi ${selectedRequest.full_name}, I'm following up on your design request.`)} target="_blank" className={styles.secondaryBtn}><MessageSquare /> WhatsApp</a>
                </div>
              </div>

              <div className={styles.detailSection}>
                <label>Design Specifications</label>
                <div className={styles.detailGrid}>
                  <div className={styles.specCard}>
                    <h4>Jewelry & Style</h4>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Type</span><span className={styles.infoValue}>{selectedRequest.jewelry_type}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Style</span><span className={styles.infoValue}>{selectedRequest.jewelry_style}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Occasion</span><span className={styles.infoValue}>{selectedRequest.occasion_type}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Budget</span><span className={styles.infoValue}>{selectedRequest.budget_range}</span></div>
                  </div>
                  <div className={styles.specCard}>
                    <h4>Stone Details</h4>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Stone</span><span className={styles.infoValue}>{selectedRequest.stone_type}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Shape</span><span className={styles.infoValue}>{selectedRequest.diamond_type}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Size</span><span className={styles.infoValue}>{selectedRequest.diamond_size}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Quality</span><span className={styles.infoValue}>{selectedRequest.diamond_quality}</span></div>
                  </div>
                  <div className={styles.specCard}>
                    <h4>Metal & Finish</h4>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Metal</span><span className={styles.infoValue}>{selectedRequest.material_preference}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Finish</span><span className={styles.infoValue}>{selectedRequest.metal_finish}</span></div>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Size</span><span className={styles.infoValue}>{selectedRequest.ring_size || 'N/A'}</span></div>
                  </div>
                  <div className={styles.specCard}>
                    <h4>Preferences</h4>
                    <div className={styles.infoItem}><span className={styles.infoLabel}>Timeline</span><span className={styles.infoValue}>{selectedRequest.delivery_timeline}</span></div>
                    <div className={styles.badgeGroup}>
                      {selectedRequest.preview_requested && <span className={styles.previewBadge}>3D Preview Req.</span>}
                      {selectedRequest.custom_engraving && <span className={styles.engravingBadge}>Engraving Req.</span>}
                    </div>
                    {selectedRequest.custom_engraving && selectedRequest.engraving_text && (
                      <p style={{fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8}}>"{selectedRequest.engraving_text}"</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <label>Reference Images</label>
                <div className={styles.imageGridMini}>
                  {selectedRequest.reference_image_urls && selectedRequest.reference_image_urls.length > 0 ? (
                    selectedRequest.reference_image_urls.map((url: string, idx: number) => (
                      <img key={idx} src={url} className={styles.miniRefImage} alt={`Ref ${idx}`} onClick={() => window.open(url, '_blank')} />
                    ))
                  ) : selectedRequest.reference_image_url ? (
                    <img src={selectedRequest.reference_image_url} className={styles.miniRefImage} alt="Reference" onClick={() => window.open(selectedRequest.reference_image_url, '_blank')} />
                  ) : (
                    <p className={styles.noData}>No images provided.</p>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <label>Custom Instructions</label>
                <div className={styles.notesArea} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {selectedRequest.additional_notes || 'No special instructions.'}
                </div>
              </div>

              <div className={styles.detailSection}>
                <label>Management</label>
                <div className={styles.managementGrid}>
                  <div className={styles.inputGroup}>
                    <span>Status</span>
                    <CustomDropdown 
                      options={['Pending', 'In Review', 'Designing', 'Completed', 'Cancelled']}
                      selected={selectedRequest.status}
                      onChange={(val) => updateRequestStatus(selectedRequest.id, val)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <span>Priority</span>
                    <CustomDropdown 
                      options={['Low', 'Medium', 'High', 'Urgent']}
                      selected={selectedRequest.priority || 'Medium'}
                      onChange={(val) => updateRequestPriority(selectedRequest.id, val)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <label>Internal Admin Notes</label>
                <textarea
                  className={styles.notesArea}
                  defaultValue={selectedRequest.admin_notes || ''}
                  onBlur={(e) => updateAdminNotes(selectedRequest.id, e.target.value)}
                  placeholder="Add private notes for staff..."
                />
              </div>

              <button className={styles.deleteRequestBtn} onClick={() => deleteRequest(selectedRequest.id)}><Trash2 /> Delete Request</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  const renderProducts = () => (
    <div className={styles.tabContent}>
      <div className={styles.subTabNav}>
        <button className={activeProductSubTab === 'jewelry' ? styles.activeSubTab : ''} onClick={() => { setActiveProductSubTab('jewelry'); resetForm(); }}>Luxury Rings</button>
        <button className={activeProductSubTab === 'products' ? styles.activeSubTab : ''} onClick={() => { setActiveProductSubTab('products'); resetForm(); }}>Diamonds</button>
        <button className={activeProductSubTab === 'themes' ? styles.activeSubTab : ''} onClick={() => { setActiveProductSubTab('themes'); resetForm(); }}>Earrings</button>
        <button className={activeProductSubTab === 'bespoke' ? styles.activeSubTab : ''} onClick={() => { setActiveProductSubTab('bespoke'); resetForm(); }}>Bespoke</button>
      </div>

      <div className={styles.productSplit}>
        {/* Form */}
        <div className={styles.productFormPanel}>
          <div className={styles.cardHeader}>
            <h3>{editingItem ? 'Edit' : 'Add New'} Item</h3>
            {editingItem && <button onClick={resetForm} className={styles.textBtn}>Cancel Edit</button>}
          </div>
          <form onSubmit={handleProductSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Title</label>
              <input value={fTitle} onChange={e => setFTitle(e.target.value)} required placeholder="Product Title" />
            </div>
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} required placeholder="Main description..." />
            </div>
            <div className={styles.inputGroup}>
              <label>Luxury Features (One per line)</label>
              <textarea value={fFeatures} onChange={e => setFFeatures(e.target.value)} placeholder="• 18K Gold\n• VVS Diamonds..." />
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Price</label>
                <input type="number" step="0.01" value={fPrice} onChange={e => setFPrice(e.target.value)} required placeholder="0.00" />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <CustomDropdown 
                  options={['Active', 'Inactive', 'Sold Out']}
                  selected={fStatus}
                  onChange={setFStatus}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Category</label>
              <CustomDropdown 
                options={currentCategories}
                selected={fCategory}
                onChange={setFCategory}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Luxury Subdescription</label>
              <input value={fSubDesc} onChange={e => setFSubDesc(e.target.value)} placeholder="Additional craftsmanship details..." />
            </div>
            <div className={styles.inputGroup}>
              <label>Product Image</label>
              <div className={styles.uploadBox}>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadFile(file);
                    if (url) setFImage(url);
                  }
                }} />
                {fImage && <img src={fImage} className={styles.formPreview} alt="Preview" />}
              </div>
            </div>
            <button type="submit" className={styles.primaryBtn} disabled={isUploading}>
              {isUploading ? 'Uploading...' : (editingItem ? 'Update Product' : 'Publish Product')}
            </button>
          </form>
        </div>

        {/* List */}
        <div className={styles.productListPanel}>
          <div className={styles.cardHeader}>
            <h3>Collection Inventory</h3>
          </div>
          <div className={styles.scrollList}>
            {(activeProductSubTab === 'jewelry' ? jewelry : activeProductSubTab === 'products' ? products : activeProductSubTab === 'themes' ? themes : bespoke).map(item => (
              <div key={item.id} className={styles.productListItem}>
                <img src={item.image} alt={item.title} />
                <div className={styles.productListItemInfo}>
                  <h4>{item.title}</h4>
                  <p>${item.price} · {item.status}</p>
                </div>
                <div className={styles.listItemActions}>
                  <button onClick={() => startEdit(item)} className={styles.iconBtn}><Eye size={18} /></button>
                  <button onClick={() => deleteItem(item.id)} className={styles.iconBtn} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className={styles.tabContent}>
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardColumn}>
          <div className={styles.cardHeader}>
            <h3>Account Settings</h3>
          </div>
          <form onSubmit={handleProfileUpdate} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Profile Image</label>
              <div className={styles.profileUpload}>
                <div className={styles.avatarLarge}>
                  {sProfileImage ? <img src={sProfileImage} alt="Avatar" /> : (adminUser?.username?.charAt(0) || 'A')}
                </div>
                <div className={styles.uploadBoxMini}>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadFile(file);
                      if (url) setSProfileImage(url);
                    }
                  }} />
                  <p className={styles.miniHint}>Recommended: 400x400px</p>
                </div>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input value={sUsername} onChange={e => setSUsername(e.target.value)} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" value={sEmail} onChange={e => setSEmail(e.target.value)} required />
            </div>
            <button type="submit" className={styles.primaryBtn} disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className={styles.dashboardColumn}>
          <div className={styles.cardHeader}>
            <h3>Security</h3>
          </div>
          <form onSubmit={handlePasswordUpdate} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Current Password</label>
              <input type="password" value={sCurrentPass} onChange={e => setSCurrentPass(e.target.value)} placeholder="Required to change password" />
            </div>
            <div className={styles.inputGroup}>
              <label>New Password</label>
              <input type="password" value={sNewPass} onChange={e => setSNewPass(e.target.value)} placeholder="At least 8 characters" />
            </div>
            <div className={styles.inputGroup}>
              <label>Confirm New Password</label>
              <input type="password" value={sConfirmPass} onChange={e => setSConfirmPass(e.target.value)} />
            </div>
            <button type="submit" className={styles.secondaryBtn} disabled={isUploading}>
              {isUploading ? 'Updating...' : 'Change Password'}
            </button>
          </form>

          <div className={styles.divider} style={{ margin: '2rem 0' }}></div>
          
          <div className={styles.cardHeader}>
            <h3>System Status</h3>
          </div>
          <div className={styles.miniList}>
            <div className={styles.miniItem}>
              <div className={styles.miniItemInfo}>
                <p className={styles.miniItemTitle}>Database</p>
                <p className={styles.miniItemSub}>PostgreSQL Cluster</p>
              </div>
              <span className={styles.statusBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Connected</span>
            </div>
            <div className={styles.miniItem}>
              <div className={styles.miniItemInfo}>
                <p className={styles.miniItemTitle}>Auth Engine</p>
                <p className={styles.miniItemSub}>JWT + Bcrypt Secure</p>
              </div>
              <span className={styles.statusBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>NEXORA <span>ADMIN</span></h2>
        </div>

        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 /> Analytics
          </button>
          <button className={`${styles.navItem} ${activeTab === 'requests' ? styles.active : ''}`} onClick={() => setActiveTab('requests')}>
            <Activity /> 3D Requests
            {stats.pendingRequests > 0 && <span className={styles.badge}>{stats.pendingRequests}</span>}
          </button>
          <button className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`} onClick={() => setActiveTab('products')}>
            <Package /> Products
          </button>
          <button className={`${styles.navItem} ${activeTab === 'customers' ? styles.active : ''}`} onClick={() => setActiveTab('customers')}>
            <Users /> Customers
          </button>
          <button className={`${styles.navItem} ${activeTab === 'messages' ? styles.active : ''}`} onClick={() => setActiveTab('messages')}>
            <MessageSquare /> Messages
          </button>
          <button className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings /> Settings
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h1>
          <div className={styles.headerActions}>
            {showSuccess && <span className={styles.successMsg}><CheckCircle /> Saved Successfully</span>}
            <div className={styles.adminProfile}>
              <span>{adminUser?.username || 'Admin'}</span>
              <div className={styles.avatar}>
                {adminUser?.profile_image ? <img src={adminUser.profile_image} alt="Avatar" /> : (adminUser?.username?.charAt(0) || 'A')}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'customers' && (
            <div className={styles.tabContent}>
              <div className={styles.toolbar}>
                <div className={styles.searchBar}>
                  <Search />
                  <input
                    type="text"
                    placeholder="Search clients by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.requestsContainer}>
                <div className={styles.requestsList}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Location</th>
                        <th>Requests</th>
                        <th>Last Activity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.id} className={selectedCustomer?.id === c.id ? styles.selectedRow : ''} onClick={() => setSelectedCustomer(c)}>
                          <td>
                            <div className={styles.customerCell}>
                              <span className={styles.name}>{c.full_name}</span>
                              <span className={styles.email}>{c.email}</span>
                            </div>
                          </td>
                          <td>{c.country || 'Not Set'}</td>
                          <td>{c.request_count}</td>
                          <td>{new Date(c.last_activity_at).toLocaleDateString()}</td>
                          <td>
                            <span className={styles.statusBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedCustomer && (
                  <div className={styles.requestDetail}>
                    <div className={styles.detailHeader}>
                      <h3>Client Profile</h3>
                      <button className={styles.closeDetail} onClick={() => setSelectedCustomer(null)}>&times;</button>
                    </div>
                    <div className={styles.detailBody}>
                      <div className={styles.detailSection}>
                        <label>Contact Information</label>
                        <div className={styles.detailInfo}>
                          <p><strong>Name:</strong> {selectedCustomer.full_name}</p>
                          <p><strong>Email:</strong> {selectedCustomer.email}</p>
                          <p><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                          <p><strong>Country:</strong> {selectedCustomer.country || 'N/A'}</p>
                        </div>
                      </div>

                      <div className={styles.detailSection}>
                        <label>Preferences & Budget</label>
                        <div className={styles.detailInfo}>
                          <p><strong>Budget:</strong> {selectedCustomer.budget_preference || 'Not specified'}</p>
                          <p><strong>Jewelry Interests:</strong> {selectedCustomer.jewelry_preferences || 'No data yet'}</p>
                        </div>
                      </div>

                      <div className={styles.detailSection}>
                        <label>Request History</label>
                        <div className={styles.miniList}>
                          {requests.filter(r => r.customer_id === selectedCustomer.id).map(r => (
                            <div key={r.id} className={styles.miniItem}>
                              <div className={styles.miniItemInfo}>
                                <p className={styles.miniItemTitle}>{r.jewelry_type}</p>
                                <p className={styles.miniItemSub}>{new Date(r.created_at).toLocaleDateString()} · {r.status}</p>
                              </div>
                            </div>
                          ))}
                          {requests.filter(r => r.customer_id === selectedCustomer.id).length === 0 && (
                            <p className={styles.noData}>No previous requests.</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.detailSection}>
                        <label>Internal Admin Notes</label>
                        <textarea
                          className={styles.notesArea}
                          defaultValue={selectedCustomer.internal_notes || ''}
                          onBlur={(e) => updateCustomerNotes(selectedCustomer.id, e.target.value)}
                          placeholder="Private notes about this client..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'messages' && (
            <div className={styles.tabContent}>
              <div className={styles.toolbar}>
                <div className={styles.filters}>
                  {['All', 'Unread', 'Requests', 'Support'].map(f => (
                    <button 
                      key={f} 
                      className={`${styles.filterTab} ${messageFilter === f ? styles.activeFilterTab : ''}`}
                      onClick={() => setMessageFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.requestsContainer}>
                <div className={styles.requestsList}>
                  <div className={styles.messageInbox}>
                    {filteredMessages.map(m => (
                      <div 
                        key={m.id} 
                        className={`${styles.messageItem} ${selectedMessage?.id === m.id ? styles.selectedMessage : ''} ${!m.is_read ? styles.unreadMessage : ''}`}
                        onClick={() => { setSelectedMessage(m); if (!m.is_read) markMessageAsRead(m.id); }}
                      >
                        <div className={styles.messageItemHeader}>
                          <span className={styles.messageSender}>{m.customer_name || 'System'}</span>
                          <span className={styles.messageTime}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={styles.messageSubject}>{m.subject}</p>
                        <p className={styles.messageSnippet}>{m.content.substring(0, 60)}...</p>
                        <div className={styles.messageBadges}>
                          <span className={styles.typeBadge}>{m.message_type}</span>
                          {!m.is_read && <span className={styles.unreadDot}></span>}
                        </div>
                      </div>
                    ))}
                    {filteredMessages.length === 0 && (
                      <div className={styles.emptyInbox}>
                        <Mail size={48} />
                        <p>No messages found in this category.</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedMessage && (
                  <div className={styles.requestDetail} style={{ flex: 1.5 }}>
                    <div className={styles.detailHeader}>
                      <h3>{selectedMessage.subject}</h3>
                      <button className={styles.closeDetail} onClick={() => setSelectedMessage(null)}>&times;</button>
                    </div>
                    <div className={styles.detailBody}>
                      <div className={styles.conversationArea}>
                        {/* Selected Message Content */}
                        <div className={`${styles.messageBubble} ${selectedMessage.sender_type === 'admin' ? styles.adminBubble : styles.customerBubble}`}>
                          <div className={styles.bubbleHeader}>
                            <strong>{selectedMessage.sender_type === 'admin' ? 'Admin' : selectedMessage.customer_name}</strong>
                            <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                          </div>
                          <p>{selectedMessage.content}</p>
                          {selectedMessage.metadata?.image && (
                            <img src={selectedMessage.metadata.image} className={styles.messageImage} alt="Ref" />
                          )}
                        </div>

                        {/* Thread (Filter other messages from same customer) */}
                        {messages
                          .filter(m => m.customer_id === selectedMessage.customer_id && m.id !== selectedMessage.id)
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map(m => (
                            <div key={m.id} className={`${styles.messageBubble} ${m.sender_type === 'admin' ? styles.adminBubble : styles.customerBubble}`}>
                              <div className={styles.bubbleHeader}>
                                <strong>{m.sender_type === 'admin' ? 'Admin' : m.customer_name}</strong>
                                <span>{new Date(m.created_at).toLocaleString()}</span>
                              </div>
                              <p>{m.content}</p>
                            </div>
                          ))}
                      </div>

                      <div className={styles.replyBox}>
                        <textarea
                          placeholder="Type your luxury response..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className={styles.replyActions}>
                          <button 
                            className={styles.primaryBtn} 
                            onClick={() => handleMessageReply(selectedMessage.customer_id)}
                            disabled={isUploading || !replyContent.trim()}
                          >
                            {isUploading ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
}
