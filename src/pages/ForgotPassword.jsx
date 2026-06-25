import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ForgotPassword({ onLoginClick }) {
  const { triggerPasswordReset, completePasswordReset } = useApp();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  
  const [step, setStep] = useState('request'); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await triggerPasswordReset(email);
      setSuccess(res.message);
      
      if (res.resetToken) {
        setToken(res.resetToken);
      }
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await completePasswordReset(token, newPassword);
      setSuccess(res.message);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Resetting password failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80svh] px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
        
        {}
        <button
          onClick={onLoginClick}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        {}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-amber-50 dark:bg-slate-700/50 rounded-2xl text-amber-600 dark:text-amber-400 mb-4">
            <Key className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            {step === 'request' && 'Forgot Password'}
            {step === 'reset' && 'Reset Password'}
            {step === 'done' && 'Password Updated!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
            {step === 'request' && 'Enter your email and we will send a password reset code.'}
            {step === 'reset' && 'Enter the reset code sent to your console/email.'}
            {step === 'done' && 'Your password has been successfully updated.'}
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 p-4 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/10 dark:text-rose-450 border border-rose-100 dark:border-rose-900/20 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
            {success}
          </div>
        )}

        {}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:transform active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Sending Code...' : 'Request Reset Code'}
            </button>
          </form>
        )}

        {}
        {step === 'reset' && (
          <form onSubmit={handleCompleteReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Reset Code (Token)
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                placeholder="Enter reset token"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                  placeholder="Min 6 characters"
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:transform active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {}
        {step === 'done' && (
          <button
            onClick={onLoginClick}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:transform active:scale-[0.98] transition-all text-sm"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}
