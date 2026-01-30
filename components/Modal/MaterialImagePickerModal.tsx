import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ImagePickerComponent } from '../../utils/ImagePickerComponent';

interface MaterialImagePickerModalProps {
    visible: boolean;
    selectedImages: string[];
    onImagesChange: (images: string[]) => void;
    onClose: () => void;
}

export const MaterialImagePickerModal: React.FC<MaterialImagePickerModalProps> = ({
    visible,
    selectedImages,
    onImagesChange,
    onClose,
}) => {
    const { t } = useTranslation();

    return (
        <Modal visible={visible} animationType="slide">
            {visible && (
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalCloseButton}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{t('learning.addImages')}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <ImagePickerComponent
                        images={selectedImages}
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
