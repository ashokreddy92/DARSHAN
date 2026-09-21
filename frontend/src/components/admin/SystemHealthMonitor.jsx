import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Activity, Server, AlertTriangle, CheckCircle2, Clock, 
  RefreshCw, Layers, ShieldAlert, Check, ExternalLink, Zap
} from 'lucide-react';

const SystemHealthMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [queueStats, setQueueStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'queues' | 'incidents'

  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [healthRes, bottleRes, queueRes, incidentRes] = await Promise.allSettled([
        axios.get('/api/admin/system/health', { headers }),
        axios.get('/api/admin/system/bottlenecks', { headers }),
        axios.get('/api/admin/rabbitmq/queues', { headers }),
        axios.get('/api/admin/incidents', { headers })
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.data.success) {
        setHealthData(healthRes.value.data.data);
      }
      if (bottleRes.status === 'fulfilled' && bottleRes.value.data.success) {
        setBottlenecks(bottleRes.value.data.data);
      }
      if (queueRes.status === 'fulfilled' && queueRes.value.data.success) {
        setQueueStats(queueRes.value.data.data);
      }
      if (incidentRes.status === 'fulfilled' && incidentRes.value.data.success) {
        setIncidents(incidentRes.value.data.data);
      }
    } catch (err) {
      toast.error('Failed to refresh system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const timer = setInterval(fetchSystemData, 15000); // 15s live polling
    return () => clearInterval(timer);
  }, []);

  const handleAcknowledge = async (incidentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/incidents/${incidentId}/acknowledge`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info('Incident marked as Acknowledged');
      fetchSystemData();
    } catch (err) {
      toast.error('Failed to acknowledge incident');
    }
  };

  const handleResolve = async (incidentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/incidents/${incidentId}/resolve`, {
        note: resolutionNote || 'Resolved by administrator'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Incident resolved');
      setResolvingId(null);
      setResolutionNote('');
      fetchSystemData();
    } catch (err) {
      toast.error('Failed to resolve incident');
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'healthy') return <CheckCircle2 size={18} color="#15803d" />;
    if (s === 'warning') return <AlertTriangle size={18} color="#b45309" />;
    return <ShieldAlert size={18} color="#b91c1c" />;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'healthy') return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' };
    if (s === 'warning') return { bg: '#fffbeb', border: '#fde68a', text: '#b45309' };
    return { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' };
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${activeSubTab === 'overview' ? 'btn-primary' : ''}`}
            onClick={() => setActiveSubTab('overview')}
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            <Activity size={16} /> System Health & Latencies
          </button>
          <button 
            className={`btn ${activeSubTab === 'queues' ? 'btn-primary' : ''}`}
            onClick={() => setActiveSubTab('queues')}
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            <Layers size={16} /> RabbitMQ Queues ({queueStats?.queues?.length || 0})
          </button>
          <button 
            className={`btn ${activeSubTab === 'incidents' ? 'btn-primary' : ''}`}
            onClick={() => setActiveSubTab('incidents')}
            style={{ padding: '8px 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={16} /> Failures & Incidents ({incidents.filter((i) => i.status !== 'Resolved').length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a
            href="http://localhost:5000/metrics"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={14} /> Prometheus Exporter
          </a>
          <button onClick={fetchSystemData} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 14px' }}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* OVERVIEW SUBTAB */}
      {activeSubTab === 'overview' && (
        <>
          {/* Infrastructure Health Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {healthData?.components?.map((c) => {
              const colors = getStatusColor(c.status);
              return (
                <div 
                  key={c.id} 
                  className="card"
                  style={{ padding: '16px', borderRadius: '12px', background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>{c.name}</span>
                    {getStatusIcon(c.status)}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.text, marginBottom: '4px' }}>
                    {c.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {c.metrics}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Measured Latency Gauge & System Performance */}
          {bottlenecks && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', marginBottom: '24px' }}>
              {/* Latency Stats Card */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white' }}>
                <h4 style={{ margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#d97706" /> API Response Latency (Measured)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>AVERAGE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                      {bottlenecks.metrics.performance.avgLatencyMs} ms
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: bottlenecks.metrics.performance.p95LatencyMs > 500 ? '#fef3c7' : '#f8fafc', borderRadius: '8px', border: `1px solid ${bottlenecks.metrics.performance.p95LatencyMs > 500 ? '#fde68a' : '#e2e8f0'}` }}>
                    <div style={{ fontSize: '0.75rem', color: bottlenecks.metrics.performance.p95LatencyMs > 500 ? '#b45309' : '#64748b', fontWeight: 700 }}>P95 LATENCY</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: bottlenecks.metrics.performance.p95LatencyMs > 500 ? '#b45309' : '#0f172a' }}>
                      {bottlenecks.metrics.performance.p95LatencyMs} ms
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>P99 LATENCY</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                      {bottlenecks.metrics.performance.p99LatencyMs} ms
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Based on rolling sample of {bottlenecks.metrics.performance.totalRequestsSampled} active HTTP requests.
                </div>
              </div>

              {/* Active Bottlenecks & Warnings */}
              <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white' }}>
                <h4 style={{ margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#b45309" /> Bottleneck Detector
                </h4>

                {bottlenecks.bottlenecks.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={24} color="#15803d" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontWeight: 700, color: '#15803d' }}>No System Bottlenecks Detected</div>
                    <small style={{ color: '#166534' }}>API latencies, database responses, and queue depths are optimal.</small>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bottlenecks.bottlenecks.map((b, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: b.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb', border: `1px solid ${b.severity === 'CRITICAL' ? '#fecaca' : '#fde68a'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <strong style={{ color: b.severity === 'CRITICAL' ? '#b91c1c' : '#b45309', fontSize: '0.85rem' }}>{b.component}</strong>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: b.severity === 'CRITICAL' ? '#b91c1c' : '#b45309' }}>{b.severity}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#334155' }}>{b.message}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{b.recommendation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Slowest APIs */}
          {bottlenecks && bottlenecks.metrics.topSlowAPIs.length > 0 && (
            <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 14px', color: '#0f172a' }}>Top Slow Endpoints (P95 Response Times)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Endpoint</th>
                      <th style={{ padding: '8px 12px' }}>Requests</th>
                      <th style={{ padding: '8px 12px' }}>Avg Latency</th>
                      <th style={{ padding: '8px 12px' }}>P95 Latency</th>
                      <th style={{ padding: '8px 12px' }}>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottlenecks.metrics.topSlowAPIs.map((e, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{e.endpoint}</td>
                        <td style={{ padding: '8px 12px' }}>{e.calls}</td>
                        <td style={{ padding: '8px 12px' }}>{e.avgLatencyMs} ms</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: e.p95LatencyMs > 500 ? '#b91c1c' : '#0f172a' }}>
                          {e.p95LatencyMs} ms
                        </td>
                        <td style={{ padding: '8px 12px', color: e.errors > 0 ? '#b91c1c' : '#15803d' }}>{e.errors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* QUEUES SUBTAB */}
      {activeSubTab === 'queues' && (
        <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white' }}>
          <h3 style={{ margin: '0 0 4px', color: '#0f172a' }}>RabbitMQ Queue Architecture</h3>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.88rem' }}>
            Inspect asynchronous queue depths, active worker consumers, and dead-letter backlogs.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 16px' }}>Queue Name</th>
                  <th style={{ padding: '10px 16px' }}>Target Exchange</th>
                  <th style={{ padding: '10px 16px' }}>Messages Ready</th>
                  <th style={{ padding: '10px 16px' }}>Active Consumers</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {queueStats?.queues?.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
                      {q.name}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#64748b' }}>
                      {q.id === 'deadletter' ? 'darshanease.deadletter' : (q.id === 'notification' ? 'darshanease.notifications' : 'darshanease.events / jobs')}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: q.messagesReady > 50 ? '#b91c1c' : '#0f172a' }}>
                      {q.messagesReady}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#475569' }}>
                      {q.consumerCount} worker(s)
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        background: q.status === 'Healthy' ? '#dcfce7' : (q.status === 'Backlogged' ? '#fee2e2' : '#f1f5f9'),
                        color: q.status === 'Healthy' ? '#15803d' : (q.status === 'Backlogged' ? '#b91c1c' : '#475569'),
                        padding: '3px 10px', borderRadius: '50px', fontWeight: 700, fontSize: '0.75rem'
                      }}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INCIDENTS SUBTAB */}
      {activeSubTab === 'incidents' && (
        <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white' }}>
          <h3 style={{ margin: '0 0 4px', color: '#0f172a' }}>Grouped Failure Incidents</h3>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.88rem' }}>
            Error deduplication grouping prevents alert flooding. Acknowledge and resolve operational incidents below.
          </p>

          {incidents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
              <CheckCircle2 size={32} color="#15803d" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: 0, color: '#1e293b' }}>Zero Active Incidents</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>All services are executing without recurring operational errors.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Incident ID</th>
                    <th style={{ padding: '10px 14px' }}>Service</th>
                    <th style={{ padding: '10px 14px' }}>Severity</th>
                    <th style={{ padding: '10px 14px' }}>Occurrences</th>
                    <th style={{ padding: '10px 14px' }}>Error Message</th>
                    <th style={{ padding: '10px 14px' }}>Last Seen</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{inc.incidentId}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155' }}>{inc.service}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: inc.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                          color: inc.severity === 'CRITICAL' ? '#b91c1c' : '#b45309',
                          padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem'
                        }}>
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b' }}>{inc.occurrences}</td>
                      <td style={{ padding: '10px 14px', color: '#475569', maxWidth: '280px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inc.message}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                        {new Date(inc.lastSeen).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: inc.status === 'Resolved' ? '#dcfce7' : (inc.status === 'Acknowledged' ? '#e0e7ff' : '#fef3c7'),
                          color: inc.status === 'Resolved' ? '#15803d' : (inc.status === 'Acknowledged' ? '#4338ca' : '#b45309'),
                          padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem'
                        }}>
                          {inc.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {inc.status === 'Investigating' && (
                          <button 
                            onClick={() => handleAcknowledge(inc.incidentId)}
                            className="btn btn-sm"
                            style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '3px 8px', borderRadius: '4px', marginRight: '4px', fontSize: '0.75rem' }}
                          >
                            Acknowledge
                          </button>
                        )}
                        {inc.status !== 'Resolved' && (
                          <button 
                            onClick={() => setResolvingId(inc.incidentId)}
                            className="btn btn-sm btn-primary"
                            style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RESOLVE INCIDENT MODAL */}
      {resolvingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', maxWidth: '440px', width: '100%' }}>
            <h4 style={{ margin: '0 0 12px', color: '#0f172a' }}>Resolve Incident {resolvingId}</h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Resolution Note</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Describe how the issue was mitigated..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setResolvingId(null)} className="btn" style={{ background: '#f1f5f9', border: 'none' }}>
                Cancel
              </button>
              <button onClick={() => handleResolve(resolvingId)} className="btn btn-primary">
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthMonitor;
