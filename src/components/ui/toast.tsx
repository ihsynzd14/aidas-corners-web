'use client';

import { useToast } from '@/hooks/use-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
            animate-in slide-in-from-right-full
            ${
              toast.variant === 'destructive'
                ? 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100'
                : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            }
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              {toast.title && (
                <h3 className="font-semibold mb-1">{toast.title}</h3>
              )}
              <p className="text-sm">{toast.description}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 