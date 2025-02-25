import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  title: string;
  description: React.ReactNode;
  autoCloseDelay?: number;
}

export function AlertDialog({ 
  isOpen, 
  onClose, 
  status, 
  title, 
  description, 
  autoCloseDelay = 3000 
}: AlertDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoCloseDelay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]"
            role="alertdialog"
            aria-labelledby="alert-title"
            aria-describedby="alert-description"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-[90vw] max-w-md border border-gray-100 dark:border-gray-700">
              <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.2, 
                    type: "spring",
                    stiffness: 200
                  }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-xl ${
                      status === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    {status === 'success' ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                    )}
                  </motion.div>
                  <div>
                    <h3 
                      id="alert-title"
                      className={`text-lg font-semibold ${
                        status === 'success' 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {title}
                    </h3>
                    <p 
                      id="alert-description"
                      className="text-gray-600 dark:text-gray-300 mt-1 text-sm"
                    >
                      {description}
                    </p>
                  </div>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className={`p-1 rounded-lg transition-colors ${
                    status === 'success'
                      ? 'hover:bg-green-50 dark:hover:bg-green-900/20'
                      : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                className={`h-1 rounded-full ${
                  status === 'success' 
                    ? 'bg-green-500/20 dark:bg-green-500/40' 
                    : 'bg-red-500/20 dark:bg-red-500/40'
                }`}
              >
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                  className={`h-full rounded-full ${
                    status === 'success' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}
                />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 