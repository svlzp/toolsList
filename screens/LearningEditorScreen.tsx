import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useGetLearningByIdQuery,
    useUpdateLearningMutation,
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
} from '../store/api/learningApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { MaterialImagePickerModal } from '../components/Modal/MaterialImagePickerModal';

interface MaterialBlock {
    isNew: boolean;
    id?: number;
    description: string;
    selectedImages: string[];
}

export const LearningEditorScreen = ({ route, navigation }: any) => {
    const { t } = useTranslation();
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
        setSelectedBlockForImages(blockIndex);
        setShowImagePicker(true);
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
                t('learning.deleteConfirm'),
                t('learning.deleteQuestion'),
                [
                    { text: t('common.cancel') },
                    {
                        text: t('common.delete'),
                        onPress: async () => {
                            try {
                                await deleteContent({
                                    learningId,
                                    contentId: block.id as number,
                                }).unwrap();
                                const updated = materialBlocks.filter((_, i) => i !== index);
                                setMaterialBlocks(updated);
                            } catch (error) {
                                Alert.alert(t('common.error'), t('learning.deleteError'));
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
            Alert.alert(t('common.error'), t('learning.titleEmpty'));
            return;
        }

        try {
            await updateLearning({
                id: learningId,
                dto: { title: learningTitle },
            }).unwrap();
            Alert.alert(t('learning.success'), t('learning.titleUpdated'));
        } catch (error) {
            Alert.alert(t('common.error'), t('learning.updateError'));
        }
    };

    const saveMaterialBlocks = async () => {
        try {
            for (const [index, block] of materialBlocks.entries()) {
                if (block.selectedImages.length === 0 && !block.description.trim()) {
                    continue;
                }

                if (block.isNew) {
                   
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
                    
                    const formData = new FormData();
                    formData.append('description', block.description);
                    
                    block.selectedImages.forEach((image, imgIndex) => {
                       
                        if (image.startsWith('file://') ) {
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
            Alert.alert(t('learning.success'), t('learning.materialsSaved'));
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            Alert.alert(t('common.error'), t('learning.saveError'));
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
                  
                    <View style={styles.titleSection}>
                        <Text style={styles.label}>{t('learning.lessonTitle')}:</Text>
                        <TextInput
                            style={styles.titleInput}
                            value={learningTitle}
                            onChangeText={setLearningTitle}
                            placeholder={t('learning.enterTitle')}
                        />
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={updateLearningTitle}
                            disabled={isUpdatingLearning}
                        >
                            {isUpdatingLearning ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>{t('learning.saveTitle')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                   
                    <View style={styles.materialsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('learning.materials')}</Text>
                            <TouchableOpacity
                                style={styles.addBlockButton}
                                onPress={addMaterialBlock}
                            >
                                <Text style={styles.addBlockButtonText}>+ {t('learning.block')}</Text>
                            </TouchableOpacity>
                        </View>

                        {materialBlocks.length > 0 ? (
                            materialBlocks.map((block, index) => (
                                <View key={index} style={styles.materialBlock}>
                                    <View style={styles.blockHeader}>
                                        <Text style={styles.blockNumber}>{t('learning.material')} #{index + 1}</Text>
                                        <TouchableOpacity
                                            onPress={() => removeMaterialBlock(index)}
                                            style={styles.removeBlockButton}
                                        >
                                            <Text style={styles.removeBlockButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                               
                                    <TextInput
                                        style={styles.descriptionInput}
                                        placeholder={t('learning.description')}
                                        value={block.description}
                                        onChangeText={(text) => {
                                            const updated = [...materialBlocks];
                                            updated[index].description = text;
                                            setMaterialBlocks(updated);
                                        }}
                                        multiline
                                        numberOfLines={3}
                                    />

                                
                                    <TouchableOpacity
                                        style={styles.pickButton}
                                        onPress={() => pickImages(index)}
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
                            <Text style={styles.noBlocksText}>{t('learning.noMaterialsAdded')}</Text>
                        )}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.saveAllButton]}
                            onPress={saveMaterialBlocks}
                        >
                            <Text style={styles.actionButtonText}>{t('learning.saveAllMaterials')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.backButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.actionButtonText}>{t('common.back')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <MaterialImagePickerModal
                visible={showImagePicker}
                selectedImages={selectedBlockForImages !== null ? materialBlocks[selectedBlockForImages]?.selectedImages || [] : []}
                onImagesChange={(images) => {
                    if (selectedBlockForImages !== null) {
                        const updated = [...materialBlocks];
                        updated[selectedBlockForImages].selectedImages = images;
                        setMaterialBlocks(updated);
                    }
                }}
                onClose={() => {
                    setShowImagePicker(false);
                    setSelectedBlockForImages(null);
                }}
            />
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
