import React, { useEffect, useState } from 'react';
import { X, Trophy, Crown, Flame, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../services/api';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [topStudents, setTopStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard();
      setTopStudents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-lg">
              <Trophy className="w-7 h-7 text-yellow-100 fill-yellow-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">Campus XP Leaderboard</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-wider">
                  Top Achievers
                </span>
              </div>
              <p className="text-xs text-yellow-100 mt-0.5">Earn XP points & badges by attending tech workshops, fests, & hackathons!</p>
            </div>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#737686]">Loading campus leaderboard...</div>
          ) : topStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737686]">No leaderboard data yet. Register for events to earn XP!</div>
          ) : (
            <>
              {/* TOP 3 PODIUM */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* 2nd Place */}
                {topStudents[1] && (
                  <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl border-2 border-gray-300 shadow-sm flex flex-col items-center justify-between">
                    <div className="relative">
                      <img src={topStudents[1].avatar} alt={topStudents[1].name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-400" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-400 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#191b23] mt-2 line-clamp-1">{topStudents[1].name}</h4>
                    <p className="text-[10px] text-gray-600 font-bold mt-0.5">{topStudents[1].xpPoints || 150} XP</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full mt-1">Silver Achiever</span>
                  </div>
                )}

                {/* 1st Place Gold */}
                {topStudents[0] && (
                  <div className="bg-gradient-to-b from-amber-50 to-white p-4 rounded-2xl border-2 border-amber-400 shadow-md flex flex-col items-center justify-between scale-105 relative">
                    <Crown className="w-5 h-5 text-amber-500 fill-amber-400 absolute -top-3" />
                    <div className="relative">
                      <img src={topStudents[0].avatar} alt={topStudents[0].name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md" />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">1</span>
                    </div>
                    <h4 className="text-xs font-black text-[#191b23] mt-2 line-clamp-1">{topStudents[0].name}</h4>
                    <p className="text-xs text-amber-600 font-black mt-0.5">{topStudents[0].xpPoints || 250} XP</p>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Gold Champion
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {topStudents[2] && (
                  <div className="bg-gradient-to-b from-amber-900/5 to-white p-4 rounded-2xl border-2 border-amber-700/30 shadow-sm flex flex-col items-center justify-between">
                    <div className="relative">
                      <img src={topStudents[2].avatar} alt={topStudents[2].name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-700/50" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-800 text-white text-[10px] font-black flex items-center justify-center">3</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#191b23] mt-2 line-clamp-1">{topStudents[2].name}</h4>
                    <p className="text-[10px] text-amber-800 font-bold mt-0.5">{topStudents[2].xpPoints || 100} XP</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full mt-1">Bronze Achiever</span>
                  </div>
                )}
              </div>

              {/* RANKED LIST TABLE */}
              <div className="bg-white rounded-2xl border border-[#e1e2ed] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#faf8ff] border-b border-[#e1e2ed] text-[#737686] font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4">Badges & Badges</th>
                      <th className="py-2.5 px-4 text-right">XP Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f3fe]">
                    {topStudents.map((st, index) => (
                      <tr key={st._id || st.id} className="hover:bg-[#f3f3fe]/50 transition-colors">
                        <td className="py-3 px-4 font-black text-[#191b23]">
                          {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#191b23]">
                          <div className="flex items-center gap-2.5">
                            <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover border" />
                            <div>
                              <div>{st.name}</div>
                              <span className="text-[9px] text-[#737686] font-normal block">Level {st.level || 1} Student</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#434655]">{st.department}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {st.badges && st.badges.length > 0 ? (
                              st.badges.map((b: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#eeefff] text-[#004ac6]">
                                  {b}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400">⚡ Campus Member</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-600">
                          <span className="flex items-center justify-end gap-1">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {st.xpPoints || 150} XP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
