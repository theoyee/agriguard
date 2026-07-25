import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';


interface ToastProps {
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

export default function Toast({ toast }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className={`fixed top-18 right-6 z-[999] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-sm ${toast.type === 'success'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
            : toast.type === 'error'
              ? 'bg-rose-50/90 border-rose-200 text-rose-800'
              : 'bg-slate-50/90 border-slate-200 text-slate-800'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <Info className="w-5 h-5 text-slate-500" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}