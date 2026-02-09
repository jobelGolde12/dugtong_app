import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_REQUEST_COUNT_KEY = '@phone_permission_request_count';
const DONT_ASK_AGAIN_KEY = '@phone_permission_dont_ask_again';

export const getPermissionRequestCount = async (): Promise<number> => {
  try {
    const count = await AsyncStorage.getItem(PERMISSION_REQUEST_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Failed to get permission request count:', error);
    return 0;
  }
};

export const incrementPermissionRequestCount = async (): Promise<void> => {
  try {
    const currentCount = await getPermissionRequestCount();
    await AsyncStorage.setItem(PERMISSION_REQUEST_COUNT_KEY, (currentCount + 1).toString());
  } catch (error) {
    console.error('Failed to increment permission request count:', error);
  }
};

export const getDontAskAgain = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(DONT_ASK_AGAIN_KEY);
    return value === 'true';
  } catch (error) {
    console.error("Failed to get \"don't ask again\" preference:", error);
    return false;
  }
};

export const setDontAskAgain = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(DONT_ASK_AGAIN_KEY, value.toString());
  } catch (error) {
    console.error("Failed to set \"don't ask again\" preference:", error);
  }
};