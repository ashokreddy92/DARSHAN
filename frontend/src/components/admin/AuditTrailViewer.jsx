import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Shield, Search, RefreshCw, Eye, Calendar, User, FileText } from 'lucide-react';

const AuditTrailViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Detail Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = { page, limit: 25 };

      if (actionFilter !== 'all') params.action = actionFilter;
      if (roleFilter !== 'all') params.actorRole = roleFilter;

      const res = await axios.get('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data.success) {
        setLogs(res.data.data.logs);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [actionFilter, roleFilter]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#d97706" /> Administrative Audit Trail
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Immutable chronological record of administrative actions, configuration updates, and financial state changes.
          </p>
        </div>

        <button onClick={() => fetchAuditLogs(pagination.page)} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 14px' }}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', borderRadius: '12px', background: 'white', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ width: '220px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>ACTION TYPE</label>
            <select className="form-control" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
              <option value="all">All Administrative Actions</option>
              <option value="REFUND_PAYMENT">REFUND_PAYMENT</option>
              <option value="CREATE_DEITY">CREATE_DEITY</option>
              <option value="UPDATE_DEITY">UPDATE_DEITY</option>
              <option value="TOGGLE_DEITY_STATUS">TOGGLE_DEITY_STATUS</option>
              <option value="ASSIGN_DEITY_TO_TEMPLE">ASSIGN_DEITY_TO_TEMPLE</option>
              <option value="REMOVE_DEITY_FROM_TEMPLE">REMOVE_DEITY_FROM_TEMPLE</option>
              <option value="ACKNOWLEDGE_INCIDENT">ACKNOWLEDGE_INCIDENT</option>
              <option value="RESOLVE_INCIDENT">RESOLVE_INCIDENT</option>
            </select>
          </div>

          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>ACTOR ROLE</label>
            <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ fontSize: '0.85rem' }}>
              <option value="all">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ORGANIZER">ORGANIZER</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ padding: 0, borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                <th style={{ padding: '10px 14px' }}>Actor</th>
                <th style={{ padding: '10px 14px' }}>Role</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
                <th style={{ padding: '10px 14px' }}>Resource</th>
                <th style={{ padding: '10px 14px' }}>IP Address</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 8px' }} />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                      {log.actorName}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: log.actorRole === 'ADMIN' ? '#fef3c7' : '#f1f5f9',
                        color: log.actorRole === 'ADMIN' ? '#b45309' : '#475569',
                        padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem'
                      }}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {log.resourceType} {log.resourceId ? `(#${log.resourceId.toString().slice(-6)})` : ''}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                      {log.ipAddress}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-sm"
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', fontSize: '0.78rem' }}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total audit records)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchAuditLogs(pagination.page - 1)}
              className="btn btn-sm"
              style={{ background: 'white', border: '1px solid #cbd5e1' }}
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchAuditLogs(pagination.page + 1)}
              className="btn btn-sm"
              style={{ background: 'white', border: '1px solid #cbd5e1' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DIFF INSPECTOR MODAL */}
      {selectedLog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>Audit Entry Details</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div><strong>Actor:</strong> {selectedLog.actorName} ({selectedLog.actorRole})</div>
              <div><strong>Action:</strong> <span style={{ color: '#0369a1', fontFamily: 'monospace' }}>{selectedLog.action}</span></div>
              <div><strong>Resource:</strong> {selectedLog.resourceType}</div>
              <div><strong>Resource ID:</strong> {selectedLog.resourceId || 'N/A'}</div>
              <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
              <div style={{ gridColumn: 'span 2', fontSize: '0.78rem', color: '#64748b' }}>
                <strong>User Agent:</strong> {selectedLog.userAgent}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#b91c1c' }}>Previous State</h4>
                <pre style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '200px' }}>
                  {JSON.stringify(selectedLog.previousValue, null, 2) || 'null'}
                </pre>
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#15803d' }}>New State</h4>
                <pre style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '200px' }}>
                  {JSON.stringify(selectedLog.newValue, null, 2) || 'null'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailViewer;
