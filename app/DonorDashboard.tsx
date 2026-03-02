import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants/roles.constants';

interface DonorProfile {
  id: string;
  full_name: string;
  age: number;
  sex: string;
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability: string;
  email?: string;
  avatar_data?: string;
  avatar_mime_type?: string;
}

export default function DonorDashboard() {
  const { colors } = useTheme();
  const { userRole, donorProfile, user, logout } = useAuth();
  const [donorData, setDonorData] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load donor data function
  const loadDonorData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      console.log('📊 Loading donor data...');
      console.log('📊 donorProfile from context:', donorProfile);
      console.log('📊 user from context:', user);
      
      // First use donorProfile from AuthContext if available
      if (donorProfile) {
        console.log('📊 Using donorProfile from context:', donorProfile);
        setDonorData(donorProfile);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // Fallback to AsyncStorage
      const savedData = await AsyncStorage.getItem('donorProfile');
      console.log('📊 Saved data from AsyncStorage:', savedData);
      if (savedData) {
        const donorProfileData = JSON.parse(savedData);
        console.log('📊 Parsed donor profile:', donorProfileData);
        setDonorData(donorProfileData);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // If no profile found, set loading to false
      setLoading(false);
    } catch (error) {
      console.error('Error loading donor data:', error);
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [donorProfile]);

  // Load data on mount
  useEffect(() => {
    loadDonorData();
  }, [loadDonorData]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }
    
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to send a message.');
      return;
    }

    setIsSending(true);
    
    try {
      // Get token directly
      const { getAccessToken } = await import('../api/client');
      const token = await getAccessToken();
      
      const response = await fetch('https://dugtung-next.vercel.app/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            sender_id: user.id,
            subject: 'Donor Inquiry',
            content: message.trim(),
          }
        }),
      });
      
      const result = await response.json();
      console.log('Message send result:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }
      
      Alert.alert('Success', 'Message sent to admin.');
      setMessage('');
      
      Alert.alert('Success', 'Message sent to admin.');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateAvailability = async (status: string) => {
    if (!donorData || !user?.id) {
      Alert.alert('Error', 'Unable to update availability. Please try again.');
      return;
    }

    setIsUpdatingAvailability(true);
    setShowAvailabilityModal(false);

    try {
      const { getAccessToken } = await import('../api/client');
      const token = await getAccessToken();
      console.log("DEBUG - Token present:", !!token, "Token:", token?.substring(0, 20));

      const response = await fetch(`https://dugtung-next.vercel.app/api/donors/${donorData.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          availability_status: status,
        }),
      });

      const result = await response.json();
      console.log("DEBUG - Response status:", response.status, "Result:", result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to update availability (${response.status})`);
      }

      const updatedDonor = result.data || result;
      setDonorData({
        ...donorData,
        availability: updatedDonor.availability_status || status,
      });

      Alert.alert('Success', `You are now ${status === 'available' ? 'available' : 'unavailable'} to donate.`);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', error.message || 'Failed to update availability. Please try again.');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your donor profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!donorData || !user?.id) {
              Alert.alert('Error', 'Unable to delete profile. Please try again.');
              return;
            }

            setIsDeleting(true);

            try {
              const { getAccessToken } = await import('../api/client');
              const token = await getAccessToken();

              const response = await fetch(`https://dugtung-next.vercel.app/api/donors/${donorData.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || 'Failed to delete profile');
              }

              Alert.alert(
                'Profile Deleted',
                'Your donor profile has been deleted.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await logout();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', error.message || 'Failed to delete profile. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const availabilityOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Unavailable', value: 'unavailable' },
  ];

  // Show loading while data loads
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

  // Show "No Profile Found" only for donors without profile
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
            keyboardShouldPersistTaps="handled"
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
                  onPress={() => {
                    Alert.alert(
                      'Logout',
                      'Are you sure you want to logout?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Logout', 
                          onPress: async () => {
                            await logout();
                          }
                        },
                      ]
                    );
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
              
              {/* Avatar and Name Section */}
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  {(() => {
                    console.log('🖼️ Rendering avatar. donorData:', {
                      has_avatar_data: !!donorData.avatar_data,
                      has_mime_type: !!donorData.avatar_mime_type,
                      avatar_data_length: donorData.avatar_data?.length,
                      mime_type: donorData.avatar_mime_type,
                      email: donorData.email
                    });
                    
                    if (donorData.avatar_data && donorData.avatar_mime_type) {
                      return (
                        <Image 
                          source={{ uri: `data:${donorData.avatar_mime_type};base64,${donorData.avatar_data}` }}
                          style={styles.avatar}
                        />
                      );
                    } else {
                      return (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarInitial}>
                            {donorData.full_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      );
                    }
                  })()}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{donorData.full_name}</Text>
                  {donorData.email && (
                    <View style={styles.emailContainer}>
                      <Ionicons name="mail-outline" size={14} color="#64748B" />
                      <Text style={styles.profileEmail}>{donorData.email}</Text>
                    </View>
                  )}
                </View>
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
                  pointerEvents="box-only"
                />
                <View style={styles.messageInputBorder} pointerEvents="none" />
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

            {/* Availability Settings Card */}
            <View style={styles.card}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="settings-outline" size={24} color="#6C63FF" />
                <Text style={styles.sectionTitle}>Availability Settings</Text>
              </View>
              
              <Text style={styles.messageDescription}>
                Update your availability status to let administrators know when you can donate blood.
              </Text>

              <TouchableOpacity 
                style={styles.availabilityButton}
                onPress={() => setShowAvailabilityModal(true)}
                disabled={isUpdatingAvailability}
              >
                {isUpdatingAvailability ? (
                  <ActivityIndicator color="#6C63FF" size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name={donorData.availability === 'available' || donorData.availability === 'Available' 
                        ? "checkmark-circle" 
                        : "time-outline"} 
                      size={20} 
                      color="#6C63FF" 
                    />
                    <Text style={styles.availabilityButtonText}>
                      {donorData.availability === 'available' || donorData.availability === 'Available'
                        ? 'Available'
                        : 'Unavailable'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Danger Zone Card */}
            <View style={[styles.card, styles.dangerCard]}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="warning-outline" size={24} color="#EF4444" />
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
              </View>
              
              <Text style={styles.messageDescription}>
                Permanently delete your donor profile. This action cannot be undone.
              </Text>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteProfile}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Delete My Profile</Text>
                  </>
                )}
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

          {/* Availability Modal */}
          <Modal
            visible={showAvailabilityModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAvailabilityModal(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setShowAvailabilityModal(false)}
            >
              <Pressable 
                style={styles.modalContent}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Update Availability</Text>
                  <TouchableOpacity 
                    onPress={() => setShowAvailabilityModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>
                  Select your current availability status:
                </Text>

                <View style={styles.modalOptions}>
                  {availabilityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.modalOption,
                        donorData?.availability === option.value && styles.modalOptionSelected,
                      ]}
                      onPress={() => handleUpdateAvailability(option.value)}
                    >
                      <Ionicons 
                        name={option.value === 'available' ? 'checkmark-circle' : 'time-outline'}
                        size={24}
                        color={donorData?.availability === option.value ? '#6C63FF' : '#64748B'}
                      />
                      <Text style={[
                        styles.modalOptionText,
                        donorData?.availability === option.value && styles.modalOptionTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Helper Component for Info Items
const InfoItem = ({ label, value, icon, isHighlighted = false }: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
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
    zIndex: 1,
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
    zIndex: 2,
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
    pointerEvents: 'none',
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#6C63FF',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E0E7FF',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  availabilityButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  dangerCard: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  dangerTitle: {
    color: '#EF4444',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  modalOptionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#F5F3FF',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalOptionTextSelected: {
    color: '#6C63FF',
  },
});

