import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import '../shim'; // Import the shim to handle node built-ins
import { ConnectionAlert } from '../lib/ConnectionAlert';
import { AuthProvider } from '../contexts/AuthContext';
import { ConnectionProvider } from '../contexts/ConnectionContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import { useConnection } from '../hooks/useConnection';
import { testTursoConnection, rawTursoTest } from '../src/lib/turso';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { isConnected } = useConnection();

  useEffect(() => {
    console.log("Running in:", Constants.executionEnvironment);
    console.log("FETCH TYPE:", typeof fetch);
    rawTursoTest();
    testTursoConnection()
      .then(() => console.log("TURSO WORKING IN APK"))
      .catch((err: Error) => console.error("TURSO FAILED IN APK:", err));
  }, []);

  return (
    <>
      <ConnectionAlert isConnected={isConnected} />
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
    </>
  );
}

export default function Layout() {
  return (
    <ConnectionProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </ConnectionProvider>
  );
}

