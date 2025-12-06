import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
  KeyboardTypeOptions,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PredefinedInputProps {
  label?: string;             // "Имя", "Фамилия", "Телефон" и т.п.
  placeholder?: string;       // Подсказка внутри поля
  value?: string;             // Текущее значение поля
  onChangeText?: (text: string) => void; // Колбэк при вводе
  isPhone?: boolean;          // Если true, используем phone-pad и только цифры
  multiline?: boolean;        // Если true, делаем многострочное поле
  containerStyle?: ViewStyle; // Переопределить стили контейнера
  inputStyle?: TextStyle;     // Переопределить стили TextInput
  showClearButton?: boolean;  // Показывать ли кнопку "очистить"
  isPassword?: boolean;       // Если true, делаем поле пароля
  validationPassed?: boolean; // Если true, показываем зелёную галочку
  hasError?: boolean;         // Если true, показываем красный восклицательный знак
  isDropdown?: boolean;       // Если true — рендерим выпадающий список вместо TextInput
  options?: Array<{ id: number; name: string; address: string }>; // список магазинов
  onBlur?: () => void;        // нужен для валидации
  errorMessage?: string;      // текст ошибки
  textArea?: boolean;         // default false, если true, то поле будет textarea
  keyboardType?: KeyboardTypeOptions; // для установки типа клавиатуры если не телефон
  isRequired?: boolean;       // звёздочка для обязательных полей
  style?: object; //  свойство для переопределения стилей
  isDisabled?: boolean; //  свойство для блокировки ввода
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // управление автозаглавными буквами
}

export const PredefinedInput: React.FC <PredefinedInputProps> = ({
  label,
  placeholder,
  value = '',
  onChangeText,
  isPhone = false,
  multiline = false,
  containerStyle,
  inputStyle,
  showClearButton = true,
  isPassword = false,
  validationPassed = false,
  hasError = false,
  isDropdown = false,
  options = [],
  onBlur, 
  errorMessage, 
  textArea = false, 
  keyboardType,
  isRequired = false,
  style,
  isDisabled,
  autoCapitalize = 'none',
}) => {
  const [internalValue, setInternalValue] = useState<string>(value);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Новое: синхронизация internalValue при изменении value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const formatPhoneNumber = (onlyDigits: string): string => {
    if (onlyDigits.startsWith('0') && onlyDigits.length === 10) {
      const part1 = onlyDigits.slice(0, 3);
      const part2 = onlyDigits.slice(3, 6);
      const part3 = onlyDigits.slice(6, 8);
      const part4 = onlyDigits.slice(8, 10);
      return `+972${part1.slice(1)}-${part2}-${part3}-${part4}`;
    }
    if (onlyDigits.startsWith('972') && onlyDigits.length === 12) {
      const p1 = onlyDigits.slice(3, 5);
      const p2 = onlyDigits.slice(5, 8);
      const p3 = onlyDigits.slice(8, 10);
      const p4 = onlyDigits.slice(10, 12);
      return `+972-${p1}-${p2}-${p3}-${p4}`;
    }
    return onlyDigits;
  };

  const handleChange = (text: string) => {
    if (isPhone) {
      const onlyDigits = text.replace(/\D/g, '');
      if (onlyDigits.length === 0) {
        setInternalValue('');
        onChangeText?.('');
        return;
      }
      if (!onlyDigits.startsWith('0') && !onlyDigits.startsWith('9')) {
        return;
      }
      if (onlyDigits.startsWith('972')) {
        if (onlyDigits.length > 12) {
          const truncated = onlyDigits.slice(0, 12);
          const formatted = formatPhoneNumber(truncated);
          setInternalValue(formatted);
          onChangeText?.(truncated);
          return;
        }
        if (onlyDigits.length === 12) {
          const formatted = formatPhoneNumber(onlyDigits);
          setInternalValue(formatted);
          onChangeText?.(onlyDigits);
          return;
        }
        setInternalValue(onlyDigits);
        onChangeText?.(onlyDigits);
        return;
      }
      if (onlyDigits.startsWith('0')) {
        if (onlyDigits.length > 10) {
          const truncated = onlyDigits.slice(0, 10);
          const formatted = formatPhoneNumber(truncated);
          setInternalValue(formatted);
          onChangeText?.(truncated);
          return;
        }
        if (onlyDigits.length === 10) {
          const formatted = formatPhoneNumber(onlyDigits);
          setInternalValue(formatted);
          onChangeText?.(onlyDigits);
          return;
        }
        setInternalValue(onlyDigits);
        onChangeText?.(onlyDigits);
        return;
      }
      setInternalValue(onlyDigits);
      onChangeText?.(onlyDigits);
      return;
    }
    setInternalValue(text);
    onChangeText?.(text);
  };

  const handleClear = () => {
    setInternalValue('');
    onChangeText?.('');
  };

  const finalKeyboardType: KeyboardTypeOptions = keyboardType ?? (isPhone ? 'phone-pad' : 'default');

  const handleSelectItem = (item: { id: number; name: string; address: string }) => {
      const itemValue = `${item.id}`;
      const inputValue = `${item.name} ${item.address}`;
      setInternalValue(inputValue);
      onChangeText?.(itemValue);
      setIsOpen(false);
    };

  const renderDropdown = () => {
    return (
      <View style={styles.dropdownContainer}>
        {options.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.dropdownItem}
            disabled={isDisabled} // блокировка выбора при isDisabled
            onPress={() => handleSelectItem(item)}
          >
            <Ionicons name="radio-button-off" size={20} color="#444" />
            <Text style={styles.dropdownItemText}>{item.name}{item.address}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle, style]}> 
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {isRequired && <Text style={styles.requiredStar}>*</Text>}
        </View>
      )}
      {isDropdown ? (
        <>
          <TouchableOpacity
            style={[
              styles.dropdownHeader,
              hasError && styles.errorBorder,
            ]}
            disabled={isDisabled} // блокировка нажатия на выпадающий список
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text style={styles.dropdownHeaderText}>
              {internalValue ? internalValue : placeholder}
            </Text>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
          {isOpen && renderDropdown()} 
        </>
      ) : (
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              textArea && styles.textArea,
              inputStyle,
              hasError && styles.errorBorder,
            ]}
            value={internalValue}
            onChangeText={handleChange}
            onBlur={onBlur} 
            placeholder={placeholder}
            keyboardType={finalKeyboardType}
            multiline={multiline || textArea}
            secureTextEntry={isPassword && !isPasswordVisible}
            editable={!isDisabled}
            autoCapitalize={autoCapitalize}
          />

          {showClearButton && internalValue.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton} disabled={isDisabled}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}

          {isPassword && (
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeButton} disabled={isDisabled}>
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={22}
                color="#999"
              />
            </TouchableOpacity>
          )}

          {validationPassed && (
            <View style={styles.validationPassed}>
              <Ionicons name="checkmark-circle" size={22} color="green" />
            </View>
          )}

          {hasError && (
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle" size={22} color="red" />
            </View>
          )}
        </View>
      )}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 520,
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    width: '100%',
    minHeight: 44,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
  },
  eyeButton: {
    position: 'absolute',
    right: 40,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationPassed: {
    position: 'absolute',
    right: 70,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorIcon: {
    position: 'absolute',
    right: 100,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  errorText: { 
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  textArea: { 
    height: 100,
    width: '100%',
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  labelContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredStar: {
    color: 'red',
    marginLeft: 4,
  },
});
