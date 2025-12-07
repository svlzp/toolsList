import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRegisterMutation } from '../store/api/authApi';
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [register, { isLoading }] = useRegisterMutation();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>(); 

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      await register(formData).unwrap();
      Alert.alert('Успешно', 'Регистрация прошла успешно', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
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

            <Text style={styles.title}>Регистрация</Text>

            <Controller 
              control={control}
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PredefinedInput
                  label='Имя'
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
                  message: 'Введите валидный email',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PredefinedInput
                  label='Email'
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.email}
                />
              )}
              name="email"
            />
            {errors.email && <Text style={styles.errorText}>Введите валидный email</Text>} 

            <Controller 
              control={control}
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PredefinedInput
                  isPassword={true}
                  label='Пароль'
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  hasError={!!errors.password}
                />
              )}
              name="password"
            />
            {errors.password && <Text style={styles.errorText}>Минимум 6 символов</Text>} 

            <View style={{marginTop: 20}}>
              <PredefinedButton 
                type="blue" 
                label="Зарегистрироваться" 
                onPress={handleSubmit(onSubmit)} 
                disabled={isLoading} 
              /> 
            </View>

            <View>
              <PredefinedButton 
                type="text" 
                textColor='#000' 
                label="Уже есть аккаунт? Войти" 
                onPress={() => navigation.navigate('Login')} 
              />
            </View>

            <View style={styles.buttonLanguage}>
              <PredefinedButton type="text" textColor='#000' label="Russian" onPress={() => Alert.alert("Russian")} />
              <PredefinedButton type="text" textColor='#000' label="English" onPress={() => Alert.alert("English")} />
              <PredefinedButton type="text" textColor='#000' label="Hebrew" onPress={() => Alert.alert("Hebrew")} />
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