import React from 'react';
import { X, QrCode, CheckCircle2, Download } from 'lucide-react';
import type { Registration } from '../services/api';

interface TicketModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const event = registration.internshipId || registration.eventId;
  const ticketCode = registration.ticketCode;
  const qrCodeUrl = registration.qrCodeUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-slate-900">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Pass Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-left relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-black text-emerald-300 uppercase tracking-wider mb-2">
            <QrCode className="w-4 h-4" /> Task Verification Pass
          </div>
          <h3 className="text-xl font-black leading-tight line-clamp-2 font-heading">{event?.title || 'Internship Task'}</h3>
          <p className="text-xs text-white/80 mt-1 font-bold">{event?.company || 'Partner Firm'}</p>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-5">
          {/* QR Code Container */}
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
            <img
              src={qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketCode}`}
              alt="QR Verification Code"
              className="w-36 h-36 mx-auto rounded-lg bg-white p-1"
            />
            <p className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 mt-2 tracking-widest">{ticketCode}</p>
          </div>

          {/* Event Meta Details */}
          <div className="text-left space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Progress Rate:</span>
              <span className="font-black text-blue-600">{registration.progress || 35}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Logged Hours:</span>
              <span className="font-black text-slate-900 dark:text-white">{registration.hoursLogged || 0} hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Verification:</span>
              <span className="font-black text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-bold">
            Show this QR code to your company mentor for weekly task check-ins.
          </p>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all border border-blue-200 dark:border-blue-800"
          >
            <Download className="w-4 h-4" /> Download / Print Verification Pass
          </button>
        </div>
      </div>
    </div>
  );
};
