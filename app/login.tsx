import { supabase } from '@/utils/supabase';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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

    return (
        <View style={styles.container} >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder='email@address.com'
                    placeholderTextColor="#8D6E63"
                    autoCapitalize='none' //Make sures to not capitalize emails
                />
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true} // Hides the password dots
                    placeholder='Password'
                    placeholderTextColor='#8D6E63'
                    autoCapitalize='none'
                />
            </View>

            {/* Button */}
            <View style={styles.buttonContainer}>
                <Pressable style={styles.loginButton} onPress={signInWithEmail} disabled={loading}>
                    {loading ? <ActivityIndicator color='#fff'/> : <Text style={styles.loginText}> Sign In</Text>}
                </Pressable>

                <Pressable style={styles.signupButton} onPress={signUpWithEmail} disabled={loading}>
                    <Text style={styles.signupText}>Create Account</Text>
                </Pressable>
            </View>
        </View>
    );     
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: '#ece0d1',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5c4033',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#8d6e63',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        gap: 15, //Space between inputs
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d7ccc8',
        color: '#5c4033',
        fontSize: 16,
    },
    buttonContainer: {
        gap: 15,
    },
    loginButton: {
        backgroundColor: '#5c4033',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        //shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    loginText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    signupButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#5c4033',         
    },
    signupText: {
        color: '#5c4033',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
