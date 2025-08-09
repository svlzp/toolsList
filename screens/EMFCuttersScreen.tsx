import { SafeAreaView, ScrollView, View, Text, StyleSheet, Button, Modal, TextInput, Image, TouchableOpacity, Alert, Platform } from "react-native"
import { AppLayout } from "../Layout/AppLayout"
import { useState, useMemo } from "react";
import { pickImageFromGallery, takePhoto } from "../utils/imageUtils";

export const EMFCuttersScreen = () => {
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    type Tool = {
        id: string;
        name: string;
        comment: string;
        image: string | null;
        date: string;
    };
    const [tools, setTools] = useState<Tool[]>([]);
    const [toolName, setToolName] = useState('');
    const [toolId, setToolId] = useState('');
    const [toolComment, setToolComment] = useState('');
    const [toolImage, setToolImage] = useState<string | null>(null);

    // Фильтрация инструментов на основе поискового запроса
    const filteredTools = useMemo(() => {
        if (!searchQuery.trim()) {
            return tools;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return tools.filter(tool => 
            tool.name.toLowerCase().includes(lowercasedQuery) || 
            tool.id.toLowerCase().includes(lowercasedQuery)
        );
    }, [tools, searchQuery]);

    // Функция для выбора изображения из галереи
    const pickImage = async () => {
        const imageUri = await pickImageFromGallery();
        if (imageUri) {
            setToolImage(imageUri);
        }
    };

    // Функция для открытия камеры
    const openCamera = async () => {
        const imageUri = await takePhoto();
        if (imageUri) {
            setToolImage(imageUri);
        }
    };

    // Функция для показа меню выбора источника изображения
    const handleImageSelection = () => {
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

    const saveTool = () => {
        if (!toolName || !toolId) {
            Alert.alert("Ошибка", "Необходимо указать название и ID инструмента");
            return;
        }

        const newTool: Tool = {
            id: toolId,
            name: toolName,
            comment: toolComment,
            image: toolImage,
            date: new Date().toLocaleDateString(),
        };

        setTools([...tools, newTool]);
        setToolName('');
        setToolId('');
        setToolComment('');
        setToolImage(null);
        setVisible(false);
    };

    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <Button title="Добавить инструмент" onPress={() => setVisible(true)} />

                        <Modal
                            visible={visible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Добавление инструмента</Text>

                                    <TouchableOpacity
                                        style={styles.imageContainer}
                                        onPress={handleImageSelection}
                                    >
                                        {toolImage ? (
                                            <Image source={{ uri: toolImage }} style={styles.toolImage} />
                                        ) : (
                                            <View style={styles.placeholderImage}>
                                                <Text style={styles.placeholderText}>
                                                    Нажмите для выбора изображения
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <View style={styles.imageButtonsContainer}>
                                        <Button 
                                            title="Выбрать из галереи" 
                                            onPress={pickImage} 
                                        />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Название инструмента"
                                        value={toolName}
                                        onChangeText={setToolName}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="ID инструмента"
                                        value={toolId}
                                        onChangeText={setToolId}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Комментарий"
                                        value={toolComment}
                                        onChangeText={setToolComment}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    <View style={styles.buttonContainer}>
                                        <Button title="Сохранить" onPress={saveTool} />
                                        <View style={styles.buttonSpacer} />
                                        <Button title="Отмена" onPress={() => setVisible(false)} color="#888" />
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        {tools.length > 0 && (
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
                                            <View key={index} style={styles.toolItem}>
                                                <View style={styles.toolImageContainer}>
                                                    {tool.image ? (
                                                        <Image source={{ uri: tool.image }} style={styles.toolItemImage} />
                                                    ) : (
                                                        <View style={styles.noImagePlaceholder}>
                                                            <Text style={styles.noImageText}>Нет фото</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.toolInfo}>
                                                    <Text style={styles.toolName}>{tool.name}</Text>
                                                    <Text style={styles.toolId}>ID: {tool.id}</Text>
                                                    {tool.comment ? <Text style={styles.toolComment}>Комментарий: {tool.comment}</Text> : null}
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noResultsText}>Инструменты не найдены</Text>
                                    )}
                                </View>
                            </View>
                        )}
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
    text: {
        marginBottom: 20,
        fontSize: 18,
    },
    imageContainer: {
        width: 150,
        height: 150,
        marginBottom: 15,
        borderRadius: 5,
        overflow: 'hidden',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    placeholderText: {
        textAlign: 'center',
        color: '#666',
    },
    toolImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        justifyContent: 'space-between',
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
    toolId: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: 'center',
    },
    toolComment: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    imageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
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
});