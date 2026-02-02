import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import SafeScrollView from '../lib/SafeScrollView';

// Dummy data for testing
const DUMMY_AUTHORIZED_USERS = [
  { fullName: 'Admin User', contactNumber: '09123456789' },
  { fullName: 'Hospital Staff', contactNumber: '09987654321' },
  { fullName: 'Health Officer', contactNumber: '09111222333' },
];

export default function LoginScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = () => {
    // Validate inputs
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    if (!contactNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your contact number');
      return;
    }

    // Format contact number to remove non-digits
    const formattedContactNumber = contactNumber.replace(/\D/g, '');

    // Check if user exists in dummy data
    const userExists = DUMMY_AUTHORIZED_USERS.some(
      user =>
        user.fullName.toLowerCase().trim() === fullName.toLowerCase().trim() &&
        user.contactNumber === formattedContactNumber
    );

    if (userExists) {
      // Navigate to dashboard
      router.push('/dashboard');
      Alert.alert('Success', 'Login successful! Redirecting to dashboard.');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please check your information or use dummy data:\n\nFull Name: Admin User\nContact: 09123456789');
    }
  };

  const handleDummyLogin = (dummyUser: typeof DUMMY_AUTHORIZED_USERS[0]) => {
    setFullName(dummyUser.fullName);
    setContactNumber(dummyUser.contactNumber);

    // Automatically login with dummy data
    router.push('/dashboard');
    Alert.alert('Success', `Logged in as ${dummyUser.fullName}! Redirecting to dashboard.`);
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

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setContactNumber(formatted);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require('@/assets/images/welcome-bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <SafeScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.formContainer}>
                <Text style={styles.title}>Login</Text>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'fullName' && styles.inputFocused,
                    ]}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    autoCapitalize="words"
                  />
                </View>

                {/* Contact Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'contactNumber' && styles.inputFocused,
                    ]}
                    value={contactNumber}
                    onChangeText={handlePhoneChange}
                    onFocus={() => setFocusedField('contactNumber')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="09XX-XXX-XXXX"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                  <Text style={styles.helperText}>Philippine format required</Text>
                </View>

                {/* Login Button */}
                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                {/* Dummy Data Section */}
                <View style={styles.dummySection}>
                  <Text style={styles.dummyDataTitle}>Or use dummy data for testing:</Text>
                  {DUMMY_AUTHORIZED_USERS.map((user, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dummyButton}
                      onPress={() => handleDummyLogin(user)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dummyButtonText}>
                        {user.fullName} - {user.contactNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Register Link */}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => router.push('/register')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerButtonText}>
                    Not an authorized personnel? Register as Donor
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  formContainer: {
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#1E90FF',
    backgroundColor: 'rgba(30, 144, 255, 0.15)',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    backgroundColor: 'rgba(30, 144, 255, 0.8)',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  dummySection: {
    marginBottom: 20,
  },
  dummyDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dummyButton: {
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dummyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  registerButton: {
    backgroundColor: 'rgba(108, 117, 125, 0.8)',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});