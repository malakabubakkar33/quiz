'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, LogOut, Trash2, HelpCircle, X, Loader2 } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Prevent background scrolling while modal is open & listen for Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-[#FDF2F2] border-[#FECDCA] text-[#D92D20]',
      confirmBtn: 'bg-[#D92D20] hover:bg-[#B42318] text-white shadow-xs focus:ring-[#D92D20]/30',
      defaultIcon: <Trash2 className="w-6 h-6" />,
      badge: 'bg-[#FDF2F2] text-[#D92D20] border-[#FECDCA]',
      badgeText: 'Action Required',
    },
    warning: {
      iconBg: 'bg-[#FEF9E7] border-[#FDE68A] text-[#B45309]',
      confirmBtn: 'bg-[#14213D] hover:bg-[#0A1220] text-white shadow-xs focus:ring-[#14213D]/30',
      defaultIcon: <AlertTriangle className="w-6 h-6" />,
      badge: 'bg-[#FEF9E7] text-[#B45309] border-[#FDE68A]',
      badgeText: 'Confirmation',
    },
    primary: {
      iconBg: 'bg-[#EBF3FC] border-[#C8DEF7] text-[#1769E0]',
      confirmBtn: 'bg-[#1769E0] hover:bg-[#1257BD] text-white shadow-xs focus:ring-[#1769E0]/30',
      defaultIcon: <LogOut className="w-6 h-6" />,
      badge: 'bg-[#EBF3FC] text-[#1769E0] border-[#C8DEF7]',
      badgeText: 'Notice',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0A1220]/60 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#5B667A] hover:text-[#14213D] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Icon */}
        <div className="text-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-xs ${currentVariant.iconBg}`}
          >
            {icon || currentVariant.defaultIcon}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-center">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentVariant.badge}`}
              >
                {currentVariant.badgeText}
              </span>
            </div>
            <h3
              id="modal-title"
              className="text-lg sm:text-xl font-bold text-[#14213D] font-serif-title tracking-tight"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#5B667A] leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-1/2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#5B667A] hover:text-[#14213D] bg-white hover:bg-[#F7F8FA] border border-[#E5EAF0] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-1/2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${currentVariant.confirmBtn}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>{isLoading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
