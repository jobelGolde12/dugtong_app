import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <Text style={styles.title}>Start Saving Lives the Easy Way</Text>
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
          <Text style={styles.link}>Register as Donor</Text>
          <Text style={styles.link}>Login (Authorized Personnel)</Text>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, // This makes it take full screen
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
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
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
    fontWeight: '600',
  },

  // Secondary Links
  secondaryLinks: {
    alignItems: 'center',
    gap: 5,
  },
  link: {
    color: '#E0E7FF',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});