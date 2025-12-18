import React from 'react';
import './AlertDialog.css';

const AlertDialog = ({ isOpen, onClose, message, title, type = 'info', confirmText }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleConfirm();
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="alert-dialog-overlay" onClick={handleBackdropClick}>
      <div className={`alert-dialog alert-dialog-${type}`}>
        <div className="alert-dialog-icon">
          <span className="material-symbols-outlined">{getIcon()}</span>
        </div>
        
        <div className="alert-dialog-content">
          {title && <h3>{title}</h3>}
          <p>{message || 'Action completed'}</p>
        </div>
        
        <div className="alert-dialog-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
          >
            {confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
