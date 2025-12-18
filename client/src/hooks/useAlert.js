import { useState, useCallback } from 'react';

export const useAlert = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    message: '',
    title: '',
    type: 'info',
    confirmText: ''
  });

  const alert = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        message: typeof options === 'string' ? options : options.message || 'Action completed',
        title: typeof options === 'string' ? '' : options.title || '',
        type: typeof options === 'string' ? 'info' : options.type || 'info',
        confirmText: typeof options === 'string' ? 'OK' : options.confirmText || 'OK'
      });
      setIsOpen(true);
      
      // Auto-resolve after closing
      setTimeout(() => resolve(true), 0);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    config,
    alert,
    handleClose
  };
};
