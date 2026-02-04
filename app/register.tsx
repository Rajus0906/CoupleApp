import { supabase } from "@/utils/supabase";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    //Matches Database naming
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [fullName, setFullName] = React.useState('');
    const [bio, setBio] = React.useState('');
    const [birthday, setBirthday] = React.useState('');

    
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    async function handleSignUp() {
        //Basic Validation
        if (!email || !password || !username){
            Alert.alert('Error', 'Please fill in all required fields.');
        return;
    }

    if(password != confirmPassword) {
        Alert.alert ('Error', 'Oops, looks like the passwords do not match!');
        return;
    }

    setLoading(true);

    //Creating the Auth User
    const {data: { session }, error: authError} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
                full_name: fullName,
                bio: bio,
                birthday: birthday,
            },
        },
    });

    if(authError) {
        Alert.alert('Auth Error', authError.message);
        setLoading(false);
        return;
    }
            // checks email verification
            Alert.alert('Success', 'Please check your email to verify your account.')
            setLoading(false);
        }
    
    //Visual stuff now
    return (
        // Makes it so keyboard does not cover important things and pushes content up
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
        >
                
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Join Now!</Text>
                <Text style={styles.subtitles}>Create your profile to get started</Text>

                <View style={styles.inputContainer}>

                    {/* Username Input */}
                    <Text style={styles.label}>Username *</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Unique Handle (e.g. moviebuff0729)"
                        autoCapitalize="none"
                    />

                    {/* Full Name Input */}
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Your real name (Optional)"
                    />

                    {/* Email Input */}
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input} 
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email@address.com"
                        autoCapitalize="none"
                    />

                    {/* Bio creation (Optional) */}
                    <Text style={styles.label}>Bio (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell us about yourself"
                        multiline
                    />

                    {/* Set Birthday (Optional)*/}
                    <Text style={styles.label}>Birthday (YYYY-MM-DD)</Text>
                    <TextInput
                        style={styles.input}
                        value={birthday}
                        onChangeText={setBirthday}
                        placeholder="2003-07-29"
                    />

                    {/* Set Password */}
                    <Text style={styles.label}>Password *</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword} // Toggles Visibility
                            placeholder="Minimum 6 characters"
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color='#8d6e63' />
                        </Pressable>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password *</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword} // Toggles Visibility
                            placeholder="Repeat Password"
                        />
                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color='#8d6e63' />
                        </Pressable>
                    </View>
                </View>


                {/* Created a button to create account*/}
                <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
                    {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Create Account</Text>}
                </Pressable>

                <Pressable onPress= {() => router.back()}>
                    <Text style={styles.backText}> Already have an account? Login</Text>
                </Pressable>

                {/* Gives extra space at the bottom to make sure the keyboard does not hide anything*/}
                <View style={{height : 50}}/>
            </ScrollView>
        </KeyboardAvoidingView>
    );
 }

 const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ece0d1',
        flexGrow: 1,
        padding: 50,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        color: '#5c4033',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingTop: 20,
    },
    subtitles: {
        fontSize: 14,
        color: '#8d6e63',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        gap: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5c4033',
        marginTop: 5,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderColor: '#d7ccc8',
        borderWidth: 1,
    },
    passwordContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#d7ccc8',
        borderWidth: 1,
        alignItems: 'center',
        paddingRight: 10, // Gives space for the eye icon
    },
    passwordInput: {
        flex: 1, //takes up all the space but not the eye icon
        padding: 12,
    },
    eyeIcon: {
        padding: 5,
    },
    button: {
        backgroundColor: '#5c4033',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    backText: {
        textAlign: 'center',
        marginTop: 15,
        color: '#8d6e63',
    },
 });