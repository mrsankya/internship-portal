import React, { useState, useEffect } from 'react';
import { X, Download, Printer, CheckCircle2, XCircle, Search, QrCode, Award, Percent } from 'lucide-react';
import { api } from '../services/api';
import type { InternshipItem, Registration } from '../services/api';
import { QRScannerModal } from './QRScannerModal';

interface ParticipantRosterModalProps {
  event: InternshipItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ParticipantRosterModal: React.FC<ParticipantRosterModalProps> = ({ event, isOpen, onClose }) => {
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const fetchRoster = async () => {
    if (!event) return;
    try {
      setLoading(true);
      const data = await api.getEventParticipants(event._id);
      setParticipants(data.participants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      fetchRoster();
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleAttendance = async (regId: string, attendanceStatus: 'Verified' | 'Present' | 'Absent', newProgress?: number) => {
    try {
      await api.updateAttendance(regId, attendanceStatus, undefined, newProgress);
      fetchRoster();
    } catch (err: any) {
      alert(err.message || 'Failed to update intern status');
    }
  };

  const filteredParticipants = participants.filter(p => {
    const name = p.userId?.name || '';
    const email = p.userId?.email || '';
    const studentId = p.userId?.studentId || '';
    const ticketCode = p.ticketCode || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || studentId.toLowerCase().includes(q) || ticketCode.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-slate-900">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60">
          <div>
            <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Intern Applications & Progress Roster</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">{event.title}</h2>
            <p className="text-xs text-slate-500 font-bold">{participants.length} Enrolled Interns • {event.company}</p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4" /> Live QR Scanner
            </button>
            <button
              onClick={() => api.exportParticipantsCSV(event.title, participants)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV / Excel
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search intern name, ID, or verification code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Verified / Active: <strong className="text-emerald-600">{participants.filter(p => p.attendanceStatus === 'Verified' || p.attendanceStatus === 'Present' || p.progress >= 50).length}</strong> / {participants.length}
          </span>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-bold">Loading intern roster...</div>
          ) : filteredParticipants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3 px-3">Intern Candidate</th>
                    <th className="py-3 px-3">Department & ID</th>
                    <th className="py-3 px-3">Verification Code</th>
                    <th className="py-3 px-3">Progress % & Hours</th>
                    <th className="py-3 px-3 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredParticipants.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.userId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={p.userId?.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <div>
                            <div>{p.userId?.name || 'Intern Candidate'}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{p.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div>{p.userId?.department || 'General'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.userId?.studentId}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {p.ticketCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[10px] font-black text-slate-900 dark:text-white">
                            <span>{p.progress || 35}%</span>
                            <span className="text-emerald-600">{p.hoursLogged || 0} hrs</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(p.progress || 35, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAttendance(p._id, 'Verified', Math.min(100, (p.progress || 35) + 20))}
                            title="Verify Milestone Check-in"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-colors border border-emerald-300 dark:border-emerald-800"
                          >
                            ✓ Verify Task
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 font-bold">No intern applications found.</div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onCheckInSuccess={() => fetchRoster()}
      />
    </div>
  );
};
