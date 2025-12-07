import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen, RootStackParamList } from './screens/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MachineCncScreen } from './screens/MachineCncScreen'; 
import { ToolsScreen } from './screens/ToolsScreen'; 
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAuthPersist } from './hooks/useAuthPersist';
import { useActions } from './hooks/useActions';
import { useAppSelector } from './hooks/reduxHooks';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import './i18n'; 
import { LearningScreen } from './screens/LearningScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { isLoading, tokens } = useAuthPersist();
  const { setTokens } = useActions();
  const [isReady, setIsReady] = useState(false);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isLoading) {
      if (tokens) {
        setTokens(tokens);
      }
      setIsReady(true);
    }
  }, [isLoading, tokens]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3A55F8' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
        
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="MachineCnc" component={MachineCncScreen} />
            <Stack.Screen name="Tools" component={ToolsScreen} />
            <Stack.Screen name="Learning" component={LearningScreen} />
          </>
        ) : (
        
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}


