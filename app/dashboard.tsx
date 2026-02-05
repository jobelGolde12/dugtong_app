import { router } from 'expo-router';
import { useEffect } from 'react';

export default function DashboardScreen() {
  useEffect(() => {
    // Redirect to Search page by default
    router.replace('/search');
  }, []);

  return null;
}
