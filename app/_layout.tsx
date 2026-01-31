import { Stack } from 'expo-router';
import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { Alert, Platform } from 'react-native';
import { normalizeBoolean, toBoolean } from '../lib/utils/booleanHelpers';
import { ThemeProvider } from '../contexts/ThemeContext';

// Import exception handlers with error handling
let setJSExceptionHandler: any, setNativeExceptionHandler: any;
try {
  const exceptionHandler = require('react-native-exception-handler');
  setJSExceptionHandler = exceptionHandler.setJSExceptionHandler;
  setNativeExceptionHandler = exceptionHandler.setNativeExceptionHandler;
} catch (err) {
  console.warn('react-native-exception-handler not available:', err);
}

export default function Layout() {
  // Global error logger for better error tracking
  const logError = (errorType: string, error: any, additionalInfo?: any) => {
    console.error(`=== ${errorType} ===`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Platform:', Platform.OS);
    console.error('Error:', error);
    console.error('Error message:', error?.message || 'No message');
    console.error('Error stack:', error?.stack || 'No stack');
    if (additionalInfo) {
      console.error('Additional info:', additionalInfo);
    }
    console.error('========================');
  };

  // Set up a fallback native error handler using React Native's ErrorUtils
  const setupFallbackErrorHandler = () => {
    try {
      // Use React Native's built-in ErrorUtils as a fallback
      if (typeof require !== 'undefined') {
        const { ErrorUtils } = require('react-native');
        if (ErrorUtils && ErrorUtils.setGlobalErrorHandler) {
          const fallbackHandler = (error: any, isFatal?: boolean) => {
            logError('FALLBACK ERROR HANDLER', error, {
              isFatal,
              errorType: typeof error,
              platform: Platform.OS
            });
            
            // Show user-friendly alert
            const errorMessage = error?.message || String(error) || 'An unexpected error occurred';
            Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
            
            // Return false to let the default behavior continue
            return false;
          };
          
          ErrorUtils.setGlobalErrorHandler(fallbackHandler);
          console.log('Fallback ErrorUtils handler setup successful');
        }
      }
    } catch (err) {
      console.warn('Failed to setup fallback ErrorUtils handler:', err);
    }
  };

  // Set up error handlers inline to avoid route issues
  useEffect(() => {
    const errorHandler = (error: any, isFatal: any) => {
      // Convert isFatal to boolean using enhanced normalization
      const isFatalBool = normalizeBoolean(isFatal, false);
      
      // Log detailed error information using the global logger
      logError('JS ERROR HANDLER', error, {
        isFatal,
        isFatalBool,
        errorType: typeof error
      });
      
      // Show error details in alert for debugging
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorStack = error?.stack || '';
      
      if (isFatalBool) {
        Alert.alert(
          'Fatal Error',
          `${errorMessage}\n\nStack: ${errorStack.substring(0, 200)}...`,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('App will restart due to fatal error');
              }
            }
          ]
        );
      } else {
        console.warn('Non-fatal error:', error);
        // Optionally show non-fatal errors in development
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    };

    const nativeExceptionHandler = (exceptionString: string) => {
      logError('NATIVE EXCEPTION', exceptionString, {
        platform: Platform.OS,
        type: 'native'
      });
      
      // Show native exception in alert
      Alert.alert(
        'Native Exception',
        exceptionString,
        [{ text: 'OK' }]
      );
    };

    try {
      // Set up JS exception handler with explicit type checking
      if (typeof setJSExceptionHandler === 'function') {
        // Use a wrapper to handle type conversion issues
        const wrappedErrorHandler = (error: any, isFatal: any) => {
          try {
            // Pre-process isFatal parameter using enhanced normalization
            const safeIsFatal = normalizeBoolean(isFatal, false);
            
            // Call the original handler with the converted value
            const modifiedError = error;
            errorHandler(modifiedError, safeIsFatal);
          } catch (castErr) {
            // Handle casting errors specifically
            logError('ERROR HANDLER CASTING ERROR', castErr, {
              originalError: error,
              originalIsFatal: isFatal,
              isFatalType: typeof isFatal
            });
            
            // Fallback with safe defaults
            const safeErrorMessage = error?.message || String(error) || 'Unknown error occurred';
            
            Alert.alert(
              'Error',
              safeErrorMessage,
              [{ text: 'OK' }]
            );
          }
        };
        
        setJSExceptionHandler(wrappedErrorHandler, toBoolean(true));
        console.log('JS Exception Handler setup successful');
      } else {
        console.warn('setJSExceptionHandler is not available, setting up fallback handler');
        setupFallbackErrorHandler();
      }
      
      // Try to set up native exception handler with better error handling
      try {
        // Check if the method exists before calling it
        if (typeof setNativeExceptionHandler === 'function') {
          setNativeExceptionHandler(nativeExceptionHandler);
          console.log('Native Exception Handler setup successful');
        } else {
          console.warn('setNativeExceptionHandler is not available - native exception handling may not be supported on this platform');
        }
      } catch (nativeErr) {
        console.warn('Native Exception Handler setup failed:', nativeErr);
        console.warn('This is expected on some platforms or if the native module is not properly linked');
      }
    } catch (err) {
      logError('EXCEPTION HANDLER SETUP FAILED', err);
    }

    // Set up unhandled promise rejection handler
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      logError('UNHANDLED PROMISE REJECTION', event.reason, {
        promise: event.promise,
        type: 'promise'
      });
      
      Alert.alert(
        'Unhandled Promise Rejection',
        `An unhandled promise rejection occurred: ${event.reason?.message || event.reason}`,
        [{ text: 'OK' }]
      );
    };

    // Add event listeners for better error tracking
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      }
    };
  }, []);
  return (
    <ThemeProvider>
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
        </Stack>
      </ErrorBoundary>
    </ThemeProvider>
  );
}