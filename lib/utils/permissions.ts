import { Linking, PermissionsAndroid, Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable' | 'undetermined';

export const checkPhonePermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS !== 'android') {
    return 'granted'; // iOS doesn't require explicit permission for telprompt:
  }

  try {
    const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
    if (status) {
      return 'granted';
    }
    // On Android, if not granted, we can't immediately know if it's denied or undetermined.
    // We will treat it as undetermined for our flow.
    return 'undetermined';
  } catch (error) {
    console.error('Failed to check phone permission:', error);
    return 'unavailable';
  }
};

export const requestPhonePermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS !== 'android') {
    return 'granted';
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: 'Phone Call Permission',
        message: 'This app needs access to your phone to make calls to donors.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    }
    if (result === PermissionsAndroid.RESULTS.DENIED) {
      return 'denied';
    }
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'blocked';
    }
  } catch (error) {
    console.error('Failed to request phone permission:', error);
    return 'unavailable';
  }
  return 'denied'; // Default to denied
};

export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error('Failed to open app settings:', error);
  }
};

// More utilities to be added later
