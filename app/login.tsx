import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

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

  const handleDummyLogin = (dummyUser) => {
    setFullName(dummyUser.fullName);
    setContactNumber(dummyUser.contactNumber);

    // Automatically login with dummy data
    router.push('/dashboard');
    Alert.alert('Success', `Logged in as ${dummyUser.fullName}! Redirecting to dashboard.`);
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,4})(\d{0,3})(\d{0,4})$/);

    if (match) {
      const formatted = match[1] + (match[2] ? '-' + match[2] : '') + (match[3] ? '-' + match[3] : '');
      return formatted;
    }
    return text;
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setContactNumber(formatted);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Authorized Personnel Login</Text>
        <Text style={styles.subtitle}>Access donor management system</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={contactNumber}
            onChangeText={handlePhoneChange}
            placeholder="09XX-XXX-XXXX"
            keyboardType="phone-pad"
            maxLength={13}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.dummyDataTitle}>Or use dummy data for testing:</Text>
        {DUMMY_AUTHORIZED_USERS.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dummyButton}
            onPress={() => handleDummyLogin(user)}
          >
            <Text style={styles.dummyButtonText}>{user.fullName} - {user.contactNumber}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerButtonText}>Not an authorized personnel? Register as Donor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dummyDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  },
  dummyButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  dummyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
