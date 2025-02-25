'use client';

import { useState, useCallback } from 'react';

export interface ToastProps {
  id: string;
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const TOAST_REMOVE_DELAY = 5000;

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = TOAST_REMOVE_DELAY }: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastProps = {
      id,
      title,
      description,
      variant,
      duration,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);

    return {
      id,
      dismiss: () => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)),
      update: (props: Partial<ToastProps>) =>
        setToasts((prevToasts) =>
          prevToasts.map((toast) =>
            toast.id === id ? { ...toast, ...props } : toast
          )
        ),
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toast,
    toasts,
    removeToast,
  };
} 