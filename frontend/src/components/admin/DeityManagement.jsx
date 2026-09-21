import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Sparkles, Plus, Search, Edit, Trash2, CheckCircle2, 
  Landmark, RefreshCw, Star, Link2, X, ExternalLink
} from 'lucide-react';

const DeityManagement = ({ temples = [] }) => {
  const [deities, setDeities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDeity, setEditingDeity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    alternateNames: '',
    category: 'Vaishnavism',
    description: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  // Temple Mapping Modal
  const [mappingDeity, setMappingDeity] = useState(null);
  const [selectedTempleId, setSelectedTempleId] = useState('');
  const [isPrimaryMapping, setIsPrimaryMapping] = useState(true);
  const [mappingLoading, setMappingLoading] = useState(false);

  const fetchDeities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/deities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDeities(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load deities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeities();
  }, []);

  const openAddModal = () => {
    setEditingDeity(null);
    setFormData({
      name: '',
      alternateNames: '',
      category: 'Vaishnavism',
      description: '',
      imageUrl: '',
      isFeatured: false,
      isActive: true
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (deity) => {
    setEditingDeity(deity);
    setFormData({
      name: deity.name,
      alternateNames: (deity.alternateNames || []).join(', '),
      category: deity.category || 'Vaishnavism',
      description: deity.description || '',
      imageUrl: deity.imageUrl || '',
      isFeatured: Boolean(deity.isFeatured),
      isActive: Boolean(deity.isActive)
    });
    setIsFormModalOpen(true);
  };

  const handleSaveDeity = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.warning('Please enter deity name');
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        ...formData,
        alternateNames: formData.alternateNames
          ? formData.alternateNames.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      if (editingDeity) {
        await axios.put(`/api/admin/deities/${editingDeity._id}`, payload, { headers });
        toast.success(`Deity '${formData.name}' updated`);
      } else {
        await axios.post('/api/admin/deities', payload, { headers });
        toast.success(`Deity '${formData.name}' created`);
      }

      setIsFormModalOpen(false);
      fetchDeities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save deity');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (deity) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`/api/admin/deities/${deity._id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.info(res.data.message);
        fetchDeities();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleAssignToTemple = async (e) => {
    e.preventDefault();
    if (!selectedTempleId) return toast.warning('Please select a temple');

    try {
      setMappingLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/temples/${selectedTempleId}/deities`, {
        deityId: mappingDeity._id,
        isPrimary: isPrimaryMapping
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Deity assigned to temple successfully');
      setMappingDeity(null);
      fetchDeities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to map deity');
    } finally {
      setMappingLoading(false);
    }
  };

  const handleRemoveMapping = async (templeId, deityId) => {
    if (!window.confirm('Remove this deity mapping from the temple?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/temples/${templeId}/deities/${deityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info('Deity mapping removed');
      fetchDeities();
    } catch (err) {
      toast.error('Failed to remove mapping');
    }
  };

  const filteredDeities = deities.filter((d) => {
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesSearch = !search.trim() || 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.alternateNames || []).some((n) => n.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#d97706" /> Sacred Deity Management
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Curate worshipped deities, assign primary & secondary relationships to temples, and control devotee discovery.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '8px 18px', fontWeight: 700 }}>
            <Plus size={16} /> Add Deity
          </button>
          <button onClick={fetchDeities} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 14px' }}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', borderRadius: '12px', background: 'white', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search deity by name, alias..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ fontSize: '0.88rem' }}>
              <option value="all">All Traditions</option>
              <option value="Vaishnavism">Vaishnavism</option>
              <option value="Shaivism">Shaivism</option>
              <option value="Shakta">Shakta</option>
              <option value="Hanuman">Hanuman</option>
              <option value="Ganesha">Ganesha</option>
              <option value="Other">Other Traditions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deity Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 8px' }} />
          Loading deity directory...
        </div>
      ) : filteredDeities.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>No deities found matching your filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredDeities.map((deity) => (
            <div 
              key={deity._id} 
              className="card"
              style={{
                borderRadius: '14px', overflow: 'hidden', background: 'white',
                border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column'
              }}
            >
              {/* Image banner or fallback */}
              <div style={{ height: '120px', position: 'relative', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                {deity.imageUrl ? (
                  <img 
                    src={deity.imageUrl} 
                    alt={deity.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#d97706', fontWeight: 800 }}>
                    <Sparkles size={32} />
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: deity.isActive ? '#dcfce7' : '#fee2e2',
                  color: deity.isActive ? '#15803d' : '#b91c1c',
                  padding: '3px 8px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700
                }}>
                  {deity.isActive ? 'Active' : 'Inactive'}
                </span>
                {deity.isFeatured && (
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: '#fef3c7', color: '#b45309',
                    padding: '3px 8px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Star size={12} fill="#b45309" /> Featured
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{deity.name}</h4>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {deity.category}
                  </span>
                </div>

                {deity.alternateNames && deity.alternateNames.length > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                    <strong>Also known as:</strong> {deity.alternateNames.join(', ')}
                  </div>
                )}

                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, margin: '0 0 12px', flex: 1 }}>
                  {deity.description}
                </p>

                {/* Associated Temples */}
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Landmark size={12} /> ASSOCIATED TEMPLES ({deity.temples?.length || 0})
                  </div>
                  {deity.temples && deity.temples.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {deity.temples.map((t) => (
                        <span key={t._id} style={{ fontSize: '0.74rem', background: 'white', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {t.name}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveMapping(t._id, deity._id)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <small style={{ color: '#94a3b8' }}>No temples mapped yet</small>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <button 
                    onClick={() => openEditModal(deity)} 
                    className="btn btn-sm" 
                    style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button 
                    onClick={() => setMappingDeity(deity)} 
                    className="btn btn-sm" 
                    style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Link2 size={13} /> Map Temple
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(deity)} 
                    className="btn btn-sm" 
                    style={{
                      background: deity.isActive ? '#fff1f2' : '#f0fdf4',
                      color: deity.isActive ? '#be123c' : '#15803d',
                      border: 'none', fontSize: '0.8rem'
                    }}
                  >
                    {deity.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT DEITY MODAL */}
      {isFormModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>{editingDeity ? 'Edit Deity' : 'Add New Sacred Deity'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveDeity}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Deity Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Lord Venkateswara"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Alternate Names / Aliases (Comma-separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Balaji, Srinivasa, Govinda"
                  value={formData.alternateNames}
                  onChange={(e) => setFormData({ ...formData, alternateNames: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tradition / Category</label>
                <select 
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Vaishnavism">Vaishnavism</option>
                  <option value="Shaivism">Shaivism</option>
                  <option value="Shakta">Shakta</option>
                  <option value="Hanuman">Hanuman</option>
                  <option value="Ganesha">Ganesha</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Significance & Description *</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  required
                  placeholder="Describe the spiritual significance..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  Featured Deity
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active (Publicly Visible)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn" style={{ background: '#f1f5f9', border: 'none' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {saving ? 'Saving...' : (editingDeity ? 'Update Deity' : 'Create Deity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAP TEMPLE MODAL */}
      {mappingDeity && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ margin: '0 0 4px', color: '#0f172a' }}>Map {mappingDeity.name} to Temple</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.85rem' }}>
              Assign as Primary or Secondary deity worshipped at a shrine.
            </p>

            <form onSubmit={handleAssignToTemple}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Select Temple *</label>
                <select 
                  className="form-control" 
                  required 
                  value={selectedTempleId}
                  onChange={(e) => setSelectedTempleId(e.target.value)}
                >
                  <option value="">-- Choose Temple --</option>
                  {temples.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.location?.city || 'India'})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Relationship</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="relType"
                      checked={isPrimaryMapping}
                      onChange={() => setIsPrimaryMapping(true)}
                    />
                    Primary Presiding Deity
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="relType"
                      checked={!isPrimaryMapping}
                      onChange={() => setIsPrimaryMapping(false)}
                    />
                    Secondary / Consort Deity
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setMappingDeity(null)} className="btn" style={{ background: '#f1f5f9', border: 'none' }}>
                  Cancel
                </button>
                <button type="submit" disabled={mappingLoading} className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {mappingLoading ? 'Mapping...' : 'Confirm Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeityManagement;
