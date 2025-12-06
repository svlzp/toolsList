import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ScaledSize,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMobileLoginMutation } from '../store/api/authApi';
import { PredefinedInput } from '../components/Input/PredefinedInput';
import { PredefinedButton } from '../components/Button/PredefinedButton';
import GearIcon from '../components/assetsTablet/logo/GearIcon';
import { useAppSelector } from '../hooks/reduxHooks';
import { useActions } from '../hooks/useActions';
import { saveAuthToStorage } from '../hooks/useAuthPersist';

type RootStackParamList = {
  Welcome: undefined;
  StoreSelection: undefined;
  Login: undefined;
  Register: undefined;
};
export const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [addAuth, { isLoading, data, error }] = useMobileLoginMutation();
  const { setLang, setTokens } = useActions();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { control, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>(); 
  const [rememberMe, setRememberMe] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLang(lang);
  };

  const onSubmit = async (formData: { email: string; password: string }) => {
    try {
      const result = await addAuth(formData).unwrap();
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      
      
      if (rememberMe) {
        await saveAuthToStorage({ 
          accessToken: result.accessToken, 
          refreshToken: result.refreshToken 
        });
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  useEffect(() => {
    if(isAuthenticated){
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
 
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.mainContainer}>
          <View style={styles.card}>
            <View style={styles.logoContainer}>  
                 <GearIcon />
            </View>

            <Text style={styles.title}>{t('login.title')}</Text>
            <Controller 
              control={control}
              rules={{
                required: true,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('login.emailError'),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PredefinedInput
                  label={t('login.email')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
              name="email"
            />
            {errors.email && <Text style={styles.errorText}>{t('login.emailError')}</Text>} 

            <Controller 
              control={control}
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PredefinedInput
                  isPassword={true}
                  label={t('login.password')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.password}
                />
              )}
              name="password"
            />
            {errors.password && <Text style={styles.errorText}>{t('login.passwordError')}</Text>} 

            <TouchableOpacity 
              style={styles.rememberMeContainer} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>{t('login.rememberMe')}</Text>
            </TouchableOpacity>

            <View style={{marginTop: 20}}>
              <PredefinedButton type="blue" label={t('login.submit')} onPress={handleSubmit(onSubmit)} disabled={isLoading} /> 
            </View>
            <View>
              <PredefinedButton type="text" textColor='#000' label={t('login.register')} onPress={() => navigation.navigate('Register')} />
            </View>
            <View style={styles.buttonLanguage}>
              <PredefinedButton 
                type="text" 
                textColor={i18n.language === 'ru' ? '#3A55F8' : '#000'} 
                label={t('languages.russian')} 
                onPress={() => changeLanguage('ru')} 
              />
              <PredefinedButton 
                type="text" 
                textColor={i18n.language === 'en' ? '#3A55F8' : '#000'} 
                label={t('languages.english')} 
                onPress={() => changeLanguage('en')} 
              />
              <PredefinedButton 
                type="text" 
                textColor={i18n.language === 'he' ? '#3A55F8' : '#000'} 
                label={t('languages.hebrew')} 
                onPress={() => changeLanguage('he')} 
              />
            </View>
          
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    flex: 1,
    backgroundColor: '#3A55F8',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20, 
  },
  mainContainer: {
    top: "10%",
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '90%',
    maxWidth: 400, 
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
  },
  logoStub: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  buttonLanguage: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorText: { 
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#3A55F8',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#3A55F8',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#333',
  },
});
