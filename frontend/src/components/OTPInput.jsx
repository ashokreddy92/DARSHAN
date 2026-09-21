import React, { useRef, useEffect } from 'react';

/**
 * OTPInput Component
 * 6-digit auto-advancing, paste-supporting, backspace-friendly numeric input.
 * Fully optimized for mobile keypads and keyboard navigation.
 */
const OTPInput = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true
}) => {
  const inputsRef = useRef([]);

  // Ensure refs array has right size
  inputsRef.current = inputsRef.current.slice(0, length);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const focusInput = (index) => {
    if (inputsRef.current[index]) {
      inputsRef.current[index].focus();
      inputsRef.current[index].select();
    }
  };

  const handleInputChange = (index, e) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (!cleanDigits) {
      // Empty input
      const newDigits = [...digits];
      newDigits[index] = '';
      const newVal = newDigits.join('');
      onChange(newVal);
      return;
    }

    // Handle single or multi-digit insertion (e.g., auto-complete/autofill)
    if (cleanDigits.length > 1) {
      const pasted = cleanDigits.slice(0, length);
      onChange(pasted);
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
      const nextFocus = Math.min(pasted.length, length - 1);
      focusInput(nextFocus);
      return;
    }

    // Single digit input
    const char = cleanDigits[cleanDigits.length - 1];
    const newDigits = [...digits];
    newDigits[index] = char;
    const newVal = newDigits.join('');
    onChange(newVal);

    if (newVal.length === length && onComplete) {
      onComplete(newVal);
    } else if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, delete previous and move focus back
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        focusInput(index - 1);
        e.preventDefault();
      } else if (digits[index]) {
        // Clear current
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain');
    const cleanDigits = pasteData.replace(/\D/g, '').slice(0, length);

    if (cleanDigits) {
      onChange(cleanDigits);
      if (cleanDigits.length === length && onComplete) {
        onComplete(cleanDigits);
      }
      const targetIndex = Math.min(cleanDigits.length, length - 1);
      focusInput(targetIndex);
    }
  };

  return (
    <div className="otp-input-group" role="group" aria-label="One-Time Password Inputs">
      {Array.from({ length }).map((_, i) => {
        const isFilled = Boolean(digits[i]);
        return (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            value={digits[i] || ''}
            disabled={disabled}
            onChange={(e) => handleInputChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`otp-digit-box ${isFilled ? 'filled' : ''} ${hasError ? 'error' : ''}`}
            aria-label={`OTP Digit ${i + 1}`}
          />
        );
      })}

      <style>{`
        .otp-input-group {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: nowrap;
          gap: clamp(4px, 2vw, 10px);
          margin: 1.25rem auto;
          width: 100%;
          max-width: 360px;
        }

        .otp-digit-box {
          flex: 1 1 0;
          min-width: 34px;
          max-width: 50px;
          height: clamp(46px, 12vw, 58px);
          text-align: center;
          font-size: clamp(1.2rem, 4vw, 1.55rem);
          font-weight: 700;
          font-family: inherit;
          color: #0f172a;
          background-color: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          padding: 0;
          box-sizing: border-box;
        }

        .otp-digit-box:focus {
          border-color: #d97706;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
          transform: translateY(-2px);
        }

        .otp-digit-box.filled {
          border-color: #d97706;
          background-color: #ffffff;
          color: #92400e;
        }

        .otp-digit-box.error {
          border-color: #ef4444;
          background-color: #ffffff;
          color: #b91c1c;
        }

        .otp-digit-box.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .otp-digit-box:disabled {
          background-color: #f8fafc;
          border-color: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 480px) {
          .otp-digit-box {
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default OTPInput;
