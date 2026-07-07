"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: {
    bg: "bg-white/95 dark:bg-gray-900/95",
    border: "border-green-400/30",
    icon: "text-black",
    text: "text-gray-900 dark:text-white",
    sub: "text-gray-500 dark:text-gray-400",
  },
  error: {
    bg: "bg-white/95 dark:bg-gray-900/95",
    border: "border-red-400/30",
    icon: "text-black",
    text: "text-gray-900 dark:text-white",
    sub: "text-gray-500 dark:text-gray-400",
  },
  info: {
    bg: "bg-white/95 dark:bg-gray-900/95",
    border: "border-blue-400/30",
    icon: "text-black",
    text: "text-gray-900 dark:text-white",
    sub: "text-gray-500 dark:text-gray-400",
  },
};

function ToastItemComponent({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const colors = COLORS[item.variant];
  const Icon = ICONS[item.variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl backdrop-blur-xl ${colors.bg} ${colors.border} min-w-[320px] max-w-[420px]`}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div className={`mt-0.5 shrink-0 ${colors.icon}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${colors.text}`}>
          {item.variant === "success" ? "Success" : item.variant === "error" ? "Error" : "Info"}
        </p>
        <p className={`text-xs mt-0.5 ${colors.sub}`}>{item.message}</p>
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItemComponent key={t.id} item={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
