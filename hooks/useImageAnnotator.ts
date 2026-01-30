import { useState } from 'react';
import { pickImageFromGallery, takePhoto } from '../utils/imageUtils';

export const useImageAnnotator = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showAnnotator, setShowAnnotator] = useState(false);

  const openGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      setImageUri(uri);
      setShowAnnotator(true);
    }
  };

  const openCamera = async () => {
    const uri = await takePhoto();
    if (uri) {
      setImageUri(uri);
      setShowAnnotator(true);
    }
  };

  const handleSave = (annotatedUri: string): string => {
 
    setShowAnnotator(false);
    return annotatedUri;
  };

  const handleCancel = () => {
    setShowAnnotator(false);
    setImageUri(null);
  };

  return {
    imageUri,
    showAnnotator,
    openGallery,
    openCamera,
    handleSave,
    handleCancel,
  };
};
