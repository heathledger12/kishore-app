import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccessNotification?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccessNotification
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [providerDisabledNotice, setProviderDisabledNotice] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const getFriendlyErrorMessage = (err: unknown): string => {
    if (!(err instanceof Error)) return 'Authentication failed. Please try again.';
    const msg = err.message || '';
    const errObj = err as { code?: string };
    const code = errObj.code || '';

    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      setProviderDisabledNotice(true);
      return 'Email/Password sign-in is not yet enabled in the Firebase Console for this project. You can enable it under Authentication > Sign-in method, or sign in instantly with Google below.';
    }
    if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
      return 'An account with this email address already exists. Please sign in or reset your password.';
    }
    if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
      return 'The email address format is invalid. Please check for typos.';
    }
    if (code === 'auth/weak-password' || msg.includes('weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      msg.includes('user-not-found') ||
      msg.includes('wrong-password') ||
      msg.includes('invalid-credential')
    ) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
      return 'Too many failed login attempts. Please wait a few moments or reset your password.';
    }
    if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
      return 'Sign-in window was closed before completing.';
    }
    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    return msg.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)\.?/, '').trim() || 'Authentication failed.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setProviderDisabledNotice(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await resetPassword(cleanEmail);
        setResetSent(true);
      } catch (err: unknown) {
        setErrorMsg(getFriendlyErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim() || displayName.trim().length < 2) {
        setErrorMsg('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password confirmation.');
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await loginWithEmail(cleanEmail, password);
        if (onSuccessNotification) onSuccessNotification('Welcome back! You are now signed in.');
      } else {
        await registerWithEmail(cleanEmail, password, displayName.trim());
        if (onSuccessNotification) onSuccessNotification('Account created successfully! Welcome to Kishore Opinion.');
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setProviderDisabledNotice(false);
    try {
      setLoading(true);
      await loginWithGoogle();
      if (onSuccessNotification) onSuccessNotification('Successfully signed in with Google!');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 relative border border-white/15 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient circle in background */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25 mb-3">
            <div className="w-full h-full bg-[#080D24] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign in to Kishore Opinion'}
            {mode === 'register' && 'Create your Account'}
            {mode === 'forgot' && 'Reset your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Enter your credentials to access your opinion dashboard'}
            {mode === 'register' && 'Join the community and publish your perspectives'}
            {mode === 'forgot' && 'We will send a secure password reset link to your email'}
          </p>
        </div>

        {/* Auth Mode Toggle Pill (Login vs Register) */}
        {mode !== 'forgot' && (
          <div className="flex p-1 rounded-xl bg-slate-900/80 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Provider Disabled Notice & Action */}
        {providerDisabledNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs mb-4 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>How to Enable Email/Password</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Google Login is already active for this project. To also allow custom email/password registration:
            </p>
            <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1 pl-1">
              <li>Open your Firebase Console project <span className="font-mono text-cyan-300">seismic-post-5w2pc</span></li>
              <li>Go to <strong className="text-white">Authentication → Sign-in method</strong></li>
              <li>Click <strong className="text-white">Email/Password</strong> and toggle to <strong className="text-emerald-400">Enable</strong></li>
            </ol>
            <div className="pt-1 flex flex-col gap-2">
              <a
                href="https://console.firebase.google.com/project/seismic-post-5w2pc/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="text-center py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold transition-colors"
              >
                Open Firebase Authentication Providers ↗
              </a>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Or Continue Instantly with Google</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Reset Email Sent Confirmation */}
        {mode === 'forgot' && resetSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-300 mt-2">
              If an account exists with <span className="text-cyan-300 font-medium">{email}</span>, you will receive password reset instructions shortly.
            </p>
            <button
              onClick={() => {
                setMode('login');
                setResetSent(false);
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Only in Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Kishore Kumar"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {/* Password Field (for Login and Register) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg('');
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Only in Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Password Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-cyan-300 mt-2"
              >
                Back to Sign In
              </button>
            )}

            {/* Divider and Google Sign-in */}
            {mode !== 'forgot' && (
              <>
                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-full border-t border-white/10" />
                  <span className="absolute bg-[#0b102c] px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Or continue with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.9 6.3C.7 8.7 0 11.3 0 14s.7 5.3 1.9 7.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Google Account</span>
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
