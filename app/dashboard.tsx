import React, { useEffect } from 'react';
import { router } from 'expo-router';

export default function DashboardScreen() {
  useEffect(() => {
    // Redirect to Reports page by default
    router.replace('/reports');
  }, []);

  return null;
}