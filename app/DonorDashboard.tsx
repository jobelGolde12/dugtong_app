import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { RoleGuard } from './components/RoleGuard';
import { USER_ROLES } from '../constants/roles.constants';
import { useTheme } from '../contexts/ThemeContext';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';

interface DonorProfile {
  fullName: string;
  age: string;
  sex: string;
  bloodType: string;
  contactNumber: string;
  municipality: string;
  availabilityStatus: string;
  synced: boolean;
  created_at: string;
}

export default function DonorDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, isDonor, isLoading: authLoading } = useRoleAccess();
  const [donorData, setDonorData] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadDonorData();
  }, []);

  // Check if user has permission to access donor dashboard
  // Show loading while authentication is being initialized
  if (authLoading) {
    return (
      <RoleBasedDashboardLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </RoleBasedDashboardLayout>
    );
  }

  if (!isDonor()) {
    return (
      <RoleGuard 
        allowedRoles={[USER_ROLES.DONOR]} 
        userRole={userRole}
      >
        <View />
      </RoleGuard>
    );
  }

  const loadDonorData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('donorProfile');
      if (savedData) {
        const donorProfile = JSON.parse(savedData);
        setDonorData(donorProfile);
      } else {
        Alert.alert('No Data', 'No donor profile found. Please register first.');
      }
    } catch (error) {
      console.error('Error loading donor data:', error);
      Alert.alert('Error', 'Failed to load donor data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear your donor data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('donorProfile');
              setDonorData(null);
              Alert.alert('Success', 'Donor data cleared successfully.');
            } catch (error) {
              console.error('Error clearing donor data:', error);
              Alert.alert('Error', 'Failed to clear donor data.');
            }
          }
        }
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message before sending.');
      return;
    }

    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Your message has been sent to the admin.');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading your donor profile...</Text>
      </View>
    );
  }

  if (!donorData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Donor Dashboard</Text>
            <Text style={styles.subtitle}>Your information is reviewed by an admin</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.noDataTitle}>No Profile Found</Text>
            <Text style={styles.noDataText}>Please register as a donor to view your dashboard.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Donor Dashboard</Text>
            <Text style={styles.subtitle}>Your information is reviewed by an admin</Text>
          </View>

          {/* Donor Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Donor Information</Text>
              <View style={[
                styles.statusBadge,
                donorData.availabilityStatus === 'Available' 
                  ? styles.statusAvailable 
                  : styles.statusUnavailable
              ]}>
                <Text style={styles.statusBadgeText}>
                  {donorData.availabilityStatus}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem label="Full Name" value={donorData.fullName} />
              <InfoItem label="Age" value={donorData.age} />
              <InfoItem label="Sex" value={donorData.sex} />
              <InfoItem 
                label="Blood Type" 
                value={donorData.bloodType} 
                isHighlighted 
              />
              <InfoItem label="Contact Number" value={donorData.contactNumber} />
              <InfoItem label="Municipality" value={donorData.municipality} />
            </View>
          </View>

          {/* Leave Message Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Leave a Message</Text>
            <Text style={styles.messageDescription}>
              Have questions or concerns? Send a message to the admin team.
            </Text>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message here..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
                editable={!isSending}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!message.trim() || isSending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.push('/register')}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sendAlertsButton}
              onPress={() => router.push('/send-alerts')}
            >
              <Text style={styles.sendAlertsButtonText}>Send Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearData}
            >
              <Text style={styles.clearButtonText}>Clear Donor Data</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            Your profile is securely stored and only accessible to authorized administrators.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper Component for Info Items
const InfoItem = ({ label, value, isHighlighted = false }: { 
  label: string; 
  value: string;
  isHighlighted?: boolean;
}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[
      styles.infoValue,
      isHighlighted && styles.highlightedValue
    ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.5,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  statusAvailable: {
    backgroundColor: '#10B981',
  },
  statusUnavailable: {
    backgroundColor: '#F59E0B',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    flex: 2,
    textAlign: 'right',
  },
  highlightedValue: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 18,
  },
  messageDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  messageInputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageInput: {
    minHeight: 100,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  backButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  sendAlertsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0d6efd',
  },
  sendAlertsButtonText: {
    color: '#0d6efd',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});