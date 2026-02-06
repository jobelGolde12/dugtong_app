import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native';
import { createDonorRegistration, DonorRegistrationRequest } from '../api/donor-registrations';
import { getApiErrorMessage } from '../api/client';
import SafeScrollView from '../lib/SafeScrollView';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MUNICIPALITIES = [
  'Sorsogon City',
  'Bulan',
  'Matnog',
  'Irosin',
  'Gubat',
  'Castilla',
  'Magallanes',
  'Pilar',
  'Donsol',
  'Juban',
  'Casiguran',
  'Bulusan',
  'Santa Magdalena',
  'Barcelona'
];

interface FormData {
  fullName: string;
  age: string;
  sex: string;
  bloodType: string;
  contactNumber: string;
  municipality: string;
  availabilityStatus: string;
}

interface Errors {
  fullName?: string;
  age?: string;
  sex?: string;
  bloodType?: string;
  contactNumber?: string;
  municipality?: string;
  availabilityStatus?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface DropdownModalProps {
  visible: boolean;
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
}

export default function RegisterScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    age: '',
    sex: '',
    bloodType: '',
    contactNumber: '',
    municipality: '',
    availabilityStatus: 'Available'
  });

  const [errors, setErrors] = useState<Errors>({});
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [containerHeight, setContainerHeight] = useState(0);

  // Load and calculate image dimensions
  useEffect(() => {
    // Use a try-catch to handle potential image loading errors
    try {
      const imageSource = require('@/assets/images/welcome-bg.png');
      // For React Native, we can't use Image.resolveAssetSource in the same way
      // Instead, we'll set default dimensions and let the image scale naturally
      setImageDimensions({
        width: 1024, // Default width
        height: 768  // Default height
      });
    } catch (error) {
      console.warn('Could not load background image, using defaults');
      setImageDimensions({
        width: 1024,
        height: 768
      });
    }
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { height: newHeight } = event.nativeEvent.layout;
    setContainerHeight(newHeight);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: string, value: string): string => {
    let error = '';
    
    switch (field) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
        
      case 'age':
        if (!value) error = 'Age is required';
        else if (isNaN(Number(value)) || Number(value) <= 0) error = 'Age must be a valid number greater than 0';
        else if (Number(value) > 120) error = 'Please enter a valid age';
        break;
        
      case 'sex':
        if (!value) error = 'Sex is required';
        break;
        
      case 'bloodType':
        if (!value) error = 'Blood Type is required';
        break;
        
      case 'contactNumber':
        if (!value.trim()) error = 'Contact Number is required';
        else if (!/^09\d{9}$/.test(value.replace(/[^0-9]/g, ''))) {
          error = 'Must follow Philippine format (09XXXXXXXXX)';
        }
        break;
        
      case 'municipality':
        if (!value) error = 'Municipality is required';
        break;

      case 'availabilityStatus':
        if (!value) error = 'Availability Status is required';
        break;
    }

    return error;
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    let isValid = true;

    const fieldsToValidate: Array<keyof FormData> = ['fullName', 'age', 'sex', 'bloodType', 'contactNumber', 'municipality', 'availabilityStatus'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (field: string) => {
    setFocusedField(null);
    const error = validateField(field, formData[field as keyof FormData]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData: DonorRegistrationRequest = {
        full_name: formData.fullName,
        age: parseInt(formData.age, 10),
        sex: formData.sex as 'Male' | 'Female',
        blood_type: formData.bloodType,
        contact_number: formData.contactNumber,
        municipality: formData.municipality,
        availability_status: formData.availabilityStatus as 'Available' | 'Temporarily Unavailable',
      };

      console.log('Submitting donor registration:', registrationData);
      
      const response = await createDonorRegistration(registrationData);
      
      Alert.alert(
        'Registration Submitted 🎉',
        `Thank you for registering as a voluntary donor! Your registration has been submitted with status: ${response.status}. You will be notified once it's approved.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              router.push('/login');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting donor registration:', error);
      const errorMessage = getApiErrorMessage(error);
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const DropdownModal: React.FC<DropdownModalProps> = ({ visible, items, onSelect, onClose }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require('@/assets/images/welcome-bg.png')}
        style={styles.background}
        imageStyle={{ width: width, height: height }}
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
                <Text style={styles.title}>Donor Registration</Text>
                <Text style={styles.subtitle}>Join our lifesaving community</Text>
                
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'fullName' && styles.inputFocused,
                      errors.fullName && styles.inputError
                    ]}
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  />
                  {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
                </View>

                {/* Age */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'age' && styles.inputFocused,
                      errors.age && styles.inputError
                    ]}
                    value={formData.age}
                    onChangeText={(value) => handleInputChange('age', value.replace(/[^0-9]/g, ''))}
                    onFocus={() => setFocusedField('age')}
                    onBlur={() => handleBlur('age')}
                    placeholder="Enter your age"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
                </View>

                {/* Sex */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sex *</Text>
                  <View style={styles.radioGroup}>
                    {['Male', 'Female'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.radioButton,
                          formData.sex === option && styles.radioButtonSelected,
                          errors.sex && styles.radioButtonError
                        ]}
                        onPress={() => {
                          handleInputChange('sex', option);
                          if (errors.sex) setErrors(prev => ({ ...prev, sex: '' }));
                        }}
                      >
                        <Text style={[
                          styles.radioText,
                          formData.sex === option && styles.radioTextSelected
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.sex ? <Text style={styles.errorText}>{errors.sex}</Text> : null}
                </View>

                {/* Blood Type */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Blood Type *</Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      focusedField === 'bloodType' && styles.dropdownFocused,
                      errors.bloodType && styles.dropdownError
                    ]}
                    onPress={() => {
                      setShowBloodTypeDropdown(true);
                      setFocusedField('bloodType');
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      !formData.bloodType && styles.dropdownPlaceholder
                    ]}>
                      {formData.bloodType || 'Select Blood Type'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  {errors.bloodType ? <Text style={styles.errorText}>{errors.bloodType}</Text> : null}
                </View>

                {/* Contact Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Number *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'contactNumber' && styles.inputFocused,
                      errors.contactNumber && styles.inputError
                    ]}
                    value={formData.contactNumber}
                    onChangeText={(value) => handleInputChange('contactNumber', formatPhoneNumber(value))}
                    onFocus={() => setFocusedField('contactNumber')}
                    onBlur={() => handleBlur('contactNumber')}
                    placeholder="09XX-XXX-XXXX"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                  {errors.contactNumber ? (
                    <Text style={styles.errorText}>{errors.contactNumber}</Text>
                  ) : (
                    <Text style={styles.helperText}>Philippine format required</Text>
                  )}
                </View>

                {/* Municipality */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Municipality *</Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      focusedField === 'municipality' && styles.dropdownFocused,
                      errors.municipality && styles.dropdownError
                    ]}
                    onPress={() => {
                      setShowMunicipalityDropdown(true);
                      setFocusedField('municipality');
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      !formData.municipality && styles.dropdownPlaceholder
                    ]}>
                      {formData.municipality || 'Select Municipality'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  {errors.municipality ? <Text style={styles.errorText}>{errors.municipality}</Text> : null}
                </View>

                {/* Availability Status */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Availability Status *</Text>
                  <View style={styles.radioGroup}>
                    {['Available', 'Temporarily Unavailable'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.radioButton,
                          formData.availabilityStatus === option && styles.radioButtonSelected,
                          errors.availabilityStatus && styles.radioButtonError
                        ]}
                        onPress={() => {
                          handleInputChange('availabilityStatus', option);
                          if (errors.availabilityStatus) setErrors(prev => ({ ...prev, availabilityStatus: '' }));
                        }}
                      >
                        <Text style={[
                          styles.radioText,
                          formData.availabilityStatus === option && styles.radioTextSelected
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.availabilityStatus ? <Text style={styles.errorText}>{errors.availabilityStatus}</Text> : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled
                  ]} 
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  </Text>
                </TouchableOpacity>

                
                          <Link href="/login" asChild>
                            <TouchableOpacity>
                              <Text style={styles.link}>Login (Authorized Personnel)</Text>
                            </TouchableOpacity>
                          </Link>
              </View>
            </SafeScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </ImageBackground>

      {/* Dropdown Modals */}
      <DropdownModal
        visible={showBloodTypeDropdown}
        items={BLOOD_TYPES}
        onSelect={(item) => {
          handleInputChange('bloodType', item);
          if (errors.bloodType) setErrors(prev => ({ ...prev, bloodType: '' }));
        }}
        onClose={() => setShowBloodTypeDropdown(false)}
      />

      <DropdownModal
        visible={showMunicipalityDropdown}
        items={MUNICIPALITIES}
        onSelect={(item) => {
          handleInputChange('municipality', item);
          if (errors.municipality) setErrors(prev => ({ ...prev, municipality: '' }));
        }}
        onClose={() => setShowMunicipalityDropdown(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Back to black to blend with background image
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Very subtle overlay to enhance text readability
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
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark but not too dark to allow background image to show through slightly
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
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)', // Light green background
    borderColor: '#28a745',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  radioButtonError: {
    borderColor: '#FF6B6B',
  },
  radioText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  radioTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownFocused: {
    borderColor: '#1E90FF',
    backgroundColor: 'rgba(30, 144, 255, 0.15)',
  },
  dropdownError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dropdownArrow: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: 'rgba(30, 144, 255, 0.8)',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(108, 117, 125, 0.8)',
    opacity: 0.6,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  requiredNote: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    width: '90%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  link: {
    color: '#E0E7FF',
    fontSize: 14,
    textDecorationLine: 'underline',
    // Modernistic Font Settings
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
});