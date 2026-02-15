import {
  CheckCircle,
  ChevronRight,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
  XCircle,
  Clock
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  Layout,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { donorApi } from '../../../api/donors';
import { Donor } from '../../../types/donor.types';
import ErrorToast from '../../components/ErrorToast';

// ============ TYPES & INTERFACES ============
// Using types from types/donor.types.ts
import { PendingDonorRegistration } from '../../../api/donors';

interface DonorFilter {
  bloodType: string | null;
  municipality: string | null;
  availability: string | null;
  searchQuery: string;
  showPending: boolean; // Add filter for showing pending registrations
}

// ============ DESIGN SYSTEM CONSTANTS ============
const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
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
  surface: {
    light: '#ffffff',
    dark: '#1a1a1a',
  },
  gradient: {
    start: '#0ea5e9',
    end: '#0284c7',
  }
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============ REUSABLE COMPONENTS ============
const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral[50] }}>
    {children}
  </SafeAreaView>
);

const Text = ({ children, style, variant, ...props }: any) => {
  const variantStyle = variant ? TYPOGRAPHY[variant as keyof typeof TYPOGRAPHY] : {};
  return (
    <Animated.Text
      style={[{ color: COLORS.neutral[900] }, variantStyle, style]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: any;
}> = ({ children, onPress, variant = 'default', style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const cardStyles = {
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...(variant === 'elevated' && SHADOWS.md),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: COLORS.neutral[200],
      backgroundColor: 'transparent',
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[cardStyles, animatedStyle, style]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[cardStyles, style]}>
      {children}
    </Animated.View>
  );
};

const Button: React.FC<{
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
}> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  style
}) => {
    const scale = useSharedValue(1);
    const bgColor = useSharedValue(
      variant === 'primary' ? COLORS.primary[500] :
        variant === 'secondary' ? COLORS.neutral[100] :
          variant === 'destructive' ? COLORS.error[50] :
            'transparent'
    );

    const buttonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      backgroundColor: bgColor.value,
    }));

    const sizeStyles = {
      sm: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        height: 32,
      },
      md: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        height: 40,
      },
      lg: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        height: 48,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: COLORS.primary[500],
        textColor: '#ffffff',
        borderColor: COLORS.primary[500],
      },
      secondary: {
        backgroundColor: COLORS.neutral[100],
        textColor: COLORS.neutral[700],
        borderColor: COLORS.neutral[200],
      },
      ghost: {
        backgroundColor: 'transparent',
        textColor: COLORS.primary[500],
        borderColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        textColor: COLORS.neutral[700],
        borderColor: COLORS.neutral[300],
      },
      destructive: {
        backgroundColor: COLORS.error[50],
        textColor: COLORS.error[600],
        borderColor: 'transparent',
      }
    };

    const handlePressIn = () => {
      scale.value = withSpring(0.98);
      if (variant === 'primary') {
        bgColor.value = withTiming(COLORS.primary[600]);
      } else if (variant === 'secondary') {
        bgColor.value = withTiming(COLORS.neutral[200]);
      }
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
      if (variant === 'primary') {
        bgColor.value = withTiming(COLORS.primary[500]);
      } else if (variant === 'secondary') {
        bgColor.value = withTiming(COLORS.neutral[100]);
      }
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        style={[{ width: fullWidth ? '100%' : 'auto' }, style]}
      >
        <Animated.View
          style={[
            {
              borderRadius: RADIUS.md,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: SPACING.sm,
              opacity: loading ? 0.7 : 1,
              borderWidth: variant === 'outline' ? 1 : 0,
              borderColor: variantStyles[variant].borderColor,
            },
            sizeStyles[size],
            variant !== 'ghost' && SHADOWS.sm,
            buttonStyle,
          ]}
        >
          {loading && (
            <Animated.View entering={FadeIn}>
              <RefreshCw
                size={size === 'sm' ? 14 : 16}
                color={variantStyles[variant].textColor}
                style={{ opacity: 0.8 }}
              />
            </Animated.View>
          )}
          {!loading && leftIcon}
          <Text
            style={{
              color: variantStyles[variant].textColor,
              ...TYPOGRAPHY.button,
              fontSize: size === 'sm' ? 12 : 14,
            }}
          >
            {children}
          </Text>
          {!loading && rightIcon}
        </Animated.View>
      </TouchableOpacity>
    );
  };

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'neutral', size = 'md' }) => {
  const variantConfig = {
    success: {
      backgroundColor: COLORS.success[50],
      textColor: COLORS.success[600],
    },
    warning: {
      backgroundColor: COLORS.warning[50],
      textColor: COLORS.warning[600],
    },
    error: {
      backgroundColor: COLORS.error[50],
      textColor: COLORS.error[600],
    },
    neutral: {
      backgroundColor: COLORS.neutral[100],
      textColor: COLORS.neutral[700],
    },
    primary: {
      backgroundColor: COLORS.primary[50],
      textColor: COLORS.primary[600],
    },
  };

  return (
    <View
      style={{
        backgroundColor: variantConfig[variant].backgroundColor,
        paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
        paddingVertical: size === 'sm' ? 2 : SPACING.xs,
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: variantConfig[variant].textColor,
          fontSize: size === 'sm' ? 10 : 12,
          fontWeight: '600',
        }}
      >
        {children}
      </Text>
    </View>
  );
};

