import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#070a12] border-t border-white/10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
              <span className="text-lg font-black text-white font-heading">DiGi Campus</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              The premier all-in-one college event management, ticketing, QR check-in, and certification platform built for modern universities.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-slate-400 text-xs font-medium">
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Discover Campus Fests</li>
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Tech Workshops</li>
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Cultural Activities</li>
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Live Leaderboard</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">Support & Legal</h4>
            <ul className="space-y-2 text-slate-400 text-xs font-medium">
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Campus Activity Center</li>
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-sky-400 cursor-pointer transition-colors">OWASP Security Guidelines</li>
              <li className="hover:text-sky-400 cursor-pointer transition-colors">Contact Administration</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} DiGi Campus Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for College Fest & Event Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
