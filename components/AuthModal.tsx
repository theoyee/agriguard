import { motion } from 'motion/react';

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authError: string;
  googleLoading: boolean;
  handleGoogleLogin: () => void;
}

export default function AuthModal({
  showAuthModal,
  setShowAuthModal,
  authError,
  googleLoading,
  handleGoogleLogin,
}: AuthModalProps) {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative"
      >
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-semibold"
        >
          Close
        </button>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-slate-800">Sign in to AgriGuard</h3>
          <p className="text-sm text-slate-500">Use your Google account to access diagnostics history</p>
        </div>
        {authError && (
          <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-200/70 text-rose-800 text-sm">
            {authError}
          </div>
        )}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          type="button"
          className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">By signing in you agree to our Terms of Service.</p>
      </motion.div>
    </div>
  );
}