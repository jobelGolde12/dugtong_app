import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function BloodDonationMap() {
  const mapUri = 'https://www.google.com/maps/embed/v1/place?q=Sorsogon+City';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Donation Map</Text>
      <WebView
        style={styles.map}
        source={{ uri: mapUri }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  map: {
    flex: 1,
  },
});