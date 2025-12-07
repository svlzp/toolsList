import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/assetsTablet/logo/Logo';
import { PredefinedButton } from '../components/Button/PredefinedButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoutIcon from '../components/assetsTablet/LogoutIcon';
import {
  EnglishButton,
  HebrewButton,
  RussianButton,
} from '../components/LanguageButton/PredefinedLanguageButtons';
import { useActions } from '../hooks/useActions';

 // Dimensions.get('window').height
 

interface AppLayoutProps {
  children: ReactNode;
}


const renderChildren = (children: ReactNode): ReactNode => {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text>{children}</Text>;
  }
  
  if (React.isValidElement(children)) {
    return children;
  }
  
  if (Array.isArray(children)) {
    return React.Children.map(children, child => renderChildren(child));
  }
  
  return children;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { logout } = useActions();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_tokens');
    logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          <View style={styles.rightSection}>
            <RussianButton onPress={() => Alert.alert('Russian')} />
            <EnglishButton onPress={() => Alert.alert('English')} />
            <HebrewButton onPress={() => Alert.alert('Hebrew')} />
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => Alert.alert(
                'Выход',
                'Вы уверены, что хотите выйти?',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Выход', style: 'destructive', onPress: handleLogout },
                ]
              )}
            >
              <LogoutIcon width={24} height={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {renderChildren(children)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3A55F8',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#3A55F8',
    //  paddingHorizontal
    
  },
  header: {
    backgroundColor: '#3A55F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'visible',
  },
  logoContainer: {
    minHeight: 40,
    justifyContent: 'center',
    flexShrink: 1,
    maxWidth: '40%',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 10,
    flexShrink: 0,
  },
  logoutButton: {
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'visible',
    zIndex: 11,
  },
  content: {
  //  flexGrow: 1,
  //  justifyContent: 'center',
  //  alignItems: 'center',
    backgroundColor: '#3A55F8',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    height: '100%',
   
    

    
  },
});
