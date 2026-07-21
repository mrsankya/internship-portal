import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Lock, Mail, Building, Key, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [role, setRole] = useState<'intern' | 'company_mentor' | 'institution_admin'>('intern');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (authModalOpen && googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse
        });

        const btnDiv = document.getElementById('googleBtnContainer');
        if (btnDiv) {
          window.google.accounts.id.renderButton(btnDiv, {
            theme: 'outline',
            size: 'large',
            width: '320',
            text: 'continue_with'
          });
        }
      } catch (err) {
        console.error('Google ID initialize error', err);
      }
    }
  }, [authModalOpen, googleClientId]);

  if (!authModalOpen) return null;

  const handleGoogleResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);

      await api.loginWithGoogle({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        department: 'Computer Science & AI'
      });

      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, role, department });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setError('');
    setEmail('alex.rivera@digicampus.edu');
    setPassword('password123');
    setLoading(true);
    try {
      await login('alex.rivera@digicampus.edu', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo account error. Make sure backend server is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMentor = async () => {
    setError('');
    setEmail('sarah.lin@techcorp.com');
    setPassword('password123');
    setLoading(true);
    try {
      await login('sarah.lin@techcorp.com', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo account error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    setEmail('mr.sankya@digicampus.edu');
    setPassword('Mr.sankya@123');
    setLoading(true);
    try {
      await login('mr.sankya@digicampus.edu', 'Mr.sankya@123');
    } catch (err: any) {
      setError(err.message || 'Demo account error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-slate-900">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close Auth Modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Modal Header */}
          <div className="p-6 pb-4 bg-gradient-to-b from-blue-50 dark:from-slate-800 to-white dark:to-slate-900 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <Briefcase className="w-6 h-6 text-emerald-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              {mode === 'login' ? 'Welcome Back!' : 'Join Internship Hub'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {mode === 'login' ? 'Sign in to access your internships, check-ins & certificates' : 'Create an account to apply or manage internship positions'}
            </p>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-bold text-slate-900 dark:text-white">
            {error && (
              <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-medium border border-rose-300">
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div id="googleBtnContainer" className="flex justify-center min-h-[44px]"></div>
            </div>

            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="px-2 text-[10px] uppercase text-slate-400 font-bold">Or with Email</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-dept" className="block mb-1">Department / Division</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      id="auth-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                    >
                      <option value="Computer Science & AI">Computer Science & AI</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Telecom">Electronics & Telecom</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Data Science & Analytics">Data Science & Analytics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Account Role</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRole('intern')}
                      className={`py-2 px-2 text-[11px] font-black rounded-xl border transition-all ${
                        role === 'intern' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600' : 'border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      Intern
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('company_mentor')}
                      className={`py-2 px-2 text-[11px] font-black rounded-xl border transition-all ${
                        role === 'company_mentor' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600' : 'border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      Mentor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('institution_admin')}
                      className={`py-2 px-2 text-[11px] font-black rounded-xl border transition-all ${
                        role === 'institution_admin' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600' : 'border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="alex.rivera@digicampus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Key className="w-3.5 h-3.5 text-blue-600" /> Quick Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleDemoStudent}
                disabled={loading}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-black text-slate-900 dark:text-white hover:border-blue-600 transition-colors"
              >
                🎓 Intern Demo
              </button>
              <button
                type="button"
                onClick={handleDemoMentor}
                disabled={loading}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-black text-slate-900 dark:text-white hover:border-blue-600 transition-colors"
              >
                💼 Mentor Demo
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-black text-slate-900 dark:text-white hover:border-blue-600 transition-colors"
              >
                ⚡ Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
