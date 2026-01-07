import React from 'react';
import { StyleSheet, Text, View } from "react-native";


// This is the main (home) screen of the app.
// In Expo Router, index.tsx maps to the root route "/"
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>I love my Wife </Text> 
    </View>
  );
}

// Centralized styles for layout and text appearance
const styles = StyleSheet.create ({
  container: {
    flex: 1, // Makes the view fill the entire screen
    backgroundColor: '#ece0d1',
    justifyContent: "center", // Vertically centers children
    alignItems: "center", // Horizontally centers children
  },
  text: {
    color: '#5C4033',
    fontSize: 20,
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline', // Makes the link look clickable
    color: '#000000ff',
  },

});