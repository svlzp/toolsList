import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PredefinedInput } from '../Input/PredefinedInput';

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: ViewStyle;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChangeText,
  containerStyle,
}) => {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <PredefinedInput
        placeholder={placeholder}
        value={value || ''}
        onChangeText={onChangeText}
        showClearButton
        backgroundColor="#f5f5f5"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});
