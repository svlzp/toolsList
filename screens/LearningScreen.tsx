import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Button } from 'react-native';
import { AppLayout } from '../Layout/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetLearningsQuery, useAddLearningMutation, useDeleteLearningMutation } from '../store/api/learningApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { ItemCard } from '../components/Card/ItemCard';
import { getImageUrls, FileSource } from '../utils/imageUtils';
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
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const { user } = useAppSelector(state => state.auth);
    const auth = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: learnings = [], isLoading, error, refetch } = useGetLearningsQuery();
    const [addLearning, { isLoading: isAdding }] = useAddLearningMutation();
    const [deleteLearning] = useDeleteLearningMutation();

    const filteredLearnings = useMemo(() => {
        if (!searchQuery.trim()) {
            return learnings;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return learnings.filter((learning: any) => 
            learning.title.toLowerCase().includes(lowercasedQuery)
        );
    }, [learnings, searchQuery]);

    const handleAddLearning = async () => {
        if (!newTitle.trim()) {
            Alert.alert('Ошибка', 'Введите название урока');
            return;
        }

        try {
            const result = await addLearning({
                title: newTitle,
            }).unwrap();
            
            setNewTitle('');
            setShowAddModal(false);
            
            // Переходим на экран редактирования урока
            navigation.navigate('LearningDetail', { learningId: result.id });
        } catch (error) {
            console.error('Ошибка при добавлении урока:', error);
            Alert.alert('Ошибка', 'Не удалось добавить урок');
        }
    };

    const handleDeleteLearning = (id: string | number) => {
        Alert.alert(
            'Удаление',
            'Вы уверены, что хотите удалить этот урок?',
            [
                { text: 'Отмена', onPress: () => {} },
                {
                    text: 'Удалить',
                    onPress: async () => {
                        try {
                            await deleteLearning(Number(id)).unwrap();
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось удалить урок');
                        }
                    },
                },
            ]
        );
    };

    const errorMessage = error ? (
        ('status' in error ? error.status : 0) === 500 
            ? 'Ошибка сервера. Попробуйте позже.'
            : `Ошибка: ${('data' in error ? (error.data as any)?.message : '') || 'Не удалось загрузить'}`
    ) : null;

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text>Загрузка обучения...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            {errorMessage && (
                                <View style={styles.errorBanner}>
                                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    <TouchableOpacity onPress={refetch}>
                                        <Text style={styles.retryButtonText}>Повторить</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {showAddModal && (
                                <View style={styles.addModal}>
                                    <Text style={styles.modalTitle}>Добавить урок</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Название урока *"
                                        value={newTitle}
                                        onChangeText={setNewTitle}
                                    />
                                    <View style={styles.modalButtons}>
                                        <Button
                                            title="Отмена"
                                            onPress={() => {
                                                setShowAddModal(false);
                                                setNewTitle('');
                                            }}
                                        />
                                        <Button
                                            title="Создать"
                                            onPress={handleAddLearning}
                                            disabled={isAdding}
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Поиск по названию"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    clearButtonMode="while-editing"
                                />
                            </View>

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
                                        {learnings.length === 0 ? "Нет уроков" : "Уроки не найдены"}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
                
                {isAdmin && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Text style={styles.fabText}>+</Text>
                    </TouchableOpacity>
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
    addModal: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
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
