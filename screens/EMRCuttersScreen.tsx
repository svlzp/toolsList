import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native"
import { AppLayout } from "../Layout/AppLayout"


export const EMRCuttersScreen = () => {
    return(
        <AppLayout>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <Text style={styles.title}>EMR Cutters</Text>
                       
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AppLayout>
    )
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
    }
});