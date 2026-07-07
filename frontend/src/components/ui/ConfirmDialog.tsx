"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";

export type ConfirmVariant = "default" | "danger" | "hire";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDanger = variant === "danger";
  const isHire = variant === "hire";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={onCancel}
          />

          {/* Dialog — iOS-style sheet centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{
              boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* Icon */}
            <div className="flex justify-center pt-8 pb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isHire
                    ? "bg-green-50"
                    : isDanger
                    ? "bg-red-50"
                    : "bg-gray-100"
                }`}
              >
                {isHire ? (
                  <CheckCircle size={24} className="text-black" />
                ) : isDanger ? (
                  <AlertTriangle size={24} className="text-black" />
                ) : (
                  <AlertTriangle size={24} className="text-black" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>

            {/* Buttons — iOS-style stacked */}
            <div className="px-6 pb-6 pt-4 space-y-2.5">
              <button
                onClick={onConfirm}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  isHire
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : isDanger
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-900 hover:bg-black text-white"
                }`}
              >
                {confirmLabel || (isHire ? "Hire Candidate" : isDanger ? "Delete" : "Confirm")}
              </button>
              <button
                onClick={onCancel}
                className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {cancelLabel || "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
