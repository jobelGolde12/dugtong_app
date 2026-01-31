import { Link } from 'expo-router';
import React from 'react';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/welcome-bg.png')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>

        {/* Top Illustration Area */}
        <View style={styles.illustrationWrapper}>
          <Text style={styles.bloodIcon}>🩸</Text>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Dugtong</Text>
          <Text style={styles.subtitle}>
            Find blood donors quickly and manage donations across Sorsogon Province with just a few taps.
          </Text>
        </View>

        {/* Main Button */}
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Secondary Links */}
        <View style={styles.secondaryLinks}>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Register as Donor</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, 
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // Illustration Area
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  bloodIcon: {
    fontSize: 120,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },

  // Text Section
  textContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 35,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    // Modernistic Font Settings
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-condensed',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    // Modernistic Font Settings
    fontWeight: '400',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-light',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primaryButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    // Modernistic Font Settings
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },

  // Secondary Links
  secondaryLinks: {
    alignItems: 'center',
    gap: 12,
    marginTop: -20, 
    marginBottom: 20,
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
  },
});