import { Alert, Platform, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function usePhotoPicker() {
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Требуется разрешение',
          'Приложению требуется доступ к галерее для выбора фотографий. Пожалуйста, откройте настройки и предоставьте разрешение.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    }
    return true;
  };

  const requestCameraPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Требуется разрешение',
          'Приложению требуется доступ к камере для фотографирования. Пожалуйста, откройте настройки и предоставьте разрешение.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    }
    return true;
  };

  const pickFromCamera = async (): Promise<string | null> => {
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Camera picker error:', error);
      Alert.alert('Ошибка камеры', 'Не удалось получить доступ к камере. Проверьте разрешения в настройках.');
      return null;
    }
  };

  const pickFromGallery = async (): Promise<string | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Ошибка галереи', 'Не удалось получить доступ к галерее. Проверьте разрешения в настройках.');
      return null;
    }
  };

  const showPickerOptions = (): Promise<string | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Добавить фото',
        'Выберите источник фотографии',
        [
          {
            text: 'Камера',
            onPress: async () => {
              const uri = await pickFromCamera();
              resolve(uri);
            },
          },
          {
            text: 'Галерея',
            onPress: async () => {
              const uri = await pickFromGallery();
              resolve(uri);
            },
          },
          {
            text: 'Отмена',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  };

  return {
    pickFromCamera,
    pickFromGallery,
    showPickerOptions,
    requestPermissions,
    requestCameraPermissions,
  };
}