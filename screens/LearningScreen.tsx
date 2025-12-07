import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppLayout } from '../Layout/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LearningScreen = () => {
    return (
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.placeholder}>
                        <Text style={styles.icon}>📚</Text>
                        <Text style={styles.title}>Обучение</Text>
                        <Text style={styles.subtitle}>Раздел находится в разработке</Text>
                    </View>
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
        padding: 20,
    },
    placeholder: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
