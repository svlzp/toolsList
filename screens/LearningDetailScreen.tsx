import React, { useState, useEffect, useRef } from 'react';
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
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetLearningByIdQuery, useCreateContentMutation, useDeleteContentMutation, useUpdateContentMutation, useUpdateFilesMutation, useDeleteContentFileMutation } from '../store/api/learningApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { getImageUrls, FileSource } from '../utils/imageUtils';
import { translateServerArray, translateServerText } from '../utils/translatorUtils';
import * as ImagePicker from 'expo-image-picker';
import { AppLayout } from '@/Layout/AppLayout';
import { ImageAnnotator } from '../utils/ImageAnnotator';
import { ImageZoomModal } from '../components/Modal/ImageZoomModal';

interface ContentBlock {
    id: number;
    description: string;
    files: FileSource[];
}

export const LearningDetailScreen = ({ route, navigation }: any) => {
    const { t, i18n } = useTranslation();
    const learningIdParam = route.params?.learningId;
    const learningId = Number(learningIdParam);
    
    const [isAddingContent, setIsAddingContent] = useState(false);
    const [contentBlocks, setContentBlocks] = useState<Array<{
        description: string;
        selectedImages: string[];
    }>>([]);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [learning, setLearning] = useState<any>(null);
    const [editingImage, setEditingImage] = useState<{ uri: string; contentId: number; fileId: number } | null>(null);
    const [isSavingEdits, setIsSavingEdits] = useState(false);
    const [translatedContentDescriptions, setTranslatedContentDescriptions] = useState<{ [key: number]: string }>({});
    const [translatedBlockDescriptions, setTranslatedBlockDescriptions] = useState<{ [key: number]: string }>({});
    const currentLanguage = i18n.language;

    const auth = useAppSelector(state => state.auth);
    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: rawLearning, isLoading, error, refetch } = useGetLearningByIdQuery(learningId);
    const [createContent] = useCreateContentMutation();
    const [deleteContent, { isLoading: isDeletingContent }] = useDeleteContentMutation();
    const [updateContent] = useUpdateContentMutation();
    const [deleteContentFile] = useDeleteContentFileMutation();

    useEffect(() => {
        if (rawLearning) {
            translateServerArray([rawLearning], ['title']).then(translated => {
                if (translated[0]) {
                    setLearning({
                        ...rawLearning,
                        ...translated[0],
                        content: rawLearning.content?.map((c: any) => ({
                            ...c,
                        })) || [],
                    });
                }
            });
        }
    }, [rawLearning, i18n.language]);

    React.useEffect(() => {
        const translateContentDescriptions = async () => {
            if (!learning?.content || learning.content.length === 0) return;
            
            const translated = await translateServerArray(learning.content, ['description'], currentLanguage as any);
            const translatedMap: { [key: number]: string } = {};
            
            translated.forEach((item: any, index: number) => {
                if (item.description) {
                    translatedMap[index] = item.description;
                }
            });
            
            setTranslatedContentDescriptions(translatedMap);
        };
        
        translateContentDescriptions();
    }, [learning?.content, currentLanguage]);

    React.useEffect(() => {
        const translateBlockDescriptions = async () => {
            if (contentBlocks.length === 0) return;
            
            const translated = await translateServerArray(contentBlocks, ['description'], currentLanguage as any);
            const translatedMap: { [key: number]: string } = {};
            
            translated.forEach((item: any, index: number) => {
                if (item.description && item.description.trim().length > 0) {
                    translatedMap[index] = item.description;
                }
            });
            
            if (Object.keys(translatedMap).length > 0) {
                setTranslatedBlockDescriptions(translatedMap);
            }
        };
        
        translateBlockDescriptions();
    }, [contentBlocks, currentLanguage]);

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
            Alert.alert(t('common.error'), t('learning.addContent'));
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
            Alert.alert(t('learning.success'), t('learning.added'));
        } catch (error) {
            console.error('Ошибка при добавлении контента:', error);
            Alert.alert(t('common.error'), t('learning.addError'));
        }
    };

    const handleDeleteContent = (contentId: number) => {
        Alert.alert(
            t('learning.deleteConfirm'),
            t('learning.deleteQuestion'),
            [
                { text: t('learning.cancel'), onPress: () => {} },
                {
                    text: t('learning.delete'),
                    onPress: async () => {
                        try {
                            await deleteContent({
                                learningId: learningId,
                                contentId: contentId,
                            }).unwrap();
                            refetch();
                            Alert.alert(t('learning.success'), t('learning.deleted'));
                        } catch (error) {
                            console.error('Ошибка при удалении:', error);
                            Alert.alert(t('common.error'), t('learning.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteFile = (contentId: number, filename: string) => {
        Alert.alert(
            t('learning.deleteConfirm'),
            t('learning.deleteFileQuestion'),
            [
                { text: t('learning.cancel'), onPress: () => {} },
                {
                    text: t('learning.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteContentFile({
                                learningId: learningId,
                                contentId: contentId,
                                filename: filename,
                            }).unwrap();
                            refetch();
                            Alert.alert(t('learning.success'), t('learning.fileDeleted'));
                        } catch (error) {
                            console.error('Ошибка при удалении файла:', error);
                            Alert.alert(t('common.error'), t('learning.deleteFileError'));
                        }
                    },
                },
            ]
        );
    };

    const handleEditImage = (uri: string, contentId: number, fileId: number) => {
        setEditingImage({ uri, contentId, fileId });
    };

    const handleSaveEditedImage = async (annotatedImageUri: string) => {
        if (!editingImage) return;

        setIsSavingEdits(true);
        try {
         
            const contentBlock = learning?.content?.find((c: any) => c.id === editingImage.contentId);
            const oldFile = contentBlock?.files?.find((f: any) => f.id === editingImage.fileId);
            const oldFileName = oldFile?.filename || '';

            console.log('📸 === handleSaveEditedImage ===');
            console.log('contentId:', editingImage.contentId, 'fileId:', editingImage.fileId);
            console.log('oldFile found:', oldFile);
            console.log('oldFileName:', oldFileName);

            const formData = new FormData();
            formData.append('files', {
                uri: annotatedImageUri,
                name: `edited_image_${Date.now()}.jpg`,
                type: 'image/jpeg',
            } as any);

           
            if (oldFileName) {
                formData.append('oldFileNames', oldFileName);
                console.log('📤 Sending oldFileNames in FormData:', oldFileName);
            }

            console.log('📤 FormData parts:', JSON.stringify((formData as any)._parts));

            await updateContent({
                learningId: learningId,
                contentId: editingImage.contentId,
                formData,
            }).unwrap();

            setEditingImage(null);
            refetch();
            Alert.alert(t('learning.success'), t('learning.imageSaved'));
        } catch (error) {
            console.error('Ошибка при сохранении отредактированного изображения:', error);
            Alert.alert(t('common.error'), t('learning.imageSaveError'));
        } finally {
            setIsSavingEdits(false);
        }
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
                <Text style={styles.errorText}>{t('learning.loadError')}</Text>
                <Button title={t('common.retry')} onPress={refetch} />
            </View>
        );
    }

    return (
        <AppLayout>
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
                                <Text style={styles.controlButtonText}>{t('common.edit')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isAdmin && !isAddingContent && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setIsAddingContent(true)}
                        >
                            <Text style={styles.addButtonText}>+ {t('learning.addMaterial')}</Text>
                        </TouchableOpacity>
                    )}

                
                    {isAddingContent && (
                        <View style={styles.addContentForm}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>{t('learning.addMaterials')}</Text>
                                <TouchableOpacity onPress={() => {
                                    console.log('➕ Добавление нового блока в форму');
                                    addContentBlock();
                                }}>
                                    <Text style={styles.addBlockText}>+ {t('learning.block')}</Text>
                                </TouchableOpacity>
                            </View>

                            {contentBlocks.length > 0 ? (
                                contentBlocks.map((block, blockIndex) => (
                                    <View key={blockIndex} style={styles.contentBlockForm}>
                                        <View style={styles.blockFormHeader}>
                                            <Text style={styles.blockFormTitle}>{t('learning.material')} #{blockIndex + 1}</Text>
                                            <TouchableOpacity onPress={() => removeContentBlock(blockIndex)}>
                                                <Text style={styles.removeBlockText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TextInput
                                            style={styles.descriptionInput}
                                            placeholder={t('learning.description')}
                                            value={block.description}
                                            onChangeText={(text) => {
                                                const updated = [...contentBlocks];
                                                updated[blockIndex].description = text;
                                                setContentBlocks(updated);
                                            }}
                                            multiline
                                            numberOfLines={3}
                                        />

                                        {translatedBlockDescriptions[blockIndex] && translatedBlockDescriptions[blockIndex] !== block.description && (
                                            <Text style={styles.translatedPreview}>
                                                {translatedBlockDescriptions[blockIndex]}
                                            </Text>
                                        )}

                                        <TouchableOpacity
                                            style={styles.pickButton}
                                            onPress={() => pickImages(blockIndex)}
                                        >
                                            <Text style={styles.pickButtonText}>{t('learning.addImages')}</Text>
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
                                <Text style={styles.noBlocksText}>{t('learning.noBlocks')}</Text>
                            )}

                            <View style={styles.formButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        setIsAddingContent(false);
                                        setContentBlocks([]);
                                    }}
                                >
                                    <Text style={styles.buttonText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton]}
                                    onPress={handleAddAllContent}
                                >
                                    <Text style={styles.buttonText}>{t('learning.saveMaterials')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.contentList}>
                        {learning.content && learning.content.length > 0 ? (
                            learning.content.map((content: any, index: number) => (
                                <View key={content.id} style={styles.contentBlock}>
                                    <Text style={styles.contentIndex}>{t('learning.material')} #{index + 1}</Text>

                                    {content.files && content.files.length > 0 && (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.imagesContainer}
                                        >
                                            {getImageUrls(content.files, auth?.accessToken).map(
                                                (image, idx) => (
                                                    <View key={idx} style={styles.imageContentWrapper}>
                                                        <TouchableOpacity
                                                            onPress={() => setExpandedImage(image)}
                                                        >
                                                            <Image
                                                                source={{ uri: image }}
                                                                style={styles.contentImage}
                                                            />
                                                        </TouchableOpacity>
                                                        {isAdmin && (
                                                            <>
                                                                <TouchableOpacity
                                                                    style={styles.editImageButton}
                                                                    onPress={() => handleEditImage(image, content.id, content.files[idx].id)}
                                                                >
                                                                    <Text style={styles.editImageButtonText}>✏️</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.deleteImageButton}
                                                                    onPress={() => handleDeleteFile(content.id, content.files[idx].filename)}
                                                                >
                                                                    <Text style={styles.deleteImageButtonText}>🗑️</Text>
                                                                </TouchableOpacity>
                                                            </>
                                                        )}
                                                    </View>
                                                )
                                            )}
                                        </ScrollView>
                                    )}

                                    {content.description && (
                                        <Text style={styles.contentDescription}>
                                            {translatedContentDescriptions[index] || content.description}
                                        </Text>
                                    )}

                                    {isAdmin && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteContent(content.id)}
                                            disabled={isDeletingContent}
                                        >
                                            <Text style={styles.deleteButtonText}>
                                                {isDeletingContent ? t('common.deleting') : t('learning.deleteMaterial')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noContentText}>{t('learning.noMaterials')}</Text>
                        )}
                    </View>

                    <Button title={t('common.back')} onPress={() => navigation.goBack()} />
                </View>
            </ScrollView>

            <ImageZoomModal
                visible={expandedImage !== null}
                imageUri={expandedImage}
                onClose={() => setExpandedImage(null)}
            />

            <Modal
                visible={editingImage !== null && !isSavingEdits}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditingImage(null)}
            >
                {editingImage && (
                    <ImageAnnotator
                        imageUri={editingImage.uri}
                        onSave={handleSaveEditedImage}
                        onCancel={() => setEditingImage(null)}
                    />
                )}
            </Modal>
        </SafeAreaView>
    </AppLayout>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
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
    imageContentWrapper: {
        position: 'relative',
        marginRight: 8,
    },
    editImageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 122, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editImageButtonText: {
        fontSize: 16,
    },
    deleteImageButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    deleteImageButtonText: {
        fontSize: 16,
    },
    translatedPreview: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
        padding: 10,
        backgroundColor: '#f0f8ff',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
});
