import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Text,
    Alert,
    StyleSheet,
    Modal,
    SafeAreaView,
} from 'react-native';
import { pickImageFromGallery, takePhoto } from './imageUtils';
import { ImageAnnotator } from './ImageAnnotator';

interface ImagePickerComponentProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    onClose?: () => void;
    hideHeader?: boolean;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
    images,
    onImagesChange,
    maxImages = 10,
    onClose,
    hideHeader = true,
}) => {
    const [showAnnotator, setShowAnnotator] = useState(false);
    const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

    const pickImage = async () => {
        const imageUri = await pickImageFromGallery();
        if (imageUri) {
            setPendingImageUri(imageUri);
            setShowAnnotator(true);
        }
    };

    const openCamera = async () => {
        const imageUri = await takePhoto();
        if (imageUri) {
            setPendingImageUri(imageUri);
            setShowAnnotator(true);
        }
    };

    const handleAnnotatorSave = (annotatedUri: string) => {
        if (images.length < maxImages) {
            onImagesChange([...images, annotatedUri]);
        } else {
            Alert.alert('Ошибка', `Максимум ${maxImages} изображений`);
        }
        setShowAnnotator(false);
        setPendingImageUri(null);
    };

    const handleAnnotatorCancel = () => {
        setShowAnnotator(false);
        setPendingImageUri(null);
    };

    const handleImageSelection = () => {
        if (images.length >= maxImages) {
            Alert.alert("Ошибка", `Максимум ${maxImages} изображений`);
            return;
        }
        Alert.alert(
            "Выбрать источник",
            "",
            [
                {
                    text: "Отмена",
                    style: "cancel"
                },
                {
                    text: "Галерея",
                    onPress: pickImage
                },
                {
                    text: "Камера",
                    onPress: openCamera
                }
            ]
        );
    };
    const removeImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <SafeAreaView style={styles.container}>
            {!hideHeader && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Добавить фото</Text>
                    {onClose && (
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            
            <ScrollView horizontal style={styles.imagesPreview}>
                {images.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                        <Image source={{ uri }} style={styles.previewImage} />
                        <TouchableOpacity
                            style={styles.removeImageBtn}
                            onPress={() => removeImage(index)}
                        >
                            <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {images.length < maxImages && (
                    <TouchableOpacity
                        style={styles.addImageBtn}
                        onPress={handleImageSelection}
                    >
                        <Text style={styles.addImageText}>+</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <Text style={styles.imageCountText}>{images.length}/{maxImages} изображений</Text>

            {/* Модальное окно с ImageAnnotator */}
            <Modal visible={showAnnotator} animationType="slide">
                {pendingImageUri && (
                    <ImageAnnotator
                        imageUri={pendingImageUri}
                        onSave={handleAnnotatorSave}
                        onCancel={handleAnnotatorCancel}
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
        fontWeight: 'bold',
    },
    imagesPreview: {
        flexDirection: 'row',
        marginBottom: 10,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    imagePreviewContainer: {
        position: 'relative',
        marginRight: 10,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    addImageBtn: {
        width: 80,
        height: 80,
        backgroundColor: '#e1e1e1',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageText: {
        fontSize: 30,
        color: '#666',
    },
    imageCountText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default ImagePickerComponent;
