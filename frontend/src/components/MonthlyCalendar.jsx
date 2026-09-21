import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  CalendarDays, CheckCircle, Sparkles 
} from 'lucide-react';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'],
  te: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
  ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  kn: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್']
};

const WEEKDAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  te: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
  ta: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  kn: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ']
};

const MonthlyCalendar = ({ templeId, selectedDate, onSelectDate, datesList = [] }) => {
  const { language, t } = useLanguage();

  // Initialize with selectedDate or today
  const today = new Date();
  const initDate = selectedDate ? new Date(selectedDate) : today;
  
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth()); // 0-11
  const [mode, setMode] = useState('month'); // 'month' | 'week'
  const [monthData, setMonthData] = useState({});
  const [loadingMonth, setLoadingMonth] = useState(false);

  // Month String format: YYYY-MM
  const currentMonthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Fetch month overview from backend
  useEffect(() => {
    if (!templeId) return;
    const fetchMonthOverview = async () => {
      try {
        setLoadingMonth(true);
        const res = await axios.get(`http://localhost:5000/api/slots/temple/${templeId}/month-overview?month=${currentMonthStr}`);
        if (res.data.success) {
          setMonthData(res.data.data || {});
        }
      } catch (err) {
        console.warn('Month overview fetch error:', err.message);
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchMonthOverview();
  }, [templeId, currentMonthStr]);

  // Calendar Math
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Navigation limits (current month to +3 months ahead)
  const isPrevDisabled = 
    viewYear < today.getFullYear() || 
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const maxFutureDate = new Date(today);
  maxFutureDate.setMonth(today.getMonth() + 3);
  const isNextDisabled = 
    viewYear > maxFutureDate.getFullYear() || 
    (viewYear === maxFutureDate.getFullYear() && viewMonth >= maxFutureDate.getMonth());

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Localized texts
  const currentLangCode = MONTH_NAMES[language] ? language : 'en';
  const monthName = MONTH_NAMES[currentLangCode][viewMonth];
  const weekdays = WEEKDAY_NAMES[currentLangCode] || WEEKDAY_NAMES.en;

  // Selected date readable label
  const formatSelectedDateReadable = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dayW = weekdays[dt.getDay()];
      const mName = MONTH_NAMES[currentLangCode][dt.getMonth()];
      return `${dayW}, ${d} ${mName} ${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="monthly-calendar-wrapper">
      {/* View Switcher Tabs: Month View vs 7-Day Quick Strip */}
      <div className="calendar-top-bar">
        <div className="view-mode-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === 'month' ? 'active' : ''}`}
            onClick={() => setMode('month')}
          >
            <CalendarDays size={16} />
            <span>Monthly Calendar</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'week' ? 'active' : ''}`}
            onClick={() => setMode('week')}
          >
            <CalendarIcon size={16} />
            <span>Quick 7 Days</span>
          </button>
        </div>

        {/* Selected Date Indicator Badge */}
        <div className="selected-date-badge">
          <span className="badge-dot"></span>
          <strong>{formatSelectedDateReadable(selectedDate)}</strong>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {mode === 'month' && (
        <div className="month-calendar-card card">
          {/* Header with Month Navigator */}
          <div className="calendar-header-nav">
            <button
              type="button"
              className="nav-arrow-btn"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              aria-label="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="month-title-wrap">
              <h3>{monthName} {viewYear}</h3>
              {loadingMonth && <span className="updating-pill">Checking slots...</span>}
            </div>

            <button
              type="button"
              className="nav-arrow-btn"
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              aria-label="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="weekday-grid">
            {weekdays.map((w, idx) => (
              <div key={idx} className={`weekday-col ${idx === 0 || idx === 6 ? 'weekend' : ''}`}>
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="calendar-days-grid">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="calendar-cell blank"></div>
            ))}

            {/* Days of Month */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isPast = dateStr < todayStr;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const daySlot = monthData[dateStr];
              const isAvailable = !isPast; // Guaranteed available on-demand or in DB

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  className={`calendar-cell ${isPast ? 'past' : 'active-day'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectDate(dateStr)}
                  title={isPast ? 'Past Date' : isSelected ? 'Selected Date' : 'Darshan Slots Available'}
                >
                  <span className="day-number">{dayNum}</span>
                  
                  {/* Compact Status Indicator */}
                  {!isPast && (
                    <span className={`status-dot ${isSelected ? 'selected-dot' : 'avail-dot'}`}></span>
                  )}

                  {isToday && <span className="today-dot" title="Today"></span>}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot green"></span>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot gold"></span>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot blue"></span>
              <span>Today</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot gray"></span>
              <span>Past</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: QUICK 7-DAY HORIZONTAL STRIP (AS REQUESTED) */}
      {mode === 'week' && (
        <div className="week-strip-card card">
          <div className="date-picker-row">
            {datesList.map((item) => (
              <button
                key={item.dateStr}
                type="button"
                className={`date-card ${selectedDate === item.dateStr ? 'active' : ''}`}
                onClick={() => onSelectDate(item.dateStr)}
              >
                <span className="day-name">{item.dayName}</span>
                <span className="day-num">{item.dayNum}</span>
                <span className="strip-avail-badge">Available</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .monthly-calendar-wrapper {
          margin-bottom: 24px;
        }

        .calendar-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 14px;
        }

        .view-mode-tabs {
          display: inline-flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: #ffffff;
          color: #d97706;
          box-shadow: 0 2px 5px rgba(0,0,0,0.06);
        }

        .selected-date-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
        }

        /* Month Calendar Card - Compact Size */
        .month-calendar-card {
          max-width: 440px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .calendar-header-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 10px;
        }

        .month-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .month-title-wrap h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--secondary);
          margin: 0;
        }

        .updating-pill {
          font-size: 0.68rem;
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .nav-arrow-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-arrow-btn:hover:not(:disabled) {
          background: #fffbeb;
          border-color: #d97706;
          color: #d97706;
        }

        .nav-arrow-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Weekday Grid */
        .weekday-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          text-align: center;
          margin-bottom: 6px;
        }

        .weekday-col {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          padding: 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .weekday-col.weekend {
          color: #d97706;
        }

        /* Calendar Days Grid */
        .calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }

        .calendar-cell {
          aspect-ratio: 1;
          min-height: 40px;
          max-height: 48px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3px 2px;
          cursor: pointer;
          position: relative;
          transition: all 0.18s ease;
        }

        .calendar-cell.blank {
          border: none;
          background: transparent;
          cursor: default;
        }

        .calendar-cell.past {
          background: #f8fafc;
          border-color: #f1f5f9;
          color: #cbd5e1;
          cursor: not-allowed;
        }

        .calendar-cell.past .day-number {
          color: #cbd5e1;
        }

        .calendar-cell.active-day:hover {
          border-color: #d97706;
          background: #fffbeb;
          transform: translateY(-1px);
        }

        .calendar-cell.today {
          border-color: #3b82f6;
        }

        .calendar-cell.selected {
          border-color: #d97706;
          background: #fffbeb;
          box-shadow: 0 0 0 2px #d97706;
          font-weight: 800;
        }

        .day-number {
          font-size: 0.92rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
        }

        .calendar-cell.selected .day-number {
          color: #b45309;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 3px;
          display: block;
        }

        .status-dot.avail-dot {
          background: #10b981;
        }

        .status-dot.selected-dot {
          background: #d97706;
          box-shadow: 0 0 0 1.5px #fde68a;
        }

        .today-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3b82f6;
        }

        /* Calendar Legend */
        .calendar-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .legend-dot.green { background: #10b981; }
        .legend-dot.gold { background: #d97706; }
        .legend-dot.blue { background: #3b82f6; }
        .legend-dot.gray { background: #cbd5e1; }

        /* Week Strip Card */
        .week-strip-card {
          padding: 14px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          max-width: 560px;
          margin: 0 auto;
        }

        .strip-avail-badge {
          font-size: 0.62rem;
          color: #059669;
          font-weight: 700;
          margin-top: 2px;
        }

        @media (max-width: 640px) {
          .month-calendar-card {
            max-width: 100%;
            padding: 10px;
          }
          .calendar-cell {
            min-height: 36px;
            max-height: 42px;
          }
          .day-number {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyCalendar;
