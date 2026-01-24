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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetLearningByIdQuery, useCreateContentMutation, useDeleteContentMutation } from '../store/api/learningApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { getImageUrls, FileSource } from '../utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';

interface ContentBlock {
    id: number;
    description: string;
    files: FileSource[];
}

export const LearningDetailScreen = ({ route, navigation }: any) => {
    const learningIdParam = route.params?.learningId;
    const learningId = Number(learningIdParam);
    
    const [isAddingContent, setIsAddingContent] = useState(false);
    const [contentBlocks, setContentBlocks] = useState<Array<{
        description: string;
        selectedImages: string[];
    }>>([]);

    const auth = useAppSelector(state => state.auth);
    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: learning, isLoading, error, refetch } = useGetLearningByIdQuery(learningId);
    const [createContent] = useCreateContentMutation();
    const [deleteContent, { isLoading: isDeletingContent }] = useDeleteContentMutation();

    const pickImages = async (blockIndex: number) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const newImages = result.assets.map((asset) => asset.uri);
                const updated = [...contentBlocks];
                updated[blockIndex].selectedImages = [
                    ...updated[blockIndex].selectedImages,
                    ...newImages,
                ];
                setContentBlocks(updated);
            }
        } catch (err) {
            console.error('Ошибка при выборе изображения:', err);
            Alert.alert('Ошибка', 'Не удалось выбрать изображение');
        }
    };

    const addContentBlock = () => {
        setContentBlocks([
            ...contentBlocks,
            {
                description: '',
                selectedImages: [],
            },
        ]);
    };

    const removeContentBlock = (index: number) => {
        const updated = contentBlocks.filter((_, i) => i !== index);
        setContentBlocks(updated);
    };

    const removeImage = (blockIndex: number, imageIndex: number) => {
        const updated = [...contentBlocks];
        updated[blockIndex].selectedImages = updated[blockIndex].selectedImages.filter(
            (_, i) => i !== imageIndex
        );
        setContentBlocks(updated);
    };

    const handleAddAllContent = async () => {
        if (contentBlocks.length === 0) {
            Alert.alert('Ошибка', 'Добавьте хотя бы один блок');
            return;
        }

        try {
            for (const [blockIndex, block] of contentBlocks.entries()) {
                if (block.selectedImages.length === 0 && !block.description.trim()) {
                    continue;
                }

                const formData = new FormData();
                if (block.description.trim()) {
                    formData.append('description', block.description);
                }

                block.selectedImages.forEach((image, index) => {
                    formData.append('files', {
                        uri: image,
                        name: `image_${Date.now()}_${index}.jpg`,
                        type: 'image/jpeg',
                    } as any);
                });

                await createContent({
                    learningId: learningId,
                    formData,
                }).unwrap();
            }

            setContentBlocks([]);
            setIsAddingContent(false);
            refetch();
            Alert.alert('Успех', 'Все материалы добавлены');
        } catch (error) {
            console.error('Ошибка при добавлении контента:', error);
            Alert.alert('Ошибка', 'Не удалось добавить материалы');
        }
    };

    const handleDeleteContent = (contentId: number) => {
        Alert.alert(
            'Удаление',
            'Вы уверены, что хотите удалить этот материал?',
            [
                { text: 'Отмена', onPress: () => {} },
                {
                    text: 'Удалить',
                    onPress: async () => {
                        try {
                            await deleteContent({
                                learningId: learningId,
                                contentId: contentId,
                            }).unwrap();
                            refetch();
                            Alert.alert('Успех', 'Материал удален');
                        } catch (error) {
                            console.error('Ошибка при удалении:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить материал');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error || !learning) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Не удалось загрузить урок</Text>
                <Button title="Повторить" onPress={refetch} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>{learning.title}</Text>

                    {isAdmin && (
                        <View style={styles.controlButtons}>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.editButton]}
                                onPress={() => navigation.navigate('LearningEditor', { learningId: learning.id })}
                            >
                                <Text style={styles.controlButtonText}>Редактировать</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isAdmin && !isAddingContent && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setIsAddingContent(true)}
                        >
                            <Text style={styles.addButtonText}>+ Добавить материал</Text>
                        </TouchableOpacity>
                    )}

                    {/* Форма добавления нового контента */}
                    {isAddingContent && (
                        <View style={styles.addContentForm}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>Добавить материалы</Text>
                                <TouchableOpacity onPress={() => {
                                    console.log('➕ Добавление нового блока в форму');
                                    addContentBlock();
                                }}>
                                    <Text style={styles.addBlockText}>+ Блок</Text>
                                </TouchableOpacity>
                            </View>

                            {contentBlocks.length > 0 ? (
                                contentBlocks.map((block, blockIndex) => (
                                    <View key={blockIndex} style={styles.contentBlockForm}>
                                        <View style={styles.blockFormHeader}>
                                            <Text style={styles.blockFormTitle}>Материал #{blockIndex + 1}</Text>
                                            <TouchableOpacity onPress={() => removeContentBlock(blockIndex)}>
                                                <Text style={styles.removeBlockText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TextInput
                                            style={styles.descriptionInput}
                                            placeholder="Описание материала"
                                            value={block.description}
                                            onChangeText={(text) => {
                                                const updated = [...contentBlocks];
                                                updated[blockIndex].description = text;
                                                setContentBlocks(updated);
                                            }}
                                            multiline
                                            numberOfLines={3}
                                        />

                                        <TouchableOpacity
                                            style={styles.pickButton}
                                            onPress={() => pickImages(blockIndex)}
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
                                                            onPress={() => removeImage(blockIndex, imgIndex)}
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
                                <Text style={styles.noBlocksText}>Нет блоков. Добавьте первый</Text>
                            )}

                            <View style={styles.formButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        setIsAddingContent(false);
                                        setContentBlocks([]);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Отмена</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton]}
                                    onPress={handleAddAllContent}
                                >
                                    <Text style={styles.buttonText}>Сохранить материалы</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.contentList}>
                        {learning.content && learning.content.length > 0 ? (
                            learning.content.map((content: any, index: number) => (
                                <View key={content.id} style={styles.contentBlock}>
                                    <Text style={styles.contentIndex}>Материал #{index + 1}</Text>

                                    {content.files && content.files.length > 0 && (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.imagesContainer}
                                        >
                                            {getImageUrls(content.files, auth?.accessToken).map(
                                                (image, idx) => (
                                                    <Image
                                                        key={idx}
                                                        source={{ uri: image }}
                                                        style={styles.contentImage}
                                                    />
                                                )
                                            )}
                                        </ScrollView>
                                    )}

                                    {content.description && (
                                        <Text style={styles.contentDescription}>
                                            {content.description}
                                        </Text>
                                    )}

                                    {isAdmin && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteContent(content.id)}
                                            disabled={isDeletingContent}
                                        >
                                            <Text style={styles.deleteButtonText}>
                                                {isDeletingContent ? 'Удаление...' : 'Удалить материал'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noContentText}>Нет материалов</Text>
                        )}
                    </View>

                    <Button title="Назад" onPress={() => navigation.goBack()} />
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
        paddingBottom: 20,
    },
    container: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    controlButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    controlButton: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    addContentForm: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    addBlockText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
    },
    contentBlockForm: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    blockFormHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    blockFormTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    removeBlockText: {
        fontSize: 20,
        color: '#FF3B30',
        fontWeight: 'bold',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#666',
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 10,
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
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    noBlocksText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 16,
    },
    selectedImages: {
        marginVertical: 12,
    },
    selectedCount: {
        fontSize: 14,
        marginBottom: 8,
        color: '#666',
    },
    selectedImageItem: {
        marginRight: 8,
    },
    selectedImageThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    formButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
    },
    submitButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    contentList: {
        marginVertical: 20,
    },
    contentBlock: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    contentIndex: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 12,
    },
    imagesContainer: {
        marginBottom: 12,
    },
    contentImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
    },
    contentDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 12,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    noContentText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginVertical: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        marginBottom: 16,
    },
});
