import { SafeAreaView, ScrollView, View, Text, StyleSheet, Button, Modal, TextInput, Image, TouchableOpacity, Alert } from "react-native"
import { AppLayout } from "../Layout/AppLayout"
import { useState } from "react";

export const EMFCuttersScreen = () => {
    const [visible, setVisible] = useState(false);
    

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
    
    // Функция для имитации выбора изображения
    const pickImage = () => {
        // В реальном приложении здесь будет использоваться react-native-image-picker или другая библиотека
        Alert.alert("Выбор изображения", "В реальном приложении здесь откроется галерея для выбора фото");
        // Для демонстрации установим заглушку URL
        setToolImage("https://via.placeholder.com/150");
    };
    
    // Функция сохранения инструмента
    const saveTool = () => {
        if (!toolName || !toolId) {
            Alert.alert("Ошибка", "Название и ID обязательны для заполнения");
            return;
        }
        
        const newTool = {
            id: toolId,
            name: toolName,
            comment: toolComment,
            image: toolImage,
            date: new Date().toISOString()
        };
        
        setTools([...tools, newTool]);
        
        // Очищаем форму
        setToolName('');
        setToolId('');
        setToolComment('');
        setToolImage(null);
        
        // Закрываем модальное окно
        setVisible(false);
        
        Alert.alert("Успешно", "Инструмент добавлен в список");
    };
    
    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <Button title="Открыть модалку" onPress={() => setVisible(true)} />

                        <Modal
                            visible={visible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Добавление инструмента</Text>
                                    
                                    
                                    <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                                        {toolImage ? (
                                            <Image source={{ uri: toolImage }} style={styles.toolImage} />
                                        ) : (
                                            <View style={styles.placeholderImage}>
                                                <Text>Нажмите для добавления фото</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    
                                 
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
                            <View style={styles.toolsList}>
                                <Text style={styles.title}>Список инструментов</Text>
                                {tools.map((tool, index) => (
                                    <View key={index} style={styles.toolItem}>
                                        {tool.image && <Image source={{ uri: tool.image }} style={styles.toolItemImage} />}
                                        <View style={styles.toolInfo}>
                                            <Text style={styles.toolName}>{tool.name}</Text>
                                            <Text>ID: {tool.id}</Text>
                                            {tool.comment ? <Text>Комментарий: {tool.comment}</Text> : null}
                                        </View>
                                    </View>
                                ))}
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
    toolsList: {
        width: '100%',
        marginTop: 20,
    },
    toolItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    toolItemImage: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderRadius: 5,
    },
    toolInfo: {
        flex: 1,
    },
    toolName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});