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

export default function SignupScreen({ onGoToLoginScreen }: { onGoToLoginScreen: () => void }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignUp = async () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    await runAuthRequest({
      action: 'signup',
      setLoading,
      setErrorMessage,
      request: () => supabase.auth.signUp({
        email: email.trim(),
        password,
      }),
      onSuccess: (data) => {
        if (data.user) {
          onGoToLoginScreen();
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
          <Text style={globalStyles.tagline}>Start your streak today.</Text>
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
            placeholder="Create a password"
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
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={globalStyles.divider}>
          <View style={globalStyles.dividerLine} />
          <Text style={globalStyles.dividerText}>or</Text>
          <View style={globalStyles.dividerLine} />
        </View>

        <TouchableOpacity style={globalStyles.secondaryButton} onPress={onGoToLoginScreen}>
          <Text style={globalStyles.secondaryButtonText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}