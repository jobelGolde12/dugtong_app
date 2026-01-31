import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  Filter,
  RefreshCw,
  Search,
  Users,
  XCircle
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

// ============ TYPES & INTERFACES ============
interface Donor {
  id: string;
  name: string;
  bloodType: string;
  municipality: string;
  availabilityStatus: 'Available' | 'Temporarily Unavailable';
  lastDonation?: string;
  contactNumber?: string;
}

interface DonorFilter {
  bloodType: string | null;
  municipality: string | null;
  availability: string | null;
  searchQuery: string;
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
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fefce8',
    500: '#eab308',
    600: '#ca8a04',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  surface: {
    light: '#ffffff',
    dark: '#1a1a1a',
  },
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ============ REUSABLE COMPONENTS ============
const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.neutral[50] }}>
    {children}
  </SafeAreaView>
);

const Card: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated';
}> = ({ children, onPress, variant = 'default' }) => {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    shadowOpacity.value = withTiming(0.05);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    shadowOpacity.value = withTiming(0.1);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          {
            backgroundColor: COLORS.surface.light,
            borderRadius: RADIUS.lg,
            padding: SPACING.lg,
            ...SHADOWS.md,
          },
          variant === 'elevated' && SHADOWS.lg,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}> = ({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false 
}) => {
  const scale = useSharedValue(1);
  const bgColor = useSharedValue(COLORS.primary[500]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: bgColor.value,
  }));

  const sizeStyles = {
    sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
    md: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
    lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  };

  const variantStyles = {
    primary: {
      backgroundColor: COLORS.primary[500],
      textColor: '#ffffff',
    },
    secondary: {
      backgroundColor: COLORS.neutral[100],
      textColor: COLORS.neutral[700],
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: COLORS.primary[500],
    },
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    if (variant === 'primary') {
      bgColor.value = withTiming(COLORS.primary[600]);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    if (variant === 'primary') {
      bgColor.value = withTiming(COLORS.primary[500]);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <Animated.View
        style={[
          {
            borderRadius: RADIUS.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: SPACING.xs,
            opacity: loading ? 0.7 : 1,
          },
          sizeStyles[size],
          variantStyles[variant].backgroundColor !== 'transparent' && SHADOWS.sm,
          buttonStyle,
        ]}
      >
        {loading && (
          <Animated.View entering={FadeIn}>
            <RefreshCw size={16} color={variantStyles[variant].textColor} />
          </Animated.View>
        )}
        <Animated.Text
          style={{
            color: variantStyles[variant].textColor,
            fontWeight: '600',
            fontSize: size === 'sm' ? 14 : 16,
          }}
        >
          {children}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral';
}> = ({ children, variant = 'neutral' }) => {
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
  };

  return (
    <View
      style={{
        backgroundColor: variantConfig[variant].backgroundColor,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: variantConfig[variant].textColor,
          fontSize: 12,
          fontWeight: '500',
        }}
      >
        {children}
      </Text>
    </View>
  );
};

const Text = ({ children, style, ...props }: any) => (
  <Animated.Text
    style={[{ color: COLORS.neutral[900] }, style]}
    {...props}
  >
    {children}
  </Animated.Text>
);

// ============ SCREEN COMPONENTS ============
const Header: React.FC = () => (
  <Animated.View entering={FadeInDown.duration(500)} style={{ padding: SPACING.lg }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Text style={{ ...TYPOGRAPHY.h1, color: COLORS.neutral[900] }}>Donor Management</Text>
        <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.neutral[500], marginTop: SPACING.xs }}>
          Manage and monitor blood donors in your network
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <Button variant="ghost" size="sm">
          <Filter size={20} />
        </Button>
        <Button variant="ghost" size="sm">
          <Users size={20} />
        </Button>
      </View>
    </View>
  </Animated.View>
);

