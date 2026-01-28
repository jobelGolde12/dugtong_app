import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        cardStyle: {
          backgroundColor: '#1E3A8A',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="donor-registration" options={{ title: 'Donor Registration' }} />
      <Stack.Screen name="donor-search" options={{ title: 'Search Donors' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="donor-profile" options={{ title: 'Donor Profile' }} />
      <Stack.Screen name="edit-donor-profile" options={{ title: 'Edit Donor Profile' }} />
    </Stack>
  );
}