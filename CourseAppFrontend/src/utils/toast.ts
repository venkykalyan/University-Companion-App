import { Platform, ToastAndroid, Alert } from 'react-native';

/**
 * @param message - The message to show to the user.
 */
export const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Error', message);
  }
};