const Chip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}> = ({ label, selected, onPress, icon }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        backgroundColor: selected ? COLORS.primary[500] : COLORS.neutral[100],
        borderWidth: 1,
        borderColor: selected ? COLORS.primary[500] : COLORS.neutral[200],
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
      }}
    >
      {icon}
      <Text style={{
        color: selected ? '#ffffff' : COLORS.neutral[700],
        fontWeight: '500',
        fontSize: 14,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ============ SCREEN COMPONENTS ============
const Header: React.FC = () => (
  <Animated.View
    entering={FadeInDown.duration(500)}
    style={{
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.md,
    }}
  >
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    }}>
      <View>
        <Text variant="h1" style={{ color: COLORS.neutral[900] }}>
          Donor Management
        </Text>
        <Text
          variant="body2"
          style={{
            color: COLORS.neutral[500],
            marginTop: SPACING.xs,
          }}
        >
          {SCREEN_WIDTH > 768 ? 'Manage and monitor blood donors in your network' : 'Monitor blood donors'}
        </Text>
      </View>

    </View>
  </Animated.View>
);

const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
}> = ({ value, onChangeText, onFilterPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const searchWidth = useSharedValue(SCREEN_WIDTH * 0.9);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (SCREEN_WIDTH < 768) {
          searchWidth.value = withTiming(SCREEN_WIDTH * 0.85);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        searchWidth.value = withTiming(SCREEN_WIDTH * 0.9);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: searchWidth.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(500)}
      style={[
        {
          alignSelf: 'center',
          marginBottom: SPACING.lg,
        },
        animatedStyle
      ]}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface.light,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: isFocused ? COLORS.primary[300] : COLORS.neutral[200],
        paddingVertical: SPACING.sm,
        ...SHADOWS.sm,
      }}>
        <Search size={20} color={COLORS.neutral[400]} style={{ marginLeft: SPACING.md }} />
        <TextInput
          ref={inputRef}
          placeholder="Search..."
          placeholderTextColor={COLORS.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            fontSize: 16,
            color: COLORS.neutral[900],
            marginLeft: SPACING.sm,
            paddingVertical: Platform.OS === 'ios' ? SPACING.xs : 0,
            paddingRight: value.length > 0 ? SPACING.xs : SPACING.md + 24, // Adjust space for icon or clear button
          }}
          clearButtonMode="never" // We are implementing custom clear/filter buttons
        />
        {value.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              inputRef.current?.blur();
            }}
            style={{
              padding: SPACING.xs,
              marginRight: SPACING.xs,
            }}
          >
            <X size={18} color={COLORS.neutral[400]} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onFilterPress}
            style={{
              padding: SPACING.xs,
              marginRight: SPACING.xs,
            }}
          >
            <SlidersHorizontal size={18} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const FilterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  filters: DonorFilter;
  onFilterChange: (filterName: keyof DonorFilter, value: any) => void;
  onApply: () => void;
  onReset: () => void;
}> = ({ visible, onClose, filters, onFilterChange, onApply, onReset }) => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const availabilityOptions = [
    { label: 'Available', value: 'Available' },
    { label: 'Temporarily Unavailable', value: 'Temporarily Unavailable' },
    { label: 'Recently Donated', value: 'Recently Donated' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral[50] }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.neutral[200],
        }}>
          <Text variant="h2">Filters</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: SPACING.xs }}>
            <X size={24} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: SPACING.lg }}>
          <View style={{ gap: SPACING.xl }}>
            {/* Blood Type Filter */}
            <View>
              <Text variant="h3" style={{ marginBottom: SPACING.md }}>
                Blood Type
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: SPACING.sm,
              }}>
                {bloodTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    selected={filters.bloodType === type}
                    onPress={() => onFilterChange('bloodType',
                      filters.bloodType === type ? null : type
                    )}
                  />
                ))}
              </View>
            </View>

            {/* Availability Filter */}
            <View>
              <Text variant="h3" style={{ marginBottom: SPACING.md }}>
                Availability Status
              </Text>
              <View style={{ gap: SPACING.sm }}>
                {availabilityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => onFilterChange('availability',
                      filters.availability === option.value ? null : option.value
                    )}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.md,
                      backgroundColor: COLORS.neutral[50],
                      borderRadius: RADIUS.md,
                      borderWidth: 1,
                      borderColor: filters.availability === option.value
                        ? COLORS.primary[500]
                        : COLORS.neutral[200],
                    }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: filters.availability === option.value
                        ? COLORS.primary[500]
                        : COLORS.neutral[400],
                      marginRight: SPACING.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {filters.availability === option.value && (
                        <View style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: COLORS.primary[500],
                        }} />
                      )}
                    </View>
                    <Text style={{ flex: 1, color: COLORS.neutral[700] }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Municipality Filter */}
            <View>
              <Text variant="h3" style={{ marginBottom: SPACING.md }}>
                Location
              </Text>
              <TextInput
                placeholder="Enter city or municipality..."
                placeholderTextColor={COLORS.neutral[400]}
                value={filters.municipality || ''}
                onChangeText={(text) => onFilterChange('municipality', text)}
                style={{
                  backgroundColor: COLORS.surface.light,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.neutral[200],
                  padding: SPACING.md,
                  fontSize: 16,
                  color: COLORS.neutral[900],
                }}
              />
            </View>

            {/* Show Pending Registrations Toggle */}
            <View>
              <Text variant="h3" style={{ marginBottom: SPACING.md }}>
                Options
              </Text>
              <TouchableOpacity
                onPress={() => onFilterChange('showPending', !filters.showPending)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  backgroundColor: COLORS.neutral[50],
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: filters.showPending ? COLORS.primary[500] : COLORS.neutral[200],
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: filters.showPending ? COLORS.primary[500] : COLORS.neutral[400],
                  marginRight: SPACING.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {filters.showPending && (
                    <View style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: COLORS.primary[500],
                    }} />
                  )}
                </View>
                <Text style={{ flex: 1, color: COLORS.neutral[700] }}>
                  Show Pending Registrations
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={{
          flexDirection: 'row',
          gap: SPACING.md,
          padding: SPACING.lg,
          borderTopWidth: 1,
          borderTopColor: COLORS.neutral[200],
        }}>
          <Button
            variant="ghost"
            size="sm"
            onPress={onReset}
          >
            Reset All
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              onApply();
              onClose();
            }}
          >
            Apply Filters
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const StatsBar: React.FC<{ donors: (Donor | PendingDonorRegistration)[] }> = ({ donors }) => {
  const regularDonors = donors.filter(d => !('type' in d)) as Donor[];
  const pendingRegistrations = donors.filter(d => 'type' in d && d.type === 'registration') as PendingDonorRegistration[];
  
  const availableDonors = regularDonors.filter(d => d.availabilityStatus === 'Available').length;
  const totalRegularDonors = regularDonors.length;
  const recentlyDonated = regularDonors.filter(d => d.availabilityStatus === 'Recently Donated').length;

  const stats = [
    { 
      label: 'Total Donors', 
      value: totalRegularDonors, 
      color: COLORS.neutral[700],
      bgColor: COLORS.neutral[50],
      icon: Users
    },
    { 
      label: 'Available Now', 
      value: availableDonors, 
      color: COLORS.success[600],
      bgColor: COLORS.success[50],
      icon: CheckCircle
    },
    { 
      label: 'Recently Donated', 
      value: recentlyDonated, 
      color: COLORS.warning[600],
      bgColor: COLORS.warning[50],
      icon: Clock
    },
    { 
      label: 'Pending Reviews', 
      value: pendingRegistrations.length, 
      color: COLORS.warning[600],
      bgColor: COLORS.warning[50],
      icon: Clock
    },
    {
      label: 'Availability',
      value: totalRegularDonors > 0 ? `${((availableDonors / totalRegularDonors) * 100).toFixed(0)}%` : '0%',
      color: COLORS.primary[600],
      bgColor: COLORS.primary[50],
      icon: CheckCircle
    },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500)}
      style={{
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACING.md }}
      >
        {stats.map((stat, index) => (
          <Animated.View
            key={stat.label}
            entering={FadeInDown.delay(300 + index * 100).duration(500)}
            layout={Layout.springify()}
          >
            <Card variant="elevated" style={{ 
              minWidth: SCREEN_WIDTH > 768 ? 180 : 140,
              backgroundColor: stat.bgColor,
              borderWidth: 1,
              borderColor: stat.color + '20',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Gradient overlay effect */}
              <View style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 60,
                height: 60,
                backgroundColor: stat.color + '10',
                borderRadius: 30,
                marginTop: -20,
                marginRight: -20,
              }} />
              
              <View style={{ gap: SPACING.xs, position: 'relative', zIndex: 1 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text variant="h2" style={{ 
                    color: stat.color,
                    fontWeight: '800',
                    fontSize: 24
                  }}>
                    {stat.value}
                  </Text>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: stat.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <stat.icon size={16} color={stat.color} />
                  </View>
                </View>
                <Text variant="caption" style={{ 
                  color: stat.color,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginTop: 4
                }}>
                  {stat.label}
                </Text>
              </View>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const DonorCard: React.FC<{
  donor: Donor | PendingDonorRegistration;
  onViewDetails: (donor: Donor | PendingDonorRegistration) => void;
  onToggleAvailability: (donor: Donor) => void;
  onDelete: (donor: Donor) => void;
  onEdit: (donor: Donor) => void;
  index: number;
}> = ({ donor, onViewDetails, onToggleAvailability, onDelete, onEdit, index }) => {
  // Check if this is a pending registration
  const isPendingRegistration = 'type' in donor && donor.type === 'registration';
  
  // Define status config for both regular donors and pending registrations
  const statusConfig = {
    'Available': { color: COLORS.success[500], bgColor: COLORS.success[50], icon: CheckCircle },
    'Temporarily Unavailable': { color: COLORS.warning[500], bgColor: COLORS.warning[50], icon: XCircle },
    'Recently Donated': { color: COLORS.neutral[500], bgColor: COLORS.neutral[100], icon: CheckCircle },
    'pending': { color: COLORS.warning[500], bgColor: COLORS.warning[50], icon: Clock },
  };

  // Determine status based on donor type
  let status;
  if (isPendingRegistration) {
    status = statusConfig['pending'];
  } else {
    status = statusConfig[donor.availabilityStatus] || statusConfig['Available'];
  }

  // Extract data based on donor type
  const name = isPendingRegistration ? donor.full_name : donor.name;
  const bloodType = isPendingRegistration ? donor.blood_type : donor.bloodType;
  const municipality = isPendingRegistration ? donor.municipality : donor.municipality;
  const contactNumber = isPendingRegistration ? donor.contact_number : donor.contactNumber;
  const availabilityStatus = isPendingRegistration ? 'Pending Review' : donor.availabilityStatus;
  const lastDonationDate = isPendingRegistration ? undefined : donor.lastDonationDate;

  // Determine if we can perform certain actions based on donor type
  const canToggleAvailability = !isPendingRegistration;
  const canEdit = !isPendingRegistration;
  const canDelete = !isPendingRegistration;

  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 50).duration(500)}
      layout={Layout.springify()}
    >
      <Card
        onPress={() => onViewDetails(donor)}
        variant="elevated"
        style={{ marginBottom: SPACING.md }}
      >
        <View style={{ gap: SPACING.lg }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: SPACING.md,
          }}>
            <View style={{ flex: 1, gap: SPACING.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Text variant="h3" style={{ color: COLORS.neutral[900], flex: 1 }}>
                  {name}
                </Text>
                <Badge variant={isPendingRegistration ? "warning" : "primary"} size="sm">
                  {bloodType}
                </Badge>
              </View>
              <Text variant="body2" style={{ color: COLORS.neutral[500] }}>
                {municipality} • {contactNumber || 'No contact'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => onEdit(donor as Donor)}
                  leftIcon={<Edit2 size={16} color={COLORS.neutral[500]} />}
                />
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => onDelete(donor as Donor)}
                  leftIcon={<Trash2 size={16} color={COLORS.error[500]} />}
                />
              )}
              {isPendingRegistration && (
                <Badge variant="warning" size="sm">
                  PENDING
                </Badge>
              )}
            </View>
          </View>

          {/* Status & Info */}
          <View style={{
            flexDirection: SCREEN_WIDTH > 768 ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: SCREEN_WIDTH > 768 ? 'center' : 'flex-start',
            gap: SPACING.md,
          }}>
            <View style={{ flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' }}>
              <TouchableOpacity 
                onPress={canToggleAvailability ? () => onToggleAvailability(donor as Donor) : undefined}
                disabled={!canToggleAvailability}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  backgroundColor: status.bgColor,
                  borderRadius: RADIUS.full,
                  gap: SPACING.xs,
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: status.color,
                  }} />
                  <Text style={{
                    color: status.color,
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {availabilityStatus}
                  </Text>
                </View>
              </TouchableOpacity>

              {lastDonationDate && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.xs,
                }}>
                  <Text variant="caption" style={{ color: COLORS.neutral[400] }}>
                    Last:
                  </Text>
                  <Text variant="caption" style={{ color: COLORS.neutral[600], fontWeight: '500' }}>
                    {lastDonationDate}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => onViewDetails(donor)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.xs,
              }}
            >
              <Text style={{
                color: COLORS.primary[500],
                fontWeight: '600',
                fontSize: 14,
                opacity: 0.8
              }}>
                Details
              </Text>
              <ChevronRight size={16} color={COLORS.primary[500]} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const EmptyState: React.FC<{
  message: string;
  onAddDonor: () => void;
}> = ({ message, onAddDonor }) => (
  <Animated.View
    entering={FadeIn.duration(600)}
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING['3xl'],
      minHeight: 400,
    }}
  >
    <View style={{
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: COLORS.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
    }}>
      <Users size={48} color={COLORS.neutral[400]} />
    </View>
    <Text variant="h3" style={{
      color: COLORS.neutral[700],
      marginBottom: SPACING.sm,
      textAlign: 'center',
    }}>
      No donors found
    </Text>
    <Text variant="body1" style={{
      color: COLORS.neutral[500],
      textAlign: 'center',
      marginBottom: SPACING.lg,
    }}>
      {message}
    </Text>
    <Button
      variant="primary"
      size="lg"
      onPress={onAddDonor}
      leftIcon={<Plus size={20} color="#ffffff" />}
    >
      Add New Donor
    </Button>
  </Animated.View>
);

