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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Line, Circle, Path, Rect, Polyline, G } from 'react-native-svg';

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

type DrawingTool = 'pen' | 'line' | 'arrow' | 'circle' | 'rectangle' | 'eraser';

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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const touchAreaRef = useRef<View>(null);
  const panResponderRef = useRef<any>(null);

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFFFFF', '#000000'];
  const tools: DrawingTool[] = ['pen', 'line', 'arrow', 'circle', 'rectangle', 'eraser'];


  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        setIsDrawing(true);
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
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
        setIsDrawing(false);
      },
    });
  }, [currentTool, currentColor, currentWidth, currentPath]);

  const handleImageLoad = (e: any) => {
    setImageSize({
      width: e.nativeEvent.source.width,
      height: e.nativeEvent.source.height,
    });
  };

  const undoLastPath = () => {
    setPaths(paths.slice(0, -1));
  };

  const clearAll = () => {
    setPaths([]);
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

  
      <View style={styles.canvasContainer}>
        <View
          ref={touchAreaRef}
          {...panResponderRef.current?.panHandlers}
          style={styles.touchArea}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            onLoad={handleImageLoad}
            resizeMode="contain"
          />
          <Svg
            style={styles.svg}
            width={imageSize.width || '100%'}
            height={imageSize.height || '100%'}
            ref={svgRef}
          >
            {paths.map((path, index) => renderPath(path, index))}
          </Svg>
        </View>
      </View>

     
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
            </Text>
            <Text style={styles.toolLabel}>{t(`imageEditor.${tool}`)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

    
      {currentTool !== 'eraser' && (
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

      {currentTool !== 'eraser' && (
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


      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={undoLastPath}>
          <Text style={styles.buttonText}>{t('imageEditor.undo')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={clearAll}>
          <Text style={styles.buttonText}>{t('imageEditor.clear')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => onSave(imageUri)}>
          <Text style={styles.buttonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
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
    maxHeight: 80,
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
});
