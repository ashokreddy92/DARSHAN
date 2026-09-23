import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Calendar, Plus, Trash2, ShieldAlert, Landmark, Ticket, QrCode, 
  Users, UserPlus, UserCheck, Mail, Phone, ShieldCheck, X, RefreshCw,
  Shield, Settings
} from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Slot scheduling form state
  const [slotForm, setSlotForm] = useState({
    date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 300, slotType: 'VIP'
  });
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Staff Assignment form modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '', email: '', phone: '', password: 'staff123'
  });
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Fetch organizer's temples and details
  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const templesRes = await axios.get('/api/temples');
      if (templesRes.data.success) {
        // Filter temples created by this organizer (or all temples if ADMIN)
        const ownedTemples = templesRes.data.data.filter(
          (t) => t.createdBy?.toString() === user._id.toString() || user.role === 'ADMIN'
        );
        setTemples(ownedTemples);
        if (ownedTemples.length > 0) {
          setSelectedTemple(ownedTemples[0]._id);
        }
      }
    } catch (err) {
      toast.error('Error fetching organizer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, [user]);

  // Fetch Slots, Bookings, and Staff Members when Selected Temple changes
  const fetchTempleDetails = async () => {
    if (!selectedTemple) return;
    try {
      // Fetch Slots
      const slotsRes = await axios.get(`/api/slots/temple/${selectedTemple}`);
      if (slotsRes.data.success) {
        setSlots(slotsRes.data.data);
      }

      // Fetch Bookings for Temple
      const bookingsRes = await axios.get(`/api/bookings/temple/${selectedTemple}`);
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      // Fetch Staff Members assigned to Temple
      fetchStaffMembers(selectedTemple);
    } catch (err) {
      console.error('Error fetching temple slots/bookings:', err.message);
    }
  };

  const fetchStaffMembers = async (templeId) => {
    if (!templeId) return;
    try {
      setLoadingStaff(true);
      const res = await axios.get(`/api/staff/members?templeId=${templeId}`);
      if (res.data.success) {
        setStaffMembers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching staff members:', err.message);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (selectedTemple) {
      fetchTempleDetails();
    }
  }, [selectedTemple]);

  // Create Darshan Slot
  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/slots', {
        ...slotForm,
        temple: selectedTemple
      });
      if (res.data.success) {
        toast.success('Darshan slot scheduled successfully!');
        setShowSlotForm(false);
        setSlotForm({ date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 300, slotType: 'VIP' });
        fetchTempleDetails(); // Reload slots
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule slot');
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const res = await axios.delete(`/api/slots/${id}`);
      if (res.data.success) {
        toast.success('Slot removed');
        fetchTempleDetails();
      }
    } catch (err) {
      toast.error('Failed to delete slot');
    }
  };

  // Verify Payment
  const handleVerifyPayment = async (bookingId) => {
    try {
      const res = await axios.put(`/api/bookings/${bookingId}/verify`);
      if (res.data.success) {
        toast.success('Payment verified and booking confirmed!');
        fetchTempleDetails(); // Reload bookings
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  // Reject Payment
  const handleRejectPayment = async (bookingId) => {
    if (!window.confirm('Reject this payment and cancel the booking?')) return;
    try {
      const res = await axios.put(`/api/bookings/${bookingId}/reject`);
      if (res.data.success) {
        toast.warning('Payment rejected and booking cancelled');
        fetchTempleDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  // Assign or Create Staff Member
  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.email.trim() || !selectedTemple) {
      toast.error('Please fill staff email and select a temple');
      return;
    }

    try {
      setSubmittingStaff(true);
      const res = await axios.post('/api/staff/assign', {
        ...staffForm,
        templeId: selectedTemple
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Staff member assigned successfully');
        setShowStaffModal(false);
        setStaffForm({ name: '', email: '', phone: '', password: 'staff123' });
        fetchStaffMembers(selectedTemple);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign staff member');
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Remove / Unassign Staff Member
  const handleRemoveStaff = async (staffId, staffName) => {
    if (!window.confirm(`Unassign staff member "${staffName}" from this temple?`)) return;
    try {
      const res = await axios.delete(`/api/staff/members/${staffId}`);
      if (res.data.success) {
        toast.info(`Staff member ${staffName} unassigned`);
        fetchStaffMembers(selectedTemple);
      }
    } catch (err) {
      toast.error('Failed to unassign staff member');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Syncing dashboard logs...</div>;
  }

  if (temples.length === 0) {
    return (
      <div className="container error-panel card text-center" style={{ margin: '80px auto', maxWidth: '600px' }}>
        <ShieldAlert size={48} className="warn-icon" />
        <h2>No Temples Assigned</h2>
        <p>You currently do not manage any temples. Please contact administrators to list your temple.</p>
        <style>{`
          .error-panel { padding: 40px; }
          .warn-icon { color: var(--warning); margin-bottom: 20px; }
          .text-center { text-align: center; }
        `}</style>
      </div>
    );
  }

  const currentTempleObj = temples.find(t => t._id === selectedTemple);

  return (
    <div className="organizer-container container">
      {/* Page Header */}
      <div className="org-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="title-row">
            <Landmark className="org-icon" />
            <h1>Organizer Dashboard</h1>
          </div>
          <p>Schedule darshan calendars, manage staff members, and control ticket verification.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && (
            <Link 
              to="/admin" 
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontWeight: 600,
                borderRadius: '10px',
                color: '#b45309',
                borderColor: '#fde68a',
                background: '#fffbeb'
              }}
            >
              <Shield size={18} color="#d97706" /> Admin Control Panel
            </Link>
          )}

          <button 
            type="button"
            onClick={() => setShowStaffModal(true)}
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontWeight: 600,
              borderRadius: '10px'
            }}
          >
            <UserPlus size={18} /> Assign Staff Member
          </button>

          <button 
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
            }}
          >
            <QrCode size={19} /> Scan Ticket QR
          </button>
        </div>
      </div>

      {/* Portal Connections Switcher Bar */}
      <div className="admin-switch-bar card" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--secondary)' }}>
            System Dashboards Connection:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/organizer" className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 700, borderRadius: '8px', padding: '6px 14px' }}>
            <Settings size={14} /> Organizer Panel
          </Link>
          <Link to="/staff-dashboard" className="btn btn-sm btn-outline" style={{ background: '#fff', color: '#334155', fontWeight: 600, borderRadius: '8px', padding: '6px 14px' }}>
            <QrCode size={14} /> Staff Scanner Portal
          </Link>
          <Link to="/admin" className="btn btn-sm btn-outline" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a', fontWeight: 600, borderRadius: '8px', padding: '6px 14px' }}>
            <Shield size={14} /> Central Admin Panel
          </Link>
        </div>
      </div>

      {/* Select active temple */}
      <div className="temple-selector-card card">
        <label>Active Temple Management:</label>
        <select
          value={selectedTemple}
          onChange={(e) => setSelectedTemple(e.target.value)}
          className="form-control"
        >
          {temples.map((t) => (
            <option key={t._id} value={t._id}>{t.name} - {t.location?.city || t.city || 'India'}</option>
          ))}
        </select>
      </div>

      {/* Assigned Temple Staff Section */}
      <div className="card staff-management-card" style={{ marginBottom: '30px', padding: '20px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Temple Staff Members ({staffMembers.length})</h2>
          </div>
          <button 
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setShowStaffModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={15} /> Add / Assign Staff
          </button>
        </div>

        {loadingStaff ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={20} className="spin-icon" style={{ margin: '0 auto 8px' }} />
            <p>Loading temple staff list...</p>
          </div>
        ) : staffMembers.length === 0 ? (
          <div style={{ 
            background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', 
            padding: '24px', textAlign: 'center', color: '#64748b' 
          }}>
            <UserCheck size={36} style={{ color: '#94a3b8', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No dedicated staff members assigned to {currentTempleObj?.name || 'this temple'} yet.</p>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 12px' }}>
              Assign staff accounts to grant them QR scanning and pilgrim entry verification access.
            </p>
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => setShowStaffModal(true)}
            >
              + Assign Staff Member Now
            </button>
          </div>
        ) : (
          <div className="staff-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '14px' 
          }}>
            {staffMembers.map((staff) => (
              <div key={staff._id} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>{staff.name}</strong>
                    <span style={{ 
                      background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', 
                      fontWeight: 700, padding: '2px 6px', borderRadius: '10px' 
                    }}>Staff</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} /> {staff.email}
                  </div>
                  {staff.phone && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={12} /> {staff.phone}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStaff(staff._id, staff.name)}
                  className="icon-delete-btn"
                  title="Unassign staff member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Sections */}
      <div className="dashboard-sections">
        {/* Left: Manage slots list */}
        <div className="slots-management">
          <div className="section-header">
            <h2>Darshan Slots Calendar</h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowSlotForm(!showSlotForm)}
            >
              <Plus size={16} /> {showSlotForm ? 'Close Form' : 'Schedule Slot'}
            </button>
          </div>

          {/* Create slot form */}
          {showSlotForm && (
            <form onSubmit={handleSlotSubmit} className="slot-form card">
              <h3>New Darshan Slot</h3>
              <div className="form-group">
                <label>Darshan Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Window</label>
                <select
                  className="form-control"
                  value={slotForm.timeSlot}
                  onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                >
                  <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM (Morning)</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Mid Morning)</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Evening)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Slot Type</label>
                <select
                  className="form-control"
                  value={slotForm.slotType}
                  onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}
                >
                  <option value="VIP">VIP Priority Entry</option>
                  <option value="Special Pooja">Special Pooja & Ritual</option>
                  <option value="General">General Free Queue</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={slotForm.price}
                  onChange={(e) => setSlotForm({ ...slotForm, price: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Devotee Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={slotForm.maxCapacity}
                  onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Schedule Slot</button>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setShowSlotForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Timings</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s._id}>
                    <td>{s.date}</td>
                    <td>{s.timeSlot}</td>
                    <td>{s.slotType}</td>
                    <td>{s.price === 0 ? 'Free' : `₹${s.price}`}</td>
                    <td>{s.bookedCount} / {s.maxCapacity} booked</td>
                    <td>
                      <button className="icon-delete-btn" onClick={() => handleDeleteSlot(s._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Bookings list */}
        <div className="bookings-overview">
          <div className="section-header">
            <h2>Devotee Bookings</h2>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Devotee</th>
                  <th>Pilgrims</th>
                  <th>Slot Info</th>
                  <th>Payment Info</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.bookingReference}</strong></td>
                    <td>{b.user?.name}</td>
                    <td>{b.devotees?.length || 1} pilgrim(s)</td>
                    <td>{b.slot?.date} <br /><small>{b.slot?.timeSlot} ({b.slot?.slotType})</small></td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <strong>Method:</strong> {b.paymentMethod || 'Card'} <br />
                        {b.transactionId && <><strong>UTR:</strong> <code>{b.transactionId}</code> <br /></>}
                        {b.upiId && <><strong>UPI ID:</strong> <code>{b.upiId}</code></>}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${b.status?.toLowerCase().replace(' ', '-')}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.status === 'Pending Verification' && (
                        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleVerifyPayment(b._id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Verify
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={() => handleRejectPayment(b._id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {showStaffModal && (
        <div className="staff-modal-overlay">
          <div className="staff-modal-card card">
            <button 
              type="button" 
              className="modal-close-btn"
              onClick={() => setShowStaffModal(false)}
            >
              <X size={20} />
            </button>

            <div className="staff-modal-header text-center">
              <div className="staff-icon-badge">
                <UserPlus size={26} />
              </div>
              <h3>Assign Temple Staff Member</h3>
              <p>Assign staff permissions for <strong>{currentTempleObj?.name || 'Selected Temple'}</strong></p>
            </div>

            <form onSubmit={handleAssignStaff} className="staff-form">
              <div className="form-group">
                <label>Staff Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Suresh Verma"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Staff Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="staff@temple.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  If the email exists, their role will be updated to Temple Staff.
                </small>
              </div>

              <div className="form-group">
                <label>Contact Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Default Access Password</label>
                <input
                  type="text"
                  className="form-control"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="staff123"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={submittingStaff}
                >
                  <ShieldCheck size={18} /> {submittingStaff ? 'Assigning...' : 'Assign Staff Member'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowStaffModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal for Ticket Check-in */}
      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanComplete={fetchTempleDetails} 
      />

      <style>{`
        .organizer-container {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          min-height: calc(100vh - 200px);
          width: 100%;
        }

        .org-header {
          margin-bottom: clamp(20px, 3.5vw, 30px);
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .org-icon {
          color: var(--primary);
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .org-header h1 {
          font-weight: 800;
          color: var(--secondary);
        }

        .org-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .temple-selector-card {
          padding: clamp(14px, 2.5vw, 20px);
          margin-bottom: clamp(20px, 3vw, 28px);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .temple-selector-card label {
          font-weight: 700;
          color: var(--secondary);
          white-space: nowrap;
          font-size: 0.95rem;
        }

        .temple-selector-card select {
          flex: 1;
          min-width: 240px;
          max-width: 450px;
          min-height: 42px;
        }

        /* Layout Columns */
        .dashboard-sections {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: clamp(20px, 3.5vw, 40px);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary);
        }

        /* Staff Modal */
        .staff-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .staff-modal-card {
          background: white;
          width: 100%;
          max-width: 480px;
          border-radius: 16px;
          padding: 24px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .staff-icon-badge {
          width: 52px;
          height: 52px;
          background: #fff7ed;
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .staff-modal-header h3 {
          margin: 0 0 4px;
          font-size: 1.25rem;
          color: var(--secondary);
        }

        .staff-modal-header p {
          margin: 0 0 20px;
          font-size: 0.88rem;
          color: #64748b;
        }

        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f1f5f9;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
        }

        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Inline Forms */
        .slot-form {
          margin-bottom: 24px;
          border-color: var(--primary);
          padding: clamp(14px, 2.5vw, 20px);
        }

        .slot-form h3 {
          font-size: 1.1rem;
          margin-bottom: 14px;
          color: var(--secondary);
        }

        .slot-form .form-group {
          margin-bottom: 12px;
        }

        .slot-form .form-control {
          padding: 8px 12px;
          font-size: 0.9rem;
          min-height: 40px;
        }

        .slot-form .form-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .icon-delete-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: var(--transition);
        }

        .icon-delete-btn:hover {
          background-color: #fef2f2;
        }

        .status-pill {
          font-size: 0.75rem;
          padding: 3px 8px;
          border-radius: 50px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .status-pill.confirmed { background-color: #ecfdf5; color: var(--success); }
        .status-pill.cancelled { background-color: #fef2f2; color: var(--danger); }

        @media (max-width: 992px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .temple-selector-card {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .temple-selector-card select {
            max-width: 100%;
          }
          .slot-form .form-actions {
            flex-direction: column;
          }
          .slot-form .form-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OrganizerDashboard;
