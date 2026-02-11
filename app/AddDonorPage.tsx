import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import SafeScrollView from '../lib/SafeScrollView';
import { donorApi } from '../api/donors';
import { useTheme } from '../contexts/ThemeContext';

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

interface DropdownModalProps {
  visible: boolean;
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
}

export default function AddDonorPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isLoading, setIsLoading] = useState(false); // Moved here

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

    const fieldsToValidate: (keyof FormData)[] = ['fullName', 'age', 'sex', 'bloodType', 'contactNumber', 'municipality', 'availabilityStatus'];
    
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
      Alert.alert('Validation Error', 'Please fix errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedContactNumber = formData.contactNumber.replace(/\D/g, '');
      await donorApi.createDonor({
        name: formData.fullName,
        age: Number(formData.age),
        sex: formData.sex,
        bloodType: formData.bloodType,
        contactNumber: normalizedContactNumber,
        municipality: formData.municipality,
        availabilityStatus: formData.availabilityStatus,
      });

      Alert.alert(
        'Success',
        'Successfully addedd...',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      Alert.alert('Error', error.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsLoading(false);
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

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
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
              <Text style={styles.title}>Add Donor</Text>
              <Text style={styles.subtitle}>Register a new donor to the system</Text>
                
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
                    placeholder="Enter donor's full name"
                    placeholderTextColor={colors.textSecondary}
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
                    placeholder="Enter age"
                    placeholderTextColor={colors.textSecondary}
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
                    placeholderTextColor={colors.textSecondary}
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
                  style={styles.submitButton} 
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Add Donor</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </SafeScrollView>
          </KeyboardAvoidingView>
        </Animated.View>

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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.error + '1A',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primary + '1F',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  radioButtonError: {
    borderColor: colors.error,
  },
  radioText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  radioTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  dropdown: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  dropdownError: {
    borderColor: colors.error,
    backgroundColor: colors.error + '1A',
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: colors.textSecondary,
  },
  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primaryVariant,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '90%',
    maxHeight: '60%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});
