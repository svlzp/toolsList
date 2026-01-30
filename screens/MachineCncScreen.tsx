import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../Layout/AppLayout';
import { useGetAllMachinesQuery, useCreateMachineMutation, useDeleteMachineMutation } from '../store/api/machineCncApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { AddButton } from '../components/Button/AddButton';
import { ItemCard } from '../components/Card/ItemCard';
import { AddMachineModal } from '../components/Modal/AddMachineModal';
import { SearchInput } from '../components/Search/SearchInput';
import { getImageUrls } from '../utils/imageUtils';
import { translateServerObject, translateServerArray } from '../utils/translatorUtils';
import { useNavigation } from '@react-navigation/native';

export const MachineCncScreen = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const { user } = useAppSelector(state => state.auth);
    const auth = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: rawMachines = [], isLoading, error, refetch } = useGetAllMachinesQuery();
    const [createMachine, { isLoading: isCreating }] = useCreateMachineMutation();
    const [deleteMachine] = useDeleteMachineMutation();

 
    const [machines, setMachines] = useState<any[]>([]);
    useEffect(() => {
        translateServerArray(rawMachines, ['name', 'description']).then(setMachines);
    }, [rawMachines, i18n.language]);

    const filteredMachines = useSearchFilter(machines, searchQuery, {
        searchFields: ['name', 'description'],
    });

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

            Alert.alert(t('machines.success'), t('machines.added'));
        } catch (error) {
            console.error('Ошибка при добавлении станка:', error);
            Alert.alert(t('common.error'), t('machines.addError'));
        }
    };

    const handleDeleteMachine = (id: number | string, name?: string) => {
        const machineName = name || 'станок';
        Alert.alert(
            t('machines.deleteConfirm'),
            `${t('machines.deleteQuestion')} ${machineName}?`,
            [
                { text: t('machines.cancel'), onPress: () => {} },
                {
                    text: t('machines.delete'),
                    onPress: async () => {
                        try {
                            await deleteMachine(Number(id)).unwrap();
                            Alert.alert(t('machines.success'), t('machines.deleted'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('machines.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const errorMessage = error ? (
        ('status' in error ? error.status : 0) === 500
            ? t('machines.error')
            : `${t('common.error')}: ${('data' in error ? (error.data as any)?.message : '') || t('machines.notFound')}`
    ) : null;

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>{t('machines.loading')}</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            <Text style={styles.title}>{t('machines.title')}</Text>

                            {errorMessage && (
                                <View style={styles.errorBanner}>
                                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    <TouchableOpacity onPress={refetch}>
                                        <Text style={styles.retryButtonText}>{t('machines.retry')}</Text>
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

                            <SearchInput
                                placeholder={t('machines.search')}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />

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
                                            ? t('machines.noMachines')
                                            : t('machines.notFound')}
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