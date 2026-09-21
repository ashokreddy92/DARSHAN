import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Shield, LayoutDashboard, Landmark, CalendarRange, Ticket, 
  HelpCircle, Heart, Plus, Trash2, Edit, RefreshCw, 
  Layers, Calendar, Filter, QrCode, Users, Search, UserCheck, 
  UserX, Printer, CheckCircle2, AlertCircle, Eye, Check, X, ShieldCheck,
  CreditCard, Activity, Sparkles
} from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';
import AnalyticsCharts from '../components/AnalyticsCharts';
import PaymentLogbook from '../components/admin/PaymentLogbook';
import SystemHealthMonitor from '../components/admin/SystemHealthMonitor';
import DeityManagement from '../components/admin/DeityManagement';
import AuditTrailViewer from '../components/admin/AuditTrailViewer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics Trend & Distribution State
  const [analyticsData, setAnalyticsData] = useState({
    dailyTrend: [],
    templeDistribution: [],
    statusBreakdown: {}
  });

  // Database Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStaff: 0,
    totalTemples: 0,
    totalBookings: 0,
    todayTicketsSold: 0,
    todayRevenue: 0,
    todayCheckedIn: 0,
    counts: { confirmed: 0, checkedIn: 0, cancelled: 0, pending: 0 },
    recentBookings: []
  });

  const [temples, setTemples] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  // Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // User Management States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null); // { id, name, role, temple }
  const [historyUser, setHistoryUser] = useState(null);
  const [userHistoryBookings, setUserHistoryBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Ticket Management States
  const [ticketTempleFilter, setTicketTempleFilter] = useState('all');
  const [ticketDateFilter, setTicketDateFilter] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [ticketSearch, setTicketSearch] = useState('');
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState(null);

  // Selected Temple for Slots View ('all' or templeId)
  const [selectedTempleForSlots, setSelectedTempleForSlots] = useState('all');
  const [slotDateFilter, setSlotDateFilter] = useState('');
  const [slotTypeFilter, setSlotTypeFilter] = useState('all');

  // Temple Create Form State
  const [templeForm, setTempleForm] = useState({
    name: '', city: '', state: '', description: '', deity: '', primaryDeity: '', imageUrl: '', openingHours: '', speciality: ''
  });
  const [showTempleForm, setShowTempleForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deitiesList, setDeitiesList] = useState([]);
  const [showDeitiesModal, setShowDeitiesModal] = useState(false);

  // Slot Create Form State
  const [slotForm, setSlotForm] = useState({
    temple: '', allTemples: false, date: '', timeSlot: '06:00 AM - 08:00 AM', maxCapacity: 50, price: 300, slotType: 'VIP'
  });
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Editing States
  const [editingTempleId, setEditingTempleId] = useState(null);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Fetch Stats Overview Data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Live Stats
      const statsRes = await axios.get('http://localhost:5000/api/bookings/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch Temples
      const templesRes = await axios.get('http://localhost:5000/api/temples');
      if (templesRes.data.success) {
        setTemples(templesRes.data.data);
        if (templesRes.data.data.length > 0 && !slotForm.temple) {
          setSlotForm((prev) => ({ ...prev, temple: templesRes.data.data[0]._id }));
        }
      }

      // Fetch All Bookings for Tickets tab
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/admin/tickets');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      // Fetch Donations
      const donationsRes = await axios.get('http://localhost:5000/api/donations');
      if (donationsRes.data.success) {
        setDonations(donationsRes.data.data);
      }

      // Fetch Analytics Data (Daily Trends, Temple Distribution, Ratios)
      try {
        const analyticsRes = await axios.get('http://localhost:5000/api/admin/analytics');
        if (analyticsRes.data.success && analyticsRes.data.data) {
          setAnalyticsData(analyticsRes.data.data);
        }
      } catch (aErr) {
        console.warn('Analytics endpoint optional fallback:', aErr.message);
      }

      // Fetch Deities List for Temple Mapping
      try {
        const deitiesRes = await axios.get('http://localhost:5000/api/deities');
        if (deitiesRes.data.success) {
          setDeitiesList(deitiesRes.data.data);
        }
      } catch (dErr) {
        console.warn('Deities fetch note:', dErr.message);
      }

    } catch (err) {
      toast.error('Error loading admin dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      if (userStatusFilter !== 'all') params.append('status', userStatusFilter);

      const res = await axios.get(`http://localhost:5000/api/users?${params.toString()}`);
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Slots for Selected Temple or All Temples
  const fetchSlotsForTemple = async (templeId) => {
    if (!templeId) return;
    try {
      const url = (templeId === 'all')
        ? 'http://localhost:5000/api/slots/temple/all'
        : `http://localhost:5000/api/slots/temple/${templeId}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching slots');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    if (selectedTempleForSlots) {
      fetchSlotsForTemple(selectedTempleForSlots);
    }
  }, [selectedTempleForSlots]);

  // Handle User Role Update
  const handleSaveUserRole = async () => {
    if (!editingUser) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${editingUser.id}/role`, {
        role: editingUser.role,
        temple: editingUser.role === 'TEMPLE_STAFF' ? editingUser.temple : null
      });
      if (res.data.success) {
        toast.success(res.data.message || 'User role updated');
        setEditingUser(null);
        fetchUsers();
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Handle User Status Toggle (Activate / Deactivate)
  const handleToggleUserStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} account for ${user.name}?`)) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}/status`, {
        isActive: !user.isActive
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  // View User Booking History Modal
  const handleViewUserHistory = async (user) => {
    setHistoryUser(user);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${user._id}/bookings`);
      if (res.data.success) {
        setUserHistoryBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load user booking history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Bulk auto-generate slots for all temples
  const handleGenerateAllTemplesSlots = async (days = 14) => {
    if (!window.confirm(`Auto-generate darshan slots across ALL ${temples.length} temples for the next ${days} days? Existing slots will be preserved.`)) {
      return;
    }
    try {
      setGeneratingSlots(true);
      const res = await axios.post('http://localhost:5000/api/slots/generate-all', { days });
      if (res.data.success) {
        toast.success(res.data.message || `Slots successfully generated across ${temples.length} temples!`);
        fetchSlotsForTemple(selectedTempleForSlots);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-generate slots');
    } finally {
      setGeneratingSlots(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setTempleForm((prev) => ({ ...prev, imageUrl: res.data.url }));
        toast.success('Image uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Temple Form Submit
  const handleTempleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTempleId) {
        const res = await axios.put(`http://localhost:5000/api/temples/${editingTempleId}`, templeForm);
        if (res.data.success) {
          toast.success('Temple updated successfully!');
          setTempleForm({ name: '', city: '', state: '', description: '', deity: '', primaryDeity: '', imageUrl: '', openingHours: '', speciality: '' });
          setEditingTempleId(null);
          setShowTempleForm(false);
          fetchData();
        }
      } else {
        const res = await axios.post('http://localhost:5000/api/temples', templeForm);
        if (res.data.success) {
          toast.success('Temple created successfully!');
          setTempleForm({ name: '', city: '', state: '', description: '', deity: '', primaryDeity: '', imageUrl: '', openingHours: '', speciality: '' });
          setShowTempleForm(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editingTempleId ? 'update' : 'create'} temple`);
    }
  };

  // Populate Temple edit form
  const handleTempleEditClick = (temple) => {
    setEditingTempleId(temple._id);
    setTempleForm({
      name: temple.name,
      city: temple.location?.city || '',
      state: temple.location?.state || '',
      description: temple.description || '',
      deity: temple.deity || '',
      primaryDeity: temple.primaryDeity?._id || temple.primaryDeity || '',
      imageUrl: temple.imageUrl || '',
      openingHours: temple.openingHours || '',
      speciality: temple.speciality || ''
    });
    setShowTempleForm(true);
  };

  // Delete Temple
  const handleDeleteTemple = async (id) => {
    if (!window.confirm('Are you sure you want to delete this temple?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/temples/${id}`);
      if (res.data.success) {
        toast.success('Temple deleted successfully');
        fetchData();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Slot Form Submit
  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlotId) {
        const res = await axios.put(`http://localhost:5000/api/slots/${editingSlotId}`, slotForm);
        if (res.data.success) {
          toast.success('Darshan slot updated successfully!');
          setSlotForm({
            temple: selectedTempleForSlots === 'all' ? (temples[0]?._id || '') : selectedTempleForSlots, 
            allTemples: false, 
            date: '', 
            timeSlot: '06:00 AM - 08:00 AM', 
            maxCapacity: 50, 
            price: 300, 
            slotType: 'VIP'
          });
          setEditingSlotId(null);
          setShowSlotForm(false);
          fetchSlotsForTemple(selectedTempleForSlots);
        }
      } else {
        const payload = { ...slotForm };
        if (payload.allTemples) {
          payload.temple = 'all';
        } else if (!payload.temple || payload.temple === 'all') {
          payload.temple = selectedTempleForSlots !== 'all' ? selectedTempleForSlots : (temples[0]?._id || '');
        }

        const res = await axios.post('http://localhost:5000/api/slots', payload);
        if (res.data.success) {
          toast.success(res.data.message || 'Darshan slot scheduled successfully!');
          setSlotForm({
            temple: selectedTempleForSlots === 'all' ? (temples[0]?._id || '') : selectedTempleForSlots, 
            allTemples: false, 
            date: '', 
            timeSlot: '06:00 AM - 08:00 AM', 
            maxCapacity: 50, 
            price: 300, 
            slotType: 'VIP'
          });
          setShowSlotForm(false);
          fetchSlotsForTemple(selectedTempleForSlots);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${editingSlotId ? 'update' : 'schedule'} slot`);
    }
  };

  const handleSlotEditClick = (slot) => {
    setEditingSlotId(slot._id);
    setSlotForm({
      temple: slot.temple?._id || slot.temple,
      allTemples: false,
      date: slot.date,
      timeSlot: slot.timeSlot,
      maxCapacity: slot.maxCapacity,
      price: slot.price,
      slotType: slot.slotType
    });
    setShowSlotForm(true);
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/slots/${id}`);
      if (res.data.success) {
        toast.success('Slot removed');
        fetchSlotsForTemple(selectedTempleForSlots);
      }
    } catch (err) {
      toast.error('Failed to remove slot');
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking ticket?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      if (res.data.success) {
        toast.success('Booking cancelled');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  // Verify UPI Payment
  const handleVerifyPayment = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${id}/verify`);
      if (res.data.success) {
        toast.success('Payment verified and booking confirmed!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  // Reject UPI Payment
  const handleRejectPayment = async (id) => {
    if (!window.confirm('Reject this payment and cancel the booking?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${id}/reject`);
      if (res.data.success) {
        toast.warning('Payment rejected and booking cancelled');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  // Filtered Tickets
  const filteredBookings = bookings.filter((b) => {
    if (ticketTempleFilter !== 'all' && b.temple?._id !== ticketTempleFilter) return false;
    if (ticketDateFilter && b.slot?.date !== ticketDateFilter) return false;
    if (ticketStatusFilter !== 'all') {
      const normalizedStatus = (b.status || '').toUpperCase();
      if (ticketStatusFilter === 'CONFIRMED' && !['CONFIRMED', 'Confirmed'].includes(b.status)) return false;
      if (ticketStatusFilter === 'CHECKED_IN' && !['CHECKED_IN', 'Checked In'].includes(b.status)) return false;
      if (ticketStatusFilter === 'CANCELLED' && !['CANCELLED', 'Cancelled'].includes(b.status)) return false;
      if (ticketStatusFilter === 'PENDING' && !['Pending Verification', 'PENDING'].includes(b.status)) return false;
    }
    if (ticketSearch) {
      const q = ticketSearch.toLowerCase();
      const refMatch = b.bookingReference?.toLowerCase().includes(q);
      const nameMatch = b.devotees?.some((d) => d.name?.toLowerCase().includes(q)) || b.user?.name?.toLowerCase().includes(q);
      const txnMatch = b.transactionId?.toLowerCase().includes(q);
      if (!refMatch && !nameMatch && !txnMatch) return false;
    }
    return true;
  });

  return (
    <div className="admin-container container">
      {/* Header Banner */}
      <div className="card admin-header" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Shield size={28} style={{ color: '#f59e0b' }} />
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                DarshanEase Central Administration
              </h1>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
              Complete temple management, devotee access control, QR ticket verification, and operational logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 22px', fontSize: '1rem', fontWeight: 700,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
              }}
            >
              <QrCode size={20} /> Scan Ticket QR
            </button>
            <button
              onClick={fetchData}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '28px'
      }}>
        <div className="card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Registered Users</span>
          <h2 style={{ margin: '8px 0 2px', fontSize: '1.8rem', color: '#1e293b' }}>{stats.totalUsers}</h2>
          <small style={{ color: '#64748b' }}>{stats.totalStaff} staff members</small>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Active Temples</span>
          <h2 style={{ margin: '8px 0 2px', fontSize: '1.8rem', color: '#1e293b' }}>{stats.totalTemples}</h2>
          <small style={{ color: '#64748b' }}>Pilgrimage shrines</small>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Today's Tickets Sold</span>
          <h2 style={{ margin: '8px 0 2px', fontSize: '1.8rem', color: '#d97706' }}>{stats.todayTicketsSold}</h2>
          <small style={{ color: '#64748b' }}>Issued for today</small>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Today's Revenue</span>
          <h2 style={{ margin: '8px 0 2px', fontSize: '1.8rem', color: '#059669' }}>₹{stats.todayRevenue}</h2>
          <small style={{ color: '#64748b' }}>Bookings revenue</small>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #06b6d4' }}>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Checked-In Today</span>
          <h2 style={{ margin: '8px 0 2px', fontSize: '1.8rem', color: '#0891b2' }}>{stats.todayCheckedIn}</h2>
          <small style={{ color: '#64748b' }}>QR scanned at gates</small>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <LayoutDashboard size={18} /> Overview
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={18} /> User & Staff ({stats.totalUsers + stats.totalStaff})
        </button>
        <button className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          <Ticket size={18} /> Ticket Management ({bookings.length})
        </button>
        <button className={`tab-btn ${activeTab === 'temples' ? 'active' : ''}`} onClick={() => setActiveTab('temples')}>
          <Landmark size={18} /> Temples ({temples.length})
        </button>
        <button className={`tab-btn ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>
          <CalendarRange size={18} /> Darshan Slots
        </button>
        <button className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
          <Heart size={18} /> Donations
        </button>
        <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
          <CreditCard size={18} /> Payments Logbook
        </button>
        <button className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
          <Activity size={18} /> System Health & Bottlenecks
        </button>
        <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
          <Shield size={18} /> Audit Trail
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <p>Synchronizing administrative data...</p>
        </div>
      ) : (
        <div>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Quick Scan Action Banner */}
              <div className="card" style={{
                padding: '24px', borderRadius: '14px', marginBottom: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={22} /> Gate QR Ticket Scanner
                  </h3>
                  <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.95rem' }}>
                    Verify devotee passes in real-time, validate temple and slot permissions, and disallow duplicate entries.
                  </p>
                </div>
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontWeight: 700 }}
                >
                  Open QR Scanner
                </button>
              </div>

              {/* Rich Analytics & Trend Charts */}
              <div style={{ marginBottom: '24px' }}>
                <AnalyticsCharts
                  dailyTrend={analyticsData.dailyTrend || []}
                  templeDistribution={analyticsData.templeDistribution || []}
                  statusBreakdown={analyticsData.statusBreakdown || {
                    confirmed: stats.counts?.confirmed || 0,
                    checkedIn: stats.counts?.checkedIn || 0,
                    cancelled: stats.counts?.cancelled || 0,
                    pending: stats.counts?.pending || 0
                  }}
                />
              </div>

              {/* Status Breakdown & Recent Bookings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ padding: '24px', borderRadius: '14px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Ticket Status Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                      <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>Confirmed (Valid)</span>
                      <h3 style={{ margin: '6px 0 0', color: '#15803d', fontSize: '1.5rem' }}>{stats.counts?.confirmed || 0}</h3>
                    </div>
                    <div style={{ padding: '14px', background: '#ecfeff', borderRadius: '10px', border: '1px solid #a5f3fc' }}>
                      <span style={{ color: '#155e75', fontSize: '0.85rem', fontWeight: 600 }}>Checked In (Used)</span>
                      <h3 style={{ margin: '6px 0 0', color: '#0e7490', fontSize: '1.5rem' }}>{stats.counts?.checkedIn || 0}</h3>
                    </div>
                    <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                      <span style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>Pending Verification</span>
                      <h3 style={{ margin: '6px 0 0', color: '#b45309', fontSize: '1.5rem' }}>{stats.counts?.pending || 0}</h3>
                    </div>
                    <div style={{ padding: '14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                      <span style={{ color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>Cancelled</span>
                      <h3 style={{ margin: '6px 0 0', color: '#b91c1c', fontSize: '1.5rem' }}>{stats.counts?.cancelled || 0}</h3>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', borderRadius: '14px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Recent Booking Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.recentBookings?.slice(0, 5).map((b) => (
                      <div key={b._id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <strong>{b.devotees?.[0]?.name || b.user?.name || 'Devotee'}</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>
                            {b.bookingReference} &bull; {b.temple?.name}
                          </span>
                        </div>
                        <span style={{
                          padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                          background: ['Checked In', 'CHECKED_IN'].includes(b.status) ? '#dcfce7' : '#e0f2fe',
                          color: ['Checked In', 'CHECKED_IN'].includes(b.status) ? '#166534' : '#0369a1'
                        }}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              {/* Filter & Search Bar */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
                  <div style={{ position: 'relative', minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                      style={{ paddingLeft: '34px' }}
                    />
                  </div>

                  <div className="selection-picker">
                    <span>Role:</span>
                    <select
                      className="form-control inline-select"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="USER">User (Devotee)</option>
                      <option value="TEMPLE_STAFF">Temple Staff</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="selection-picker">
                    <span>Status:</span>
                    <select
                      className="form-control inline-select"
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    >
                      <option value="all">All Accounts</option>
                      <option value="active">Active</option>
                      <option value="inactive">Deactivated</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-outline-dark" onClick={fetchUsers}>
                  <RefreshCw size={16} /> Search & Refresh
                </button>
              </div>

              {/* Users Table */}
              <div className="table-container card" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Assigned Temple</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Loading accounts...</td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <strong>{u.name}</strong>
                            <small style={{ display: 'block', color: '#64748b' }}>{u.email}</small>
                          </td>
                          <td>{u.phone || '—'}</td>
                          <td>
                            <span style={{
                              padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                              background: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'TEMPLE_STAFF' ? '#e0f2fe' : '#f1f5f9',
                              color: u.role === 'ADMIN' ? '#92400e' : u.role === 'TEMPLE_STAFF' ? '#0369a1' : '#334155'
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.role === 'TEMPLE_STAFF' ? (
                              <strong>{u.temple?.name || <span style={{ color: '#ef4444' }}>Not Assigned</span>}</strong>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>N/A</span>
                            )}
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                              background: u.isActive ? '#dcfce7' : '#fee2e2',
                              color: u.isActive ? '#166534' : '#991b1b'
                            }}>
                              {u.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="icon-action-btn"
                                title="Change Role / Temple"
                                onClick={() => setEditingUser({ id: u._id, name: u.name, role: u.role, temple: u.temple?._id || '' })}
                                style={{ color: '#2563eb' }}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="icon-action-btn"
                                title="View Booking History"
                                onClick={() => handleViewUserHistory(u)}
                                style={{ color: '#0d9488' }}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="icon-action-btn"
                                title={u.isActive ? 'Deactivate' : 'Activate'}
                                onClick={() => handleToggleUserStatus(u)}
                                style={{ color: u.isActive ? '#dc2626' : '#16a34a' }}
                              >
                                {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Edit Role Modal */}
              {editingUser && (
                <div className="modal-overlay" style={{
                  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
                }}>
                  <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0 }}>Manage User Role</h3>
                      <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <p style={{ margin: '0 0 16px', color: '#64748b' }}>Account: <strong>{editingUser.name}</strong></p>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Role</label>
                      <select
                        className="form-control"
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      >
                        <option value="USER">USER (Normal Devotee)</option>
                        <option value="TEMPLE_STAFF">TEMPLE_STAFF (Gate & Scan Access)</option>
                        <option value="ORGANIZER">ORGANIZER (Temple Manager)</option>
                        <option value="ADMIN">ADMIN (Full Superuser Access)</option>
                      </select>
                    </div>

                    {editingUser.role === 'TEMPLE_STAFF' && (
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Assign Temple to Staff *</label>
                        <select
                          className="form-control"
                          value={editingUser.temple}
                          onChange={(e) => setEditingUser({ ...editingUser, temple: e.target.value })}
                          required
                        >
                          <option value="">-- Choose Temple --</option>
                          {temples.map((t) => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                          ))}
                        </select>
                        <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                          This staff member will strictly only have access to scan and view tickets for this temple.
                        </small>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button className="btn btn-primary" onClick={handleSaveUserRole} style={{ flex: 1 }}>Save Changes</button>
                      <button className="btn btn-outline-dark" onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* User Booking History Modal */}
              {historyUser && (
                <div className="modal-overlay" style={{
                  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
                }}>
                  <div className="card" style={{ maxWidth: '680px', width: '100%', padding: '24px', borderRadius: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0 }}>Booking History for {historyUser.name}</h3>
                      <button onClick={() => setHistoryUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    {historyLoading ? (
                      <p>Loading history...</p>
                    ) : userHistoryBookings.length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No bookings found for this user.</p>
                    ) : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Ref ID</th>
                              <th>Temple</th>
                              <th>Slot</th>
                              <th>Status</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userHistoryBookings.map((b) => (
                              <tr key={b._id}>
                                <td><strong>{b.bookingReference}</strong></td>
                                <td>{b.temple?.name}</td>
                                <td>{b.slot?.date} ({b.slot?.timeSlot})</td>
                                <td>
                                  <span style={{
                                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                                    background: b.status === 'Confirmed' ? '#dcfce7' : '#fee2e2',
                                    color: b.status === 'Confirmed' ? '#166534' : '#991b1b'
                                  }}>
                                    {b.status}
                                  </span>
                                </td>
                                <td>₹{b.totalPrice}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === 'tickets' && (
            <div>
              {/* Ticket Filters */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
                  <div style={{ position: 'relative', minWidth: '220px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Reference, Devotee, UTR..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      style={{ paddingLeft: '34px' }}
                    />
                  </div>

                  <div className="selection-picker">
                    <span>Temple:</span>
                    <select
                      className="form-control inline-select"
                      value={ticketTempleFilter}
                      onChange={(e) => setTicketTempleFilter(e.target.value)}
                    >
                      <option value="all">All Temples</option>
                      {temples.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="selection-picker">
                    <span>Date:</span>
                    <input
                      type="date"
                      className="form-control"
                      value={ticketDateFilter}
                      onChange={(e) => setTicketDateFilter(e.target.value)}
                    />
                    {ticketDateFilter && (
                      <button className="btn btn-sm btn-outline-dark" onClick={() => setTicketDateFilter('')}>Clear</button>
                    )}
                  </div>

                  <div className="selection-picker">
                    <span>Status:</span>
                    <select
                      className="form-control inline-select"
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="CONFIRMED">Confirmed (Valid)</option>
                      <option value="CHECKED_IN">Checked In (Admitted)</option>
                      <option value="PENDING">Pending Verification</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setIsScannerOpen(true)}>
                    <QrCode size={16} /> Scan QR Ticket
                  </button>
                </div>
              </div>

              {/* Tickets Table */}
              <div className="table-container card" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Devotee Name</th>
                      <th>Temple</th>
                      <th>Darshan Slot</th>
                      <th>Pilgrims</th>
                      <th>Payment / UTR</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          No tickets found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const isCheckedIn = ['Checked In', 'CHECKED_IN'].includes(b.status);
                        const isConfirmed = ['Confirmed', 'CONFIRMED'].includes(b.status);
                        const isPending = ['Pending Verification', 'PENDING'].includes(b.status);

                        return (
                          <tr key={b._id}>
                            <td><strong>{b.bookingReference}</strong></td>
                            <td>
                              <strong>{b.devotees?.[0]?.name || b.user?.name}</strong>
                              <small style={{ display: 'block', color: '#64748b' }}>{b.user?.email || b.user?.phone}</small>
                            </td>
                            <td>{b.temple?.name}</td>
                            <td>
                              {b.slot?.date} <br />
                              <small style={{ color: '#64748b' }}>{b.slot?.timeSlot} ({b.slot?.slotType})</small>
                            </td>
                            <td>{b.devotees?.length || 1} Person</td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                <strong>₹{b.totalPrice}</strong> &bull; {b.paymentMethod || 'Card'}
                                {b.transactionId && <code style={{ display: 'block', fontSize: '0.8rem' }}>UTR: {b.transactionId}</code>}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                                background: isCheckedIn ? '#dcfce7' : isConfirmed ? '#e0f2fe' : isPending ? '#fef3c7' : '#fee2e2',
                                color: isCheckedIn ? '#166534' : isConfirmed ? '#0369a1' : isPending ? '#92400e' : '#991b1b'
                              }}>
                                {b.status}
                              </span>
                              {isCheckedIn && b.checkedInAt && (
                                <small style={{ display: 'block', color: '#166534', fontSize: '0.75rem', marginTop: '2px' }}>
                                  At {new Date(b.checkedInAt).toLocaleTimeString()}
                                </small>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {isPending && (
                                  <>
                                    <button 
                                      className="btn btn-success btn-sm" 
                                      onClick={() => handleVerifyPayment(b._id)}
                                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                      Verify
                                    </button>
                                    <button 
                                      className="btn btn-outline-danger btn-sm" 
                                      onClick={() => handleRejectPayment(b._id)}
                                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {isConfirmed && (
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleCancelBooking(b._id)}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-dark btn-sm"
                                  onClick={() => setSelectedTicketForPrint(b)}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  title="View & Print Ticket Pass"
                                >
                                  Pass
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Ticket Pass View Modal */}
              {selectedTicketForPrint && (
                <div className="modal-overlay" style={{
                  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
                }}>
                  <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--primary)' }}>Darshan Pass</h3>
                      <button onClick={() => setSelectedTicketForPrint(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                      <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>{selectedTicketForPrint.temple?.name}</h2>
                      <p style={{ margin: 0, color: '#64748b' }}>Devotee Darshan Admission Ticket</p>
                    </div>

                    {/* QR Code Container */}
                    <div style={{
                      margin: '0 auto 18px', padding: '16px', background: '#f8fafc',
                      borderRadius: '12px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', width: 'fit-content', border: '1px solid #e2e8f0'
                    }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedTicketForPrint.bookingReference)}`} 
                        alt="Ticket QR Code" 
                        style={{ width: '160px', height: '160px', display: 'block' }}
                      />
                      <code style={{ marginTop: '10px', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px' }}>
                        {selectedTicketForPrint.bookingReference}
                      </code>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', fontSize: '0.9rem', marginBottom: '16px' }}>
                      <p style={{ margin: '4px 0' }}><strong>Devotee:</strong> {selectedTicketForPrint.devotees?.[0]?.name || selectedTicketForPrint.user?.name}</p>
                      <p style={{ margin: '4px 0' }}><strong>Slot:</strong> {selectedTicketForPrint.slot?.date} &bull; {selectedTicketForPrint.slot?.timeSlot}</p>
                      <p style={{ margin: '4px 0' }}><strong>Tier:</strong> {selectedTicketForPrint.slot?.slotType} (₹{selectedTicketForPrint.totalPrice})</p>
                      <p style={{ margin: '4px 0' }}><strong>Status:</strong> {selectedTicketForPrint.status}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>
                        <Printer size={16} /> Print Pass
                      </button>
                      <button className="btn btn-outline-dark" onClick={() => setSelectedTicketForPrint(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLES TAB */}
          {activeTab === 'temples' && (
            <div>
              <div className="section-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Manage Temples</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn" 
                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    onClick={() => setShowDeitiesModal(true)}
                  >
                    <Sparkles size={16} /> Manage Deities Catalog
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowTempleForm(!showTempleForm)}>
                    <Plus size={16} /> Add New Temple
                  </button>
                </div>
              </div>

              {/* Deities Catalog Management Modal */}
              {showDeitiesModal && (
                <div className="modal-overlay" style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1200, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', padding: '16px'
                }}>
                  <div style={{
                    backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '1050px',
                    width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
                        <Sparkles size={22} style={{ color: '#d97706' }} /> Deities Catalog & Temple Mappings
                      </h2>
                      <button 
                        className="btn btn-outline-dark" 
                        onClick={() => { 
                          setShowDeitiesModal(false); 
                          fetchData(); 
                        }}
                      >
                        Close
                      </button>
                    </div>
                    <DeityManagement temples={temples} />
                  </div>
                </div>
              )}

              {showTempleForm && (
                <form onSubmit={handleTempleSubmit} className="admin-form card" style={{ marginBottom: '24px' }}>
                  <h3>{editingTempleId ? 'Edit Temple' : 'Register New Temple'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Temple Name *</label>
                      <input type="text" className="form-control" value={templeForm.name} onChange={(e) => setTempleForm({ ...templeForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Deity Name / Title *</label>
                      <input type="text" className="form-control" value={templeForm.deity} onChange={(e) => setTempleForm({ ...templeForm, deity: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Presiding Deity Link (Catalog)</label>
                      <select 
                        className="form-control"
                        value={templeForm.primaryDeity || ''}
                        onChange={(e) => {
                          const selId = e.target.value;
                          const matched = deitiesList.find(d => d._id === selId);
                          setTempleForm({
                            ...templeForm,
                            primaryDeity: selId,
                            deity: matched ? matched.name : templeForm.deity
                          });
                        }}
                      >
                        <option value="">-- Link to Deities Catalog (Optional) --</option>
                        {deitiesList.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.category})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input type="text" className="form-control" value={templeForm.city} onChange={(e) => setTempleForm({ ...templeForm, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input type="text" className="form-control" value={templeForm.state} onChange={(e) => setTempleForm({ ...templeForm, state: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Description *</label>
                      <textarea className="form-control" rows={3} value={templeForm.description} onChange={(e) => setTempleForm({ ...templeForm, description: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{editingTempleId ? 'Update Temple' : 'Create Temple'}</button>
                    <button type="button" className="btn btn-outline-dark" onClick={() => { setShowTempleForm(false); setEditingTempleId(null); }}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="table-container card" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Temple Name</th>
                      <th>Location</th>
                      <th>Deity</th>
                      <th>Opening Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temples.map((temple) => (
                      <tr key={temple._id}>
                        <td><strong>{temple.name}</strong></td>
                        <td>{temple.location?.city}, {temple.location?.state}</td>
                        <td>{temple.deity}</td>
                        <td>{temple.openingHours || '06:00 AM - 09:00 PM'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-action-btn edit" onClick={() => handleTempleEditClick(temple)} style={{ color: 'var(--primary)' }}>
                              <Edit size={16} />
                            </button>
                            <button className="icon-action-btn delete" onClick={() => handleDeleteTemple(temple._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLOTS TAB */}
          {activeTab === 'slots' && (
            <div className="slots-tab">
              <div className="section-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                  <div className="selection-picker">
                    <span>Temple:</span>
                    <select 
                      value={selectedTempleForSlots} 
                      onChange={(e) => {
                        setSelectedTempleForSlots(e.target.value);
                        setSlotForm((prev) => ({ 
                          ...prev, 
                          temple: e.target.value === 'all' ? (temples[0]?._id || '') : e.target.value 
                        }));
                      }}
                      className="form-control inline-select"
                    >
                      <option value="all">🌟 All Temples (Global View)</option>
                      {temples.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="selection-picker">
                    <span>Date:</span>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={slotDateFilter} 
                      onChange={(e) => setSlotDateFilter(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                    />
                    {slotDateFilter && (
                      <button 
                        className="btn btn-sm btn-outline-dark" 
                        onClick={() => setSlotDateFilter('')}
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="selection-picker">
                    <span>Tier:</span>
                    <select 
                      value={slotTypeFilter} 
                      onChange={(e) => setSlotTypeFilter(e.target.value)} 
                      className="form-control inline-select"
                    >
                      <option value="all">All Tiers</option>
                      <option value="VIP">VIP</option>
                      <option value="Special Pooja">Special Pooja</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn" 
                    onClick={() => handleGenerateAllTemplesSlots(14)}
                    disabled={generatingSlots}
                    style={{ 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                      color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                    }}
                  >
                    {generatingSlots ? <RefreshCw size={16} className="spin-icon" /> : <Sparkles size={16} />}
                    {generatingSlots ? 'Generating...' : 'Auto-Generate Slots for All Temples'}
                  </button>

                  <button className="btn btn-primary" onClick={() => setShowSlotForm(!showSlotForm)}>
                    <Plus size={16} /> Create Darshan Slot
                  </button>
                </div>
              </div>

              {/* Slot creation form */}
              {showSlotForm && (
                <form onSubmit={handleSlotSubmit} className="admin-form card" style={{ marginBottom: '24px' }}>
                  <h3>{editingSlotId ? 'Edit Darshan Slot' : 'Schedule Darshan Slot'}</h3>
                  <div className="form-grid">
                    {!editingSlotId && (
                      <div className="form-group" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, fontWeight: 600, color: '#1e293b' }}>
                          <input 
                            type="checkbox" 
                            checked={slotForm.allTemples || false} 
                            onChange={(e) => setSlotForm({ ...slotForm, allTemples: e.target.checked })} 
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span>🌟 Apply this slot configuration to <strong>ALL {temples.length} temples</strong> simultaneously</span>
                        </label>
                      </div>
                    )}

                    {!slotForm.allTemples && (
                      <div className="form-group">
                        <label>Target Temple *</label>
                        <select 
                          className="form-control" 
                          value={slotForm.temple} 
                          onChange={(e) => setSlotForm({ ...slotForm, temple: e.target.value })}
                          required
                        >
                          {temples.map((t) => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Date *</label>
                      <input type="date" className="form-control" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Time Slot *</label>
                      <select className="form-control" value={slotForm.timeSlot} onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}>
                        <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM</option>
                        <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                        <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                        <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Slot Type *</label>
                      <select className="form-control" value={slotForm.slotType} onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}>
                        <option value="VIP">VIP</option>
                        <option value="Special Pooja">Special Pooja</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Max Ticket Capacity *</label>
                      <input type="number" className="form-control" value={slotForm.maxCapacity} onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: parseInt(e.target.value) })} required />
                    </div>
                    <div className="form-group">
                      <label>Ticket Price (INR) *</label>
                      <input type="number" className="form-control" value={slotForm.price} onChange={(e) => setSlotForm({ ...slotForm, price: parseInt(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{editingSlotId ? 'Update Slot' : 'Schedule Slot'}</button>
                    <button type="button" className="btn btn-outline-dark" onClick={() => {
                      setShowSlotForm(false);
                      setEditingSlotId(null);
                    }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* Slots Table */}
              {(() => {
                const filteredSlots = slots.filter((slot) => {
                  if (slotDateFilter && slot.date !== slotDateFilter) return false;
                  if (slotTypeFilter !== 'all' && slot.slotType !== slotTypeFilter) return false;
                  return true;
                });

                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#64748b', fontSize: '0.9rem' }}>
                      <span>Showing <strong>{filteredSlots.length}</strong> slots {selectedTempleForSlots === 'all' ? '(across all temples)' : `for selected temple`}</span>
                    </div>

                    <div className="table-container card" style={{ padding: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Temple</th>
                            <th>Date</th>
                            <th>Time Slot</th>
                            <th>Slot Type</th>
                            <th>Price</th>
                            <th>Capacity Stats</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSlots.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                                No darshan slots found.
                              </td>
                            </tr>
                          ) : (
                            filteredSlots.slice(0, 100).map((slot) => {
                              const available = slot.maxCapacity - slot.bookedCount;
                              const templeName = slot.temple?.name || temples.find(t => t._id === (slot.temple?._id || slot.temple))?.name || 'Temple';

                              return (
                                <tr key={slot._id}>
                                  <td><strong>{templeName}</strong></td>
                                  <td>{slot.date}</td>
                                  <td>{slot.timeSlot}</td>
                                  <td>
                                    <span className={`tag-badge ${slot.slotType.toLowerCase().replace(' ', '-')}`}>
                                      {slot.slotType}
                                    </span>
                                  </td>
                                  <td>{slot.price === 0 ? 'Free' : `₹${slot.price}`}</td>
                                  <td>
                                    <strong>{slot.bookedCount}</strong> / {slot.maxCapacity}
                                    <span style={{ marginLeft: '6px', color: available > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                      ({available} left)
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button className="icon-action-btn edit" onClick={() => handleSlotEditClick(slot)} style={{ color: 'var(--primary)' }}>
                                        <Edit size={16} />
                                      </button>
                                      <button className="icon-action-btn delete" onClick={() => handleDeleteSlot(slot._id)}>
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* DONATIONS TAB */}
          {activeTab === 'donations' && (
            <div className="donations-tab">
              <h2>System Donations Audit</h2>
              <div className="table-container card" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Donor Name</th>
                      <th>Temple Destination</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation._id}>
                        <td><code>{donation.transactionId}</code></td>
                        <td>{donation.donorName}</td>
                        <td>{donation.temple?.name || 'General Fund'}</td>
                        <td>{donation.purpose}</td>
                        <td><strong>₹{donation.amount}</strong></td>
                        <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYMENTS LOGBOOK TAB */}
          {activeTab === 'payments' && (
            <PaymentLogbook temples={temples} />
          )}

          {/* SYSTEM HEALTH & BOTTLENECK MONITOR TAB */}
          {activeTab === 'health' && (
            <SystemHealthMonitor />
          )}

          {/* GLOBAL AUDIT TRAIL TAB */}
          {activeTab === 'audit' && (
            <AuditTrailViewer />
          )}
        </div>
      )}

      {/* QR Scanner Modal (Global) */}
      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={() => {
          fetchData();
        }}
      />

      <style>{`
        .admin-container {
          padding-top: clamp(24px, 4vw, 40px);
          padding-bottom: clamp(40px, 6vw, 80px);
          min-height: calc(100vh - 200px);
          width: 100%;
        }

        .admin-header {
          margin-bottom: clamp(20px, 3.5vw, 30px);
        }

        /* Modern Segmented Navigation Tabs Bar */
        .admin-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          margin-bottom: 26px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .admin-tabs::-webkit-scrollbar {
          height: 4px;
        }

        .admin-tabs::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.92rem;
          color: #64748b;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          user-select: none;
        }

        .tab-btn:hover {
          color: #1e293b;
          background: rgba(255, 255, 255, 0.7);
        }

        .tab-btn.active {
          color: #d97706;
          background: #ffffff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .tab-btn svg {
          transition: transform 0.2s ease;
        }

        .tab-btn:hover svg {
          transform: scale(1.1);
        }

        .tab-btn.active svg {
          color: #d97706;
        }

        /* Section Actions & Pickers */
        .section-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .selection-picker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #475569;
          font-weight: 600;
        }

        .inline-select {
          min-width: 180px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          font-size: 0.9rem;
          color: #1e293b;
        }

        /* Tables & Lists */
        .table-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        th {
          background-color: #f8fafc;
          color: #475569;
          font-weight: 700;
          padding: 14px 16px;
          border-bottom: 1.5px solid #e2e8f0;
          white-space: nowrap;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover td {
          background-color: #f8fafc;
        }

        /* Action Buttons */
        .icon-action-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          padding: 7px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .icon-action-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .icon-action-btn.delete {
          color: #dc2626;
        }

        .icon-action-btn.delete:hover {
          background: #fee2e2;
          border-color: #fecaca;
        }

        .icon-action-btn.edit {
          color: #d97706;
        }

        .icon-action-btn.edit:hover {
          background: #fef3c7;
          border-color: #fde68a;
        }

        /* Badges */
        .tag-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .tag-badge.general {
          background-color: #f1f5f9;
          color: #475569;
        }

        .tag-badge.vip {
          background-color: #fef3c7;
          color: #b45309;
        }

        .tag-badge.special-pooja {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        /* Form Controls */
        .admin-form {
          border: 1px solid #fed7aa;
          padding: 24px;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .admin-form h3 {
          margin-top: 0;
          margin-bottom: 18px;
          color: #9a3412;
          font-size: 1.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .admin-tabs {
            padding: 4px;
            gap: 4px;
          }
          .tab-btn {
            padding: 8px 12px;
            font-size: 0.85rem;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

