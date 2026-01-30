import React, { useCallback } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ImagePickerComponent } from '../../utils/ImagePickerComponent';
import { PredefinedInput } from '../Input/PredefinedInput';
import { PredefinedButton } from '../Button/PredefinedButton';

interface MachineFormData {
    name: string;
    description?: string;
}

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
    const { t } = useTranslation();
    const { control, handleSubmit, reset, watch } = useForm<MachineFormData>({
        defaultValues: {
            name: '',
            description: '',
        },
    });
    const [machineImages, setMachineImages] = React.useState<string[]>([]);

    const handleClose = useCallback(() => {
        reset();
        setMachineImages([]);
        onClose();
    }, [onClose, reset]);

    const handleFormSubmit = async (data: MachineFormData) => {
        await onSubmit({
            name: data.name,
            description: data.description || undefined,
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

                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: 'Название станка обязательно' }}
                            render={({ field: { value, onChange } }) => (
                                <PredefinedInput
                                    placeholder="Название станка *"
                                    value={value}
                                    onChangeText={onChange}
                                    isDisabled={isLoading}
                                    isRequired
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { value, onChange } }) => (
                                <PredefinedInput
                                    placeholder="Описание"
                                    value={value}
                                    onChangeText={onChange}
                                    textArea
                                    isDisabled={isLoading}
                                />
                            )}
                        />

                        <View style={styles.modalButtons}>
                            <PredefinedButton
                                type="text"
                                label={t('common.cancel') || 'Отмена'}
                                onPress={handleClose}
                                disabled={isLoading}
                            />
                            <PredefinedButton
                                type="blue"
                                label={isLoading ? t('common.saving') || 'Загрузка...' : t('common.create') || 'Создать'}
                                onPress={handleSubmit(handleFormSubmit)}
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
