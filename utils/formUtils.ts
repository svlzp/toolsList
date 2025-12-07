import { Alert } from 'react-native';
import { AddItemFormData } from '../components/Modal/AddItemModal';

export interface FormDataConfig {
    fieldMapping?: Record<string, string>; // { item_id: 'tool_id' }
}


export const createFormDataFromItem = (
    data: AddItemFormData,
    images: string[],
    config: FormDataConfig = {}
): FormData => {
    const formData = new FormData();
    const { fieldMapping = {} } = config;


    Object.entries(data).forEach(([key, value]) => {
        if (value) {
            const fieldName = fieldMapping[key] || key;
            formData.append(fieldName, value);
        }
    });


    images.forEach((imageUri, index) => {
        formData.append('files', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
        } as any);
    });

    return formData;
};


export const confirmDelete = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
): void => {
    Alert.alert(
        title,
        message,
        [
            { text: 'Отмена', style: 'cancel' },
            {
                text: 'Удалить',
                style: 'destructive',
                onPress: onConfirm,
            },
        ]
    );
};


export const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    onSuccess?: () => void
): Promise<boolean> => {
    try {
        await apiCall();
        Alert.alert('Успех', successMessage);
        onSuccess?.();
        return true;
    } catch (err) {
        console.error(errorMessage, err);
        Alert.alert('Ошибка', errorMessage);
        return false;
    }
};
