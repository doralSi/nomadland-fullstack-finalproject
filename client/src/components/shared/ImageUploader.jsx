import React from 'react';
import './ImageUploader.css';

const ImageUploader = ({ 
  imagePreview, 
  fileInputRef, 
  onImageChange, 
  onRemoveImage,
  label = "Event Image"
}) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="image-input"
      />
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button
            type="button"
            onClick={onRemoveImage}
            className="remove-image-btn"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
