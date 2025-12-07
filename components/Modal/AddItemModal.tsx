import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ImagePickerComponent } from '../ImagePicker/ImagePickerComponent';

export interface AddItemFormData {
    name: string;
    item_id: string;
    description: string;
    size: string;
    type: string;
}

export interface FieldConfig {
    placeholder?: string;
    required?: boolean;
    requiredMessage?: string;
    show?: boolean;
    multiline?: boolean;
}

interface AddItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: AddItemFormData, images: string[]) => Promise<void>;
    isLoading?: boolean;
    title?: string;
    fields?: {
        name?: FieldConfig;
        item_id?: FieldConfig;
        description?: FieldConfig;
        size?: FieldConfig;
        type?: FieldConfig;
    };
    maxImages?: number;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
    visible,
    onClose,
    onSubmit,
    isLoading = false,
    title = 'Добавление',
    fields = {},
    maxImages = 10,
}) => {
    const [images, setImages] = useState<string[]>([]);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<AddItemFormData>({
        defaultValues: { name: '', item_id: '', description: '', size: '', type: '' }
    });

    const handleClose = () => {
        reset();
        setImages([]);
        onClose();
    };

    const handleFormSubmit = async (data: AddItemFormData) => {
        try {
            await onSubmit(data, images);
            reset();
            setImages([]);
        } catch (err) {}
    };

  
    const getFieldConfig = (fieldName: keyof typeof fields, defaults: Partial<FieldConfig> = {}): FieldConfig => ({
        show: true,
        ...defaults,
        ...fields[fieldName],
    });

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
            <View style={styles.modalBackground}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{title}</Text>

                        <ImagePickerComponent images={images} onImagesChange={setImages} maxImages={maxImages} />

                        {getFieldConfig('name', { placeholder: 'Название *', required: true }).show !== false && (
                            <Controller
                                control={control}
                                name="name"
                                rules={fields.name?.required !== false ? { required: fields.name?.requiredMessage || 'Название обязательно' } : undefined}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[styles.input, errors.name && styles.inputError]}
                                            placeholder={fields.name?.placeholder || 'Название *'}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                                    </View>
                                )}
                            />
                        )}

                        {getFieldConfig('item_id', { placeholder: 'ID *', required: true }).show !== false && (
                            <Controller
                                control={control}
                                name="item_id"
                                rules={fields.item_id?.required !== false ? { required: fields.item_id?.requiredMessage || 'ID обязателен' } : undefined}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[styles.input, errors.item_id && styles.inputError]}
                                            placeholder={fields.item_id?.placeholder || 'ID *'}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                        {errors.item_id && <Text style={styles.errorText}>{errors.item_id.message}</Text>}
                                    </View>
                                )}
                            />
                        )}

                        {getFieldConfig('description', { placeholder: 'Описание', multiline: true }).show !== false && (
                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, (fields.description?.multiline !== false) && styles.multilineInput]}
                                        placeholder={fields.description?.placeholder || 'Описание'}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        multiline={fields.description?.multiline !== false}
                                        numberOfLines={fields.description?.multiline !== false ? 3 : 1}
                                    />
                                )}
                            />
                        )}

                        {getFieldConfig('size', { placeholder: 'Размер' }).show !== false && (
                            <Controller
                                control={control}
                                name="size"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        placeholder={fields.size?.placeholder || 'Размер'}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                        )}

                        {getFieldConfig('type', { placeholder: 'Тип' }).show !== false && (
                            <Controller
                                control={control}
                                name="type"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        placeholder={fields.type?.placeholder || 'Тип'}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                        )}

                        <View style={styles.buttonContainer}>
                            <Button title={isLoading ? "Сохранение..." : "Сохранить"} onPress={handleSubmit(handleFormSubmit)} disabled={isLoading} />
                            <View style={styles.buttonSpacer} />
                            <Button title="Отмена" onPress={handleClose} color="#888" />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
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
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonSpacer: {
        width: 10,
    },
});

export default AddItemModal;
