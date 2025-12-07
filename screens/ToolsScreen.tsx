import { ScrollView, View, Text, StyleSheet, Button, TextInput } from "react-native"
import { AppLayout } from "../Layout/AppLayout"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useMemo } from "react";
import { useGetToolsQuery, useAddToolMutation, useDeleteToolMutation } from "../store/api/toolsApi";
import { useAppSelector } from "../hooks/reduxHooks";
import { ItemCard } from "../components/Card/ItemCard";
import { AddItemModal, AddItemFormData } from "../components/Modal/AddItemModal";
import { ItemDetailsModal, ItemDetails } from "../components/Modal/ItemDetailsModal";
import { LoadingState, ErrorState } from "../components/States";
import { createFormDataFromItem, confirmDelete, handleApiCall } from "../utils/formUtils";

type Tool = {
    id: string;
    name: string;
    tool_id: string;
    description?: string;
    size?: string;
    type?: string;
    files?: string[];
};

export const ToolsScreen = () => {
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const { data: tools = [], isLoading, error, refetch, isFetching } = useGetToolsQuery();
    const [addTool, { isLoading: isAdding }] = useAddToolMutation();
    const [deleteTool] = useDeleteToolMutation();

    
    if (error) {
        console.log('ToolsScreen Error:', JSON.stringify(error));
    }

    const filteredTools = useMemo(() => {
        if (!searchQuery.trim()) {
            return tools;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return tools.filter(tool => 
            tool.name.toLowerCase().includes(lowercasedQuery) || 
            tool.tool_id.toLowerCase().includes(lowercasedQuery)
        );
    }, [tools, searchQuery]);

    const handleAddTool = async (data: AddItemFormData, images: string[]) => {
        console.log('=== Добавление инструмента ===');
        console.log('Данные формы:', data);
        console.log('Изображения:', images);
        
        const formData = createFormDataFromItem(data, images, {
            fieldMapping: { item_id: 'tool_id' }
        });
        
        console.log('FormData создан');
        
        await handleApiCall(
            () => {
                console.log('Отправка запроса на сервер...');
                return addTool(formData).unwrap();
            },
            'Инструмент добавлен',
            'Не удалось добавить инструмент',
            () => {
                console.log('Инструмент успешно добавлен!');
                setVisible(false);
            }
        );
    };

    const handleDeleteTool = (id: string) => {
        confirmDelete(
            'Удаление',
            'Вы уверены, что хотите удалить этот инструмент?',
            async () => {
                await handleApiCall(
                    () => deleteTool(id).unwrap(),
                    'Инструмент удален',
                    'Не удалось удалить инструмент',
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
                        <Text>Загрузка инструментов...</Text>
                    </View>
                ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                      
                        {errorMessage && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                <Button title="Повторить" onPress={refetch} />
                            </View>
                        )}

                        {isAdmin && (
                            <Button title="Добавить инструмент" onPress={() => setVisible(true)} />
                        )}

                        <AddItemModal
                            visible={visible}
                            onClose={() => setVisible(false)}
                            onSubmit={handleAddTool}
                            isLoading={isAdding}
                            title="Добавление инструмента"
                            fields={{
                                name: { placeholder: 'Название инструмента *' },
                                item_id: { placeholder: 'ID инструмента *' },
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
                                images: selectedTool.files,
                                fields: [
                                    { label: 'Описание', value: selectedTool.description },
                                    { label: 'Размер', value: selectedTool.size },
                                    { label: 'Тип', value: selectedTool.type },
                                ],
                            } : null}
                            title="Детали инструмента"
                            onDelete={handleDeleteTool}
                            showDeleteButton={isAdmin}
                        />

                        <View style={styles.toolsContainer}>
                            <Text style={styles.title}>Список инструментов</Text>
                            
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Поиск по названию или ID"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    clearButtonMode="while-editing"
                                />
                            </View>
                            
                            <View style={styles.toolsList}>
                                {filteredTools.length > 0 ? (
                                    filteredTools.map((tool, index) => (
                                        <ItemCard
                                            key={tool.id || index}
                                            item={{
                                                id: tool.id,
                                                title: tool.name,
                                                subtitle: `ID: ${tool.tool_id}`,
                                                description: tool.description,
                                                images: tool.files,
                                            }}
                                            onPress={() => openToolDetails(tool)}
                                            variant="tool"
                                        />
                                    ))
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        {tools.length === 0 ? "Нет инструментов" : "Инструменты не найдены"}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
});
