import React from 'react';
import { StyleSheet, View } from "react-native";


// This is the main (home) screen of the app.
// In Expo Router, index.tsx maps to the root route "/"
export default function Index() {
  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ece0d1',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#8D6E63',
  }
});