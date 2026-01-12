import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { supabase } from "@/utils/supabase";

export default function RootLayout() {
  const router = useRouter();

  React.useEffect(() => {
    // Sets up the listener
    // "onAuthStateChange" fires automatically when the app starts
    // and whenever you sign in/out.
    supabase.auth.onAuthStateChange((_event, session) => {

      // The logic
      if(session) {
        //If the user exists, send them to the home page
        router.replace('/(tabs)');
      } else {
        //If the user doesn't exist send them to the login page
        router.replace('/login');
      }
    });
  }, []);


  return (
    <>
    <StatusBar style='dark' />
    {/* screenOptions={{ headerShown: false }} hides the header for ALL screens */}
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='login' />
    </Stack>
    </>

  );

}
