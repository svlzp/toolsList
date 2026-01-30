import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next";
import { AppLayout } from "../Layout/AppLayout"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react";
import { useGetToolsQuery, useAddToolMutation, useDeleteToolMutation } from "../store/api/toolsApi";
import { useAppSelector } from "../hooks/reduxHooks";
import { useSearchFilter } from "../hooks/useSearchFilter";
import { AddButton } from "../components/Button/AddButton";
import { ItemCard } from "../components/Card/ItemCard";
import { AddItemModal, AddItemFormData } from "../components/Modal/AddItemModal";
import { ItemDetailsModal } from "../components/Modal/ItemDetailsModal";
import { SearchInput } from "../components/Search/SearchInput";
import { createFormDataFromItem, confirmDelete, handleApiCall } from "../utils/formUtils";
import { getImageUrls, FileSource } from "../utils/imageUtils";
import { translateServerArray } from "../utils/translatorUtils";


type Tool = {
    id: string;
    name: string;
    tool_id: string;
    description?: string;
    size?: string;
    type?: string;
    files?: FileSource[];
};

export const ToolsScreen = () => {
    const { t, i18n } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

    const { user } = useAppSelector(state => state.auth);
    const auth = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: rawTools = [], isLoading, error, refetch, isFetching } = useGetToolsQuery();
    const [addTool, { isLoading: isAdding }] = useAddToolMutation();
    const [deleteTool] = useDeleteToolMutation();


    const [tools, setTools] = useState<any[]>([]);
    useEffect(() => {
        translateServerArray(rawTools, ['name', 'description']).then(setTools);
    }, [rawTools, i18n.language]);

    const filteredTools = useSearchFilter(tools, searchQuery, {
        searchFields: ['name', 'tool_id'],
    });

    const handleAddTool = async (data: AddItemFormData, images: string[]) => {
        const formData = createFormDataFromItem(data, images, {
            fieldMapping: { item_id: 'tool_id' }
        });
        
        await handleApiCall(
            () => addTool(formData).unwrap(),
            t('tools.added'),
            t('tools.addError'),
            () => setVisible(false)
        );
    };

    const handleDeleteTool = (id: string | number) => {
        confirmDelete(
            t('tools.deleteConfirm'),
            t('tools.deleteQuestion'),
            async () => {
                await handleApiCall(
                    () => deleteTool(String(id)).unwrap(),
                    t('tools.deleted'),
                    t('tools.deleteError'),
                    () => {
                        setDetailsModalVisible(false);
                        setSelectedTool(null);
                    }
                );
            }
        );
    };

    const openToolDetails = (tool: Tool) => {
        setSelectedTool(tool);
        setDetailsModalVisible(true);
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
                        <Text>{t('tools.loading')}</Text>
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

                        <AddItemModal
                            visible={visible}
                            onClose={() => setVisible(false)}
                            onSubmit={handleAddTool}
                            isLoading={isAdding}
                            title={t('tools.addTitle')}
                            fields={{
                                name: { placeholder: t('tools.name') },
                                item_id: { placeholder: t('tools.toolId') },
                            }}
                            maxImages={10}
                        />

                        <ItemDetailsModal
                            visible={detailsModalVisible}
                            onClose={() => {
                                setDetailsModalVisible(false);
                                setSelectedTool(null);
                            }}
                            item={selectedTool ? {
                                id: selectedTool.id,
                                title: selectedTool.name,
                                subtitle: `ID: ${selectedTool.tool_id}`,
                                images: getImageUrls(selectedTool.files, auth?.accessToken),
                                fields: [
                                    { label: t('tools.description'), value: selectedTool.description },
                                    { label: t('tools.size'), value: selectedTool.size },
                                    { label: t('tools.type'), value: selectedTool.type },
                                ],
                            } : null}
                            title={t('tools.details')}
                            onDelete={handleDeleteTool}
                            showDeleteButton={isAdmin}
                        />

                        <View style={styles.toolsContainer}>
                            <Text style={styles.title}>{t('tools.title')}</Text>
                            
                            <SearchInput
                                placeholder={t('tools.search')}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            
                            <View style={styles.toolsList}>
                                {filteredTools.length > 0 ? (
                                    filteredTools.map((tool: any, index: number) => (
                                        <ItemCard
                                            key={tool.id || index}
                                            item={{
                                                id: tool.id,
                                                title: tool.name,
                                                subtitle: `ID: ${tool.tool_id}`,
                                                description: tool.description,
                                                images: getImageUrls(tool.files, auth?.accessToken),
                                            }}
                                            onPress={() => openToolDetails(tool)}
                                            onEdit={isAdmin ? () => openToolDetails(tool) : undefined}
                                            onDelete={isAdmin ? handleDeleteTool : undefined}
                                            variant="tool"
                                            showMenu={isAdmin}
                                        />
                                    ))
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        {tools.length === 0 ? t('tools.noTools') : t('tools.notFound')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                )}
                
                {isAdmin && (
                    <AddButton onPress={() => setVisible(true)} />
                )}
            </SafeAreaView>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
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
    toolsContainer: {
        width: '100%',
        marginTop: 20,
        alignItems: 'center',
    },
    toolsList: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
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