const LoadingIndicator: React.FC = () => (
  <Animated.View
    entering={FadeIn}
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
      padding: SPACING['3xl'],
    }}
  >
    <View style={{ alignItems: 'center', gap: SPACING.lg }}>
      <Animated.View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: COLORS.primary[50],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RefreshCw
          size={32}
          color={COLORS.primary[500]}
          style={{ opacity: 0.7 }}
        />
      </Animated.View>
      <Text variant="body1" style={{ color: COLORS.neutral[500] }}>
        Loading donors...
      </Text>
    </View>
  </Animated.View>
);

// ============ MAIN SCREEN COMPONENT ============
const DonorManagementScreen: React.FC = () => {
  const [donors, setDonors] = useState<(Donor | PendingDonorRegistration)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<DonorFilter>({
    bloodType: null,
    municipality: null,
    availability: null,
    searchQuery: '',
    showPending: true, // Show pending registrations by default
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | PendingDonorRegistration | null>(null);

  const debounceTimer = useRef<any>(null);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching donors with filters:', filters);
      
      // Fetch donors
      const donorResult = await donorApi.getDonors({
        bloodType: filters.bloodType || null,
        municipality: filters.municipality || null,
        availability: filters.availability,
        searchQuery: filters.searchQuery,
      });

      console.log('📊 Donor result:', donorResult);
      console.log('📊 Items:', donorResult?.items);
      console.log('📊 Items length:', donorResult?.items?.length);

      // Get donors array
      let combinedResults: Donor[] = [];
      
      if (donorResult && donorResult.items && Array.isArray(donorResult.items)) {
        combinedResults = [...donorResult.items];
      } else if (Array.isArray(donorResult)) {
        // Fallback if response is direct array
        combinedResults = [...donorResult];
      }

      console.log('✅ Combined results:', combinedResults.length);
      setDonors(combinedResults);
    } catch (err: any) {
      console.error('❌ Error fetching donors:', err);
      setError(err.message || 'Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchDonors();
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters]);

  const handleFilterChange = useCallback((filterName: keyof DonorFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      bloodType: null,
      municipality: null,
      availability: null,
      searchQuery: '',
      showPending: true,
    });
  }, []);

  const handleViewDetails = useCallback((donor: Donor | PendingDonorRegistration) => {
    // Check if this is a pending registration
    const isPendingRegistration = 'type' in donor && donor.type === 'registration';
    
    if (isPendingRegistration) {
      // Format details for pending registration
      const reg = donor as PendingDonorRegistration;
      Alert.alert(
        'Pending Registration Details',
        `Name: ${reg.full_name}\nBlood Type: ${reg.blood_type}\nLocation: ${reg.municipality}\nStatus: ${reg.status}\nContact: ${reg.contact_number || 'N/A'}\nAge: ${reg.age}\nSex: ${reg.sex || 'Not specified'}\nCreated: ${reg.created_at}\nID: ${reg.id}`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Approve',
            style: 'default',
            onPress: () => {
              Alert.alert('Approve Registration', `Would you like to approve ${reg.full_name}'s registration?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Approve',
                  style: 'default',
                  onPress: async () => {
                    try {
                      await donorApi.approveRegistration(String(reg.id));
                      Alert.alert('Success', `${reg.full_name}'s registration has been approved.`);
                      // Refresh the list to remove the pending registration
                      fetchDonors();
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to approve registration.');
                    }
                  }
                }
              ]);
            }
          },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Reject Registration', `Would you like to reject ${reg.full_name}'s registration?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reject',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await donorApi.rejectRegistration(String(reg.id));
                      Alert.alert('Rejected', `${reg.full_name}'s registration has been rejected.`);
                      // Refresh the list to remove the pending registration
                      fetchDonors();
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to reject registration.');
                    }
                  }
                }
              ]);
            }
          }
        ]
      );
    } else {
      // Format details for regular donor
      const regDonor = donor as Donor;
      Alert.alert(
        'Donor Details',
        `Name: ${regDonor.name}\nBlood Type: ${regDonor.bloodType}\nLocation: ${regDonor.municipality}\nStatus: ${regDonor.availabilityStatus}\nContact: ${regDonor.contactNumber || 'N/A'}\nEmail: undefined\nLast Donation: ${regDonor.lastDonationDate || 'N/A'}\nNotes: ${regDonor.notes || 'None'}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, []);

  const handleToggleAvailability = useCallback(async (donor: Donor) => {
    try {
      const statusOrder = ['Available', 'Recently Donated', 'Temporarily Unavailable'];
      const currentStatus = donor.availabilityStatus;
      // If current status is not in our known list, default to Available
      const currentIndex = statusOrder.includes(currentStatus) ? statusOrder.indexOf(currentStatus) : 0;
      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

      // Optimistic update
      setDonors(prev => prev.map(d => {
        if ('id' in d && d.id === donor.id) {
          return { ...d, availabilityStatus: nextStatus as any };
        }
        return d;
      }));

      await donorApi.updateAvailability(donor.id, nextStatus);

    } catch (error: any) {
      // Revert optimistic update
      setDonors(prev => prev.map(d => {
        if ('id' in d && d.id === donor.id) {
          return donor;
        }
        return d;
      }));
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  }, []);

  const handleDeleteDonor = useCallback((donor: Donor) => {
    Alert.alert(
      'Delete Donor',
      `Are you sure you want to delete ${donor.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistic delete
              setDonors(prev => prev.filter(d => {
                if ('id' in d) {
                  return d.id !== donor.id;
                }
                return true;
              }));
              await donorApi.deleteDonor(donor.id);
            } catch (error: any) {
              fetchDonors(); // Re-fetch to restore if failed
              Alert.alert('Error', error.message || 'Failed to delete donor');
            }
          }
        },
      ]
    );
  }, [fetchDonors]);

  const handleEdit = useCallback((donor: Donor) => {
    Alert.alert(
      'Edit Donor',
      `Edit details functionality for ${donor.name} is not implemented yet.`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleAddDonor = useCallback(() => {
    Alert.alert(
      'Add New Donor',
      'Add new donor functionality would open a form here.',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const activeFilterCount = [
    filters.bloodType,
    filters.availability,
    filters.municipality,
    !filters.showPending ? 'hidePending' : null, // Count as active if not showing pending registrations
  ].filter(value => Boolean(value)).length;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        {error && (
          <View style={{ position: 'absolute', top: 10, left: 20, right: 20, zIndex: 100 }}>
            <ErrorToast message={error} onDismiss={() => setError(null)} visible={!!error} />
          </View>
        )}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: SPACING['2xl'] }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Header />

          {donors.length > 0 && <StatsBar donors={donors} />}

          <SearchBar
            value={filters.searchQuery}
            onChangeText={(text) => handleFilterChange('searchQuery', text)}
            onFilterPress={() => setFilterModalVisible(true)}
          />

          {activeFilterCount > 0 && (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOut}
              style={{
                paddingHorizontal: SPACING.lg,
                marginBottom: SPACING.md,
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <Text variant="body2" style={{ color: COLORS.neutral[500] }}>
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </Text>
                  <Badge variant="primary" size="sm">
                    {activeFilterCount}
                  </Badge>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleClearFilters}
                >
                  Clear all
                </Button>
              </View>
            </Animated.View>
          )}

          <View style={{
            paddingHorizontal: SPACING.lg,
            gap: SPACING.md,
            minHeight: SCREEN_HEIGHT * 0.5,
          }}>
            {loading ? (
              <LoadingIndicator />
            ) : donors.length > 0 ? (
              donors.map((donor, index) => {
                // Generate a unique key by combining the type and ID
                const key = 'type' in donor ? `${donor.type}-${donor.id}` : `donor-${donor.id}`;
                return (
                  <DonorCard
                    key={key}
                    donor={donor}
                    onViewDetails={handleViewDetails}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={handleDeleteDonor}
                    onEdit={handleEdit}
                    index={index}
                  />
                );
              })
            ) : (
              <EmptyState
                message="No donors or pending registrations match your current filters. Try adjusting your search criteria or add new donors."
                onAddDonor={handleAddDonor}
              />
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        {!loading && donors.length > 0 && (
          <Animated.View
            entering={SlideInDown.delay(500)}
            exiting={SlideOutDown}
            style={{
              position: 'absolute',
              bottom: SPACING.xl,
              right: SPACING.xl,
              ...SHADOWS.xl,
            }}
          >
            <TouchableOpacity
              onPress={handleAddDonor}
              activeOpacity={0.9}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: COLORS.primary[500],
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.lg,
              }}
            >
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApply={() => { }}
          onReset={handleClearFilters}
        />
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default DonorManagementScreen;

