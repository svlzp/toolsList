import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppLayout } from '../Layout/AppLayout';
import { useUpdateQuantityByRtMutation, useGetStagesByWorkIdQuery, useCreateStageMutation } from '../store/api/workOvernightApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { PredefinedButton } from '@/components/Button/PredefinedButton';
import { ImagePickerComponent } from '../utils/ImagePickerComponent';

interface RouteParams {
    id: number;
    name?: string;
    rt: string;
    quantity: number;
    madeBy?: string;
    completed: number;  
    manufacturingTime?: string;
    stages?: string[];  
}

interface StageBlock {
    description: string;
    selectedImages: string[];
}

export const WorkDetailScreen = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation<any>();
    const work = route.params as RouteParams;
    const { user } = useAppSelector(state => state.auth);

    const { data: stagesData = [], isLoading: isLoadingStages, refetch: refetchStages } = useGetStagesByWorkIdQuery(work.id);
    const stagesList = stagesData.map((stage) => stage.description);

    const [completed, setCompleted] = useState(work.completed);
    const [updateQuantity, { isLoading }] = useUpdateQuantityByRtMutation();
    const [createStage, { isLoading: isSavingStages }] = useCreateStageMutation();
    
    const [isAddingStages, setIsAddingStages] = useState(false);
    const [stageBlocks, setStageBlocks] = useState<StageBlock[]>([]);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

    const pickImages = async (blockIndex: number) => {
        setSelectedBlockIndex(blockIndex);
    };

    const handleImagesSelected = (images: string[]) => {
        if (selectedBlockIndex !== null) {
            const updated = [...stageBlocks];
            updated[selectedBlockIndex].selectedImages = [
                ...updated[selectedBlockIndex].selectedImages,
                ...images,
            ];
            setStageBlocks(updated);
            setSelectedBlockIndex(null);
        }
    };

    const addStageBlock = () => {
        setStageBlocks([
            ...stageBlocks,
            {
                description: '',
                selectedImages: [],
            },
        ]);
    };

    const removeStageBlock = (index: number) => {
        const updated = stageBlocks.filter((_, i) => i !== index);
        setStageBlocks(updated);
    };

    const removeImage = (blockIndex: number, imageIndex: number) => {
        const updated = [...stageBlocks];
        updated[blockIndex].selectedImages = updated[blockIndex].selectedImages.filter(
            (_, i) => i !== imageIndex
        );
        setStageBlocks(updated);
    };

    const handleSaveStages = async () => {
        if (stageBlocks.length === 0) {
            Alert.alert(t('common.error'), t('works.addBlock'));
            return;
        }

        try {
            for (const [blockIndex, block] of stageBlocks.entries()) {
                if (block.selectedImages.length === 0 && !block.description.trim()) {
                    continue;
                }

                const formData = new FormData();
                formData.append('stepNumber', (blockIndex + stagesList.length + 1).toString());
                
                if (block.description.trim()) {
                    formData.append('description', block.description);
                }

                block.selectedImages.forEach((image, index) => {
                    formData.append('file', {
                        uri: image,
                        name: `stage_${Date.now()}_${index}.jpg`,
                        type: 'image/jpeg',
                    } as any);
                });

                await createStage({
                    workId: work.id,
                    formData,
                }).unwrap();
            }

            setStageBlocks([]);
            setIsAddingStages(false);
            refetchStages();
            Alert.alert(t('works.success'), t('works.stagesAdded'));
        } catch (error) {
            console.error('Ошибка при сохранении особенностей:', error);
            Alert.alert(t('common.error'), t('works.stagesSaveError'));
        }
    };

    const handleIncrement = () => {
       
        if (completed < work.quantity) {
            setCompleted(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (completed > work.completed) {
            setCompleted(prev => prev - 1);
        }
    };

    const handleConfirm = async () => {
        Alert.alert(
            t('works.confirm'),
            `${t('works.completed')}: ${completed} ${t('works.from')} ${work.quantity}\n\n${t('works.updateProgress')}?`,
            [
                { text: t('common.cancel'), onPress: () => {} },
                {
                    text: t('works.confirm'),
                    onPress: async () => {
                        try {
                            await updateQuantity({
                                rt: work.rt,
                                completed: completed,
                            }).unwrap();
                            Alert.alert(t('works.success'), t('works.progressUpdated'));
                            navigation.goBack();
                        } catch (error) {
                            console.error('Ошибка при обновлении:', error);
                            Alert.alert(t('common.error'), t('works.updateError'));
                        }
                    },
                },
            ]
        );
    };


    const remaining = work.quantity - completed;
    const percentComplete = (completed / work.quantity) * 100;

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <Button title={`← ${t('common.back')}`} onPress={() => navigation.goBack()} />

                        <View style={styles.header}>
                            <Text style={styles.title}>{work.name || t('works.work')}</Text>
                            <View style={styles.rtBadge}>
                                <Text style={styles.rtText}>RT: {work.rt}</Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{t('works.workInfo')}</Text>

                            {work.madeBy && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>{t('works.madeBy')}:</Text>
                                    <Text style={styles.value}>{work.madeBy}</Text>
                                </View>
                            )}

                            {work.manufacturingTime && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>{t('works.manufacturingTime')}:</Text>
                                    <Text style={styles.value}>{work.manufacturingTime}</Text>
                                </View>
                            )}

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>{t('works.totalParts')}:</Text>
                                <Text style={styles.value}>{work.quantity}</Text>
                            </View>
                        </View>

                        {stagesList && stagesList.length > 0 && user?.role?.toUpperCase() === 'ADMIN' && (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{t('works.setupFeatures')}</Text>
                                {isLoadingStages ? (
                                    <ActivityIndicator size="small" color="#007AFF" />
                                ) : (
                                    <>
                                        {stagesList.map((stage: string, index: number) => (
                                            <View key={index} style={styles.stageRow}>
                                                <Text style={styles.stageNumber}>{index + 1}</Text>
                                                <Text style={styles.stageText}>{stage}</Text>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        )}

                        {user?.role?.toUpperCase() === 'ADMIN' && (
                            <TouchableOpacity 
                                style={styles.floatingAddButton}
                                onPress={() => setIsAddingStages(!isAddingStages)}
                            >
                                <Text style={styles.floatingAddButtonText}>
                                    {isAddingStages ? t('common.hide') : `+ ${t('works.addDescription')}`}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {isAddingStages && user?.role?.toUpperCase() === 'ADMIN' && (
                            <View style={styles.addStagesForm}>
                                <Text style={styles.formTitle}>{t('works.addSetupFeatures')}</Text>
                                
                                {stageBlocks.length > 0 ? (
                                    stageBlocks.map((block, blockIndex) => (
                                        <View key={blockIndex} style={styles.stageBlockForm}>
                                            <View style={styles.blockHeader}>
                                                <Text style={styles.blockTitle}>{t('works.block')} {blockIndex + 1}</Text>
                                                <TouchableOpacity onPress={() => removeStageBlock(blockIndex)}>
                                                    <Text style={styles.removeBlockText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <TextInput
                                                style={styles.descriptionInput}
                                                placeholder={t('works.featureDescription')}
                                                value={block.description}
                                                onChangeText={(text) => {
                                                    const updated = [...stageBlocks];
                                                    updated[blockIndex].description = text;
                                                    setStageBlocks(updated);
                                                }}
                                                multiline={true}
                                                numberOfLines={3}
                                            />

                                            <TouchableOpacity 
                                                style={styles.pickButton}
                                                onPress={() => pickImages(blockIndex)}
                                            >
                                                <Text style={styles.pickButtonText}>{t('learning.addImages')}</Text>
                                            </TouchableOpacity>

                                            {block.selectedImages.length > 0 && (
                                                <View style={styles.imagesGrid}>
                                                    {block.selectedImages.map((image, imageIndex) => (
                                                        <View key={imageIndex} style={styles.imageWrapper}>
                                                            <Image 
                                                                source={{ uri: image }} 
                                                                style={styles.thumbnail}
                                                            />
                                                            <TouchableOpacity 
                                                                style={styles.removeImageButton}
                                                                onPress={() => removeImage(blockIndex, imageIndex)}
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
                                    <Text style={styles.noBlocksText}>{t('works.noBlocks')}</Text>
                                )}

                                <TouchableOpacity 
                                    style={styles.addBlockButton}
                                    onPress={addStageBlock}
                                >
                                    <Text style={styles.addBlockButtonText}>+ {t('works.addBlock')}</Text>
                                </TouchableOpacity>

                                <View style={styles.formButtons}>
                                    <Button 
                                        title={t('common.cancel')} 
                                        onPress={() => {
                                            setIsAddingStages(false);
                                            setStageBlocks([]);
                                        }}
                                        disabled={isSavingStages}
                                    />
                                    <Button 
                                        title={isSavingStages ? t('common.saving') : t('common.save')} 
                                        onPress={handleSaveStages}
                                        disabled={isSavingStages}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{t('works.progress')}</Text>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min(percentComplete, 100)}%` },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {Math.round(percentComplete)}%
                                </Text>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>{t('works.completed')}</Text>
                                    <Text style={styles.statValue}>{completed}</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>{t('works.remaining')}</Text>
                                    <Text style={styles.statValue}>{remaining}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{t('works.updateProgress')}</Text>
                            <Text style={styles.description}>
                                {t('works.completed')}: {completed} {t('works.from')} {work.quantity} {t('works.parts')}
                            </Text>

                            <View style={styles.quantityControl}>
                                <Button
                                    title="−"
                                    onPress={handleDecrement}
                                    disabled={completed === work.completed || isLoading}
                                    color="#FF3B30"
                                />
                                <View style={styles.quantityDisplay}>
                                    <Text style={styles.quantityValue}>{completed}</Text>
                                    <Text style={styles.quantityLabel}>{t('works.done')}</Text>
                                </View>
                                <Button
                                    title="+"
                                    onPress={handleIncrement}
                                    disabled={completed === work.quantity || isLoading}
                                    color="#34C759"
                                />
                            </View>

                            <Text style={styles.note}>
                                {t('works.incrementNote')}
                            </Text>

                            <PredefinedButton
                                label={isLoading ? t('common.loading') : t('works.confirmUpdate')}
                                onPress={handleConfirm}
                                disabled={isLoading || completed === work.completed}
                                type='green'
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

          
            <Modal visible={selectedBlockIndex !== null} animationType="slide">
                {selectedBlockIndex !== null && (
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setSelectedBlockIndex(null)}>
                                <Text style={styles.modalCloseButton}>✕</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{t('learning.addImages')}</Text>
                            <View style={{ width: 40 }} />
                        </View>
                        <ImagePickerComponent 
                            images={stageBlocks[selectedBlockIndex]?.selectedImages || []}
                            onImagesChange={handleImagesSelected}
                            maxImages={10}
                            onClose={() => setSelectedBlockIndex(null)}
                            hideHeader={true}
                        />
                    </SafeAreaView>
                )}
            </Modal>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        padding: 16,
    },
    header: {
        marginVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    rtBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    rtText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#34C759',
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'right',
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 8,
    },
    quantityDisplay: {
        alignItems: 'center',
        flex: 1,
    },
    quantityValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    quantityLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    note: {
        fontSize: 12,
        color: '#FF9500',
        marginBottom: 16,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    stageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    stageNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
        marginRight: 12,
        minWidth: 24,
    },
    stageText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    addStageButton: {
        marginTop: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    addStageButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    addStagesForm: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    stageBlockForm: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
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
    blockTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    removeBlockText: {
        fontSize: 20,
        color: '#FF3B30',
        fontWeight: 'bold',
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
    addBlockButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    addBlockButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    formButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    floatingAddButton: {
        backgroundColor: '#007AFF',
        borderRadius: 50,
        paddingHorizontal: 24,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    floatingAddButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
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
