
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="register" />
                <Stack.Screen name="login" />
                <Stack.Screen name="dashboard" />
                <Stack.Screen name="search" />
                <Stack.Screen name="donor-management" />
                <Stack.Screen name="reports" />
                <Stack.Screen name="chatbot" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="DonorDashboard" />
                <Stack.Screen name="AddDonorPage" />
              </Stack>
            </ErrorBoundary>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

