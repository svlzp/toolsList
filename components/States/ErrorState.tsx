import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '../../Layout/AppLayout';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    retryButtonTitle?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
    message = 'Ошибка загрузки',
    onRetry,
    retryButtonTitle = 'Повторить'
}) => {
    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.errorText}>{message}</Text>
                    {onRetry && (
                        <Button title={retryButtonTitle} onPress={onRetry} />
                    )}
                </View>
            </SafeAreaView>
        </AppLayout>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontSize: 16,
    },
});
