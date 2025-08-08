import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PredefinedButton } from './PredefinedButton'; // импорт вашего компонента

interface PhoneNumberKeypadProps {
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onSubmit: () => void;
}

export const PhoneNumberKeypad: React.FC<PhoneNumberKeypadProps> = ({
  onDigitPress,
  onClear,
  onDelete,
  onSubmit,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <View style={styles.container}>
      <View style={styles.digitsContainer}>
        {digits.map((digit) => (
          <PredefinedButton
            key={digit}
            type="text"
            label={digit}
            onPress={() => onDigitPress(digit)}
            width={60}
            height={60}
          />
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <PredefinedButton
          type="text"
          label="Очистить"
          onPress={onClear}
          width={120}
        />
        <PredefinedButton
          type="text"
          label="Удалить"
          onPress={onDelete}
          width={120}
        />
        <PredefinedButton
          type="text"
          label="Отправить"
          onPress={onSubmit}
          width={120}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  digitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200,
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
