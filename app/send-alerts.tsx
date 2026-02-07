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
import { alertApi } from '../api/alerts';
import { useTheme } from '../contexts/ThemeContext';
import SafeScrollView from '../lib/SafeScrollView';
import { ThemeColors } from '../types/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reusable Form Components
const FormCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  style?: any;
  styles: any;
}> = ({ children, title, icon, style, styles }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={[
        styles.formCard,
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
  styles: any;
  colors: ThemeColors;
}> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  icon,
  error,
  required = false,
  styles,
  colors
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
            placeholderTextColor={colors.disabled}
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
  styles: any;
  colors: ThemeColors;
}> = ({ label, placeholder, value, onPress, icon, required = false, styles, colors }) => {
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
          <ChevronDown size={20} color={colors.disabled} />
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
  styles: any;
  colors: ThemeColors;
}> = ({ label, value, onChange, mode = 'datetime', required = false, styles, colors }) => {
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
            <Calendar size={20} color={colors.disabled} />
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
  styles: any;
}> = ({ label, checked, onToggle, description, styles }) => {
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
  styles: any;
  colors: ThemeColors;
}> = ({ label, selected, onPress, icon, styles, colors }) => {
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
          styles.chip,
          {
            backgroundColor: selected ? colors.primary : colors.surfaceVariant,
            borderColor: selected ? colors.primary : colors.border,
          },
          animatedStyle,
        ]}
      >
        {icon && (
          <View style={{ opacity: selected ? 1 : 0.6 }}>
            {React.cloneElement(icon as any, {
              size: 16,
              color: selected ? colors.textOnPrimary : colors.textSecondary,
            })}
          </View>
        )}
        <Text style={{
          color: selected ? colors.textOnPrimary : colors.text,
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
    { id: 'all', label: 'All Donors', icon: <Globe size={16} color={colors.textSecondary} /> },
    { id: 'blood_a', label: 'Blood Type A', icon: <Target size={16} color={colors.textSecondary} /> },
    { id: 'blood_b', label: 'Blood Type B', icon: <Target size={16} color={colors.textSecondary} /> },
    { id: 'blood_o', label: 'Blood Type O', icon: <Target size={16} color={colors.textSecondary} /> },
    { id: 'blood_ab', label: 'Blood Type AB', icon: <Target size={16} color={colors.textSecondary} /> },
    { id: 'available', label: 'Available Donors', icon: <Users size={16} color={colors.textSecondary} /> },
    { id: 'location', label: 'Specific Location', icon: <MapPin size={16} color={colors.textSecondary} /> },
  ];

  const alertTypes = [
    { id: 'urgent', label: 'Urgent Need', icon: <AlertCircle size={16} />, color: colors.error },
    { id: 'reminder', label: 'Reminder', icon: <Bell size={16} />, color: colors.warning },
    { id: 'info', label: 'Information', icon: <FileText size={16} />, color: colors.info },
    { id: 'event', label: 'Event', icon: <Calendar size={16} />, color: colors.success },
  ];

  const priorityOptions = [
    { id: 'low', label: 'Low', color: colors.success },
    { id: 'medium', label: 'Medium', color: colors.warning },
    { id: 'high', label: 'High', color: colors.error },
    { id: 'critical', label: 'Critical', color: colors.error },
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
      await alertApi.createAlert({
        title: formData.title,
        message: formData.message,
        alert_type: formData.alertType,
        priority: formData.priority,
        target_audience: formData.targetAudience,
        location: formData.location || undefined,
        schedule_at: formData.sendNow ? undefined : formData.scheduleDate.toISOString(),
        send_now: formData.sendNow,
      });

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
            onPress: () => { },
            style: 'cancel'
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create alert. Please try again.');
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.headerIcon}>
                <Bell size={28} color={colors.primary} />
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
        <FormCard styles={styles} title="Alert Details" icon={<FileText size={20} color={colors.primary} />}>
          <FormInput
            styles={styles}
            colors={colors}
            label="Alert Title"
            placeholder="Enter a clear, descriptive title"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            icon={<Tag size={20} color={colors.disabled} />}
            error={errors.title}
            required
          />

          <FormInput
            styles={styles}
            colors={colors}
            label="Message"
            placeholder="Enter the full notification message"
            value={formData.message}
            onChangeText={(text) => handleInputChange('message', text)}
            multiline
            numberOfLines={4}
            icon={<FileText size={20} color={colors.disabled} />}
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
                  styles={styles}
                  colors={colors}
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
                    formData.priority === priority.id && { borderColor: priority.color, backgroundColor: colors.surfaceVariant }
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
        <FormCard styles={styles} title="Target Audience" icon={<Users size={20} color={colors.primary} />}>
          <FormSelect
            styles={styles}
            colors={colors}
            label="Select Audience"
            placeholder="Choose who should receive this alert"
            value={formatAudienceDisplay()}
            onPress={() => setShowAudienceModal(true)}
            icon={<Target size={20} color={colors.disabled} />}
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
        <FormCard styles={styles} title="Schedule" icon={<Calendar size={20} color={colors.primary} />}>
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
                styles={styles}
                colors={colors}
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
              styles={styles}
              label="Require confirmation"
              checked={formData.isScheduled}
              onToggle={() => handleInputChange('isScheduled', !formData.isScheduled)}
              description="Donors must confirm receipt of this alert"
            />
          </View>
        </FormCard>

        {/* Location Card (Optional) */}
        <FormCard styles={styles} title="Location (Optional)" icon={<MapPin size={20} color={colors.primary} />}>
          <FormInput
            styles={styles}
            colors={colors}
            label="Location Details"
            placeholder="e.g., Central Hospital, 123 Main St"
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            icon={<MapPin size={20} color={colors.disabled} />}
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
              <Clock size={20} color={colors.textOnPrimary} />
            ) : (
              <Send size={20} color={colors.textOnPrimary} />
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
                <X size={24} color={colors.textSecondary} />
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 35,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 4,
  },
  draftButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 0,
  },
  draftButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // Removed shadows
    elevation: 0, // For Android
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  formCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
    color: colors.text,
  },
  formInputContainer: {
    marginBottom: 20,
  },
  formLabelContainer: {
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
  },
  requiredStar: {
    color: colors.error,
  },
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0,
    overflow: 'hidden',
    // Removed shadows
    elevation: 0, // For Android
  },
  formInputFocused: {
    borderColor: 'transparent',
    // Removed shadows
    elevation: 0, // For Android
  },
  formInputError: {
    borderColor: 'transparent',
  },
  formInputIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 16,
    paddingRight: 16,
    minHeight: 56,
  },
  formInputWithIcon: {
    paddingLeft: 0,
  },
  formInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 120,
    paddingTop: 16,
  },
  formError: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  formSelectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0,
    paddingRight: 16,
    minHeight: 56,
    // Removed shadows
    elevation: 0, // For Android
  },
  formSelectTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  formSelectText: {
    fontSize: 16,
    color: colors.text,
    paddingLeft: 16,
  },
  formSelectPlaceholder: {
    color: colors.disabled,
  },
  formSection: {
    marginTop: 20,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
    marginBottom: 8,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 0, // Removed border
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0, // Removed border
    minWidth: 100,
    // Removed shadows
    elevation: 0, // For Android
  },
  priorityButtonSelected: {
    borderWidth: 0, // Removed border
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedAudienceContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 0, // Removed border
  },
  selectedAudienceTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedAudienceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: 9999,
    borderWidth: 0, // Removed border
  },
  audienceChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  scheduleOptions: {
    gap: 16,
    marginBottom: 20,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0, // Removed border
  },
  scheduleOptionSelected: {
    borderColor: 'transparent',
    backgroundColor: colors.surfaceVariant,
  },
  scheduleOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0, // Removed border
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleOptionRadioSelected: {
    borderColor: colors.primary,
  },
  scheduleOptionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  scheduleOptionTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  scheduleOptionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scheduleDateContainer: {
    marginTop: 16,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 0, // Removed border
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.textOnPrimary,
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  checkboxDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    borderWidth: 0, // Removed border
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
    // Removed shadows
    elevation: 0, // For Android
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0, // Removed border
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 0, // Removed border
  },
  audienceOptionSelected: {
    borderColor: 'transparent',
    backgroundColor: colors.surfaceVariant,
  },
  audienceCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 0, // Removed border
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceCheckboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  audienceCheckboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textOnPrimary,
  },
  audienceOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceOptionContent: {
    flex: 1,
  },
  audienceOptionLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  audienceOptionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 0, // Removed border
  },
  modalSelectAllButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 0, // Removed border
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSelectAllText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  modalDoneButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Removed shadows
    elevation: 0, // For Android
  },
  modalDoneText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreateAlertsScreen;