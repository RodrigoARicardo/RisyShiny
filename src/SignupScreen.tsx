import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import supabase from 'src/config/supabaseClient';
import { globalStyles } from 'src/GlobalStyles';

interface UserData{
    user_email : string,
    user_password : string,
    login_timestamp : string
}

export default function SignupScreen({ onGoToLoginScreen }: { onGoToLoginScreen: () => void }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false); // Will be used to prevent user from repeatedly calling database

    const handleSignUp = async () => {

        setErrorMessage(''); // Make sure error handler is clear
        
        // TODO: Add visual feedback for error messages

        if (!email || !password) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        setLoading(false);

        if (error) {
            // Check if the error is about the user already existing
            if (error.message.includes("already registered")) {
            setErrorMessage("This email/username is already taken.");
            } else {
            setErrorMessage(error.message);
            }
            return;
        }

        if (data.user) {
            Alert.alert(
                "Success!", 
                "Check your email for a confirmation link!",
                [{ text: "OK", onPress: () => onGoToLoginScreen() }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={globalStyles.appContainerCentered}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={globalStyles.loginBox}>
                <Text style={globalStyles.titleText}>RisyShiny</Text>
                <Text style={globalStyles.headerText}>Signup</Text>

                <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.label}>Email: </Text>
                    <TextInput
                        style={globalStyles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.label}>Password: </Text>
                    <TextInput
                        style={globalStyles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={globalStyles.loginButton} onPress={handleSignUp}>
                    <Text style={globalStyles.buttonText}>Start game</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.loginButton} onPress={onGoToLoginScreen}>
                    <Text style={globalStyles.buttonText}>Have an account. Press here to login.</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}