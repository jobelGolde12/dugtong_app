import DateTimePicker from '@react-native-community/datetimepicker';
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Globe,
  MapPin,
  Send,
  Tag,
  Target,
  Users,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import SafeScrollView from '../lib/SafeScrollView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design System Constants
const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
  },
  surface: {
    light: '#ffffff',
    dark: '#1a1a1a',
  },
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 14, fontWeight: '600', letterSpacing: 0.25 },
} as const;

const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  }
} as const;

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Reusable Form Components
const FormCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  style?: any;
}> = ({ children, title, icon, style }) => {
  return (
    <Animated.View 
      entering={FadeInDown.duration(500)}
      style={[
        {
          backgroundColor: COLORS.surface.light,
          borderRadius: RADIUS.lg,
          padding: SPACING.xl,
          marginBottom: SPACING.xl,
          ...SHADOWS.md,
        },
        style
      ]}
    >
      {title && (
        <View style={styles.formCardHeader}>
          {icon && (
            <View style={styles.formCardIcon}>
              {icon}
            </View>
          )}
          <Text style={styles.formCardTitle}>{title}</Text>
        </View>
      )}
      {children}
    </Animated.View>
  );
};

const FormInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
}> = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  multiline = false, 
  numberOfLines = 1,
  icon,
  error,
  required = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02);
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1);
  };

  return (
    <View style={styles.formInputContainer}>
      <View style={styles.formLabelContainer}>
        <Text style={styles.formLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>
      
      <Animated.View style={[
        styles.formInputWrapper,
        animatedStyle,
        isFocused && styles.formInputFocused,
        error && styles.formInputError,
      ]}>
        {icon && (
          <View style={styles.formInputIcon}>
            {icon}
          </View>
        )}
        <RNTextInput
          style={[
            styles.formInput,
            multiline && styles.formInputMultiline,
            icon && styles.formInputWithIcon,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
      
      {error && (
        <Animated.Text entering={FadeIn} style={styles.formError}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const FormSelect: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onPress: () => void;
  icon?: React.ReactNode;
  required?: boolean;
}> = ({ label, placeholder, value, onPress, icon, required = false }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <View style={styles.formInputContainer}>
      <View style={styles.formLabelContainer}>
        <Text style={styles.formLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Animated.View style={[styles.formSelectWrapper, animatedStyle]}>
          {icon && (
            <View style={styles.formInputIcon}>
              {icon}
            </View>
          )}
          <View style={[
            styles.formSelectTextContainer,
            icon && styles.formInputWithIcon,
          ]}>
            <Text style={[
              styles.formSelectText,
              !value && styles.formSelectPlaceholder
            ]}>
              {value || placeholder}
            </Text>
          </View>
          <ChevronDown size={20} color={COLORS.neutral[400]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const FormDatePicker: React.FC<{
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  required?: boolean;
}> = ({ label, value, onChange, mode = 'datetime', required = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.formInputContainer}>
      <View style={styles.formLabelContainer}>
        <Text style={styles.formLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Animated.View style={[styles.formSelectWrapper, animatedStyle]}>
          <View style={styles.formInputIcon}>
            <Calendar size={20} color={COLORS.neutral[400]} />
          </View>
          <View style={styles.formSelectTextContainer}>
            <Text style={styles.formSelectText}>
              {formatDate(value)}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

const FormCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onToggle: () => void;
  description?: string;
}> = ({ label, checked, onToggle, description }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.checkboxContainer}
      activeOpacity={0.8}
    >
      <Animated.View style={[animatedStyle]}>
        <View style={[
          styles.checkbox,
          checked && styles.checkboxChecked
        ]}>
          {checked && (
            <View style={styles.checkboxInner}>
              <View style={styles.checkboxDot} />
            </View>
          )}
        </View>
      </Animated.View>
      
      <View style={styles.checkboxContent}>
        <Text style={styles.checkboxLabel}>{label}</Text>
        {description && (
          <Text style={styles.checkboxDescription}>{description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Chip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}> = ({ label, selected, onPress, icon }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.xs,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.full,
            backgroundColor: selected ? COLORS.primary[500] : COLORS.neutral[100],
            borderWidth: 1,
            borderColor: selected ? COLORS.primary[500] : COLORS.neutral[200],
          },
          animatedStyle,
        ]}
      >
        {icon && (
          <View style={{ opacity: selected ? 1 : 0.6 }}>
            {React.cloneElement(icon as any, {
              size: 16,
              color: selected ? '#fff' : COLORS.neutral[600],
            })}
          </View>
        )}
        <Text style={{
          color: selected ? '#fff' : COLORS.neutral[700],
          fontWeight: '500',
          fontSize: 14,
        }}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CreateAlertsScreen: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    alertType: 'urgent',
    targetAudience: [] as string[],
    priority: 'medium',
    scheduleDate: new Date(),
    location: '',
    isScheduled: false,
    sendNow: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);

  const audienceOptions = [
    { id: 'all', label: 'All Donors', icon: <Globe size={16} /> },
    { id: 'blood_a', label: 'Blood Type A', icon: <Target size={16} /> },
    { id: 'blood_b', label: 'Blood Type B', icon: <Target size={16} /> },
    { id: 'blood_o', label: 'Blood Type O', icon: <Target size={16} /> },
    { id: 'blood_ab', label: 'Blood Type AB', icon: <Target size={16} /> },
    { id: 'available', label: 'Available Donors', icon: <Users size={16} /> },
    { id: 'location', label: 'Specific Location', icon: <MapPin size={16} /> },
  ];

  const alertTypes = [
    { id: 'urgent', label: 'Urgent Need', icon: <AlertCircle size={16} />, color: COLORS.error[500] },
    { id: 'reminder', label: 'Reminder', icon: <Bell size={16} />, color: COLORS.warning[500] },
    { id: 'info', label: 'Information', icon: <FileText size={16} />, color: COLORS.info[500] },
    { id: 'event', label: 'Event', icon: <Calendar size={16} />, color: COLORS.success[500] },
  ];

  const priorityOptions = [
    { id: 'low', label: 'Low', color: COLORS.success[500] },
    { id: 'medium', label: 'Medium', color: COLORS.warning[500] },
    { id: 'high', label: 'High', color: COLORS.error[500] },
    { id: 'critical', label: 'Critical', color: COLORS.error[600] },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAudienceToggle = (audienceId: string) => {
    setFormData(prev => {
      const newAudience = [...prev.targetAudience];
      if (newAudience.includes(audienceId)) {
        return {
          ...prev,
          targetAudience: newAudience.filter(id => id !== audienceId)
        };
      } else {
        return {
          ...prev,
          targetAudience: [...newAudience, audienceId]
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Alert title is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }

    if (formData.targetAudience.length === 0) {
      newErrors.targetAudience = 'Select at least one target audience';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success!',
        `Alert "${formData.title}" has been created successfully.`,
        [
          {
            text: 'Create Another',
            onPress: () => resetForm(),
            style: 'default'
          },
          {
            text: 'View Alerts',
            onPress: () => {},
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      alertType: 'urgent',
      targetAudience: [],
      priority: 'medium',
      scheduleDate: new Date(),
      location: '',
      isScheduled: false,
      sendNow: true,
    });
    setErrors({});
  };

  const formatAudienceDisplay = () => {
    if (formData.targetAudience.length === 0) {
      return 'Select target audience';
    }
    
    if (formData.targetAudience.includes('all')) {
      return 'All Donors';
    }
    
    const count = formData.targetAudience.length;
    return `${count} audience${count > 1 ? 's' : ''} selected`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <View style={styles.titleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <View style={styles.headerIcon}>
                <Bell size={28} color={COLORS.primary[600]} />
              </View>
              <View>
                <Text style={styles.title}>Create Alert</Text>
                <Text style={styles.subtitle}>
                  Send notifications to donors
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.draftButton}
            onPress={resetForm}
          >
            <Text style={styles.draftButtonText}>Clear Draft</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Form */}
        <FormCard title="Alert Details" icon={<FileText size={20} color={COLORS.primary[500]} />}>
          <FormInput
            label="Alert Title"
            placeholder="Enter a clear, descriptive title"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            icon={<Tag size={20} color={COLORS.neutral[400]} />}
            error={errors.title}
            required
          />

          <FormInput
            label="Message"
            placeholder="Enter the full notification message"
            value={formData.message}
            onChangeText={(text) => handleInputChange('message', text)}
            multiline
            numberOfLines={4}
            icon={<FileText size={20} color={COLORS.neutral[400]} />}
            error={errors.message}
            required
          />

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Alert Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {alertTypes.map((type) => (
                <Chip
                  key={type.id}
                  label={type.label}
                  selected={formData.alertType === type.id}
                  onPress={() => handleInputChange('alertType', type.id)}
                  icon={type.icon}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority.id && styles.priorityButtonSelected,
                    formData.priority === priority.id && { borderColor: priority.color }
                  ]}
                  onPress={() => handleInputChange('priority', priority.id)}
                >
                  <View style={[
                    styles.priorityIndicator,
                    { backgroundColor: priority.color }
                  ]} />
                  <Text style={[
                    styles.priorityText,
                    formData.priority === priority.id && { color: priority.color, fontWeight: '600' }
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FormCard>

        {/* Target Audience Card */}
        <FormCard title="Target Audience" icon={<Users size={20} color={COLORS.primary[500]} />}>
          <FormSelect
            label="Select Audience"
            placeholder="Choose who should receive this alert"
            value={formatAudienceDisplay()}
            onPress={() => setShowAudienceModal(true)}
            icon={<Target size={20} color={COLORS.neutral[400]} />}
            required
          />
          
          {errors.targetAudience && (
            <Animated.Text entering={FadeIn} style={styles.formError}>
              {errors.targetAudience}
            </Animated.Text>
          )}

          {formData.targetAudience.length > 0 && !formData.targetAudience.includes('all') && (
            <View style={styles.selectedAudienceContainer}>
              <Text style={styles.selectedAudienceTitle}>Selected:</Text>
              <View style={styles.selectedAudienceChips}>
                {formData.targetAudience.map(audienceId => {
                  const audience = audienceOptions.find(a => a.id === audienceId);
                  return audience ? (
                    <View key={audience.id} style={styles.audienceChip}>
                      {audience.icon}
                      <Text style={styles.audienceChipText}>{audience.label}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </View>
          )}
        </FormCard>

        {/* Schedule Card */}
        <FormCard title="Schedule" icon={<Calendar size={20} color={COLORS.primary[500]} />}>
          <View style={styles.scheduleOptions}>
            <TouchableOpacity
              style={[
                styles.scheduleOption,
                formData.sendNow && styles.scheduleOptionSelected
              ]}
              onPress={() => handleInputChange('sendNow', true)}
            >
              <View style={[
                styles.scheduleOptionRadio,
                formData.sendNow && styles.scheduleOptionRadioSelected
              ]}>
                {formData.sendNow && <View style={styles.scheduleOptionRadioInner} />}
              </View>
              <View>
                <Text style={styles.scheduleOptionTitle}>Send Immediately</Text>
                <Text style={styles.scheduleOptionDescription}>
                  Alert will be sent as soon as you publish it
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.scheduleOption,
                !formData.sendNow && styles.scheduleOptionSelected
              ]}
              onPress={() => handleInputChange('sendNow', false)}
            >
              <View style={[
                styles.scheduleOptionRadio,
                !formData.sendNow && styles.scheduleOptionRadioSelected
              ]}>
                {!formData.sendNow && <View style={styles.scheduleOptionRadioInner} />}
              </View>
              <View>
                <Text style={styles.scheduleOptionTitle}>Schedule for Later</Text>
                <Text style={styles.scheduleOptionDescription}>
                  Set a specific date and time
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {!formData.sendNow && (
            <Animated.View 
              entering={FadeInDown}
              style={styles.scheduleDateContainer}
            >
              <FormDatePicker
                label="Schedule Date & Time"
                value={formData.scheduleDate}
                onChange={(date) => handleInputChange('scheduleDate', date)}
                required={!formData.sendNow}
              />
            </Animated.View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Additional Options</Text>
            <FormCheckbox
              label="Require confirmation"
              checked={formData.isScheduled}
              onToggle={() => handleInputChange('isScheduled', !formData.isScheduled)}
              description="Donors must confirm receipt of this alert"
            />
          </View>
        </FormCard>

        {/* Location Card (Optional) */}
        <FormCard title="Location (Optional)" icon={<MapPin size={20} color={COLORS.primary[500]} />}>
          <FormInput
            label="Location Details"
            placeholder="e.g., Central Hospital, 123 Main St"
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            icon={<MapPin size={20} color={COLORS.neutral[400]} />}
          />
          <Text style={styles.helperText}>
            Add location details if this alert is location-specific
          </Text>
        </FormCard>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetForm}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Clock size={20} color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Alert'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Audience Selection Modal */}
        <Modal
          visible={showAudienceModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAudienceModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Audience</Text>
              <TouchableOpacity
                onPress={() => setShowAudienceModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={COLORS.neutral[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {audienceOptions.map((audience) => (
                <TouchableOpacity
                  key={audience.id}
                  style={[
                    styles.audienceOption,
                    formData.targetAudience.includes(audience.id) && styles.audienceOptionSelected
                  ]}
                  onPress={() => handleAudienceToggle(audience.id)}
                >
                  <View style={[
                    styles.audienceCheckbox,
                    formData.targetAudience.includes(audience.id) && styles.audienceCheckboxSelected
                  ]}>
                    {formData.targetAudience.includes(audience.id) && (
                      <View style={styles.audienceCheckboxInner} />
                    )}
                  </View>
                  <View style={styles.audienceOptionIcon}>
                    {audience.icon}
                  </View>
                  <View style={styles.audienceOptionContent}>
                    <Text style={styles.audienceOptionLabel}>{audience.label}</Text>
                    <Text style={styles.audienceOptionDescription}>
                      {audience.id === 'all' ? 'Send to all registered donors' : 
                       audience.id.includes('blood') ? 'Send to donors with specific blood type' :
                       audience.id === 'available' ? 'Send only to currently available donors' :
                       'Send to donors in specific locations'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSelectAllButton}
                onPress={() => {
                  handleInputChange('targetAudience', ['all']);
                  setShowAudienceModal(false);
                }}
              >
                <Text style={styles.modalSelectAllText}>Select All Donors</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setShowAudienceModal(false)}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.neutral[900],
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
  },
  draftButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  draftButtonText: {
    color: COLORS.neutral[700],
    fontWeight: '500',
    fontSize: 14,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  formCardIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCardTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.neutral[900],
  },
  formInputContainer: {
    marginBottom: SPACING.xl,
  },
  formLabelContainer: {
    marginBottom: SPACING.sm,
  },
  formLabel: {
    ...TYPOGRAPHY.body1,
    color: COLORS.neutral[700],
    fontWeight: '500',
  },
  requiredStar: {
    color: COLORS.error[500],
  },
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  formInputFocused: {
    borderColor: COLORS.primary[300],
    ...SHADOWS.md,
  },
  formInputError: {
    borderColor: COLORS.error[300],
  },
  formInputIcon: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral[900],
    paddingVertical: SPACING.lg,
    paddingRight: SPACING.lg,
    minHeight: 56,
  },
  formInputWithIcon: {
    paddingLeft: 0,
  },
  formInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 120,
    paddingTop: SPACING.lg,
  },
  formError: {
    color: COLORS.error[500],
    fontSize: 12,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  formSelectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingRight: SPACING.lg,
    minHeight: 56,
    ...SHADOWS.sm,
  },
  formSelectTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  formSelectText: {
    fontSize: 16,
    color: COLORS.neutral[900],
    paddingLeft: SPACING.lg,
  },
  formSelectPlaceholder: {
    color: COLORS.neutral[400],
  },
  formSection: {
    marginTop: SPACING.xl,
  },
  formSectionTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.neutral[700],
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  chipsContainer: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    minWidth: 100,
    ...SHADOWS.sm,
  },
  priorityButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderWidth: 2,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 14,
    color: COLORS.neutral[700],
    fontWeight: '500',
  },
  selectedAudienceContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary[50],
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary[100],
  },
  selectedAudienceTitle: {
    fontSize: 14,
    color: COLORS.primary[700],
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  selectedAudienceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  audienceChipText: {
    fontSize: 12,
    color: COLORS.primary[700],
    fontWeight: '500',
  },
  scheduleOptions: {
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  scheduleOptionSelected: {
    borderColor: COLORS.primary[300],
    backgroundColor: COLORS.primary[50],
  },
  scheduleOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleOptionRadioSelected: {
    borderColor: COLORS.primary[500],
  },
  scheduleOptionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary[500],
  },
  scheduleOptionTitle: {
    fontSize: 16,
    color: COLORS.neutral[900],
    fontWeight: '500',
    marginBottom: 2,
  },
  scheduleOptionDescription: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  scheduleDateContainer: {
    marginTop: SPACING.lg,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[500],
  },
  checkboxInner: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.neutral[900],
    fontWeight: '500',
    marginBottom: 2,
  },
  checkboxDescription: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING['3xl'],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.neutral[700],
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary[500],
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.neutral[900],
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  audienceOptionSelected: {
    borderColor: COLORS.primary[300],
    backgroundColor: COLORS.primary[50],
  },
  audienceCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceCheckboxSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[500],
  },
  audienceCheckboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  audienceOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceOptionContent: {
    flex: 1,
  },
  audienceOptionLabel: {
    fontSize: 16,
    color: COLORS.neutral[900],
    fontWeight: '500',
    marginBottom: 2,
  },
  audienceOptionDescription: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  modalSelectAllButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSelectAllText: {
    color: COLORS.neutral[700],
    fontWeight: '500',
    fontSize: 14,
  },
  modalDoneButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary[500],
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  modalDoneText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreateAlertsScreen;