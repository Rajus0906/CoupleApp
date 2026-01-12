import { supabase } from '@/utils/supabase';
import React from 'react';
import { Alert } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = React.useState(''); 
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    // Function to Log In
    async function signInWithEmail() {
        // This locks the UI and gives a loading screen to show something is happening
        setLoading(true);
        // This talks with Supabase to see if the email and password ligns up with your login info
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        //If it was wrong it gives you a message saying login failed
        if (error) Alert.alert('Login Failed', error.message);
        setLoading(false);
    }

    //Function to Sign Up
    async function signUpWithEmail () {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            // Sends an email verification and doesnt continue to the next page unless you confirmed
            if(!session) Alert.alert('Success!', 'Please check your inbox for email verification!');
            // Since email verification is off It will login in immediately
            else Alert.alert('Welcome!', 'Account created successfully.')
        }
        setLoading(false);
    }
        
}
