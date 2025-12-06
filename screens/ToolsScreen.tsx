import { ScrollView, View, Text, StyleSheet, Button, Modal, TextInput, Image, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native"
import { AppLayout } from "../Layout/AppLayout"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useMemo } from "react";
import { pickImageFromGallery, takePhoto } from "../utils/imageUtils";
import { useGetToolsQuery, useAddToolMutation, useDeleteToolMutation, useDeleteToolFileMutation } from "../store/api/toolsApi";
import { useAppSelector } from "../hooks/reduxHooks";

export const ToolsScreen = () => {
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  
    const { user } = useAppSelector(state => state.auth);
    const isAdmin = user?.role === 'admin';


    const { data: tools = [], isLoading, error, refetch } = useGetToolsQuery();
    const [addTool, { isLoading: isAdding }] = useAddToolMutation();
    const [deleteTool, { isLoading: isDeleting }] = useDeleteToolMutation();
    const [deleteToolFile] = useDeleteToolFileMutation();

    type Tool = {
        id: string;
        name: string;
        tool_id: string;
        description?: string;
        size?: string;
        type?: string;
        files?: string[];
    };

    const [toolName, setToolName] = useState('');
    const [toolId, setToolId] = useState('');
    const [toolDescription, setToolDescription] = useState('');
    const [toolSize, setToolSize] = useState('');
    const [toolType, setToolType] = useState('');
    const [toolImages, setToolImages] = useState<string[]>([]);

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


    const pickImage = async () => {
        const imageUri = await pickImageFromGallery();
        if (imageUri && toolImages.length < 10) {
            setToolImages([...toolImages, imageUri]);
        }
    };


    const openCamera = async () => {
        const imageUri = await takePhoto();
        if (imageUri && toolImages.length < 10) {
            setToolImages([...toolImages, imageUri]);
        }
    };

 
    const handleImageSelection = () => {
        if (toolImages.length >= 10) {
            Alert.alert("Ошибка", "Максимум 10 изображений");
            return;
        }
        Alert.alert(
            "Выберите источник",
            "Откуда вы хотите взять изображение?",
            [
                {
                    text: "Отмена",
                    style: "cancel"
                },
                {
                    text: "Галерея",
                    onPress: pickImage
                },
                {
                    text: "Камера",
                    onPress: openCamera
                }
            ]
        );
    };

    const removeImage = (index: number) => {
        setToolImages(toolImages.filter((_, i) => i !== index));
    };

    const saveTool = async () => {
        if (!toolName || !toolId) {
            Alert.alert("Ошибка", "Необходимо указать название и ID инструмента");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', toolName);
            formData.append('tool_id', toolId);
            if (toolDescription) formData.append('description', toolDescription);
            if (toolSize) formData.append('size', toolSize);
            if (toolType) formData.append('type', toolType);

        
            toolImages.forEach((imageUri, index) => {
                formData.append('files', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `image_${index}.jpg`,
                } as any);
            });

            await addTool(formData).unwrap();
            
          
            setToolName('');
            setToolId('');
            setToolDescription('');
            setToolSize('');
            setToolType('');
            setToolImages([]);
            setVisible(false);
            Alert.alert("Успех", "Инструмент добавлен");
        } catch (err) {
            console.error('Add tool error:', err);
            Alert.alert("Ошибка", "Не удалось добавить инструмент");
        }
    };

    const handleDeleteTool = async (id: string) => {
        Alert.alert(
            "Удаление",
            "Вы уверены, что хотите удалить этот инструмент?",
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Удалить",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTool(id).unwrap();
                            setDetailsModalVisible(false);
                            setSelectedTool(null);
                            Alert.alert("Успех", "Инструмент удален");
                        } catch (err) {
                            Alert.alert("Ошибка", "Не удалось удалить инструмент");
                        }
                    }
                }
            ]
        );
    };

    const openToolDetails = (tool: Tool) => {
        setSelectedTool(tool);
        setDetailsModalVisible(true);
    };

    if (isLoading) {
        return (
            <AppLayout>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text>Загрузка инструментов...</Text>
                    </View>
                </SafeAreaView>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.errorText}>Ошибка загрузки</Text>
                        <Button title="Повторить" onPress={() => refetch()} />
                    </View>
                </SafeAreaView>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        {isAdmin && (
                            <Button title="Добавить инструмент" onPress={() => setVisible(true)} />
                        )}

                        <Modal
                            visible={visible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Добавление инструмента</Text>

                                    <ScrollView horizontal style={styles.imagesPreview}>
                                        {toolImages.map((uri, index) => (
                                            <View key={index} style={styles.imagePreviewContainer}>
                                                <Image source={{ uri }} style={styles.previewImage} />
                                                <TouchableOpacity 
                                                    style={styles.removeImageBtn}
                                                    onPress={() => removeImage(index)}
                                                >
                                                    <Text style={styles.removeImageText}>×</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        {toolImages.length < 10 && (
                                            <TouchableOpacity
                                                style={styles.addImageBtn}
                                                onPress={handleImageSelection}
                                            >
                                                <Text style={styles.addImageText}>+</Text>
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                    <Text style={styles.imageCountText}>{toolImages.length}/10 изображений</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Название инструмента *"
                                        value={toolName}
                                        onChangeText={setToolName}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="ID инструмента *"
                                        value={toolId}
                                        onChangeText={setToolId}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Описание"
                                        value={toolDescription}
                                        onChangeText={setToolDescription}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Размер"
                                        value={toolSize}
                                        onChangeText={setToolSize}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Тип"
                                        value={toolType}
                                        onChangeText={setToolType}
                                    />

                                    <View style={styles.buttonContainer}>
                                        <Button 
                                            title={isAdding ? "Сохранение..." : "Сохранить"} 
                                            onPress={saveTool} 
                                            disabled={isAdding}
                                        />
                                        <View style={styles.buttonSpacer} />
                                        <Button title="Отмена" onPress={() => setVisible(false)} color="#888" />
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        <Modal
                            visible={detailsModalVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setDetailsModalVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Детали инструмента</Text>
                                    
                                    {selectedTool && (
                                        <>
                                           
                                            <ScrollView horizontal style={styles.detailsImagesContainer}>
                                                {selectedTool.files && selectedTool.files.length > 0 ? (
                                                    selectedTool.files.map((file, index) => (
                                                        <Image 
                                                            key={index} 
                                                            source={{ uri: file }} 
                                                            style={styles.detailsImage} 
                                                        />
                                                    ))
                                                ) : (
                                                    <View style={styles.noImagePlaceholder}>
                                                        <Text style={styles.noImageText}>Нет фото</Text>
                                                    </View>
                                                )}
                                            </ScrollView>
                                            
                                            <View style={styles.detailsInfo}>
                                                <Text style={styles.detailsName}>{selectedTool.name}</Text>
                                                <Text style={styles.detailsId}>ID: {selectedTool.tool_id}</Text>
                                                {selectedTool.description && (
                                                    <Text style={styles.detailsComment}>Описание: {selectedTool.description}</Text>
                                                )}
                                                {selectedTool.size && (
                                                    <Text style={styles.detailsComment}>Размер: {selectedTool.size}</Text>
                                                )}
                                                {selectedTool.type && (
                                                    <Text style={styles.detailsComment}>Тип: {selectedTool.type}</Text>
                                                )}
                                            </View>
                                            
                                            <View style={styles.buttonContainer}>
                                                {isAdmin && (
                                                    <>
                                                        <Button 
                                                            title="Удалить" 
                                                            onPress={() => handleDeleteTool(selectedTool.id)} 
                                                            color="#FF3B30" 
                                                        />
                                                        <View style={styles.buttonSpacer} />
                                                    </>
                                                )}
                                                <Button 
                                                    title="Закрыть" 
                                                    onPress={() => setDetailsModalVisible(false)} 
                                                    color="#007AFF" 
                                                />
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                        </Modal>

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
                                        <TouchableOpacity
                                            key={tool.id || index}
                                            style={styles.toolItem}
                                            onPress={() => openToolDetails(tool)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.toolImageContainer}>
                                                {tool.files && tool.files.length > 0 ? (
                                                    <Image source={{ uri: tool.files[0] }} style={styles.toolItemImage} />
                                                ) : (
                                                    <View style={styles.noImagePlaceholder}>
                                                        <Text style={styles.noImageText}>Нет фото</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.toolInfo}>
                                                <Text style={styles.toolName}>{tool.name}</Text>
                                                <Text style={styles.toolIdText}>ID: {tool.tool_id}</Text>
                                                {tool.description && (
                                                    <Text style={styles.toolComment} numberOfLines={1} ellipsizeMode="tail">
                                                        {tool.description}
                                                    </Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        maxHeight: '90%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    imagesPreview: {
        flexDirection: 'row',
        marginBottom: 10,
        maxHeight: 100,
    },
    imagePreviewContainer: {
        position: 'relative',
        marginRight: 10,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    addImageBtn: {
        width: 80,
        height: 80,
        backgroundColor: '#e1e1e1',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageText: {
        fontSize: 30,
        color: '#666',
    },
    imageCountText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    buttonSpacer: {
        width: 10,
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
    toolItem: {
        width: 200,
        height: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    toolImageContainer: {
        width: '100%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    toolItemImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    noImagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#999',
    },
    toolInfo: {
        alignItems: 'center',
        width: '100%',
    },
    toolName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'center',
    },
    toolIdText: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: 'center',
        color: '#666',
    },
    toolComment: {
        fontSize: 12,
        color: '#666',
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
    noResultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    detailsImagesContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        maxHeight: 200,
    },
    detailsImage: {
        width: 180,
        height: 180,
        borderRadius: 5,
        resizeMode: 'cover',
        marginRight: 10,
    },
    detailsInfo: {
        width: '100%',
        marginBottom: 15,
    },
    detailsName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    detailsId: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    detailsComment: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
});