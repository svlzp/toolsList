import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ImagePickerComponent } from '../../utils/ImagePickerComponent';

interface AddStageImagesModalProps {
    visible: boolean;
    selectedBlockIndex: number | null;
    stageBlocks: Array<{
        description: string;
        selectedImages: string[];
    }>;
    onClose: () => void;
    onImagesChange: (images: string[]) => void;
}

export const AddStageImagesModal: React.FC<AddStageImagesModalProps> = ({
    visible,
    selectedBlockIndex,
    stageBlocks,
    onClose,
    onImagesChange,
}) => {
    const { t } = useTranslation();

    return (
        <Modal visible={visible && selectedBlockIndex !== null} animationType="slide">
            {selectedBlockIndex !== null && (
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalCloseButton}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t('learning.addImages')}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <ImagePickerComponent 
                        images={stageBlocks[selectedBlockIndex]?.selectedImages || []}
                        onImagesChange={onImagesChange}
                        maxImages={10}
                        onClose={onClose}
                        hideHeader={true}
                    />
                </SafeAreaView>
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalCloseButton: {
        fontSize: 28,
        color: '#666',
        fontWeight: 'bold',
        width: 40,
        textAlign: 'center',
    },
});
