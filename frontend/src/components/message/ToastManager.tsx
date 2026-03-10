import React, { useState } from 'react';
import Toast from './Toast';

export type ToastData = {
  id: number;
  message: string;
  description?: string;
  type: 'success' | 'error' | 'info';
};

type ToastManagerProps = {
  children: React.ReactNode;
};

export const ToastContext = React.createContext<{
  addToast: (message: string, type: 'success' | 'error' | 'info', description?: string) => void;
} | null>(null);

export const ToastManager: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info', description?: string) => {
    const newToast: ToastData = {
      id: Date.now(),
      message,
      description,
      type,
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            description={toast.description}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};