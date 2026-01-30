import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { PredefinedInput } from '../Input/PredefinedInput';
import { PredefinedButton } from '../Button/PredefinedButton';

interface AddLearningModalProps {
    visible: boolean;
    title: string;
    onChangeTitle?: (text: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    isLoading?: boolean;
}

export const AddLearningModal: React.FC<AddLearningModalProps> = ({
    visible,
    title,
    onChangeTitle,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const { t } = useTranslation();

    if (!visible) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.modalTitle}>{t('learning.addTitle')}</Text>
            <PredefinedInput
                placeholder={t('learning.name')}
                value={title}
                onChangeText={onChangeTitle}
                isDisabled={isLoading}
            />
            <View style={styles.modalButtons}>
                <PredefinedButton
                    type="text"
                    label={t('learning.cancel')}
                    onPress={onClose}
                    disabled={isLoading}
                />
                <PredefinedButton
                    type="blue"
                    label={t('learning.add')}
                    onPress={onSubmit}
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
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
});
