import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Controller, UseFormHandleSubmit, FieldValues, FieldErrors, Control } from 'react-hook-form';
import { PredefinedInput } from '../Input/PredefinedInput';
import { PredefinedButton } from '../Button/PredefinedButton';

interface WorkFormData {
    name: string;
    rt: string;
    quantity: string;
    madeBy: string;
    completed: string;
    manufacturingTime: string;
    stages: string;
}

interface AddWorkModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: WorkFormData) => void;
    control: Control<WorkFormData>;
    handleSubmit: UseFormHandleSubmit<WorkFormData>;
    errors: FieldErrors<WorkFormData>;
    isLoading?: boolean;
}

export const AddWorkModal: React.FC<AddWorkModalProps> = ({
    visible,
    onClose,
    control,
    handleSubmit,
    errors,
    isLoading = false,
    onSubmit: handleOnSubmit,
}) => {
    const { t } = useTranslation();

    if (!visible) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.modalTitle}>{t('works.addTitle')}</Text>

            <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange } }) => (
                    <PredefinedInput
                        placeholder={t('works.name')}
                        value={value}
                        onChangeText={onChange}
                        isDisabled={isLoading}
                    />
                )}
            />

            <Controller
                control={control}
                name="rt"
                rules={{ required: 'RT код обязателен' }}
                render={({ field: { value, onChange } }) => (
                    <PredefinedInput
                        placeholder={t('works.rt')}
                        value={value}
                        onChangeText={onChange}
                        isDisabled={isLoading}
                        isRequired
                        hasError={!!errors.rt}
                        errorMessage={errors.rt?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="quantity"
                render={({ field: { value, onChange } }) => (
                    <PredefinedInput
                        placeholder={t('works.quantity')}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        isDisabled={isLoading}
                    />
                )}
            />

            <Controller
                control={control}
                name="madeBy"
                render={({ field: { value, onChange } }) => (
                    <PredefinedInput
                        placeholder={t('works.madeBy')}
                        value={value}
                        onChangeText={onChange}
                        isDisabled={isLoading}
                    />
                )}
            />

            <Controller
                control={control}
                name="completed"
                render={({ field: { value, onChange } }) => (
                    <PredefinedInput
                        placeholder={t('works.completed')}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        isDisabled={isLoading}
                    />
                )}
            />

            <Controller
                control={control}
                name="manufacturingTime"
                render={({ field: { value, onChange } }) => (
                    <PredefinedInput
                        placeholder={t('works.manufacturingTime')}
                        value={value}
                        onChangeText={onChange}
                        isDisabled={isLoading}
                    />
                )}
            />

            <View style={styles.modalButtons}>
                <PredefinedButton
                    type="text"
                    label={t('works.cancel')}
                    onPress={onClose}
                    disabled={isLoading}
                />
                <PredefinedButton
                    type="blue"
                    label={isLoading ? t('tools.saving') : t('works.save')}
                    onPress={handleSubmit(handleOnSubmit)}
                    disabled={isLoading}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#FF3B30',
        backgroundColor: '#ffebee',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 8,
    },
});
