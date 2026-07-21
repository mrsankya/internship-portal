import React from 'react';
import { X, Award, Printer, Sparkles, ShieldCheck } from 'lucide-react';
import type { Registration } from '../services/api';

interface CertificateModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const event = registration.internshipId || registration.eventId;
  const user = registration.userId;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const certId = registration.certificateId || `CERT-INT-${registration.ticketCode || '982314'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-blue-600/30 overflow-hidden relative my-8 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-20 print:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificate Printable Body */}
        <div id="certificate-print-area" className="p-8 sm:p-12 text-center space-y-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-slate-50 relative">
          {/* Decorative Frame */}
          <div className="border-4 border-blue-800 p-6 sm:p-10 rounded-2xl relative">
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-blue-800" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-800" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-800" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-blue-800" />

            {/* Emblem Header */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center mx-auto mb-3 shadow-xl">
              <Award className="w-9 h-9 text-amber-300" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-blue-700 block">
              DiGi Campus • Industrial Internship & Placement Hub
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-serif tracking-tight mt-2">
              Certificate of Internship Completion
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-serif italic mt-4">
              This official credential hereby certifies that
            </p>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 border-b-2 border-blue-400/40 inline-block px-8 py-2 mt-2 font-serif">
              {user?.name || 'Intern Candidate'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mt-4 font-medium">
              has successfully fulfilled all industry training requirements, logged <strong className="text-blue-900 font-bold">{registration.hoursLogged || 80}+ practical hours</strong>, and demonstrated technical excellence in the domain of
            </p>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-heading">
              "{event?.title || 'Full-Stack Web Development Internship'}"
            </h3>

            <p className="text-xs font-bold text-slate-500 mt-1">
              Issued in Partnership with <span className="text-blue-800 font-extrabold">{event?.company || 'Partner Technology Firm'}</span>
            </p>

            {/* Seal & Signatures */}
            <div className="pt-8 mt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 items-center text-xs">
              <div className="text-left">
                <p className="font-black text-slate-900">Dr. Sarah Lin</p>
                <p className="text-[11px] text-slate-500 font-bold">Company Mentor Sign-Off</p>
              </div>

              <div className="hidden sm:block">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-800 flex flex-col items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-900">VERIFIED SEAL</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-slate-900">Mr. Sankya</p>
                <p className="text-[11px] text-slate-500 font-bold">Dean of Industrial Placement</p>
              </div>
            </div>

            {/* Cert ID & QR Verification Code Footer */}
            <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Verification Code: <strong>{certId}</strong></span>
              <span>Issued On: {issueDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Print Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Download / Print Official Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
