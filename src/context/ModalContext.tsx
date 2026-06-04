"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmationModal from '@/components/ConfirmationModal';

interface ModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

interface ModalContextType {
  confirm: (options: ModalOptions) => Promise<boolean>;
  showAlert: (options: Omit<ModalOptions, 'cancelLabel'>) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ModalOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ModalOptions) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const showAlert = useCallback((options: Omit<ModalOptions, 'cancelLabel'>) => {
    return new Promise<void>((resolve) => {
      setModalState({
        isOpen: true,
        options: { ...options, cancelLabel: "" }, // Empty cancel label for alerts
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState) {
      modalState.resolve(true);
      setModalState(null);
    }
  };

  const handleCancel = () => {
    if (modalState) {
      modalState.resolve(false);
      setModalState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, showAlert }}>
      {children}
      {modalState && (
        <ConfirmationModal
          isOpen={modalState.isOpen}
          title={modalState.options.title}
          message={modalState.options.message}
          confirmLabel={modalState.options.confirmLabel}
          cancelLabel={modalState.options.cancelLabel || undefined}
          type={modalState.options.type}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