const FilterBar: React.FC<{
  filters: DonorFilter;
  onFilterChange: (filterName: keyof DonorFilter, value: any) => void;
  onClearFilters: () => void;
}> = ({ filters, onFilterChange, onClearFilters }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View 
      entering={FadeInDown.delay(100).duration(500)}
      style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
    >
      <Card variant="elevated">
        <View style={{ gap: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Search size={20} color={COLORS.neutral[400]} />
            <TextInput
              placeholder="Search donors by name, blood type, or location..."
              placeholderTextColor={COLORS.neutral[400]}
              value={filters.searchQuery}
              onChangeText={(text) => onFilterChange('searchQuery', text)}
              style={{
                flex: 1,
                fontSize: 16,
                color: COLORS.neutral[900],
                paddingVertical: SPACING.sm,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: SPACING.sm,
            }}
          >
            <Text style={{ fontWeight: '600', color: COLORS.neutral[700] }}>
              Advanced Filters
            </Text>
            <ChevronDown 
              size={20} 
              color={COLORS.neutral[500]}
              style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {expanded && (
            <Animated.View 
              entering={FadeIn}
              style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: SPACING.sm,
                paddingTop: SPACING.sm,
                borderTopWidth: 1,
                borderTopColor: COLORS.neutral[200]
              }}
            >
              {['A+', 'B+', 'O+', 'AB+'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => onFilterChange('bloodType', 
                    filters.bloodType === type ? null : type
                  )}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.xs,
                    borderRadius: RADIUS.full,
                    backgroundColor: filters.bloodType === type 
                      ? COLORS.primary[500] 
                      : COLORS.neutral[100],
                  }}
                >
                  <Text style={{
                    color: filters.bloodType === type ? '#fff' : COLORS.neutral[700],
                    fontWeight: '500',
                  }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {(filters.bloodType || filters.municipality || filters.availability) && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: COLORS.neutral[500], fontSize: 14 }}>
                Filters applied
              </Text>
              <Button variant="ghost" size="sm" onPress={onClearFilters}>
                Clear all
              </Button>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
};

const DonorCard: React.FC<{
  donor: Donor;
  onViewDetails: (donor: Donor) => void;
  onToggleAvailability: (donor: Donor) => void;
  onEdit: (donor: Donor) => void;
}> = ({ donor, onViewDetails, onToggleAvailability, onEdit }) => {
  const statusColor = donor.availabilityStatus === 'Available' 
    ? COLORS.success[500] 
    : COLORS.warning[500];

  return (
    <Card
      onPress={() => onViewDetails(donor)}
      variant="elevated"
    >
      <View style={{ gap: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Text style={{ ...TYPOGRAPHY.h3, color: COLORS.neutral[900] }}>
                {donor.name}
              </Text>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: statusColor,
              }} />
            </View>
            <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.neutral[500], marginTop: 2 }}>
              {donor.municipality} • {donor.contactNumber || 'No contact'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onEdit(donor)}
            >
              <Edit2 size={16} color={COLORS.neutral[500]} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onToggleAvailability(donor)}
            >
              {donor.availabilityStatus === 'Available' ? (
                <CheckCircle size={16} color={COLORS.success[500]} />
              ) : (
                <XCircle size={16} color={COLORS.warning[500]} />
              )}
            </Button>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'center' }}>
          <Badge variant="neutral">
            {donor.bloodType}
          </Badge>
          <Badge variant={donor.availabilityStatus === 'Available' ? 'success' : 'warning'}>
            {donor.availabilityStatus}
          </Badge>
          {donor.lastDonation && (
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.neutral[400] }}>
              Last donation: {donor.lastDonation}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onViewDetails(donor)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: SPACING.sm,
            borderTopWidth: 1,
            borderTopColor: COLORS.neutral[100],
          }}
        >
          <Text style={{ color: COLORS.primary[500], fontWeight: '500' }}>
            View full details
          </Text>
          <ChevronRight size={16} color={COLORS.primary[500]} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Animated.View 
    entering={FadeIn.duration(600)}
    style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: SPACING['2xl'],
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
    <Text style={{ ...TYPOGRAPHY.h3, color: COLORS.neutral[700], marginBottom: SPACING.sm }}>
      No donors found
    </Text>
    <Text style={{ ...TYPOGRAPHY.body1, color: COLORS.neutral[500], textAlign: 'center' }}>
      {message}
    </Text>
    <Button variant="primary" size="md" style={{ marginTop: SPACING.lg }}>
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
    }}
  >
    <View style={{ alignItems: 'center', gap: SPACING.md }}>
      <RefreshCw size={32} color={COLORS.primary[500]} style={{ opacity: 0.7 }} />
      <Text style={{ color: COLORS.neutral[500] }}>Loading donors...</Text>
    </View>
  </Animated.View>
);

const StatsBar: React.FC<{ donors: Donor[] }> = ({ donors }) => {
  const availableDonors = donors.filter(d => d.availabilityStatus === 'Available').length;
  const totalDonors = donors.length;

  return (
    <Animated.View 
      entering={FadeInDown.delay(200).duration(500)}
      style={{ 
        paddingHorizontal: SPACING.lg, 
        marginBottom: SPACING.lg,
        flexDirection: 'row',
        gap: SPACING.md,
      }}
    >
      <Card variant="elevated">
        <View style={{ alignItems: 'center', gap: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.h2, color: COLORS.neutral[900] }}>
            {totalDonors}
          </Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.neutral[500] }}>
            Total Donors
          </Text>
        </View>
      </Card>
      
      <Card variant="elevated">
        <View style={{ alignItems: 'center', gap: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.h2, color: COLORS.success[600] }}>
            {availableDonors}
          </Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.neutral[500] }}>
            Available Now
          </Text>
        </View>
      </Card>
      
      <Card variant="elevated">
        <View style={{ alignItems: 'center', gap: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.h2, color: COLORS.neutral[900] }}>
            {((availableDonors / totalDonors) * 100).toFixed(0)}%
          </Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.neutral[500] }}>
            Availability Rate
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
};

