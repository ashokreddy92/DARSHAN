import React, { useState } from 'react';

const AnalyticsCharts = ({ dailyTrend = [], templeDistribution = [], statusBreakdown = {} }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Maximum value for scaling the 7-day trend chart
  const maxTickets = Math.max(...dailyTrend.map(d => d.ticketsSold || 0), 10);
  const maxRevenue = Math.max(...dailyTrend.map(d => d.revenue || 0), 1000);

  // Total for status breakdown
  const statusTotal = (statusBreakdown.confirmed || 0) + 
                      (statusBreakdown.checkedIn || 0) + 
                      (statusBreakdown.cancelled || 0) + 
                      (statusBreakdown.pending || 0) || 1;

  const getPercent = (val) => Math.round(((val || 0) / statusTotal) * 100);

  const maxTempleBookings = Math.max(...templeDistribution.map(t => t.bookingCount || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Grid: 7-Day Trend + Status Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* 7-Day Trend Chart */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                7-Day Darshan Trend
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Daily booked devotees & check-ins
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#d97706' }}></span> Tickets
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }}></span> Check-Ins
              </span>
            </div>
          </div>

          {/* SVG Bar / Trend Chart */}
          <div style={{ position: 'relative', height: '220px', width: '100%' }}>
            {dailyTrend.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No booking trend data for this period
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '180px',
                paddingTop: '20px',
                gap: '8px'
              }}>
                {dailyTrend.map((item, idx) => {
                  const ticketHeight = Math.max(8, Math.round((item.ticketsSold / maxTickets) * 150));
                  const checkInHeight = Math.max(4, Math.round((item.checkIns / maxTickets) * 150));
                  const isHovered = hoveredDay === idx;

                  return (
                    <div
                      key={item.date || idx}
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div style={{
                          position: 'absolute',
                          bottom: `${ticketHeight + 25}px`,
                          background: '#1e293b',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: '2px' }}>{item.day} ({item.date})</div>
                          <div style={{ color: '#fbbf24' }}>Tickets: {item.ticketsSold}</div>
                          <div style={{ color: '#34d399' }}>Check-ins: {item.checkIns}</div>
                          <div style={{ color: '#93c5fd' }}>Revenue: ₹{item.revenue?.toLocaleString() || 0}</div>
                        </div>
                      )}

                      {/* Twin Bar */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                        {/* Tickets Bar */}
                        <div style={{
                          width: '40%',
                          maxWidth: '16px',
                          height: `${ticketHeight}px`,
                          background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.2s ease',
                          opacity: isHovered ? 1 : 0.9,
                          transform: isHovered ? 'scaleY(1.05)' : 'none',
                          transformOrigin: 'bottom'
                        }} />
                        {/* Check-in Bar */}
                        <div style={{
                          width: '40%',
                          maxWidth: '16px',
                          height: `${checkInHeight}px`,
                          background: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.2s ease',
                          opacity: isHovered ? 1 : 0.85,
                          transform: isHovered ? 'scaleY(1.05)' : 'none',
                          transformOrigin: 'bottom'
                        }} />
                      </div>

                      {/* Day Label */}
                      <span style={{
                        marginTop: '8px',
                        fontSize: '0.75rem',
                        fontWeight: isHovered ? 700 : 500,
                        color: isHovered ? '#b45309' : '#64748b'
                      }}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9'
        }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
            Darshan Pass Status
          </h3>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
            Verification and check-in status overview
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Confirmed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Confirmed (Awaiting Darshan)</span>
                <span style={{ fontWeight: 700, color: '#d97706' }}>{statusBreakdown.confirmed || 0} ({getPercent(statusBreakdown.confirmed)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(statusBreakdown.confirmed)}%`, height: '100%', background: '#d97706', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Checked In */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Checked In (Completed)</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{statusBreakdown.checkedIn || 0} ({getPercent(statusBreakdown.checkedIn)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(statusBreakdown.checkedIn)}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Pending */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Pending Verification</span>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>{statusBreakdown.pending || 0} ({getPercent(statusBreakdown.pending)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(statusBreakdown.pending)}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Cancelled */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Cancelled</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>{statusBreakdown.cancelled || 0} ({getPercent(statusBreakdown.cancelled)}%)</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(statusBreakdown.cancelled)}%`, height: '100%', background: '#ef4444', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Temple-wise Popularity Distribution */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
              Temple Darshan Distribution
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Booking volume across popular spiritual destinations
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            Top Active Temples
          </span>
        </div>

        {templeDistribution.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
            No temple distribution records available.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {templeDistribution.map((t) => {
              const pct = Math.round((t.bookingCount / maxTempleBookings) * 100);
              return (
                <div key={t.templeId} style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                      {t.templeName}
                    </span>
                    <span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.9rem' }}>
                      {t.bookingCount} bookings
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b 0%, #b45309 100%)',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
