import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message, title, confirmText, cancelText }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleBackdropClick}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>{title || 'Confirm Action'}</h3>
        </div>
        
        <div className="confirm-dialog-content">
          <p>{message || 'Are you sure you want to proceed?'}</p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            {cancelText || 'Cancel'}
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleConfirm}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
