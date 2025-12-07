import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '../../Layout/AppLayout';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
    message = 'Загрузка...' 
}) => {
    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.text}>{message}</Text>
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
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});
