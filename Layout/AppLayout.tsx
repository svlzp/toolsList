import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import Logo from '../components/assetsTablet/logo/Logo';
import { PredefinedButton } from '../components/Button/PredefinedButton';
import {
  EnglishButton,
  HebrewButton,
  RussianButton,
} from '../components/LanguageButton/PredefinedLanguageButtons';

 // Dimensions.get('window').height
 

interface AppLayoutProps {
  children: ReactNode;
}

// Вспомогательная функция для обработки текстовых элементов
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          <View style={styles.headerButtons}>
            <View style={styles.langButtons}>
              <RussianButton onPress={() => Alert.alert('Russian')} />
              <EnglishButton onPress={() => Alert.alert('English')} />
              <HebrewButton onPress={() => Alert.alert('Hebrew')} />
            </View>
           
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
    marginTop: 16, //  12
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  logoContainer: {
    // minHeight
    minHeight: 40,
    justifyContent: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
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
