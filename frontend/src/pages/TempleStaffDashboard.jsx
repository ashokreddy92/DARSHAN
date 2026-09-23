import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Landmark, QrCode, CheckCircle2, Users, Clock, 
  Calendar, RefreshCw, AlertCircle, ShieldCheck, Ticket,
  Flame, Check, AlertTriangle, ArrowRight
} from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';

const TempleStaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchStaffData = async () => {
    try {
      setRefreshing(true);
      // Try dedicated staff overview endpoint first
      try {
        const res = await axios.get('/api/staff/overview');
        if (res.data.success && res.data.data) {
          setData(res.data.data);
          return;
        }
      } catch (err) {
        // Fallback to legacy bookings/staff/today endpoint
        const fallbackRes = await axios.get('/api/bookings/staff/today');
        if (fallbackRes.data.success) {
          setData(fallbackRes.data.data);
          return;
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load temple staff dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin-icon" style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
        <h2>Loading Temple Staff Portal...</h2>
      </div>
    );
  }

  if (!data?.temple) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <h2>No Temple Assigned</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px' }}>
          Your account is registered as Temple Staff, but no specific temple has been assigned to you by the Central Administrator.
        </p>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Please contact the administrator to bind your account to your shrine location.
        </p>
      </div>
    );
  }

  const { temple, stats, recentTickets, todayDate, currentSlot, upcomingSlots } = data;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff', borderRadius: '16px', padding: '24px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ 
              background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', 
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', 
              fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px'
            }}>
              <ShieldCheck size={14} /> Temple Entry Control Staff
            </span>
            <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 800 }}>
              {temple.name}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem' }}>
              <Landmark size={15} /> {temple.location?.city || temple.city || 'India'}, {temple.location?.state || temple.state || ''} &bull; Date: {todayDate}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchStaffData}
              className="btn"
              disabled={refreshing}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px'
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
              Refresh
            </button>

            <button 
              onClick={() => setIsScannerOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', fontSize: '1rem', fontWeight: 700,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
              }}
            >
              <QrCode size={20} /> Scan Ticket QR
            </button>
          </div>
        </div>
      </div>

      {/* Active Darshan Status Banner */}
      <div style={{
        background: currentSlot ? 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' : '#f8fafc',
        border: currentSlot ? '1px solid #fde68a' : '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: currentSlot ? '#d97706' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '6px',
                background: currentSlot ? '#b45309' : '#64748b',
                color: '#fff'
              }}>
                {currentSlot ? 'Live Darshan In Progress' : 'No Active Darshan Window'}
              </span>
              {currentSlot && (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9a3412' }}>
                  {currentSlot.slotType} Tier
                </span>
              )}
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: currentSlot ? '#78350f' : '#334155' }}>
              {currentSlot ? currentSlot.timeSlot : 'Gates on standby for next scheduled slot'}
            </h3>
          </div>
        </div>

        {currentSlot && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#78350f', display: 'block' }}>Capacity Utilized</span>
              <strong style={{ fontSize: '1.1rem', color: '#9a3412' }}>
                {currentSlot.bookedCount} / {currentSlot.maxCapacity} devotees
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Real-time KPI Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Today's Bookings</span>
            <Users size={20} style={{ color: '#3b82f6' }} />
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#1e293b' }}>
            {stats?.todayBookings || 0}
          </h2>
          <small style={{ color: '#64748b' }}>Devotee reservations</small>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Checked In</span>
            <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#059669' }}>
            {stats?.checkedInDevotees !== undefined ? stats.checkedInDevotees : (stats?.checkedIn || 0)}
          </h2>
          <small style={{ color: '#64748b' }}>Darshan verified</small>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Remaining</span>
            <Clock size={20} style={{ color: '#f59e0b' }} />
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#d97706' }}>
            {stats?.remainingDevotees !== undefined ? stats.remainingDevotees : (stats?.remaining || 0)}
          </h2>
          <small style={{ color: '#64748b' }}>Awaiting entry</small>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Total Devotees</span>
            <Ticket size={20} style={{ color: '#8b5cf6' }} />
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#6d28d9' }}>
            {stats?.todayTicketsSold || stats?.todayBookings || 0}
          </h2>
          <small style={{ color: '#64748b' }}>Including family members</small>
        </div>
      </div>

      {/* Today's Slots Timeline */}
      {upcomingSlots && upcomingSlots.length > 0 && (
        <div className="card" style={{ padding: '24px', borderRadius: '14px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#d97706' }} /> Today's Darshan Slots Timeline
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {upcomingSlots.map((slot) => {
              const pct = Math.round(((slot.bookedCount || 0) / (slot.maxCapacity || 1)) * 100);
              const isFull = (slot.bookedCount || 0) >= (slot.maxCapacity || 1);
              return (
                <div key={slot._id} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                      {slot.timeSlot}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: slot.slotType === 'VIP' ? '#fef3c7' : '#e0f2fe',
                      color: slot.slotType === 'VIP' ? '#b45309' : '#0369a1'
                    }}>
                      {slot.slotType}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                    <span>Capacity</span>
                    <span>{slot.bookedCount} / {slot.maxCapacity}</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: isFull ? '#ef4444' : (pct > 75 ? '#f59e0b' : '#10b981'),
                      borderRadius: '3px'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Center - Big Scan Call to Action */}
      <div className="card" style={{
        padding: '24px', borderRadius: '14px', marginBottom: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={22} /> Devotee Verification & Admission
          </h3>
          <p style={{ margin: 0, color: '#c2410c', fontSize: '0.95rem' }}>
            Scan pilgrim QR passes or enter booking reference numbers to validate tickets and prevent duplicate entries.
          </p>
        </div>
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontWeight: 700, fontSize: '1rem' }}
        >
          Open QR Scanner
        </button>
      </div>

      {/* Recent Tickets Table */}
      <div className="card" style={{ padding: '24px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>
            Today's Ticket Roster ({temple.name})
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing {recentTickets?.length || 0} tickets
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Devotee Name</th>
                <th>Time Slot</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Verified Time</th>
              </tr>
            </thead>
            <tbody>
              {!recentTickets || recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No bookings recorded for today yet. Devotees who book slots will appear here in real-time.
                  </td>
                </tr>
              ) : (
                recentTickets.map((t) => {
                  const isCheckedIn = ['Checked In', 'CHECKED_IN'].includes(t.status);
                  const isCancelled = ['Cancelled', 'CANCELLED'].includes(t.status);
                  return (
                    <tr key={t._id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>
                          {t.bookingReference}
                        </strong>
                      </td>
                      <td>
                        <div>
                          <strong>{t.devotees?.[0]?.name || t.user?.name || 'Devotee'}</strong>
                          {t.devotees?.length > 1 && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                              +{t.devotees.length - 1} family members
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{t.slot?.timeSlot || 'Standard Timing'}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: t.slot?.slotType === 'VIP' ? '#fef3c7' : '#ede9fe',
                          color: t.slot?.slotType === 'VIP' ? '#b45309' : '#6d28d9'
                        }}>
                          {t.slot?.slotType || 'VIP'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                          background: isCheckedIn ? '#dcfce7' : (isCancelled ? '#fee2e2' : '#e0f2fe'),
                          color: isCheckedIn ? '#166534' : (isCancelled ? '#991b1b' : '#0369a1'),
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          {isCheckedIn ? 'Checked In' : (isCancelled ? 'Cancelled' : 'Confirmed')}
                        </span>
                      </td>
                      <td>
                        {t.checkedInAt ? (
                          <span style={{ fontSize: '0.82rem', color: '#166534' }}>
                            {new Date(t.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Awaiting Entry</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={() => {
          fetchStaffData();
        }}
      />
    </div>
  );
};

export default TempleStaffDashboard;
