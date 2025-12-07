import React from 'react';
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Text,
    Alert,
    StyleSheet,
} from 'react-native';
import { pickImageFromGallery, takePhoto } from '../../utils/imageUtils';

interface ImagePickerComponentProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
    images,
    onImagesChange,
    maxImages = 10,
}) => {
    const pickImage = async () => {
        const imageUri = await pickImageFromGallery();
        if (imageUri && images.length < maxImages) {
            onImagesChange([...images, imageUri]);
        }
    };

    const openCamera = async () => {
        const imageUri = await takePhoto();
        if (imageUri && images.length < maxImages) {
            onImagesChange([...images, imageUri]);
        }
    };

    const handleImageSelection = () => {
        if (images.length >= maxImages) {
            Alert.alert("Ошибка", `Максимум ${maxImages} изображений`);
            return;
        }
        Alert.alert(
            "Выберите источник",
            "Откуда вы хотите взять изображение?",
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
        <View style={styles.container}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 10,
    },
    imagesPreview: {
        flexDirection: 'row',
        marginBottom: 10,
        maxHeight: 100,
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
