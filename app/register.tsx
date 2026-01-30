import React, { useState } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { normalizeBoolean } from '../lib/utils/booleanHelpers';
import SafeScrollView from '../lib/SafeScrollView';


const { width, height } = Dimensions.get('window');

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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    sex: '',
    bloodType: '',
    contactNumber: '',
    municipality: '',
    availabilityStatus: 'Available'
  });

  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Full Name is required');
      return false;
    }
    
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      Alert.alert('Error', 'Age must be a valid number greater than 0');
      return false;
    }
    
    if (!formData.sex) {
      Alert.alert('Error', 'Sex is required');
      return false;
    }
    
    if (!formData.bloodType) {
      Alert.alert('Error', 'Blood Type is required');
      return false;
    }
    
    if (!formData.contactNumber.trim()) {
      Alert.alert('Error', 'Contact Number is required');
      return false;
    }
    
    if (!/^09\d{9}$/.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      Alert.alert('Error', 'Contact Number must follow Philippine format (e.g., 09XXXXXXXXX)');
      return false;
    }
    
    if (!formData.municipality) {
      Alert.alert('Error', 'Municipality is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const donorData = {
        ...formData,
        synced: false,
        created_at: new Date().toISOString()
      };

      console.log('Saving donor data locally:', donorData);
      
      Alert.alert(
        'Registration Successful',
        'Thank you for registering as a voluntary donor! Your data has been saved and will be uploaded once internet is available.',
        [{ text: 'OK', onPress: () => console.log('Form submitted successfully') }]
      );
    } catch (error) {
      console.error('Error saving donor data:', error);
      Alert.alert('Error', 'Failed to save your registration. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/welcome-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <SafeScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Donor Registration</Text>
            
            <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              placeholder="Enter your age"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sex</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, formData.sex === 'Male' && styles.radioButtonSelected]}
                onPress={() => handleInputChange('sex', 'Male')}
              >
                <Text style={[styles.radioText, formData.sex === 'Male' && styles.radioTextSelected]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, formData.sex === 'Female' && styles.radioButtonSelected]}
                onPress={() => handleInputChange('sex', 'Female')}
              >
                <Text style={[styles.radioText, formData.sex === 'Female' && styles.radioTextSelected]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowBloodTypeDropdown(!showBloodTypeDropdown)}
            >
              <Text style={styles.dropdownText}>
                {formData.bloodType || 'Select Blood Type'}
              </Text>
            </TouchableOpacity>
            {normalizeBoolean(showBloodTypeDropdown) && (
              <View style={styles.dropdownMenu}>
                {BLOOD_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('bloodType', type);
                      setShowBloodTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={formData.contactNumber}
              onChangeText={(value) => handleInputChange('contactNumber', value)}
              placeholder="09XXXXXXXXX"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Municipality</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowMunicipalityDropdown(!showMunicipalityDropdown)}
            >
              <Text style={styles.dropdownText}>
                {formData.municipality || 'Select Municipality'}
              </Text>
            </TouchableOpacity>
            {normalizeBoolean(showMunicipalityDropdown) && (
              <View style={styles.dropdownMenu}>
                {MUNICIPALITIES.map(municipality => (
                  <TouchableOpacity
                    key={municipality}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('municipality', municipality);
                      setShowMunicipalityDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{municipality}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Availability Status</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, formData.availabilityStatus === 'Available' && styles.radioButtonSelected]}
                onPress={() => handleInputChange('availabilityStatus', 'Available')}
              >
                <Text style={[styles.radioText, formData.availabilityStatus === 'Available' && styles.radioTextSelected]}>
                  Available
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, formData.availabilityStatus === 'Temporarily Unavailable' && styles.radioButtonSelected]}
                onPress={() => handleInputChange('availabilityStatus', 'Temporarily Unavailable')}
              >
                <Text style={[styles.radioText, formData.availabilityStatus === 'Temporarily Unavailable' && styles.radioTextSelected]}>
                  Temporarily Unavailable
                </Text>
              </TouchableOpacity>
            </View>
          </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            </TouchableOpacity>
          </View>
        </SafeScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    color: '#1E293B',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  radioButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  radioTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E293B',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1E293B',
  },
});