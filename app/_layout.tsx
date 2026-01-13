import { supabase } from "@/utils/supabase";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from 'react';

export default function RootLayout() {
  const router = useRouter();

  React.useEffect(() => {
    // Sets up the listener
    // "onAuthStateChange" fires automatically when the app starts
    // and whenever you sign in/out.
    supabase.auth.onAuthStateChange((_event, session) => {

      // The logic
      //If there is a session and email is confirmed, then you can go to the home page when making the account
      if(session?.user?.email_confirmed_at) {
        //If the user is logged in and verified, send them to the home page
        router.replace('/(tabs)');
      } else {
        //If the user doesn't exist or logged in
        //this covers people who:
        // - With no account
        // - Not verified
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
