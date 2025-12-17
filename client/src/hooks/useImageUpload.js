import { useState, useRef } from 'react';

// Custom hook for image upload functionality
export const useImageUpload = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return {
    imageFile,
    imagePreview,
    fileInputRef,
    handleImageChange,
    handleRemoveImage,
    resetImage,
    setImagePreview
  };
};
