import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import SafeScrollView from '../lib/SafeScrollView';

// Type definitions
type FormErrors = {
  fullName?: string;
  contactNumber?: string;
};

type FormValues = {
  fullName: string;
  contactNumber: string;
};

type InputField = 'fullName' | 'contactNumber';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [formValues, setFormValues] = useState<FormValues>({
    fullName: '',
    contactNumber: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<InputField | null>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputAnimations = {
    fullName: useRef(new Animated.Value(0)).current,
    contactNumber: useRef(new Animated.Value(0)).current,
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, []);

  // Animate label on focus
  const animateLabel = (field: InputField, toValue: number) => {
    Animated.timing(inputAnimations[field], {
      toValue,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
  };

  const handleInputFocus = (field: InputField) => {
    setFocusedField(field);
    if (!formValues[field]) {
      animateLabel(field, 1);
    }
    // Clear error for this field when focused
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputBlur = (field: InputField) => {
    setFocusedField(null);
    if (!formValues[field]) {
      animateLabel(field, 0);
    }
    // Validate on blur
    validateField(field, formValues[field]);
  };

  const validateField = (field: InputField, value: string): boolean => {
    let error = '';
    
    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'contactNumber':
        const digitsOnly = value.replace(/\D/g, '');
        if (!digitsOnly) {
          error = 'Contact number is required';
        } else if (digitsOnly.length !== 11 || !digitsOnly.startsWith('09')) {
          error = 'Please enter a valid PH number (09XXXXXXXXX)';
        }
        break;
    }

    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formValues.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    const digitsOnly = formValues.contactNumber.replace(/\D/g, '');
    if (!digitsOnly) {
      errors.contactNumber = 'Contact number is required';
    } else if (digitsOnly.length !== 11 || !digitsOnly.startsWith('09')) {
      errors.contactNumber = 'Please enter a valid PH number (09XXXXXXXXX)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: InputField, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    // Auto-format phone number
    if (field === 'contactNumber') {
      const formatted = formatPhoneNumber(value);
      setFormValues(prev => ({ ...prev, contactNumber: formatted }));
    }
  };

  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,4})(\d{0,3})(\d{0,4})$/);

    if (match) {
      const formatted = match[1] + (match[2] ? '-' + match[2] : '') + (match[3] ? '-' + match[3] : '');
      return formatted;
    }
    return text;
  };

  const handleLogin = async () => {
    if (isLoading) return;

    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Call actual authentication
    try {
      console.log('🔐 Attempting login with:', {
        full_name: formValues.fullName,
        contact_number: formValues.contactNumber
      });

      const result = await login({
        full_name: formValues.fullName,
        contact_number: formValues.contactNumber
      });
      
      console.log('📡 Login result:', result);
      
      if (!result.success) {
        console.error('❌ Login failed:', result.error);
        alert(`Login Failed\n\n${result.error || 'Unknown error occurred'}`);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Login successful');
      // Navigation will be handled by the AuthContext based on user role
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        stack: error?.stack
      });
      
      alert(`Login Error\n\n${error?.message || 'Network request failed. Please check your connection and try again.'}`);
      setIsLoading(false);
    }
  };



  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        
        <ImageBackground
          source={require('@/assets/images/dugtong-bg-portrait.png')}
          style={styles.background}
          resizeMode="cover"
        >
          {/* Loading Overlay */}
          {isLoading && (
            <Animated.View 
              style={[
                styles.loadingOverlay,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })
                }
              ]}
            >
              <View style={styles.loaderContainer}>
                <Animated.View style={styles.spinner}>
                  <Feather name="loader" size={32} color="#1E90FF" />
                </Animated.View>
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            </Animated.View>
          )}

          <Animated.View 
            style={[
              styles.overlay,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
              <SafeScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { minHeight: screenHeight - 100 }
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.formContainer}>
                  {/* Logo/Title Section */}
                  <View style={styles.header}>
                    <View style={styles.logoContainer}>
                      <Feather name="shield" size={40} color="#1E90FF" />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                      Sign in to continue to your account
                    </Text>
                  </View>

                  {/* Form Inputs */}
                  <View style={styles.form}>
                    {/* Full Name Input */}
                    <View style={styles.inputWrapper}>
                      <Animated.View 
                        style={[
                          styles.inputContainer,
                          focusedField === 'fullName' && styles.inputContainerFocused,
                          formErrors.fullName && styles.inputContainerError,
                          {
                            transform: [{
                              translateY: inputAnimations.fullName.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -5]
                              })
                            }]
                          }
                        ]}
                      >
                        <Animated.Text 
                          style={[
                            styles.floatingLabel,
                            {
                              opacity: inputAnimations.fullName.interpolate({
                                inputRange: [0.5, 1],
                                outputRange: [0, 1]
                              }),
                              transform: [{
                                scale: inputAnimations.fullName.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 0.9]
                                })
                              }]
                            }
                          ]}
                        >
                          Full Name
                        </Animated.Text>
                        <TextInput
                          style={styles.input}
                          value={formValues.fullName}
                          onChangeText={(value) => handleInputChange('fullName', value)}
                          onFocus={() => handleInputFocus('fullName')}
                          onBlur={() => handleInputBlur('fullName')}
                          placeholder={!formValues.fullName ? "Juan Dela Cruz" : ""}
                          placeholderTextColor="rgba(255, 255, 255, 0.5)"
                          autoCapitalize="words"
                          autoCorrect={false}
                          editable={!isLoading}
                          selectionColor="#1E90FF"
                        />
                        {formValues.fullName ? (
                          <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => handleInputChange('fullName', '')}
                            disabled={isLoading}
                          >
                            <Feather name="x" size={18} color="rgba(255, 255, 255, 0.7)" />
                          </TouchableOpacity>
                        ) : null}
                      </Animated.View>
                      {formErrors.fullName ? (
                        <View style={styles.errorContainer}>
                          <Feather name="alert-circle" size={14} color="#FF6B6B" />
                          <Text style={styles.errorText}>{formErrors.fullName}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Contact Number Input */}
                    <View style={styles.inputWrapper}>
                      <Animated.View 
                        style={[
                          styles.inputContainer,
                          focusedField === 'contactNumber' && styles.inputContainerFocused,
                          formErrors.contactNumber && styles.inputContainerError,
                          {
                            transform: [{
                              translateY: inputAnimations.contactNumber.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -5]
                              })
                            }]
                          }
                        ]}
                      >
                        <Animated.Text 
                          style={[
                            styles.floatingLabel,
                            {
                              opacity: inputAnimations.contactNumber.interpolate({
                                inputRange: [0.5, 1],
                                outputRange: [0, 1]
                              }),
                              transform: [{
                                scale: inputAnimations.contactNumber.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 0.9]
                                })
                              }]
                            }
                          ]}
                        >
                          Contact Number
                        </Animated.Text>
                        <TextInput
                          style={styles.input}
                          value={formValues.contactNumber}
                          onChangeText={(value) => handleInputChange('contactNumber', value)}
                          onFocus={() => handleInputFocus('contactNumber')}
                          onBlur={() => handleInputBlur('contactNumber')}
                          placeholder={!formValues.contactNumber ? "09XX-XXX-XXXX" : ""}
                          placeholderTextColor="rgba(255, 255, 255, 0.5)"
                          keyboardType="phone-pad"
                          maxLength={13}
                          editable={!isLoading}
                          selectionColor="#1E90FF"
                        />
                        {formValues.contactNumber ? (
                          <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => handleInputChange('contactNumber', '')}
                            disabled={isLoading}
                          >
                            <Feather name="x" size={18} color="rgba(255, 255, 255, 0.7)" />
                          </TouchableOpacity>
                        ) : null}
                      </Animated.View>
                      {formErrors.contactNumber ? (
                        <View style={styles.errorContainer}>
                          <Feather name="alert-circle" size={14} color="#FF6B6B" />
                          <Text style={styles.errorText}>{formErrors.contactNumber}</Text>
                        </View>
                      ) : (
                        <Text style={styles.helperText}>Philippine format (09XXXXXXXXX)</Text>
                      )}
                    </View>

                    {/* Login Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                      <TouchableOpacity
                        style={[
                          styles.loginButton,
                          isLoading && styles.loginButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.9}
                      >
                        {isLoading ? (
                          <View style={styles.buttonContent}>
                            <Animated.View style={styles.buttonSpinner}>
                              <Feather name="loader" size={20} color="#FFFFFF" />
                            </Animated.View>
                            <Text style={styles.loginButtonText}>Signing In...</Text>
                          </View>
                        ) : (
                          <View style={styles.buttonContent}>
                            <Feather name="log-in" size={20} color="#FFFFFF" />
                            <Text style={styles.loginButtonText}>Sign In</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>



                    {/* Register Link */}
                    <TouchableOpacity
                      style={styles.registerButton}
                      onPress={() => router.push('/register')}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.registerButtonText}>
                        Not authorized?{' '}
                        <Text style={styles.registerButtonTextHighlight}>
                          Register as Donor
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 30, 0.95)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  formContainer: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(20px)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 55,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 144, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(30, 144, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: '#1E90FF',
    backgroundColor: 'rgba(30, 144, 255, 0.1)',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  inputContainerError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  floatingLabel: {
    position: 'absolute',
    top: 12,
    left: 20,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E90FF',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    padding: 0,
    margin: 0,
    height: 24,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: 22,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  loginButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSpinner: {
    marginRight: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 12,
  },

  registerButton: {
    paddingVertical: 16,
  },
  registerButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  registerButtonTextHighlight: {
    color: '#1E90FF',
    fontWeight: '700',
  },
});