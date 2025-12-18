import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    message: '',
    title: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {}
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        message: options.message || 'Are you sure you want to proceed?',
        title: options.title || 'Confirm Action',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          resolve(true);
        }
      });
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    config,
    confirm,
    handleClose,
    handleCancel
  };
};
