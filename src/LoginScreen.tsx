import React from 'react';
import { globalStyles } from 'src/GlobalStyles';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import supabase from 'src/config/supabaseClient';


interface LoginScreenProps {
    onLogin: () => void;
    onGoToSignupScreen : () => void;
}

export default function LoginScreen({ onLogin, onGoToSignupScreen }: LoginScreenProps) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false); // Will be used to prevent user from repeatedly calling database
    

    const handleLogin = async () => {
        setErrorMessage(''); // Make sure error handler is clear
        
        // TODO: Add visual feedback for error messages
        
        if (!email || !password) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });
        setLoading(false);

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                setErrorMessage("Invalid email or password. Please try again.");
            } else {
                setErrorMessage(error.message);
            }
            return;
        }

        // If data.user exists, login was successful
        if (data.user) {
            console.log("Login successful for:", data.user.email);
            onLogin(); 
        }
    };

    return (
        <KeyboardAvoidingView
            style={globalStyles.appContainerCentered}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={globalStyles.loginBox}>
                <Text style={globalStyles.titleText}>RisyShiny</Text>
                <Text style={globalStyles.headerText}>Login</Text>

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

                <TouchableOpacity style={globalStyles.loginButton} onPress={handleLogin} disabled={loading}>
                    <Text style={globalStyles.buttonText}>Start game</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={globalStyles.loginButton} onPress={onGoToSignupScreen}>
                    <Text style={globalStyles.buttonText}>Don&#39;t have an account. Press here to sign up.</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}