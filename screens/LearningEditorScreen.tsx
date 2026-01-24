import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Button,
    Alert,
    TextInput,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useGetLearningByIdQuery,
    useUpdateLearningMutation,
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
} from '../store/api/learningApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { getImageUrls } from '../utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';

interface MaterialBlock {
    isNew: boolean;
    id?: number;
    description: string;
    selectedImages: string[];
}

export const LearningEditorScreen = ({ route, navigation }: any) => {
    const { learningId } = route.params;
    const auth = useAppSelector(state => state.auth);

    const { data: learning, isLoading, refetch } = useGetLearningByIdQuery(learningId);
    const [updateLearning, { isLoading: isUpdatingLearning }] = useUpdateLearningMutation();
    const [createContent] = useCreateContentMutation();
    const [updateContent] = useUpdateContentMutation();
    const [deleteContent] = useDeleteContentMutation();

    const [learningTitle, setLearningTitle] = useState(learning?.title || '');
    const [materialBlocks, setMaterialBlocks] = useState<MaterialBlock[]>([]);
    const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [selectedBlockForImages, setSelectedBlockForImages] = useState<number | null>(null);

    React.useEffect(() => {
        if (learning) {
            setLearningTitle(learning.title);
            // Инициализируем существующие блоки контента
            if (learning.content && learning.content.length > 0) {
                setMaterialBlocks(
                    learning.content.map((content: any) => ({
                        isNew: false,
                        id: content.id,
                        description: content.description || '',
                        selectedImages: content.files?.map((f: any) => f.url) || [],
                    }))
                );
            }
        }
    }, [learning]);

    const pickImages = async (blockIndex: number) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                const newImages = result.assets.map((asset) => asset.uri);
                const updated = [...materialBlocks];
                updated[blockIndex].selectedImages = [
                    ...updated[blockIndex].selectedImages,
                    ...newImages,
                ];
                setMaterialBlocks(updated);
            }
        } catch (err) {
            Alert.alert('Ошибка', 'Не удалось выбрать изображения');
        }
    };

    const addMaterialBlock = () => {
        setMaterialBlocks([
            ...materialBlocks,
            {
                isNew: true,
                description: '',
                selectedImages: [],
            },
        ]);
        setEditingBlockIndex(materialBlocks.length);
    };

    const removeMaterialBlock = async (index: number) => {
        const block = materialBlocks[index];
        
        if (!block.isNew && block.id) {
            Alert.alert(
                'Удаление',
                'Вы уверены?',
                [
                    { text: 'Отмена' },
                    {
                        text: 'Удалить',
                        onPress: async () => {
                            try {
                                await deleteContent({
                                    learningId,
                                    contentId: block.id as number,
                                }).unwrap();
                                const updated = materialBlocks.filter((_, i) => i !== index);
                                setMaterialBlocks(updated);
                            } catch (error) {
                                Alert.alert('Ошибка', 'Не удалось удалить материал');
                            }
                        },
                    },
                ]
            );
        } else {
            const updated = materialBlocks.filter((_, i) => i !== index);
            setMaterialBlocks(updated);
        }
    };

    const removeImage = (blockIndex: number, imageIndex: number) => {
        const updated = [...materialBlocks];
        updated[blockIndex].selectedImages = updated[blockIndex].selectedImages.filter(
            (_, i) => i !== imageIndex
        );
        setMaterialBlocks(updated);
    };

    const updateLearningTitle = async () => {
        if (!learningTitle.trim()) {
            Alert.alert('Ошибка', 'Название не может быть пустым');
            return;
        }

        try {
            await updateLearning({
                id: learningId,
                dto: { title: learningTitle },
            }).unwrap();
            Alert.alert('Успех', 'Название обновлено');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось обновить название');
        }
    };

    const saveMaterialBlocks = async () => {
        try {
            for (const [index, block] of materialBlocks.entries()) {
                if (block.selectedImages.length === 0 && !block.description.trim()) {
                    continue;
                }

                if (block.isNew) {
                    // Новый блок - создаём контент
                    const formData = new FormData();
                    formData.append('description', block.description);
                    
                    block.selectedImages.forEach((image, imgIndex) => {
                        formData.append('files', {
                            uri: image,
                            name: `image_${Date.now()}_${imgIndex}.jpg`,
                            type: 'image/jpeg',
                        } as any);
                    });

                    await createContent({
                        learningId,
                        formData,
                    }).unwrap();
                } else if (block.id) {
                    // Существующий блок - обновляем контент
                    const formData = new FormData();
                    formData.append('description', block.description);
                    
                    block.selectedImages.forEach((image, imgIndex) => {
                        // Только новые изображения (которые начинаются с file://)
                        if (image.startsWith('file://') || !image.includes('10.100.102.3')) {
                            formData.append('files', {
                                uri: image,
                                name: `image_${Date.now()}_${imgIndex}.jpg`,
                                type: 'image/jpeg',
                            } as any);
                        }
                    });

                    await updateContent({
                        learningId,
                        contentId: block.id as number,
                        formData,
                    }).unwrap();
                }
            }

            refetch();
            Alert.alert('Успех', 'Все материалы сохранены');
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить материалы');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    {/* Редактирование названия */}
                    <View style={styles.titleSection}>
                        <Text style={styles.label}>Название урока:</Text>
                        <TextInput
                            style={styles.titleInput}
                            value={learningTitle}
                            onChangeText={setLearningTitle}
                            placeholder="Введите название урока"
                        />
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={updateLearningTitle}
                            disabled={isUpdatingLearning}
                        >
                            {isUpdatingLearning ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Сохранить название</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Материалы */}
                    <View style={styles.materialsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Материалы</Text>
                            <TouchableOpacity
                                style={styles.addBlockButton}
                                onPress={addMaterialBlock}
                            >
                                <Text style={styles.addBlockButtonText}>+ Блок</Text>
                            </TouchableOpacity>
                        </View>

                        {materialBlocks.length > 0 ? (
                            materialBlocks.map((block, index) => (
                                <View key={index} style={styles.materialBlock}>
                                    <View style={styles.blockHeader}>
                                        <Text style={styles.blockNumber}>Материал #{index + 1}</Text>
                                        <TouchableOpacity
                                            onPress={() => removeMaterialBlock(index)}
                                            style={styles.removeBlockButton}
                                        >
                                            <Text style={styles.removeBlockButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Описание */}
                                    <TextInput
                                        style={styles.descriptionInput}
                                        placeholder="Описание материала"
                                        value={block.description}
                                        onChangeText={(text) => {
                                            const updated = [...materialBlocks];
                                            updated[index].description = text;
                                            setMaterialBlocks(updated);
                                        }}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    {/* Изображения */}
                                    <TouchableOpacity
                                        style={styles.pickButton}
                                        onPress={() => pickImages(index)}
                                    >
                                        <Text style={styles.pickButtonText}>Добавить изображения</Text>
                                    </TouchableOpacity>

                                    {block.selectedImages.length > 0 && (
                                        <View style={styles.imagesGrid}>
                                            {block.selectedImages.map((image, imgIndex) => (
                                                <View key={imgIndex} style={styles.imageWrapper}>
                                                    <Image
                                                        source={{ uri: image }}
                                                        style={styles.thumbnail}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.removeImageButton}
                                                        onPress={() => removeImage(index, imgIndex)}
                                                    >
                                                        <Text style={styles.removeImageButtonText}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noBlocksText}>Нет материалов. Добавьте первый блок</Text>
                        )}
                    </View>

                    {/* Кнопки действий */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.saveAllButton]}
                            onPress={saveMaterialBlocks}
                        >
                            <Text style={styles.actionButtonText}>Сохранить все материалы</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.backButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.actionButtonText}>Назад</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    container: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    titleInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 12,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    materialsSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    addBlockButton: {
        backgroundColor: '#007AFF',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addBlockButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    materialBlock: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    blockNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    removeBlockButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeBlockButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 12,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    pickButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    imageWrapper: {
        position: 'relative',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noBlocksText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 24,
    },
    actionButtons: {
        gap: 12,
    },
    actionButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    saveAllButton: {
        backgroundColor: '#34C759',
    },
    backButton: {
        backgroundColor: '#e0e0e0',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
