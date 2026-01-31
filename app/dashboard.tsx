import React, { useEffect } from 'react';
import { router } from 'expo-router';

export default function DashboardScreen() {
  useEffect(() => {
    // Redirect to Find Donor page by default
    router.replace('/search');
  }, []);

  return null;
}