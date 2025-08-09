import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'web') {

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нам нужно разрешение для доступа к вашей галерее!');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Ошибка при запросе разрешений галереи:', error);
  
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нам нужно разрешение для доступа к вашей галерее!');
        return false;
      }
      return true;
    } catch (innerError) {
      console.error('Вторичная ошибка при запросе разрешений галереи:', innerError);
      return false;
    }
  }
};

export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нам нужно разрешение для доступа к вашей камере!');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Ошибка при запросе разрешений камеры:', error);
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нам нужно разрешение для доступа к вашей камере!');
        return false;
      }
      return true;
    } catch (innerError) {
      console.error('Вторичная ошибка при запросе разрешений камеры:', innerError);
      return false;
    }
  }
};


export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при выборе изображения:', error);
    Alert.alert('Ошибка', 'Не удалось загрузить изображение');
    return null;
  }
};

export const takePhoto = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при съемке фото:', error);
    Alert.alert('Ошибка', 'Не удалось сделать фото');
    return null;
  }
};