// ============ MAIN SCREEN COMPONENT ============
export const DonorManagementScreen: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([
    {
      id: '1',
      name: 'John Smith',
      bloodType: 'A+',
      municipality: 'New York City',
      availabilityStatus: 'Available',
      lastDonation: '2024-01-15',
      contactNumber: '+1 (555) 123-4567',
    },
    {
      id: '2',
      name: 'Maria Garcia',
      bloodType: 'O-',
      municipality: 'Los Angeles',
      availabilityStatus: 'Temporarily Unavailable',
      lastDonation: '2023-12-20',
      contactNumber: '+1 (555) 987-6543',
    },
    {
      id: '3',
      name: 'David Chen',
      bloodType: 'B+',
      municipality: 'Chicago',
      availabilityStatus: 'Available',
      lastDonation: '2024-01-10',
      contactNumber: '+1 (555) 456-7890',
    },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DonorFilter>({
    bloodType: null,
    municipality: null,
    availability: null,
    searchQuery: '',
  });

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
    });
  }, []);

  const handleViewDetails = useCallback((donor: Donor) => {
    Alert.alert(
      'Donor Details',
      `Name: ${donor.name}\nBlood Type: ${donor.bloodType}\nMunicipality: ${donor.municipality}\nStatus: ${donor.availabilityStatus}\nContact: ${donor.contactNumber || 'N/A'}\nLast Donation: ${donor.lastDonation || 'N/A'}`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleToggleAvailability = useCallback(async (donor: Donor) => {
    try {
      const newStatus = donor.availabilityStatus === 'Available' 
        ? 'Temporarily Unavailable' 
        : 'Available';
      
      // Update local state
      setDonors(prev => prev.map(d => 
        d.id === donor.id ? { ...d, availabilityStatus: newStatus } : d
      ));
      
      Alert.alert(
        'Success',
        `Donor marked as ${newStatus}`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update donor availability',
        [{ text: 'OK', style: 'destructive' }]
      );
    }
  }, []);

  const handleEdit = useCallback((donor: Donor) => {
    Alert.alert(
      'Edit Donor',
      `Would you like to edit ${donor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', style: 'default' },
      ]
    );
  }, []);

  const filteredDonors = donors.filter(donor => {
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      if (!donor.name.toLowerCase().includes(searchLower) &&
          !donor.bloodType.toLowerCase().includes(searchLower) &&
          !donor.municipality.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (filters.bloodType && donor.bloodType !== filters.bloodType) return false;
    if (filters.availability && donor.availabilityStatus !== filters.availability) return false;
    
    return true;
  });

  return (
    <Container>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING['2xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Gradient */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}>
          <Svg height="300" width="100%">
            <Defs>
              <RadialGradient id="gradient" cx="50%" cy="0%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={COLORS.primary[50]} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={COLORS.neutral[50]} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="300" fill="url(#gradient)" />
          </Svg>
        </View>

        <Header />
        
        {donors.length > 0 && <StatsBar donors={donors} />}
        
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <View style={{ paddingHorizontal: SPACING.lg, gap: SPACING.md }}>
          {loading ? (
            <LoadingIndicator />
          ) : filteredDonors.length > 0 ? (
            filteredDonors.map((donor, index) => (
              <Animated.View
                key={donor.id}
                entering={FadeInDown.delay(100 + index * 50).duration(500)}
              >
                <DonorCard
                  donor={donor}
                  onViewDetails={handleViewDetails}
                  onToggleAvailability={handleToggleAvailability}
                  onEdit={handleEdit}
                />
              </Animated.View>
            ))
          ) : (
            <EmptyState message="No donors match your current filters. Try adjusting your search criteria or add new donors." />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View 
        entering={FadeIn.delay(500)}
        style={{
          position: 'absolute',
          bottom: SPACING.xl,
          right: SPACING.xl,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onPress={() => Alert.alert('Add Donor', 'Add new donor functionality')}
          style={{
            shadowColor: COLORS.primary[500],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          Add New Donor
        </Button>
      </Animated.View>
    </Container>
  );
};

// Responsive styles
const responsiveStyles = {
  container: {
    paddingHorizontal: {
      base: SPACING.lg,
      lg: SPACING['2xl'],
    },
  },
  grid: {
    columns: {
      base: 1,
      md: 2,
      lg: 3,
    },
  },
} as const;