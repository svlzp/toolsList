import { useState, useRef } from 'react';
import { GestureResponderEvent, Dimensions } from 'react-native';

interface ImageOffset {
  x: number;
  y: number;
}

export const useImageZoom = () => {
  const [imageZoom, setImageZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState<ImageOffset>({ x: 0, y: 0 });

  const lastZoom = useRef(1);
  const lastDistance = useRef(0);
  const lastTouchX = useRef(0);
  const lastTouchY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleImageTouchStart = (event: GestureResponderEvent) => {
    const touches = event.nativeEvent.touches;

    if (touches.length === 1) {
      touchStartX.current = touches[0].pageX;
      touchStartY.current = touches[0].pageY;
      lastTouchX.current = touches[0].pageX;
      lastTouchY.current = touches[0].pageY;
      lastZoom.current = imageZoom;
    } else if (touches.length === 2) {
     
      const distance = calculateDistance(
        touches[0].pageX,
        touches[0].pageY,
        touches[1].pageX,
        touches[1].pageY
      );
      lastDistance.current = distance;
      lastZoom.current = imageZoom;
    }
  };

  const handleImageTouchMove = (event: GestureResponderEvent) => {
    const touches = event.nativeEvent.touches;

    if (touches.length === 2) {
    
      const distance = calculateDistance(
        touches[0].pageX,
        touches[0].pageY,
        touches[1].pageX,
        touches[1].pageY
      );

      if (lastDistance.current > 0) {
        const scale = distance / lastDistance.current;
        const newZoom = Math.max(1, Math.min(lastZoom.current * scale, 4));
        setImageZoom(newZoom);
        lastZoom.current = newZoom; 
      }
      
      lastDistance.current = distance; 
    } else if (touches.length === 1 && imageZoom > 1) {
  
      const deltaX = touches[0].pageX - lastTouchX.current;
      const deltaY = touches[0].pageY - lastTouchY.current;

      lastTouchX.current = touches[0].pageX;
      lastTouchY.current = touches[0].pageY;

      const maxOffset = (Dimensions.get('window').width * (imageZoom - 1)) / 2;
      const maxOffsetY = (Dimensions.get('window').height * (imageZoom - 1)) / 2;

      setImageOffset(prev => ({
        x: Math.max(-maxOffset, Math.min(maxOffset, prev.x + deltaX)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y + deltaY)),
      }));
    }
  };

  const handleImageTouchEnd = () => {
    if (imageZoom <= 1) {
      resetZoom();
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(imageZoom + 0.5, 4);
    setImageZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(imageZoom - 0.5, 1);
    setImageZoom(newZoom);
  };

  const resetZoom = () => {
    setImageZoom(1);
    setImageOffset({ x: 0, y: 0 });
  };

  return {
    // State
    imageZoom,
    imageOffset,
    
    // Handlers
    handleImageTouchStart,
    handleImageTouchMove,
    handleImageTouchEnd,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
  };
};
