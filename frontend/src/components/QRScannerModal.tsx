import React, { useEffect, useState, useRef } from 'react';
import { X, Camera, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onCheckInSuccess }) => {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Web Audio success chime
  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log('Audio Context error', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setError('');
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onQrScanned,
        () => {} // Ignore scan failure frames
      );
    } catch (err: any) {
      console.warn('Camera error:', err);
      setError('Camera access unavailable or denied. Use manual ticket code entry below.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Stop camera error', err);
      }
    }
  };

  const onQrScanned = async (decodedText: string) => {
    if (loading) return;
    handleCheckIn(decodedText);
  };

  const handleCheckIn = async (code: string) => {
    if (!code) return;
    setError('');
    setLoading(true);

    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.pause();
      }

      const res = await api.scanQrTicket(code);
      playSuccessChime();
      setScanResult(res);
      if (onCheckInSuccess) onCheckInSuccess();
    } catch (err: any) {
      setError(err.message || 'Ticket verification failed');
      setTimeout(() => {
        if (html5QrCodeRef.current) {
          try { html5QrCodeRef.current.resume(); } catch (e) {}
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;
    handleCheckIn(manualCode);
  };

  const handleResetScan = () => {
    setScanResult(null);
    setError('');
    setManualCode('');
    if (html5QrCodeRef.current) {
      try { html5QrCodeRef.current.resume(); } catch (e) {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Close Header */}
        <div className="p-4 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <h3 className="font-black text-sm">Live Ticket Scanner & Check-in</h3>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-center">
          {error && (
            <div className="p-3 rounded-2xl bg-[#ffdad6] text-[#93000a] text-xs font-medium border border-[#ffb4ab] flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {scanResult ? (
            /* SUCCESS CARD */
            <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 shadow-xl space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Verified & Present
                </span>
                <h4 className="text-xl font-black text-[#191b23] mt-2">{scanResult.studentName}</h4>
                <p className="text-xs text-[#737686]">{scanResult.studentEmail}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#737686]">Event:</span>
                  <span className="font-bold text-[#191b23] line-clamp-1">{scanResult.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737686]">Department:</span>
                  <span className="font-bold text-[#004ac6]">{scanResult.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737686]">Student ID:</span>
                  <span className="font-bold font-mono text-[#191b23]">{scanResult.studentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737686]">Ticket Code:</span>
                  <span className="font-bold font-mono text-emerald-700">{scanResult.ticketCode}</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Official Participation Certificate Issued!
              </p>

              <button
                onClick={handleResetScan}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Scan Next Student Ticket
              </button>
            </div>
          ) : (
            /* CAMERA SCANNER VIEW */
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#004ac6] bg-black min-h-[260px] flex items-center justify-center shadow-lg">
                <div id="qr-reader-container" className="w-full h-full"></div>
                {loading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#2563eb]" />
                    <span className="text-xs font-bold">Verifying Ticket...</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-[#737686]">
                Point camera at the QR code on student's phone pass to check in instantly.
              </p>

              {/* Manual Ticket Code Fallback */}
              <div className="pt-3 border-t border-[#e1e2ed]">
                <form onSubmit={handleManualSubmit} className="space-y-2">
                  <label className="block text-xs font-bold text-[#191b23] text-left flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#004ac6]" /> Or Enter Ticket Pass Code Manually
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. REG-982314 or Registration ID"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs font-mono focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                    />
                    <button
                      type="submit"
                      disabled={loading || !manualCode}
                      className="px-4 py-2 rounded-xl bg-[#004ac6] text-white font-bold text-xs hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
