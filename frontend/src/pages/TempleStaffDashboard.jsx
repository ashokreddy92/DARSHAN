import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Landmark, QrCode, CheckCircle2, Users, Clock, 
  Calendar, RefreshCw, AlertCircle, ShieldCheck, Ticket
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
      const res = await axios.get('http://localhost:5000/api/bookings/staff/today');
      if (res.data.success) {
        setData(res.data.data);
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
        <p style={{ color: '#64748b' }}>
          Your account is registered as Temple Staff, but no specific temple has been assigned to you by the Administrator.
        </p>
      </div>
    );
  }

  const { temple, stats, recentTickets, todayDate } = data;

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '24px',
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
            <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 700 }}>
              {temple.name}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Landmark size={15} /> {temple.location?.city}, {temple.location?.state} &bull; Today: {todayDate}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={fetchStaffData}
              className="btn"
              disabled={refreshing}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', gap: '8px'
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

      {/* Real-time KPI Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '28px'
      }}>
        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Today's Bookings</span>
            <Users size={22} style={{ color: '#3b82f6' }} />
          </div>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem', color: '#1e293b' }}>{stats?.todayBookings || 0}</h2>
          <small style={{ color: '#64748b' }}>Scheduled devotees</small>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Checked In</span>
            <CheckCircle2 size={22} style={{ color: '#16a34a' }} />
          </div>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem', color: '#16a34a' }}>{stats?.checkedIn || 0}</h2>
          <small style={{ color: '#64748b' }}>Darshan entry granted</small>
        </div>

        <div className="card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Remaining</span>
            <Clock size={22} style={{ color: '#f59e0b' }} />
          </div>
          <h2 style={{ margin: '10px 0 0', fontSize: '2rem', color: '#d97706' }}>{stats?.remaining || 0}</h2>
          <small style={{ color: '#64748b' }}>Pending arrival</small>
        </div>
      </div>

      {/* Action Center - Big Scan Call to Action */}
      <div className="card" style={{
        padding: '24px', borderRadius: '14px', marginBottom: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        background: '#fff7ed', border: '1px solid #ffedd5'
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
            Recent Tickets for {temple.name}
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing {recentTickets?.length || 0} records
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
                  const isConfirmed = ['Confirmed', 'CONFIRMED'].includes(t.status);

                  return (
                    <tr key={t._id}>
                      <td><strong>{t.bookingReference}</strong></td>
                      <td>{t.devotees?.[0]?.name || t.user?.name || 'Devotee'}</td>
                      <td>{t.slot?.timeSlot || 'Scheduled Slot'}</td>
                      <td>
                        <span className={`tag-badge ${(t.slot?.slotType || 'General').toLowerCase().replace(' ', '-')}`}>
                          {t.slot?.slotType || 'General'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                          background: isCheckedIn ? '#dcfce7' : isConfirmed ? '#e0f2fe' : '#fee2e2',
                          color: isCheckedIn ? '#166534' : isConfirmed ? '#0369a1' : '#991b1b'
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {t.checkedInAt ? (
                          <span style={{ color: '#166534', fontWeight: 600 }}>
                            {new Date(t.checkedInAt).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Awaiting Scan</span>
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
        onScanComplete={() => {
          fetchStaffData();
        }}
      />
    </div>
  );
};

export default TempleStaffDashboard;
