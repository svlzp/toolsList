import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Line, Circle, Path, Rect, Polyline, G, Text as SvgText } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

export interface DrawingPath {
  points: Array<{ x: number; y: number }>;
  type: 'pen' | 'line' | 'arrow' | 'circle' | 'rectangle';
  color: string;
  width: number;
}

interface ImageAnnotatorProps {
  imageUri: string;
  onSave: (annotatedImageUri: string) => void;
  onCancel: () => void;
}

type DrawingTool = 'pen' | 'line' | 'arrow' | 'circle' | 'rectangle' | 'eraser' | 'text';

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUri,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const svgRef = useRef<any>(null);
  const [imageSize, setImageSize] = useState({ 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height * 0.7 
  });
  const touchAreaRef = useRef<View>(null);
  const panResponderRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const isEditingExistingTextRef = useRef(false);
  const shouldAddNewTextRef = useRef(false);
  const hitTextIndexRef = useRef<number | null>(null);
  const textElementsRef = useRef<Array<{ x: number; y: number; text: string; color: string; size: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTextSize, setCurrentTextSize] = useState(20);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [textElements, setTextElements] = useState<Array<{ x: number; y: number; text: string; color: string; size: number }>>([]);
  
  
  useEffect(() => {
    textElementsRef.current = textElements;
  }, [textElements]);

  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
  const [draggingTextIndex, setDraggingTextIndex] = useState<number | null>(null);

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFFFFF', '#000000'];
  const tools: DrawingTool[] = ['pen', 'line', 'arrow', 'circle', 'rectangle', 'eraser', 'text'];


  const checkTextHit = (x: number, y: number): number | null => {
    const elements = textElementsRef.current;
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
    
      const textWidth = element.text.length * (element.size * 0.6);
      const textHeight = element.size;
      
      if (x >= element.x - 5 && x <= element.x + textWidth + 5 &&
          y >= element.y - textHeight - 5 && y <= element.y + 5) {
        return i;
      }
    }
    return null;
  };

  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        
        touchStartRef.current = { x: locationX, y: locationY, time: Date.now() };
        hasDraggedRef.current = false;
        isEditingExistingTextRef.current = false;
        shouldAddNewTextRef.current = false;
        hitTextIndexRef.current = null;
        

        if (currentTool === 'text') {
          const hitIndex = checkTextHit(locationX, locationY);
          if (hitIndex !== null) {
       
            hitTextIndexRef.current = hitIndex;
            isEditingExistingTextRef.current = true;
            setEditingTextIndex(hitIndex);
            return;
          } else {
            shouldAddNewTextRef.current = true;
            return;
          }
        }
        
        setIsDrawing(true);
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        
     
        if (touchStartRef.current) {
          const dx = Math.abs(locationX - touchStartRef.current.x);
          const dy = Math.abs(locationY - touchStartRef.current.y);
          
          if (dx > 5 || dy > 5) {
            hasDraggedRef.current = true;
          }
        }
        
        if (currentTool === 'text' && hitTextIndexRef.current !== null && hasDraggedRef.current) {
          const idx = hitTextIndexRef.current;
          const updated = [...textElementsRef.current];
          updated[idx] = {
            ...updated[idx],
            x: locationX,
            y: locationY,
          };
          setTextElements(updated);
          setDraggingTextIndex(idx);
          return;
        }
        
        // Рисование
        if (currentTool !== 'text') {
          setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
        }
      },
      onPanResponderRelease: () => {
        // Сценарий 1: Было перемещение текста — НЕ открываем модалку
        if (hasDraggedRef.current && hitTextIndexRef.current !== null && currentTool === 'text') {
          setDraggingTextIndex(null);
          setEditingTextIndex(null);
          hasDraggedRef.current = false;
          isEditingExistingTextRef.current = false;
          shouldAddNewTextRef.current = false;
          hitTextIndexRef.current = null;
          touchStartRef.current = null;
          return;
        }
        
     
        if (currentTool === 'text' && isEditingExistingTextRef.current && !hasDraggedRef.current && hitTextIndexRef.current !== null) {
          const idx = hitTextIndexRef.current;
          const element = textElementsRef.current[idx];
          if (element) {
            setTextInput(element.text);
            setCurrentTextSize(element.size);
            setCurrentColor(element.color);
            setEditingTextIndex(idx);
          }
          setShowTextInput(true);
          hasDraggedRef.current = false;
          isEditingExistingTextRef.current = false;
          shouldAddNewTextRef.current = false;
          hitTextIndexRef.current = null;
          touchStartRef.current = null;
          return;
        }
        
       
        if (currentTool === 'text' && shouldAddNewTextRef.current && !hasDraggedRef.current && touchStartRef.current) {
          setTextPosition({ x: touchStartRef.current.x, y: touchStartRef.current.y });
          setShowTextInput(true);
          hasDraggedRef.current = false;
          isEditingExistingTextRef.current = false;
          shouldAddNewTextRef.current = false;
          hitTextIndexRef.current = null;
          touchStartRef.current = null;
          return;
        }
        
        // Сценарий 4: Завершение рисования
        if (currentPath.length > 0) {
          setPaths(prev => [
            ...prev,
            {
              points: currentPath,
              type: currentTool as 'pen' | 'line' | 'arrow' | 'circle' | 'rectangle',
              color: currentTool === 'eraser' ? 'transparent' : currentColor,
              width: currentWidth,
            },
          ]);
          setCurrentPath([]);
        }
        
      
        hasDraggedRef.current = false;
        isEditingExistingTextRef.current = false;
        shouldAddNewTextRef.current = false;
        touchStartRef.current = null;
        setIsDrawing(false);
      },
    });
    
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, [currentTool, currentColor, currentWidth, currentPath]);

  const handleImageLoad = (e: any) => {
    const width = e.nativeEvent.source.width;
    const height = e.nativeEvent.source.height;
    console.log('📷 Image loaded with size:', width, 'x', height);
    
  
    const windowWidth = Dimensions.get('window').width;
    const maxHeight = Dimensions.get('window').height * 0.7;
    
    let displayWidth = windowWidth;
    let displayHeight = (height / width) * windowWidth;
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = (width / height) * maxHeight;
    }
    
    setImageSize({
      width: displayWidth,
      height: displayHeight,
    });
  };

  const undoLastPath = () => {
    setPaths(paths.slice(0, -1));
  };
  const clearAll = () => {
    setPaths([]);
    setTextElements([]);
    handleCancelText();
  };

  const handleAddText = (x: number, y: number) => {
    setTextPosition({ x, y });
    setShowTextInput(true);
  };

  const handleConfirmText = () => {
    if (textInput.trim() && textPosition) {
      setTextElements([...textElements, {
        x: textPosition.x / canvasScale,
        y: textPosition.y / canvasScale,
        text: textInput,
        color: currentColor,
        size: currentTextSize,
      }]);
      setTextInput('');
      setTextPosition(null);
      setShowTextInput(false);
      setEditingTextIndex(null);
    }
  };

  const handleCancelText = () => {
    setTextInput('');
    setTextPosition(null);
    setShowTextInput(false);
    setEditingTextIndex(null);
    setDraggingTextIndex(null);
  };

  const handleEditText = (index: number) => {
    const element = textElements[index];
    setEditingTextIndex(index);
    setTextInput(element.text);
    setCurrentTextSize(element.size);
    setCurrentColor(element.color);
    setShowTextInput(true);
  };

  const handleUpdateText = () => {
    if (editingTextIndex !== null && textInput.trim()) {
      const updated = [...textElements];
      updated[editingTextIndex] = {
        ...updated[editingTextIndex],
        text: textInput,
        size: currentTextSize,
        color: currentColor,
      };
      setTextElements(updated);
      setEditingTextIndex(null);
      setDraggingTextIndex(null);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const handleDeleteText = (index: number) => {
    setTextElements(textElements.filter((_, i) => i !== index));
    setEditingTextIndex(null);
    setDraggingTextIndex(null);
    setShowTextInput(false);
  };


  const handleSaveAnnotated = async () => {
    setIsSaving(true);
    try {
      if (canvasRef.current) {
        const snapshot = await canvasRef.current.capture();
        console.log('📸 Snapshot taken:', snapshot);
        onSave(snapshot);
      } else {
        console.warn('⚠️ Canvas ref not available');
        onSave(imageUri);
      }
    } catch (error) {
      console.error('❌ Ошибка при экспорте изображения:', error);
      onSave(imageUri);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPath = (path: DrawingPath, index: number) => {
    const { points, type, color, width } = path;

    if (points.length < 2) return null;

    switch (type) {
      case 'pen':
        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        return (
          <Path
            key={index}
            d={pathData}
            stroke={color}
            strokeWidth={width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case 'line':
        return (
          <Line
            key={index}
            x1={points[0].x}
            y1={points[0].y}
            x2={points[points.length - 1].x}
            y2={points[points.length - 1].y}
            stroke={color}
            strokeWidth={width}
          />
        );

      case 'arrow':
        const startX = points[0].x;
        const startY = points[0].y;
        const endX = points[points.length - 1].x;
        const endY = points[points.length - 1].y;
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowSize = 15;

        return (
          <G key={index}>
            <Line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={width}
            />
    
            <Line
              x1={endX}
              y1={endY}
              x2={endX - arrowSize * Math.cos(angle - Math.PI / 6)}
              y2={endY - arrowSize * Math.sin(angle - Math.PI / 6)}
              stroke={color}
              strokeWidth={width}
            />
           
            <Line
              x1={endX}
              y1={endY}
              x2={endX - arrowSize * Math.cos(angle + Math.PI / 6)}
              y2={endY - arrowSize * Math.sin(angle + Math.PI / 6)}
              stroke={color}
              strokeWidth={width}
            />
          </G>
        );

      case 'circle':
        const centerX = (points[0].x + points[points.length - 1].x) / 2;
        const centerY = (points[0].y + points[points.length - 1].y) / 2;
        const radius = Math.hypot(
          points[points.length - 1].x - points[0].x,
          points[points.length - 1].y - points[0].y
        ) / 2;
        return (
          <Circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={color}
            strokeWidth={width}
            fill="none"
          />
        );

      case 'rectangle':
        const x = Math.min(points[0].x, points[points.length - 1].x);
        const y = Math.min(points[0].y, points[points.length - 1].y);
        const w = Math.abs(points[points.length - 1].x - points[0].x);
        const h = Math.abs(points[points.length - 1].y - points[0].y);
        return (
          <Rect
            key={index}
            x={x}
            y={y}
            width={w}
            height={h}
            stroke={color}
            strokeWidth={width}
            fill="none"
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('imageEditor.annotate')}</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ transform: [{ scale: canvasScale }], transformOrigin: '0 0' }}>
          <ViewShot ref={canvasRef} options={{ format: 'jpg', quality: 0.9 }}>
            <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.5, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <View
                ref={touchAreaRef}
                {...panResponderRef.current?.panHandlers}
                style={{ width: imageSize.width, height: imageSize.height, position: 'relative', justifyContent: 'center', alignItems: 'center' }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: imageSize.width, height: imageSize.height }}
                  onLoad={handleImageLoad}
                  resizeMode="contain"
                />
                <Svg
                style={{ position: 'absolute', top: 0, left: 0 }}
                width={imageSize.width}
                height={imageSize.height}
                ref={svgRef}
              >
                {paths.map((path, index) => renderPath(path, index))}
                {textElements.map((element, index) => (
                  <G key={`text-${index}`}>
                    <Rect
                      x={element.x - 5}
                      y={element.y - element.size - 5}
                      width={element.text.length * (element.size * 0.6) + 10}
                      height={element.size + 10}
                      fill={editingTextIndex === index ? 'rgba(100, 150, 255, 0.2)' : 'transparent'}
                      strokeWidth={editingTextIndex === index ? 2 : 0}
                      stroke={editingTextIndex === index ? '#6496FF' : 'transparent'}
                    />
                    <SvgText x={element.x} y={element.y} fontSize={element.size} fill={element.color} fontWeight="bold">
                      {element.text}
                    </SvgText>
                  </G>
                ))}
              </Svg>
            </View>
            </View>
          </ViewShot>
        </View>

        <View>
          <ScrollView style={styles.toolsContainer} horizontal showsHorizontalScrollIndicator={false}>
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool}
                style={[styles.toolButton, currentTool === tool && styles.activeToolButton]}
                onPress={() => setCurrentTool(tool)}
              >
                <Text style={styles.toolButtonText}>
                  {tool === 'pen' && '✏️'}
                  {tool === 'line' && '—'}
                  {tool === 'arrow' && '→'}
                  {tool === 'circle' && '◯'}
                  {tool === 'rectangle' && '▭'}
                  {tool === 'eraser' && '🗑️'}
                  {tool === 'text' && '📝'}
                </Text>
                <Text style={styles.toolLabel}>{t(`imageEditor.${tool}`)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {(currentTool !== 'eraser' && currentTool !== 'text') && (
            <View style={styles.colorsContainer}>
              <Text style={styles.label}>{t('imageEditor.color')}:</Text>
              <ScrollView style={styles.colors} horizontal showsHorizontalScrollIndicator={false}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      currentColor === color && styles.activeColorButton,
                    ]}
                    onPress={() => setCurrentColor(color)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {currentTool === 'text' && (
            <View style={styles.colorsContainer}>
              <Text style={styles.label}>{t('imageEditor.color')}:</Text>
              <ScrollView style={styles.colors} horizontal showsHorizontalScrollIndicator={false}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      currentColor === color && styles.activeColorButton,
                    ]}
                    onPress={() => setCurrentColor(color)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {(currentTool !== 'eraser' && currentTool !== 'text') && (
            <View style={styles.widthContainer}>
              <Text style={styles.label}>{t('imageEditor.lineWidth')}: {currentWidth}px</Text>
              <View style={styles.widthOptions}>
                {[1, 2, 3, 5, 8].map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[styles.widthButton, currentWidth === w && styles.activeWidthButton]}
                    onPress={() => setCurrentWidth(w)}
                  >
                    <View
                      style={{
                        width: w * 2,
                        height: w * 2,
                        borderRadius: w,
                        backgroundColor: '#007AFF',
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {currentTool === 'text' && (
            <View style={styles.widthContainer}>
              <Text style={styles.label}>Размер текста: {currentTextSize}px</Text>
              <View style={styles.widthOptions}>
                {[12, 16, 20, 28, 36].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.widthButton, currentTextSize === size && styles.activeWidthButton]}
                    onPress={() => setCurrentTextSize(size)}
                  >
                    <Text style={{ fontSize: 12, color: '#fff' }}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.zoomContainer}>
            <Text style={styles.label}>Масштаб: {Math.round(canvasScale * 100)}%</Text>
            <View style={styles.zoomButtons}>
              <TouchableOpacity 
                style={styles.zoomBtn} 
                onPress={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))}
              >
                <Text style={styles.zoomBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.zoomBtn} 
                onPress={() => setCanvasScale(1)}
              >
                <Text style={styles.zoomBtnText}>100%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.zoomBtn} 
                onPress={() => setCanvasScale(Math.min(3, canvasScale + 0.1))}
              >
                <Text style={styles.zoomBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={undoLastPath}>
              <Text style={styles.buttonText}>{t('imageEditor.undo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={clearAll}>
              <Text style={styles.buttonText}>{t('imageEditor.clear')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleSaveAnnotated}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('common.save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showTextInput}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelText}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.textInputModal}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.textInputLabel}>{editingTextIndex !== null ? 'Редактирование текста:' : 'Введите текст:'}</Text>
                <TextInput
                  style={styles.textInputField}
                  placeholder="Введите числа или текст..."
                  placeholderTextColor="#999"
                  value={textInput}
                  onChangeText={setTextInput}
                  autoFocus={true}
                  keyboardType="default"
                  multiline={false}
                />
                
                {editingTextIndex !== null && (
                  <>
                    <Text style={styles.textInputLabel}>Размер шрифта:</Text>
                    <View style={styles.textSizeRow}>
                      {[12, 16, 20, 28, 36].map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={[styles.sizeButton, currentTextSize === size && styles.activeSizeButton]}
                          onPress={() => setCurrentTextSize(size)}
                        >
                          <Text style={styles.sizeButtonText}>{size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.textInputLabel}>Цвет:</Text>
                    <View style={styles.colorRow}>
                      {['#000000', '#FF0000', '#00AA00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[styles.colorButton, { backgroundColor: color }, currentColor === color && styles.activeColorButton]}
                          onPress={() => setCurrentColor(color)}
                        />
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.textInputButtons}>
                  {editingTextIndex !== null && (
                    <TouchableOpacity 
                      style={[styles.textModalButton, styles.deleteButton]}
                      onPress={() => {
                        handleDeleteText(editingTextIndex);
                        handleCancelText();
                      }}
                    >
                      <Text style={styles.buttonText}>Удалить</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.textModalButton, styles.cancelButton]}
                    onPress={handleCancelText}
                  >
                    <Text style={styles.buttonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.textModalButton, styles.confirmButton]}
                    onPress={editingTextIndex !== null ? handleUpdateText : handleConfirmText}
                  >
                    <Text style={styles.buttonText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    fontSize: 24,
    color: '#fff',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  touchArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  toolsContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 10,
    minHeight: 80,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  activeToolButton: {
    backgroundColor: '#007AFF',
  },
  toolButtonText: {
    fontSize: 20,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 10,
    color: '#fff',
  },
  colorsContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  colors: {
    marginTop: 8,
  },
  label: {
    color: '#fff',
    fontSize: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorButton: {
    borderColor: '#fff',
  },
  widthContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  widthOptions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  widthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  activeWidthButton: {
    backgroundColor: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  zoomContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  zoomButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  zoomBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  zoomBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  textInputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInputField: {
    backgroundColor: '#333',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  textInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  textModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  textSizeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  activeSizeButton: {
    backgroundColor: '#007AFF',
  },
  sizeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
});

