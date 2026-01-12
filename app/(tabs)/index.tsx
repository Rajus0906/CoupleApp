import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from "react-native";
// connects supabase 
import { supabase } from '@/utils/supabase';


// This is the main (home) screen of the app.
// In Expo Router, index.tsx maps to the root route "/"
export default function Index() {
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');

  useEffect(() => {
    const testConnection = async () => {
      try{
        console.log('Attempting to connect...');

        // Asks Supabase for data from the 'test_connection' table i created
        const { data, error } = await supabase
        .from('test_connection')
        .select('*');
        
        if (error) {
          // If the table does not exist, this will give a message
          console.log('Success Error:', error.message);
          setConnectionStatus(` Error: ${error.message} `);
        } else {
          console.log('Success! Data received:', data);
          setConnectionStatus('✅ Connected to Database!');
          }
        } catch (err) {
          console.error ('Unexpected Error:', err);
          setConnectionStatus('❌ Network Failed');
        }
      };
      testConnection();
    }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Status</Text>
      <Text style={styles.status}>{connectionStatus}</Text>
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
