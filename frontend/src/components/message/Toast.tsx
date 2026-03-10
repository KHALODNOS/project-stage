import React, { useEffect, useState } from 'react';
import { TbX, TbCheck, TbAlertCircle, TbInfoCircle } from 'react-icons/tb';

type ToastProps = {
  message: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, description, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <TbCheck className="w-6 h-6" />;
      case 'error':
        return <TbAlertCircle className="w-6 h-6" />;
      case 'info':
        return <TbInfoCircle className="w-6 h-6" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-[#2b9875]';
      case 'error':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  return (
    <div className="flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs z-50 fixed top-14 right-4">
      <div className="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px]">
      <button
          onClick={onClose}
          className="text-gray-600 hover:bg-white/5 p-1 rounded-md transition-colors ease-linear"
        >
          <TbX className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <div>
            <p className="text-white text-right">{message}</p>
            {description && <p className="text-gray-500 text-right">{description}</p>}
          </div>
          <div className={`${getIconColor()} bg-white/5 backdrop-blur-xl p-1 rounded-lg my-auto`}>
            {getIcon()}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Toast;