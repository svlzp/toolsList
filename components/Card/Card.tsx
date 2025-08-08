
import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export interface CardProps {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
  selected?: boolean;
}

const Card: React.FC<CardProps> = ({ icon, text, onPress, selected = false }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    onPress();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        selected && styles.selected,
        isPressed && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: 200,
    height: 200,
    borderColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selected: {
    backgroundColor: '#e0f7fa',
  },
  pressed: {
    backgroundColor: '#cce7e8',
  },
  iconContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default Card;
