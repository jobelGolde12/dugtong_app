import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

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
        // Create a maximum timeout promise (5 seconds) to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Initialization timed out')), 5000)
        );

        // Main initialization logic
        const initPromise = (async () => {
          // Simulate minimum loading time for better UX
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check for existing donor profile
          const savedData = await AsyncStorage.getItem('donorProfile');
          setHasDonorProfile(!!savedData);
        })();

        // Race the initialization against the timeout
        await Promise.race([initPromise, timeoutPromise]);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Ensure we default to false if something failed
        // setHasDonorProfile(false) is not needed as it defaults to false, 
        // but if we were strictly handling state we might reset it here if needed.
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  return { isLoading, hasDonorProfile };
}