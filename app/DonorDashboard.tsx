import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { useRoleAccess } from '../hooks/useRoleAccess';

interface DonorProfile {
  full_name: string;
  age: number;
  sex: string;
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability: string;
}

export default function DonorDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, isDonor, isLoading: authLoading } = useRoleAccess();
  const [donorData, setDonorData] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDonorData = async () => {
    try {
      setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, []);

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
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
        <Text style={styles.loadingText}>Loading your donor profile...</Text>
        <Text style={styles.loadingSubtext}>Please wait a moment</Text>
      </View>
    );
  }

  if (!donorData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#F8FAFC', '#FFFFFF']}
          style={styles.gradientBackground}
        >
          <View style={styles.container}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="person-outline" size={64} color="#CBD5E1" />
              </View>
              <Text style={styles.noDataTitle}>No Profile Found</Text>
              <Text style={styles.noDataText}>
                Please register as a donor to view your dashboard and help save lives.
              </Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.registerButtonText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F8FAFC', '#FFFFFF']}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={loadDonorData}
                tintColor="#6C63FF"
              />
            }
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={async () => {
                    await AsyncStorage.removeItem('donorProfile');
                    router.replace('/');
                  }}
                >
                  <Ionicons name="chevron-back" size={24} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={loadDonorData}
                  disabled={isRefreshing}
                >
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color="#6C63FF" 
                    style={isRefreshing && styles.refreshingIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Donor Dashboard</Text>
                <Text style={styles.subtitle}>Your information is reviewed by administrators</Text>
              </View>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
              <LinearGradient
                colors={donorData.availability === 'available' || donorData.availability === 'Available' 
                  ? ['#10B981', '#34D399']
                  : ['#F59E0B', '#FBBF24']}
                style={styles.statusGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons 
                  name={donorData.availability === 'available' ? "checkmark-circle" : "time-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>
                  {donorData.availability === 'available' || donorData.availability === 'Available'
                    ? 'Available to Donate'
                    : 'Temporarily Unavailable'}
                </Text>
              </LinearGradient>
            </View>

            {/* Donor Information Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Ionicons name="person-circle-outline" size={24} color="#6C63FF" />
                  <Text style={styles.sectionTitle}>Donor Information</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <InfoItem 
                  label="Full Name" 
                  value={donorData.full_name} 
                  icon="person-outline"
                />
                <InfoItem 
                  label="Age" 
                  value={donorData.age} 
                  icon="calendar-outline"
                />
                <InfoItem 
                  label="Sex" 
                  value={donorData.sex} 
                  icon="male-female-outline"
                />
                <InfoItem
                  label="Blood Type"
                  value={donorData.blood_type}
                  icon="water-outline"
                  isHighlighted
                />
                <InfoItem 
                  label="Contact Number" 
                  value={donorData.contact_number} 
                  icon="call-outline"
                />
                <InfoItem 
                  label="Municipality" 
                  value={donorData.municipality} 
                  icon="location-outline"
                />
              </View>
            </View>

            {/* Leave Message Section */}
            <View style={styles.card}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#6C63FF" />
                <Text style={styles.sectionTitle}>Contact Admin</Text>
              </View>
              
              <Text style={styles.messageDescription}>
                Have questions or concerns? Send a secure message to the admin team.
              </Text>
              
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type your message here..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={message}
                  onChangeText={setMessage}
                  editable={!isSending}
                />
                <View style={styles.messageInputBorder} />
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
                  <>
                    <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/register')}
              >
                <Ionicons name="create-outline" size={20} color="#6C63FF" />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleClearData}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Clear Data</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Note */}
            <View style={styles.footer}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#94A3B8" />
              <Text style={styles.footerNote}>
                Your profile is securely stored and only accessible to authorized administrators.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Helper Component for Info Items
const InfoItem = ({ label, value, icon, isHighlighted = false }: {
  label: string;
  value: string | number;
  icon: string;
  isHighlighted?: boolean;
}) => (
  <View style={styles.infoItem}>
    <View style={styles.infoItemLeft}>
      <Ionicons name={icon} size={18} color="#64748B" style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[
      styles.infoValue,
      isHighlighted && styles.highlightedValue
    ]}>
      {String(value)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 20 : 30,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 22,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  registerButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  infoGrid: {
    gap: 0,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  highlightedValue: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 18,
  },
  messageDescription: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  messageInputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  messageInput: {
    minHeight: 120,
    padding: 20,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  messageInputBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderRadius: 16,
    opacity: 0,
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowColor: 'transparent',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  actionButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  dangerButton: {
    borderColor: '#FEE2E2',
  },
  dangerButtonText: {
    color: '#EF4444',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerNote: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginLeft: 8,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

// Import RefreshControl if not already imported
import { RefreshControl } from 'react-native';
