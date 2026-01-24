import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '../Layout/AppLayout';
import { useGetAllMachinesQuery, useCreateMachineMutation, useDeleteMachineMutation } from '../store/api/machineCncApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { ItemCard } from '../components/Card/ItemCard';
import { AddMachineModal } from '../components/Modal/AddMachineModal';
import { getImageUrls } from '../utils/imageUtils';
import { useNavigation } from '@react-navigation/native';

export const MachineCncScreen = () => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const { user } = useAppSelector(state => state.auth);
    const auth = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: machines = [], isLoading, error, refetch } = useGetAllMachinesQuery();
    const [createMachine, { isLoading: isCreating }] = useCreateMachineMutation();
    const [deleteMachine] = useDeleteMachineMutation();
    console.log('Machines:', machines);

    // Debug логирование
    useEffect(() => {
        if (machines.length > 0) {
            console.log('Machines loaded:', machines.length);
        }
    }, [machines]);

    const filteredMachines = useMemo(() => {
        if (!searchQuery.trim()) {
            return machines;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return machines.filter((machine: any) =>
            machine.name.toLowerCase().includes(lowercasedQuery) ||
            (machine.description?.toLowerCase().includes(lowercasedQuery) ?? false)
        );
    }, [machines, searchQuery]);

    const handleAddMachine = async (data: {
        name: string;
        description?: string;
        images: string[];
    }) => {
        try {
            const files = data.images.map((image, index) => ({
                uri: image,
                name: `machine-photo-${Date.now()}-${index}.jpg`,
                type: 'image/jpeg',
            }));

            await createMachine({
                data: {
                    name: data.name,
                    description: data.description,
                },
                files: files.length > 0 ? files : undefined,
            }).unwrap();

            Alert.alert('Успех', 'Станок добавлен');
        } catch (error) {
            console.error('Ошибка при добавлении станка:', error);
            Alert.alert('Ошибка', 'Не удалось добавить станок');
        }
    };

    const handleDeleteMachine = (id: number | string, name?: string) => {
        const machineName = name || 'станок';
        Alert.alert(
            'Удаление',
            `Вы уверены, что хотите удалить ${machineName}?`,
            [
                { text: 'Отмена', onPress: () => {} },
                {
                    text: 'Удалить',
                    onPress: async () => {
                        try {
                            await deleteMachine(Number(id)).unwrap();
                            Alert.alert('Успех', 'Станок удалён');
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось удалить станок');
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
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Загрузка станков...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            <Text style={styles.title}>Станки CNC</Text>

                            {errorMessage && (
                                <View style={styles.errorBanner}>
                                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    <TouchableOpacity onPress={refetch}>
                                        <Text style={styles.retryButtonText}>Повторить</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {showAddModal && (
                                <AddMachineModal
                                    visible={showAddModal}
                                    onClose={() => setShowAddModal(false)}
                                    onSubmit={handleAddMachine}
                                    isLoading={isCreating}
                                />
                            )}

                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Поиск по названию или описанию"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    clearButtonMode="while-editing"
                                />
                            </View>

                            <View style={styles.machinesList}>
                                {filteredMachines.length > 0 ? (
                                    filteredMachines.map((machine: any, index: number) => {
                                        const imageUrls = getImageUrls(machine.files, auth?.accessToken);
                                        
                                        return (
                                        <ItemCard
                                            key={machine.id || index}
                                            item={{
                                                id: machine.id,
                                                title: machine.name,
                                                description: machine.description,
                                                images: imageUrls,
                                            }}
                                            onPress={() =>
                                                navigation.navigate('WorkOvernightDetail', {
                                                    machineId: machine.id,
                                                    machineName: machine.name,
                                                })
                                            }
                                            onEdit={isAdmin ? () => {} : undefined}
                                            onDelete={isAdmin ? handleDeleteMachine : undefined}
                                            variant="machine"
                                            showMenu={isAdmin}
                                        />
                                        );
                                    })
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        {machines.length === 0
                                            ? 'Нет станков'
                                            : 'Станки не найдены'}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
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
    machinesList: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
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
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
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