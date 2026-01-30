import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../Layout/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetLearningsQuery, useAddLearningMutation, useDeleteLearningMutation } from '../store/api/learningApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { AddButton } from '../components/Button/AddButton';
import { ItemCard } from '../components/Card/ItemCard';
import { getImageUrls, FileSource } from '../utils/imageUtils';
import { translateServerArray } from '../utils/translatorUtils';
import { SearchInput } from '../components/Search/SearchInput';
import { AddLearningModal } from '../components/Modal/AddLearningModal';
import { useNavigation } from '@react-navigation/native';

type Learning = {
    id: number;
    title: string;
    content: Array<{
        id: number;
        description: string;
        files: FileSource[];
    }>;
    createdAt: string;
    updatedAt: string;
};

export const LearningScreen = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const { user } = useAppSelector(state => state.auth);
    const auth = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: rawLearnings = [], isLoading, error, refetch } = useGetLearningsQuery();
    const [addLearning, { isLoading: isAdding }] = useAddLearningMutation();
    const [deleteLearning] = useDeleteLearningMutation();

  
    const [learnings, setLearnings] = useState<any[]>([]);
    useEffect(() => {
        translateServerArray(rawLearnings, ['title']).then(setLearnings);
    }, [rawLearnings, i18n.language]);

    const filteredLearnings = useSearchFilter(learnings, searchQuery, {
        searchFields: ['title'],
    });

    const handleAddLearning = async () => {
        if (!newTitle.trim()) {
            Alert.alert(t('common.error'), t('learning.enterTitle'));
            return;
        }

        try {
            const result = await addLearning({
                title: newTitle,
            }).unwrap();
            
            setNewTitle('');
            setShowAddModal(false);
            
            navigation.navigate('LearningDetail', { learningId: result.id });
        } catch (error) {
            console.error('Ошибка при добавлении урока:', error);
            Alert.alert(t('common.error'), t('learning.addError'));
        }
    };

    const handleDeleteLearning = (id: string | number) => {
        Alert.alert(
            t('learning.deleteConfirm'),
            t('learning.deleteQuestion'),
            [
                { text: t('learning.cancel'), onPress: () => {} },
                {
                    text: t('learning.delete'),
                    onPress: async () => {
                        try {
                            await deleteLearning(Number(id)).unwrap();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('learning.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const errorMessage = error ? (
        ('status' in error ? error.status : 0) === 500 
            ? t('learning.error')
            : `${t('common.error')}: ${('data' in error ? (error.data as any)?.message : '') || t('learning.notFound')}`
    ) : null;

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text>{t('learning.loading')}</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            {errorMessage && (
                                <View style={styles.errorBanner}>
                                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    <TouchableOpacity onPress={refetch}>
                                        <Text style={styles.retryButtonText}>{t('tools.retry')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {showAddModal && (
                                <AddLearningModal
                                    visible={showAddModal}
                                    title={newTitle}
                                    onChangeTitle={setNewTitle}
                                    onClose={() => {
                                        setShowAddModal(false);
                                        setNewTitle('');
                                    }}
                                    onSubmit={handleAddLearning}
                                    isLoading={isAdding}
                                />
                            )}

                            <SearchInput
                                placeholder={t('learning.search')}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />

                            <View style={styles.learningsList}>
                                {filteredLearnings.length > 0 ? (
                                    filteredLearnings.map((learning: any, index: number) => (
                                        <ItemCard
                                            key={learning.id || index}
                                            item={{
                                                id: learning.id,
                                                title: learning.title,
                                                images: learning.content && learning.content.length > 0
                                                    ? getImageUrls(learning.content[0].files, auth?.accessToken)
                                                    : [],
                                            }}
                                            onPress={() => navigation.navigate('LearningDetail', { learningId: learning.id })}
                                            onEdit={isAdmin ? () => navigation.navigate('LearningEditor', { learningId: learning.id }) : undefined}
                                            onDelete={isAdmin ? handleDeleteLearning : undefined}
                                            variant="learning"
                                            showMenu={isAdmin}
                                        />
                                    ))
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        {learnings.length === 0 ? t('learning.noLearning') : t('learning.notFound')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
                
                {isAdmin && (
                    <AddButton onPress={() => setShowAddModal(true)} />
                )}
            </SafeAreaView>
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
        alignItems: 'center',
    },
    searchContainer: {
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    learningsList: {
        width: '100%',
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBanner: {
        width: '100%',
        backgroundColor: '#ffebee',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f44336',
    },
    errorBannerText: {
        color: '#c62828',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 36,
        color: '#fff',
        fontWeight: '200',
    },
});
