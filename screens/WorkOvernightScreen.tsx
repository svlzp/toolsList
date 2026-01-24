import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { AppLayout } from '../Layout/AppLayout';
import {
    useGetAllWorksQuery,
    useCreateWorkMutation,
    useDeleteWorkMutation,
    useUpdateQuantityByRtMutation,
    WorkOvernight,
} from '../store/api/workOvernightApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { useRoute, useNavigation } from '@react-navigation/native';

interface RouteParams {
    machineId: number;
    machineName: string;
}

interface WorkFormData {
    name: string;
    rt: string;
    quantity: string;
    madeBy: string;
    completed: string;
    manufacturingTime: string;
    stages: string;
}

export const WorkOvernightScreen = () => {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const params = route.params as RouteParams;

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { control, handleSubmit, reset, formState: { errors } } = useForm<WorkFormData>({
        defaultValues: {
            name: '',
            rt: '',
            quantity: '1',
            madeBy: '',
            completed: '0',
            manufacturingTime: '',
            stages: '',
        },
    });

    const { data: allWorks = [], isLoading, error, refetch } = useGetAllWorksQuery({
        includeArchived: showArchived,
        machineId: params.machineId,
    });
    const [createWork, { isLoading: isCreating }] = useCreateWorkMutation();
    const [deleteWork] = useDeleteWorkMutation();
    const [updateQuantity] = useUpdateQuantityByRtMutation();

    console.log('All Works:', allWorks);

    // Фильтруем работы по названию
    const filteredWorks = useMemo(() => {
        if (!searchQuery.trim()) {
            return allWorks;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return allWorks.filter((work: WorkOvernight) =>
            work.title.toLowerCase().includes(lowercasedQuery) ||
            work.rt.toLowerCase().includes(lowercasedQuery) ||
            (work.description?.toLowerCase().includes(lowercasedQuery) ?? false)
        );
    }, [allWorks, searchQuery]);

    const onSubmit = async (data: WorkFormData) => {
        try {
            // Парсим stages из строки (разделённые запятой или новой строкой)
            const stagesArray = data.stages
                ? data.stages.split('\n').map(s => s.trim()).filter(s => s.length > 0)
                : undefined;

            await createWork({
                name: data.name || undefined,
                rt: data.rt,
                quantity: parseInt(data.quantity) || 0,
                madeBy: data.madeBy || undefined,
                completed: parseInt(data.completed) || 0,
                manufacturingTime: data.manufacturingTime || undefined,
                machineId: params.machineId,
                stages: stagesArray,
            }).unwrap();

            reset();
            setShowAddModal(false);
            Alert.alert('Успех', 'Работа добавлена');
        } catch (error) {
            console.error('Ошибка при добавлении работы:', error);
            Alert.alert('Ошибка', 'Не удалось добавить работу');
        }
    };

    const handleDeleteWork = (id: number, title: string) => {
        Alert.alert(
            'Удаление',
            `Вы уверены, что хотите удалить работу "${title}"?`,
            [
                { text: 'Отмена', onPress: () => {} },
                {
                    text: 'Удалить',
                    onPress: async () => {
                        try {
                            await deleteWork(id).unwrap();
                            Alert.alert('Успех', 'Работа удалена');
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось удалить работу');
                        }
                    },
                },
            ]
        );
    };

    const handleUpdateQuantity = async (rt: string, quantity: number) => {
        try {
            await updateQuantity({ rt, quantity }).unwrap();
            Alert.alert('Успех', 'Количество обновлено');
        } catch (error) {
            console.error('Ошибка при обновлении количества:', error);
            Alert.alert('Ошибка', 'Не удалось обновить количество');
        }
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
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Загрузка работ...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            <Text style={styles.title}>Работы станка "{params.machineName}"</Text>

                            {errorMessage && (
                                <View style={styles.errorBanner}>
                                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    <Button title="Повторить" onPress={refetch} />
                                </View>
                            )}

                            <View style={styles.filterButtons}>
                                <Button
                                    title={showArchived ? 'Архивированные' : 'Активные'}
                                    onPress={() => setShowArchived(!showArchived)}
                                    color={showArchived ? '#FF9500' : '#34C759'}
                                />
                            </View>

                            {showAddModal && (
                                <View style={styles.addModal}>
                                    <Text style={styles.modalTitle}>Добавить работу</Text>
                                    
                                    <Controller
                                        control={control}
                                        name="name"
                                        render={({ field: { value, onChange } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Название работы"
                                                value={value}
                                                onChangeText={onChange}
                                                editable={!isCreating}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="rt"
                                        rules={{ required: 'RT код обязателен' }}
                                        render={({ field: { value, onChange } }) => (
                                            <>
                                                <TextInput
                                                    style={[styles.input, errors.rt && styles.inputError]}
                                                    placeholder="RT код *"
                                                    value={value}
                                                    onChangeText={onChange}
                                                    editable={!isCreating}
                                                />
                                                {errors.rt && (
                                                    <Text style={styles.errorText}>{errors.rt.message}</Text>
                                                )}
                                            </>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="quantity"
                                        render={({ field: { value, onChange } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Количество деталей"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="number-pad"
                                                editable={!isCreating}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="madeBy"
                                        render={({ field: { value, onChange } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Кем изготовлено"
                                                value={value}
                                                onChangeText={onChange}
                                                editable={!isCreating}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="completed"
                                        render={({ field: { value, onChange } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Изготовлено деталей"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="number-pad"
                                                editable={!isCreating}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="manufacturingTime"
                                        render={({ field: { value, onChange } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Время производства (например: 45 минут)"
                                                value={value}
                                                onChangeText={onChange}
                                                editable={!isCreating}
                                            />
                                        )}
                                    />

                                    <View style={styles.modalButtons}>
                                        <Button
                                            title="Отмена"
                                            onPress={() => {
                                                setShowAddModal(false);
                                                reset();
                                            }}
                                            disabled={isCreating}
                                        />
                                        <Button
                                            title={isCreating ? 'Загрузка...' : 'Создать'}
                                            onPress={handleSubmit(onSubmit)}
                                            disabled={isCreating}
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Поиск по названию или RT"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    clearButtonMode="while-editing"
                                />
                            </View>

                            <View style={styles.worksList}>
                                {filteredWorks.length > 0 ? (
                                    filteredWorks.map((work: WorkOvernight, index: number) => (
                                        <View
                                            key={work.id || index}
                                            style={styles.workItem}
                                            onTouchEnd={() => {
                                                navigation.navigate('WorkDetail', {
                                                    id: work.id,
                                                    name: work.title,
                                                    rt: work.rt,
                                                    quantity: work.quantity,
                                                    madeBy: work.description,
                                                    completed: work.completed,
                                                    manufacturingTime: '',
                                                });
                                            }}
                                        >
                                            <View style={styles.workHeader}>
                                                <View style={styles.workHeaderContent}>
                                                    <Text style={styles.workTitle}>{work.title}</Text>
                                                    <Text style={styles.workRt}>RT: {work.rt}</Text>
                                                </View>
                                                <View style={[
                                                    styles.statusBadge,
                                                    work.isArchived && styles.statusArchived,
                                                ]}>
                                                    <Text style={styles.statusText}>
                                                        {work.isArchived ? 'Архив' : 'Активно'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {work.description && (
                                                <Text style={styles.workDescription}>
                                                    {work.description}
                                                </Text>
                                            )}

                                            <View style={styles.workInfo}>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Количество:</Text>
                                                    <Text style={styles.infoValue}>{work.quantity}</Text>
                                                </View>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Сделано:</Text>
                                                    <Text style={styles.infoValue}>{work.completed}</Text>
                                                </View>
                                                {work.manufacturingTime && (
                                                    <View style={styles.infoItem}>
                                                        <Text style={styles.infoLabel}>Время производства:</Text>
                                                        <Text style={styles.infoValue}>{work.manufacturingTime}</Text>
                                                    </View>
                                                )}
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Создано:</Text>
                                                    <Text style={styles.infoValue}>{new Date(work.createdAt).toLocaleDateString('ru-RU')}</Text>
                                                </View>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Обновлено:</Text>
                                                    <Text style={styles.infoValue}>{new Date(work.updatedAt).toLocaleDateString('ru-RU')}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.workQuantity}>
                                                <Text style={styles.quantityLabel}>
                                                    Управление количеством
                                                </Text>
                                                {!work.isArchived && !isAdmin && (
                                                    <View style={styles.quantityButtons}>
                                                        <Button
                                                            title="-"
                                                            onPress={() =>
                                                                handleUpdateQuantity(work.rt, Math.max(0, work.quantity - 1))
                                                            }
                                                        />
                                                        <Button
                                                            title="+"
                                                            onPress={() =>
                                                                handleUpdateQuantity(work.rt, work.quantity + 1)
                                                            }
                                                        />
                                                    </View>
                                                )}
                                            </View>

                                            {isAdmin && (
                                                <View style={styles.adminButtons}>
                                                    <Button
                                                        title="Удалить"
                                                        color="#FF3B30"
                                                        onPress={() =>
                                                            handleDeleteWork(work.id, work.title)
                                                        }
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        {allWorks.length === 0 ? 'Нет работ' : 'Работы не найдены'}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
            {isAdmin && (
                <TouchableOpacity 
                    style={styles.floatingButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Text style={styles.floatingButtonText}>+</Text>
                </TouchableOpacity>
            )}
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
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
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#FF3B30',
        backgroundColor: '#ffebee',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    filterButtons: {
        marginBottom: 16,
    },
    searchContainer: {
        marginBottom: 15,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    worksList: {
        width: '100%',
    },
    workItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    workHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    workHeaderContent: {
        flex: 1,
        marginRight: 12,
    },
    workTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    workRt: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: '#34C759',
    },
    statusArchived: {
        backgroundColor: '#FF9500',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    workDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    workInfo: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    workQuantity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 12,
    },
    quantityLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    quantityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    adminButtons: {
        marginTop: 12,
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
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorBanner: {
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
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    floatingButtonText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
});
