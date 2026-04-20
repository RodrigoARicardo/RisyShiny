import React from 'react';
import { globalStyles } from 'src/GlobalStyles';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { runAuthRequest } from 'src/config/authErrorHandling';
import supabase from 'src/config/supabaseClient';

interface LoginScreenProps {
  onLogin: () => void;
  onGoToSignupScreen: () => void;
}

export default function LoginScreen({ onLogin, onGoToSignupScreen }: LoginScreenProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    await runAuthRequest({
      action: 'login',
      setLoading,
      setErrorMessage,
      request: () => supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      }),
      onSuccess: (data) => {
        if (data.user) {
          console.log('Login successful for:', data.user.email);
          onLogin();
        }
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={globalStyles.card}>
        <View style={globalStyles.logoWrapper}>
          <View style={globalStyles.logoCircle}>
            <Text style={globalStyles.logoEmoji}>🌅</Text>
          </View>
          <Text style={globalStyles.appName}>RisyShiny</Text>
          <Text style={globalStyles.tagline}>Your morning, elevated.</Text>
        </View>

        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Email</Text>
          <TextInput
            style={globalStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#BDBDBD"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={globalStyles.inputGroup}>
          <Text style={globalStyles.label}>Password</Text>
          <TextInput
            style={globalStyles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#BDBDBD"
            secureTextEntry
          />
        </View>

        {errorMessage ? (
          <View style={globalStyles.errorBox}>
            <Text style={globalStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[globalStyles.primaryButton, loading && globalStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={globalStyles.divider}>
          <View style={globalStyles.dividerLine} />
          <Text style={globalStyles.dividerText}>or</Text>
          <View style={globalStyles.dividerLine} />
        </View>

        <TouchableOpacity style={globalStyles.secondaryButton} onPress={onGoToSignupScreen}>
          <Text style={globalStyles.secondaryButtonText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}