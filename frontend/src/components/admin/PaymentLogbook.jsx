import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CreditCard, Search, Filter, RefreshCw, Eye, AlertCircle, 
  CheckCircle2, Clock, RotateCcw, AlertTriangle, ShieldCheck, Download
} from 'lucide-react';

const PaymentLogbook = ({ temples = [] }) => {
  const [subTab, setSubTab] = useState('logbook'); // 'logbook' | 'reconciliation'
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalVolume: 0, failedCount: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [templeFilter, setTempleFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Detail Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState([]);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Reconciliation State
  const [reconciliation, setReconciliation] = useState(null);
  const [reconciling, setReconciling] = useState(false);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = { page, limit: 15 };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (templeFilter !== 'all') params.temple = templeFilter;
      if (gatewayFilter !== 'all') params.gateway = gatewayFilter;
      if (search.trim()) params.search = search.trim();
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await axios.get('/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data.success) {
        setPayments(res.data.data.payments);
        setPagination(res.data.data.pagination);
        setSummary(res.data.data.summary);
      }
    } catch (err) {
      toast.error('Failed to load payment logbook: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [statusFilter, templeFilter, gatewayFilter, fromDate, toDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments(1);
  };

  const openPaymentDetails = async (paymentId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/admin/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedPayment(res.data.data.payment);
        setAuditTrail(res.data.data.auditTrail || []);
      }
    } catch (err) {
      toast.error('Failed to load payment timeline');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    if (!window.confirm(`Are you sure you want to issue a refund of ₹${selectedPayment.amount} for ${selectedPayment.paymentId}?`)) return;

    try {
      setRefunding(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/admin/payments/${selectedPayment._id}/refund`, {
        reason: refundReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Refund processed and audited successfully');
        openPaymentDetails(selectedPayment._id);
        fetchPayments(pagination.page);
        setRefundReason('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    } finally {
      setRefunding(false);
    }
  };

  const runReconciliation = async () => {
    try {
      setReconciling(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/payments/reconciliation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReconciliation(res.data.data);
        toast.info(`Reconciliation complete: ${res.data.data.discrepancyCount} discrepancies detected`);
      }
    } catch (err) {
      toast.error('Reconciliation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setReconciling(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'successful') return <span className="badge badge-success" style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '50px', fontWeight: 700, fontSize: '0.78rem' }}>✓ Successful</span>;
    if (s === 'failed') return <span className="badge badge-danger" style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '50px', fontWeight: 700, fontSize: '0.78rem' }}>✕ Failed</span>;
    if (s === 'refunded') return <span className="badge badge-info" style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '50px', fontWeight: 700, fontSize: '0.78rem' }}>↺ Refunded</span>;
    if (s === 'processing') return <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '50px', fontWeight: 700, fontSize: '0.78rem' }}>⟳ Processing</span>;
    return <span className="badge" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '50px', fontWeight: 700, fontSize: '0.78rem' }}>{status}</span>;
  };

  return (
    <div>
      {/* Sub-tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${subTab === 'logbook' ? 'btn-primary' : ''}`}
            onClick={() => setSubTab('logbook')}
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            <CreditCard size={16} /> Operational Logbook
          </button>
          <button 
            className={`btn ${subTab === 'reconciliation' ? 'btn-primary' : ''}`}
            onClick={() => { setSubTab('reconciliation'); if (!reconciliation) runReconciliation(); }}
            style={{ padding: '8px 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} /> Automated Reconciliation
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Confirmed Volume: <strong style={{ color: '#059669' }}>₹{summary.totalVolume.toLocaleString()}</strong>
          </span>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Failed: <strong style={{ color: '#dc2626' }}>{summary.failedCount}</strong>
          </span>
          <button onClick={() => fetchPayments(pagination.page)} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 14px' }}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
        </div>
      </div>

      {subTab === 'logbook' && (
        <>
          {/* Filters Bar */}
          <div className="card" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', background: 'white' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>SEARCH</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Payment ID, UTR..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>STATUS</label>
                <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
                  <option value="all">All Statuses</option>
                  <option value="Successful">Successful</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>TEMPLE</label>
                <select className="form-control" value={templeFilter} onChange={(e) => setTempleFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
                  <option value="all">All Temples</option>
                  {temples.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>GATEWAY</label>
                <select className="form-control" value={gatewayFilter} onChange={(e) => setGatewayFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
                  <option value="all">All Gateways</option>
                  <option value="MockGateway">MockGateway</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Stripe">Stripe</option>
                  <option value="UPI_Direct">UPI Direct</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>FROM DATE</label>
                <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ fontSize: '0.85rem' }} />
              </div>

              <div>
                <button type="submit" className="btn btn-primary w-100" style={{ padding: '9px', fontWeight: 700, fontSize: '0.88rem' }}>
                  Filter
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>Payment ID</th>
                    <th style={{ padding: '12px 16px' }}>Devotee</th>
                    <th style={{ padding: '12px 16px' }}>Temple</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Method</th>
                    <th style={{ padding: '12px 16px' }}>Txn Reference</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 8px' }} />
                        Loading payments...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No transactions match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
                          {p.paymentId}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.user?.name || 'Devotee'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.user?.email || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          {p.temple?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          ₹{p.amount}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {p.paymentMethod}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                          {p.transactionReference || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {getStatusBadge(p.status)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                          {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => openPaymentDetails(p._id)}
                            className="btn btn-sm"
                            style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px' }}
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total transactions)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchPayments(pagination.page - 1)}
                  className="btn btn-sm"
                  style={{ background: 'white', border: '1px solid #cbd5e1' }}
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchPayments(pagination.page + 1)}
                  className="btn btn-sm"
                  style={{ background: 'white', border: '1px solid #cbd5e1' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RECONCILIATION TAB */}
      {subTab === 'reconciliation' && (
        <div>
          <div className="card" style={{ padding: '24px', borderRadius: '12px', background: 'white', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#059669" /> Gateway vs. MongoDB Ledger Reconciliation
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Cross-references payment statuses, detects unpaid confirmed tickets, and identifies amount discrepancies.
                </p>
              </div>
              <button 
                onClick={runReconciliation} 
                disabled={reconciling} 
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontWeight: 700 }}
              >
                <RefreshCw size={16} className={reconciling ? 'spin-icon' : ''} /> {reconciling ? 'Reconciling Ledger...' : 'Run Fresh Audit'}
              </button>
            </div>

            {reconciliation && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>SCANNED BOOKINGS</span>
                    <h2 style={{ margin: '4px 0 0', color: '#1e293b' }}>{reconciliation.scannedCount}</h2>
                  </div>
                  <div style={{ padding: '14px', background: reconciliation.discrepancyCount > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${reconciliation.discrepancyCount > 0 ? '#fecaca' : '#bbf7d0'}` }}>
                    <span style={{ fontSize: '0.78rem', color: reconciliation.discrepancyCount > 0 ? '#b91c1c' : '#15803d', fontWeight: 700 }}>DISCREPANCIES DETECTED</span>
                    <h2 style={{ margin: '4px 0 0', color: reconciliation.discrepancyCount > 0 ? '#b91c1c' : '#15803d' }}>{reconciliation.discrepancyCount}</h2>
                  </div>
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>RECONCILED AT</span>
                    <div style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#334155' }}>
                      {new Date(reconciliation.reconciledAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {reconciliation.discrepancies.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={32} color="#15803d" style={{ margin: '0 auto 8px' }} />
                    <h4 style={{ margin: '0 0 4px', color: '#15803d' }}>All Financial Records 100% In Sync</h4>
                    <p style={{ margin: 0, color: '#166534', fontSize: '0.88rem' }}>Every confirmed booking has a verified payment transaction reference with matching amounts.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '10px 14px' }}>Severity</th>
                          <th style={{ padding: '10px 14px' }}>Issue Type</th>
                          <th style={{ padding: '10px 14px' }}>Booking Ref</th>
                          <th style={{ padding: '10px 14px' }}>Temple</th>
                          <th style={{ padding: '10px 14px' }}>Booking Status</th>
                          <th style={{ padding: '10px 14px' }}>Payment Status</th>
                          <th style={{ padding: '10px 14px' }}>Amount</th>
                          <th style={{ padding: '10px 14px' }}>Required Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliation.discrepancies.map((d, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ background: d.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7', color: d.severity === 'CRITICAL' ? '#b91c1c' : '#b45309', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem' }}>
                                {d.severity}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                              {d.type.replace(/_/g, ' ')}
                            </td>
                            <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                              {d.bookingReference}
                            </td>
                            <td style={{ padding: '10px 14px' }}>{d.templeName}</td>
                            <td style={{ padding: '10px 14px' }}>{d.bookingStatus}</td>
                            <td style={{ padding: '10px 14px' }}>{d.paymentStatus}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700 }}>₹{d.amount}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem' }}>
                                {d.suggestedAction}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT DETAIL & VISUAL TIMELINE MODAL */}
      {selectedPayment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '750px', maxHeight: '90vh',
            borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} color="#d97706" /> Payment Details
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {selectedPayment.paymentId}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)} 
                className="btn" 
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>AMOUNT</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>₹{selectedPayment.amount}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>STATUS</span>
                  <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>GATEWAY / METHOD</span>
                  <div style={{ fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                    {selectedPayment.gateway} ({selectedPayment.paymentMethod})
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>BOOKING REF</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#d97706', marginTop: '4px' }}>
                    {selectedPayment.booking?.bookingReference || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Devotee & Temple Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#475569' }}>Devotee Information</h4>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedPayment.user?.name || 'Devotee'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{selectedPayment.user?.email || 'N/A'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{selectedPayment.user?.phone || 'No phone recorded'}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#475569' }}>Temple & Darshan</h4>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedPayment.temple?.name || 'N/A'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {selectedPayment.booking?.slot?.date ? `Slot Date: ${selectedPayment.booking.slot.date}` : ''}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {selectedPayment.booking?.slot?.timeSlot ? `Timing: ${selectedPayment.booking.slot.timeSlot}` : ''}
                  </div>
                </div>
              </div>

              {/* Visual Transaction Timeline */}
              <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> Transaction Lifecycle Timeline
              </h4>

              <div style={{ paddingLeft: '12px', borderLeft: '2px solid #e2e8f0', marginBottom: '24px' }}>
                {selectedPayment.timeline && selectedPayment.timeline.length > 0 ? (
                  selectedPayment.timeline.map((item, idx) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: '16px', paddingLeft: '16px' }}>
                      <div style={{
                        position: 'absolute', left: '-21px', top: '2px', width: '12px', height: '12px',
                        borderRadius: '50%', background: '#d97706', border: '2px solid white',
                        boxShadow: '0 0 0 2px #d97706'
                      }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>{item.milestone}</strong>
                        <small style={{ color: '#94a3b8' }}>{new Date(item.timestamp).toLocaleString()}</small>
                      </div>
                      {item.note && <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>{item.note}</div>}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No milestone events recorded yet.</p>
                )}
              </div>

              {/* Financial Audit Trail */}
              {auditTrail.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#0f172a' }}>Financial Audit History</h4>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                    {auditTrail.map((a, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', padding: '6px 0', borderBottom: i !== auditTrail.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong style={{ color: '#334155' }}>{a.eventType}</strong>: {a.message}
                          <span style={{ color: '#94a3b8', marginLeft: '8px' }}>({a.actorType})</span>
                        </div>
                        <span style={{ color: '#94a3b8' }}>{new Date(a.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refund Box */}
              {selectedPayment.status === 'Successful' && (
                <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#92400e', fontSize: '0.88rem' }}>Administrative Refund</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Reason for refund (required for audit)..." 
                      value={refundReason} 
                      onChange={(e) => setRefundReason(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <button 
                      onClick={handleRefund} 
                      disabled={refunding || !refundReason.trim()} 
                      className="btn btn-danger" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      <RotateCcw size={14} /> {refunding ? 'Processing...' : 'Issue Refund'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentLogbook;
