import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAppLoadingReturn {
  isLoading: boolean;
  hasDonorProfile: boolean;
}

export function useAppLoading(): UseAppLoadingReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [hasDonorProfile, setHasDonorProfile] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate minimum loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for existing donor profile
        const savedData = await AsyncStorage.getItem('donorProfile');
        setHasDonorProfile(!!savedData);
      } catch (error) {
        console.error('Error initializing app:', error);
        setHasDonorProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  return { isLoading, hasDonorProfile };
}