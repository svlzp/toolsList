import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen, RootStackParamList } from './screens/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EMRCuttersScreen } from './screens/EMRCuttersScreen'; 
import { EMFCuttersScreen } from './screens/EMFCuttersScreen'; 

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EMRCutters" component={EMRCuttersScreen} />
        <Stack.Screen name="EMFCutters" component={EMFCuttersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


