import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LanguageSelector = ({ variant = 'navbar' }) => {
  const { language, changeLanguage, languages, currentLanguageObj } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  // Drawer variant: full-width segmented/list layout
  if (variant === 'drawer') {
    return (
      <div className="drawer-lang-selector">
        <div className="drawer-lang-header">
          <Globe size={18} className="lang-globe-icon" />
          <span className="drawer-lang-title">Choose Language / భాష / भाषा</span>
        </div>
        <div className="drawer-lang-grid">
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                className={`drawer-lang-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="lang-native">{lang.nativeName}</span>
                <span className="lang-en">({lang.name})</span>
                {isSelected && <Check size={16} className="active-check" />}
              </button>
            );
          })}
        </div>

        <style>{`
          .drawer-lang-selector {
            padding: 14px 16px;
            margin: 12px 16px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .drawer-lang-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 0.85rem;
            font-weight: 700;
            color: #475569;
          }
          .lang-globe-icon {
            color: #d97706;
          }
          .drawer-lang-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .drawer-lang-btn {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1.5px solid #cbd5e1;
            background: #ffffff;
            color: #1e293b;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .drawer-lang-btn.active {
            border-color: #d97706;
            background: #fffbeb;
            color: #92400e;
            box-shadow: 0 2px 4px rgba(217, 119, 6, 0.15);
          }
          .drawer-lang-btn:hover {
            border-color: #d97706;
          }
          .drawer-lang-btn .lang-native {
            font-size: 0.92rem;
            font-weight: 700;
          }
          .drawer-lang-btn .lang-en {
            font-size: 0.75rem;
            color: #64748b;
          }
          .drawer-lang-btn.active .lang-en {
            color: #b45309;
          }
          .drawer-lang-btn .active-check {
            position: absolute;
            top: 8px;
            right: 8px;
            color: #d97706;
          }
        `}</style>
      </div>
    );
  }

  // Footer variant: compact pill or dropdown
  if (variant === 'footer') {
    return (
      <div className="footer-lang-selector" ref={dropdownRef}>
        <button
          type="button"
          className="footer-lang-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Change Language"
        >
          <Globe size={16} />
          <span>{currentLanguageObj.nativeName}</span>
          <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
        </button>

        {isOpen && (
          <div className="footer-lang-dropdown">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`footer-dropdown-item ${lang.code === language ? 'active' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="lang-text">
                  <strong>{lang.nativeName}</strong> <small>({lang.name})</small>
                </span>
                {lang.code === language && <Check size={14} />}
              </button>
            ))}
          </div>
        )}

        <style>{`
          .footer-lang-selector {
            position: relative;
            display: inline-block;
          }
          .footer-lang-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #e2e8f0;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .footer-lang-btn:hover {
            background: rgba(255, 255, 255, 0.16);
            border-color: #d97706;
            color: #ffffff;
          }
          .chevron-icon {
            transition: transform 0.2s ease;
          }
          .chevron-icon.open {
            transform: rotate(180deg);
          }
          .footer-lang-dropdown {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 0;
            min-width: 170px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            padding: 6px;
            z-index: 100;
          }
          .footer-dropdown-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            background: transparent;
            border: none;
            color: #cbd5e1;
            font-size: 0.85rem;
            border-radius: 6px;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s ease;
          }
          .footer-dropdown-item:hover {
            background: rgba(217, 119, 6, 0.15);
            color: #f59e0b;
          }
          .footer-dropdown-item.active {
            background: rgba(217, 119, 6, 0.25);
            color: #fbbf24;
            font-weight: 700;
          }
        `}</style>
      </div>
    );
  }

  // Standard Navbar variant (Desktop & header bar)
  return (
    <div className="navbar-lang-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="navbar-lang-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe size={18} className="globe-icon" />
        <span className="lang-label">{currentLanguageObj.nativeName}</span>
        <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="navbar-lang-menu animate-fade-in">
          <div className="lang-menu-header">
            <span>Select Language / భాష / भाषा</span>
          </div>
          <div className="lang-menu-list">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-option ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelect(lang.code)}
                >
                  <div className="lang-meta">
                    <span className="native-title">{lang.nativeName}</span>
                    <span className="english-sub">{lang.name}</span>
                  </div>
                  {isSelected && <Check size={16} className="selected-indicator" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .navbar-lang-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .navbar-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          color: #334155;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .navbar-lang-btn:hover {
          background: #fffbeb;
          border-color: #d97706;
          color: #b45309;
        }

        .navbar-lang-btn .globe-icon {
          color: #d97706;
          flex-shrink: 0;
        }

        .navbar-lang-btn .lang-label {
          letter-spacing: 0.2px;
        }

        .chevron-icon {
          color: #94a3b8;
          transition: transform 0.2s ease;
        }

        .chevron-icon.open {
          transform: rotate(180deg);
        }

        .navbar-lang-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.06);
          padding: 8px;
          z-index: 1000;
          animation: langFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes langFadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lang-menu-header {
          padding: 6px 10px 8px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
        }

        .lang-menu-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: 6px;
        }

        .lang-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .lang-option:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .lang-option.active {
          background: #fffbeb;
          border-color: #fef3c7;
        }

        .lang-meta {
          display: flex;
          flex-direction: column;
        }

        .lang-meta .native-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #1e293b;
        }

        .lang-option.active .lang-meta .native-title {
          color: #b45309;
        }

        .lang-meta .english-sub {
          font-size: 0.75rem;
          color: #64748b;
        }

        .selected-indicator {
          color: #d97706;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
