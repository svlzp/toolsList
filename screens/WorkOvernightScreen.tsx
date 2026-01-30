import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { AppLayout } from '../Layout/AppLayout';
import {
    useGetAllWorksQuery,
    useCreateWorkMutation,
    useDeleteWorkMutation,
    useUpdateQuantityByRtMutation,
    WorkOvernight,
} from '../store/api/workOvernightApi';
import { useAppSelector } from '../hooks/reduxHooks';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { AddButton } from '../components/Button/AddButton';
import { WorkCard } from '../components/Card/WorkCard';
import { translateServerArray } from '../utils/translatorUtils';
import { AddWorkModal } from '../components/Modal/AddWorkModal';
import { SearchInput } from '../components/Search/SearchInput';
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
    const { t, i18n } = useTranslation();
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

    const { data: rawAllWorks = [], isLoading, error, refetch } = useGetAllWorksQuery({
        includeArchived: showArchived,
        machineId: params.machineId,
    });
    const [createWork, { isLoading: isCreating }] = useCreateWorkMutation();
    const [deleteWork] = useDeleteWorkMutation();
    const [updateQuantity] = useUpdateQuantityByRtMutation();

    const [allWorks, setAllWorks] = useState<any[]>([]);
    useEffect(() => {
        translateServerArray(rawAllWorks, ['title', 'description', 'rt']).then(setAllWorks);
    }, [rawAllWorks, i18n.language]);

    const filteredWorks = useSearchFilter(allWorks, searchQuery, {
        searchFields: ['title', 'rt', 'description'],
    });

    const onSubmit = async (data: WorkFormData) => {
        try {
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
            Alert.alert(t('works.success'), t('works.added'));
        } catch (error) {
            console.error('Ошибка при добавлении работы:', error);
            Alert.alert(t('common.error'), t('works.addError'));
        }
    };

    const handleDeleteWork = (id: number, title: string) => {
        Alert.alert(
            t('works.deleteConfirm'),
            `${t('works.deleteQuestion')} "${title}"?`,
            [
                { text: t('works.cancel'), onPress: () => {} },
                {
                    text: t('works.delete'),
                    onPress: async () => {
                        try {
                            await deleteWork(id).unwrap();
                            Alert.alert(t('works.success'), t('works.deleted'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('works.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleUpdateQuantity = async (rt: string, quantity: number) => {
        try {
            await updateQuantity({ rt, quantity }).unwrap();
            Alert.alert(t('works.success'), t('works.quantityUpdated'));
        } catch (error) {
            console.error('Ошибка при обновлении количества:', error);
            Alert.alert(t('common.error'), t('works.updateQuantityError'));
        }
    };

    const errorMessage = error ? (
        ('status' in error ? error.status : 0) === 500
            ? t('works.error')
            : `${t('common.error')}: ${('data' in error ? (error.data as any)?.message : '') || t('works.notFound')}`
    ) : null;

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>{t('works.loading')}</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.container}>
                            <Text style={styles.title}>{t('works.title')} "{params.machineName}"</Text>

                            {errorMessage && (
                                <View style={styles.errorBanner}>
                                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    <Button title={t('tools.retry')} onPress={refetch} />
                                </View>
                            )}

                            <View style={styles.filterButtons}>
                                <Button
                                    title={showArchived ? t('works.archived') : t('works.active')}
                                    onPress={() => setShowArchived(!showArchived)}
                                    color={showArchived ? '#FF9500' : '#34C759'}
                                />
                            </View>
                            {showAddModal && (
                                <AddWorkModal
                                    visible={showAddModal}
                                    onClose={() => {
                                        setShowAddModal(false);
                                        reset();
                                    }}
                                    onSubmit={onSubmit}
                                    control={control}
                                    handleSubmit={handleSubmit}
                                    errors={errors}
                                    isLoading={isCreating}
                                />
                            )}

                            <SearchInput
                                placeholder={t('works.search')}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />

                            <View style={styles.worksList}>
                                {filteredWorks.length > 0 ? (
                                    filteredWorks.map((work: WorkOvernight, index: number) => (
                                        <WorkCard
                                            key={work.id || index}
                                            work={work}
                                            onPress={() => {
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
                                            onDelete={isAdmin ? handleDeleteWork : undefined}
                                            onUpdateQuantity={handleUpdateQuantity}
                                            isAdmin={isAdmin}
                                        />
                                    ))
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        {allWorks.length === 0 ? t('works.noWorks') : t('works.notFound')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
            {isAdmin && (
                <AddButton onPress={() => setShowAddModal(true)} />
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
});
