import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, QrCode, Camera, Upload, Keyboard, CheckCircle, 
  AlertTriangle, XCircle, RefreshCw, User, Calendar, Clock, Landmark
} from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose, onScanComplete }) => {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Result States
  const [scanResult, setScanResult] = useState(null); // { status: 'success' | 'already_used' | 'error', message, data }

  const scannerRef = useRef(null);
  const scannerContainerId = 'qr-reader-viewport';

  useEffect(() => {
    if (isOpen && activeMode === 'camera' && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, scanResult]);

  const startCamera = async () => {
    try {
      setCameraError('');
      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleProcessTicket(decodedText);
        },
        () => {
          // Ignore scanning frame errors
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      setCameraActive(false);
      setCameraError('Unable to access camera. Please allow camera permissions or use Image Upload / Manual Input.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        // Suppress cleanup error
      }
      scannerRef.current = null;
      setCameraActive(false);
    }
  };

  const handleProcessTicket = async (code) => {
    if (!code || loading) return;

    // Play stop sound or pause camera while evaluating
    await stopCamera();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/bookings/scan-checkin', {
        ticketCode: code
      });

      if (res.data.success) {
        setScanResult({
          status: 'success',
          title: '✅ Ticket Verified!',
          message: 'Devotee allowed for Darshan',
          data: res.data.data
        });
        if (onScanComplete) onScanComplete(res.data.data);
      }
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes?.code === 'ALREADY_USED') {
        setScanResult({
          status: 'already_used',
          title: '❌ Ticket Already Used',
          message: errRes.message || 'This ticket has already been checked in for Darshan entry.',
          details: errRes
        });
      } else if (errRes?.code === 'WRONG_TEMPLE') {
        setScanResult({
          status: 'error',
          title: '❌ Wrong Temple Entry',
          message: errRes.message,
          details: errRes
        });
      } else {
        setScanResult({
          status: 'error',
          title: '❌ Invalid Ticket',
          message: errRes?.message || 'Verification failed. Invalid or unrecognized QR code.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle File Upload Scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-temp-file-reader');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleProcessTicket(decodedText);
    } catch (err) {
      setScanResult({
        status: 'error',
        title: '❌ No QR Code Found',
        message: 'Could not detect a valid QR code in the uploaded image. Please try another image or enter the reference number manually.'
      });
      setLoading(false);
    }
  };

  // Reset to Scan Next
  const handleResetForNext = () => {
    setScanResult(null);
    setManualCode('');
    if (activeMode === 'camera') {
      setTimeout(() => startCamera(), 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
    }}>
      <div className="card" style={{
        maxWidth: '520px', width: '100%', borderRadius: '16px',
        overflow: 'hidden', padding: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        background: '#ffffff', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px', background: '#0f172a', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <QrCode size={22} style={{ color: '#38bdf8' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Darshan QR Scanner & Entry Control</h3>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Mode Switcher */}
          {!scanResult && (
            <div style={{
              display: 'flex', background: '#f1f5f9', borderRadius: '10px',
              padding: '4px', marginBottom: '18px', gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveMode('camera'); setScanResult(null); }}
                style={{
                  flex: 1, padding: '8px 12px', border: 'none', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  background: activeMode === 'camera' ? '#ffffff' : 'transparent',
                  color: activeMode === 'camera' ? '#0f172a' : '#64748b',
                  boxShadow: activeMode === 'camera' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Camera size={16} /> Camera Scan
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('upload'); stopCamera(); setScanResult(null); }}
                style={{
                  flex: 1, padding: '8px 12px', border: 'none', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  background: activeMode === 'upload' ? '#ffffff' : 'transparent',
                  color: activeMode === 'upload' ? '#0f172a' : '#64748b',
                  boxShadow: activeMode === 'upload' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Upload size={16} /> Upload QR
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('manual'); stopCamera(); setScanResult(null); }}
                style={{
                  flex: 1, padding: '8px 12px', border: 'none', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  background: activeMode === 'manual' ? '#ffffff' : 'transparent',
                  color: activeMode === 'manual' ? '#0f172a' : '#64748b',
                  boxShadow: activeMode === 'manual' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Keyboard size={16} /> Manual Code
              </button>
            </div>
          )}

          {/* SCAN RESULTS DISPLAY */}
          {scanResult ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              {scanResult.status === 'success' && (
                <div style={{
                  background: '#f0fdf4', border: '2px solid #86efac',
                  borderRadius: '12px', padding: '20px', marginBottom: '16px'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: '#dcfce7', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 12px', color: '#16a34a'
                  }}>
                    <CheckCircle size={40} />
                  </div>
                  <h3 style={{ color: '#15803d', margin: '0 0 6px', fontSize: '1.4rem' }}>
                    {scanResult.title}
                  </h3>
                  <p style={{ color: '#166534', fontWeight: 600, margin: '0 0 16px', fontSize: '1rem' }}>
                    {scanResult.message}
                  </p>

                  <div style={{
                    background: '#ffffff', borderRadius: '8px', padding: '14px',
                    textAlign: 'left', border: '1px solid #bbf7d0', fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Ticket Ref:</span>
                        <strong>{scanResult.data?.bookingReference}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Status:</span>
                        <span style={{
                          background: '#dcfce7', color: '#166534', padding: '2px 8px',
                          borderRadius: '12px', fontWeight: 600, fontSize: '0.8rem'
                        }}>
                          CHECKED_IN
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Devotee Name:</span>
                        <strong>{scanResult.data?.devotees?.[0]?.name || scanResult.data?.user?.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Pilgrims:</span>
                        <strong>{scanResult.data?.devotees?.length || 1} Person</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Temple:</span>
                        <strong>{scanResult.data?.temple?.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Slot:</span>
                        <strong>{scanResult.data?.slot?.date} ({scanResult.data?.slot?.timeSlot})</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scanResult.status === 'already_used' && (
                <div style={{
                  background: '#fef2f2', border: '2px solid #fca5a5',
                  borderRadius: '12px', padding: '20px', marginBottom: '16px'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: '#fee2e2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 12px', color: '#dc2626'
                  }}>
                    <XCircle size={40} />
                  </div>
                  <h3 style={{ color: '#991b1b', margin: '0 0 6px', fontSize: '1.4rem' }}>
                    {scanResult.title}
                  </h3>
                  <p style={{ color: '#b91c1c', fontWeight: 600, margin: '0 0 16px' }}>
                    {scanResult.message}
                  </p>

                  <div style={{
                    background: '#ffffff', borderRadius: '8px', padding: '14px',
                    textAlign: 'left', border: '1px solid #fecaca', fontSize: '0.85rem'
                  }}>
                    <p style={{ margin: '4px 0' }}><strong>Reference:</strong> <code>{scanResult.details?.bookingReference}</code></p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Previously Checked In:</strong> {scanResult.details?.checkedInAt ? new Date(scanResult.details.checkedInAt).toLocaleTimeString() : 'Earlier today'}
                    </p>
                    <p style={{ margin: '4px 0' }}><strong>Checked In By:</strong> {scanResult.details?.checkedInBy || 'Staff Member'}</p>
                    <p style={{ margin: '4px 0', color: '#dc2626', fontWeight: 600 }}>
                      ⚠️ Duplicate entry disallowed. Please verify devotee identity.
                    </p>
                  </div>
                </div>
              )}

              {scanResult.status === 'error' && (
                <div style={{
                  background: '#fffbeb', border: '2px solid #fcd34d',
                  borderRadius: '12px', padding: '20px', marginBottom: '16px'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: '#fef3c7', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 12px', color: '#d97706'
                  }}>
                    <AlertTriangle size={40} />
                  </div>
                  <h3 style={{ color: '#92400e', margin: '0 0 6px', fontSize: '1.3rem' }}>
                    {scanResult.title}
                  </h3>
                  <p style={{ color: '#b45309', margin: '0 0 12px' }}>
                    {scanResult.message}
                  </p>
                </div>
              )}

              <button
                onClick={handleResetForNext}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600 }}
              >
                Scan Next Ticket
              </button>
            </div>
          ) : (
            /* SCANNER MODES */
            <div>
              {/* CAMERA MODE */}
              {activeMode === 'camera' && (
                <div>
                  <div 
                    id={scannerContainerId} 
                    style={{
                      width: '100%', minHeight: '280px', borderRadius: '12px',
                      overflow: 'hidden', background: '#000000'
                    }}
                  />
                  {cameraError ? (
                    <div style={{
                      marginTop: '12px', padding: '12px', background: '#fef2f2',
                      color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem'
                    }}>
                      {cameraError}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '12px' }}>
                      Position devotee's ticket QR code inside the frame to scan automatically.
                    </p>
                  )}
                </div>
              )}

              {/* FILE UPLOAD MODE */}
              {activeMode === 'upload' && (
                <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                  <div id="qr-temp-file-reader" style={{ display: 'none' }} />
                  <label style={{
                    display: 'block', border: '2px dashed #cbd5e1', borderRadius: '12px',
                    padding: '36px 20px', cursor: 'pointer', background: '#f8fafc'
                  }}>
                    <Upload size={40} style={{ color: '#3b82f6', margin: '0 auto 12px' }} />
                    <strong style={{ display: 'block', marginBottom: '6px', color: '#1e293b' }}>
                      Click to upload ticket screenshot or QR image
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Supports PNG, JPG, JPEG</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              )}

              {/* MANUAL INPUT MODE */}
              {activeMode === 'manual' && (
                <form onSubmit={(e) => { e.preventDefault(); handleProcessTicket(manualCode); }} style={{ padding: '10px 0' }}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Booking Reference or Ticket ID:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. DSE-AB12CD34"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.1rem', padding: '10px' }}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !manualCode.trim()}
                    style={{ width: '100%', padding: '12px', fontWeight: 600 }}
                  >
                    {loading ? 'Verifying Ticket...' : 'Verify & Check-In'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
