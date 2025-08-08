import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import HomeIcon from '../assetsTablet/HomeIcon';
import LogoutIcon from '../assetsTablet/LogoutIcon';

type ButtonType = 'blue'  | 'text' | 'green';

interface PredefinedButtonProps {
  type: ButtonType; // тип кнопки (blue, green, text)
  label: string; // текст на кнопке
  onPress: () => void; // обработчик нажатия
  width?: number; // ширина кнопки
  height?: number; // высота кнопки
  disabled?: boolean; // флаг активности кнопки
  showArrow?: boolean; // флаг отображения стрелки
  arrowDirection?: 'left' | 'right'; // направление стрелки
  textColor?: string; // цвет текста
  showHomeIcon?: boolean; // флаг отображения иконки дома
  showLogoutIcon?: boolean; // флаг отображения иконки выхода
  borderColor?: string;  // цвет рамки
  borderRadius?: number; //  для радиуса
}

export const PredefinedButton: React.FC<PredefinedButtonProps> = ({
  type,
  label,
  onPress,
  width,
  height,
  disabled = false,
  showArrow = false,
  arrowDirection = 'right',
  textColor,
  showHomeIcon = false,
  showLogoutIcon = false,
  borderColor = '#fff',
  borderRadius = 24, 
}) => {
  const getStylesByType = (): {
    containerStyle: ViewStyle;
    textStyle: TextStyle;
  } => {
    switch (type) {
      case 'blue':
        return {
          containerStyle: {
            backgroundColor: disabled ? '#a0c4ff' : '#3A55F8',
          },
          textStyle: { color: '#fff' },
        };
      case 'green':
        return {
          containerStyle: {
            backgroundColor: disabled ? '#9EE59E' : '#3DCC3D',
          },
          textStyle: { color: '#fff' },
        };
      case 'text':
      default:
        return {
          containerStyle: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: borderColor,
          },
          textStyle: {
            color: textColor || (disabled ? '#a1a1aa' : '#3b82f6'),
          },
        };
    }
  };

  const { containerStyle, textStyle } = getStylesByType();

  const sizeStyles: ViewStyle = {};
  if (width) sizeStyles.width = width;
  if (height) sizeStyles.height = height;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.commonContainer,
        containerStyle,
        sizeStyles,
        disabled && styles.disabledOpacity,
        { borderRadius }, 
      ]}
    >
      <View style={styles.contentContainer}>
        {showHomeIcon && <HomeIcon width={20} height={20} color={textStyle.color as string | undefined} />}
        {showLogoutIcon && <LogoutIcon width={20} height={20} color={textStyle.color as string | undefined} />}
        <Text style={[styles.commonText, textStyle]}>
          {arrowDirection === 'left' && showArrow && '← '}
          {label}
          {arrowDirection === 'right' && showArrow && ' →'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  commonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  commonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disabledOpacity: {
    opacity: 0.7,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
