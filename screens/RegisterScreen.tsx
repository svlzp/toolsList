import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRegisterMutation } from '../store/api/authApi';
import { useActions } from '../hooks/useActions';
import { PredefinedInput } from '../components/Input/PredefinedInput';
import { PredefinedButton } from '../components/Button/PredefinedButton';
import GearIcon from '../components/assetsTablet/logo/GearIcon';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export const RegisterScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [register, { isLoading }] = useRegisterMutation();
  const { setLang } = useActions();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>(); 

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLang(lang);
  }; 

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      await register(formData).unwrap();
      Alert.alert(t('common.success'), t('register.submit'), [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert(t('common.error'), 'Не удалось зарегистрироваться');
    }
  };

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

            <Text style={styles.title}>{t('register.title')}</Text>

            <Controller 
              control={control}
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PredefinedInput
                  label={t('register.name')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.name}
                />
              )}
              name="name"
            />
            {errors.name && <Text style={styles.errorText}>Введите имя (минимум 2 символа)</Text>} 

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
                  label={t('register.email')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.email}
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
                  label={t('register.password')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.password}
                />
              )}
              name="password"
            />
            {errors.password && <Text style={styles.errorText}>{t('login.passwordError')}</Text>} 

            <View style={{marginTop: 20}}>
              <PredefinedButton 
                type="blue" 
                label={t('register.submit')} 
                onPress={handleSubmit(onSubmit)} 
                disabled={isLoading} 
              /> 
            </View>

            <View>
              <PredefinedButton 
                type="text" 
                textColor='#000' 
                label={t('login.register')} 
                onPress={() => navigation.navigate('Login')} 
              />
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
});