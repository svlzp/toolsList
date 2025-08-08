import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';


export interface LanguageButtonProps {
  icon: React.ReactElement<{ color?: string }>;
  onPress: () => void;
  color?: string;
  size?: number;
  tooltip?: string;
  style?: object;
  selected?: boolean;
  selectedRadio?: boolean; 
}

const LanguageButton: React.FC<LanguageButtonProps> = ({ icon, onPress,
   color = '#000', size = 24, tooltip, style ,selected,selectedRadio}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const showTooltip = () => setModalVisible(true);
  const hideTooltip = () => setModalVisible(false);

  return (
    <View>
      <TouchableOpacity onLongPress={showTooltip}>
        <IconButton
          icon={() => React.cloneElement(icon, { color })}
          onPress={onPress}
          size={size}
          style={[styles.button, style, selectedRadio && styles.selectedRadio]}
        />
      </TouchableOpacity>

      {tooltip && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={hideTooltip}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={hideTooltip}>
            <View style={styles.tooltipContainer}>
              <Text style={styles.tooltipText}>{tooltip}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  button: {},

  selectedRadio: {
    borderWidth: 4, 
    borderColor: 'blue',
    borderRadius: 50,
    borderStyle: 'solid',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tooltipContainer: {
    backgroundColor: 'black',
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default LanguageButton;
