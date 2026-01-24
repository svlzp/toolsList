import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ScrollView } from 'react-native';
import { ImagePickerComponent } from '../ImagePicker/ImagePickerComponent';

export interface AddMachineModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description?: string;
        images: string[];
    }) => Promise<void>;
    isLoading?: boolean;
}

export const AddMachineModal: React.FC<AddMachineModalProps> = ({
    visible,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const [machineName, setMachineName] = useState('');
    const [machineDescription, setMachineDescription] = useState('');
    const [machineImages, setMachineImages] = useState<string[]>([]);

    const handleClose = useCallback(() => {
        setMachineName('');
        setMachineDescription('');
        setMachineImages([]);
        onClose();
    }, [onClose]);

    const handleSubmit = async () => {
        await onSubmit({
            name: machineName,
            description: machineDescription || undefined,
            images: machineImages,
        });
        handleClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalBackground}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.addModal}>
                        <Text style={styles.modalTitle}>Добавить станок</Text>

                        <ImagePickerComponent
                            images={machineImages}
                            onImagesChange={setMachineImages}
                            maxImages={10}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Название станка *"
                            value={machineName}
                            onChangeText={setMachineName}
                            editable={!isLoading}
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Описание"
                            value={machineDescription}
                            onChangeText={setMachineDescription}
                            multiline
                            editable={!isLoading}
                        />
                        <View style={styles.modalButtons}>
                            <Button
                                title="Отмена"
                                onPress={handleClose}
                                disabled={isLoading}
                            />
                            <Button
                                title={isLoading ? 'Загрузка...' : 'Создать'}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-end',
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
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
});
