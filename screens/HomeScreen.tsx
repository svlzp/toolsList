
import { useState } from 'react';
import { BuyProductCard, ReceiveOrderCard, RepairDeviceCard, ViewIconCard } from '../components/Card/PredefinedCards';
import { PredefinedButton } from '../components/Button/PredefinedButton';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getOrientation } from '../hooks/orientation';
import { AppLayout } from '../Layout/AppLayout';

export type RootStackParamList = {
  Home: undefined;
  EMRCutters: undefined;
  EMFCutters: undefined;
  // добавьте другие экраны при необходимости
};



export function HomeScreen({ navigation }: { navigation: any }) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [buttonOpacity] = useState(new Animated.Value(0));
  const [orientation, setOrientation] = useState(getOrientation());

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    // Логика для кнопки "Next"
  };

  const handleLayoutChange = () => {
    setOrientation(getOrientation());
  };

  return (
    <AppLayout>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} onLayout={handleLayoutChange}>
          <View style={styles.container}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Добро пожаловать!👋</Text>
            </View>
            <View style={[styles.containerCard]}>
              <View style={styles.cardItem}>
                <BuyProductCard onPress={() => navigation.navigate('EMRCutters')} selected={selectedCard === 0} />
              </View>
              <View style={styles.cardItem}>
                <RepairDeviceCard onPress={() => navigation.navigate('EMFCutters')} selected={selectedCard === 1} />
              </View>
              <View style={styles.cardItem}>
                <ReceiveOrderCard onPress={() => handleCardClick(2)} selected={selectedCard === 2} />
              </View>
              <View style={styles.cardItem}>
                <ViewIconCard onPress={() => handleCardClick(3)} selected={selectedCard === 3} />
              </View>
            </View>
          </View>
          {selectedCard !== null && (
            <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
              <PredefinedButton type="green" width={200} height={40} onPress={handleNext} label={'Next'} />
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppLayout>
  );
}

// Заглушки для других экранов (создайте отдельные файлы)
function BuyProductScreen() {
  return <View><Text>Buy Product Screen</Text></View>;
}

function NewOrderScreen() {
  return <View><Text>New Order Screen</Text></View>;
}


const styles = StyleSheet.create({
    safeArea:{
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
      borderRadius: 40,
    },
    containerCard: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 20,
    },
    cardItem: {
      margin: 10,
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    buttonContainer: {
      marginTop: 20,
      alignItems: 'center',
      backgroundColor: '#3A55F8',
    },
  });
