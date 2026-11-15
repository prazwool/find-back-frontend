import { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type Toast = { id: number; message: string; tone: 'success' | 'error' };
const ToastContext = createContext<((message: string, tone?: 'success' | 'error') => void) | null>(null);
let toastId = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function notify(message: string, tone: 'success' | 'error' = 'success') {
    const id = ++toastId;
    setToasts((items) => [...items, { id, message, tone }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4300);
  }
  return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" aria-live="polite">{toasts.map((t) => <div key={t.id} className={`toast toast--${t.tone}`}>
    {t.tone === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}<span>{t.message}</span>
    <button aria-label="Dismiss message" onClick={() => setToasts((items) => items.filter((x) => x.id !== t.id))}><X size={16} /></button>
  </div>)}</div></ToastContext.Provider>;
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
