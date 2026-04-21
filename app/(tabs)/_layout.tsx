import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import supabase from 'src/config/supabaseClient';
import LoginScreen from 'src/LoginScreen';
import SignupScreen from 'src/SignupScreen';

// Defines the possible states for the unauthenticated view
type AuthView = 'login' | 'signup';

export default function TabLayout() {
  const router = useRouter();

  // session states:
  // undefined = checking auth status (loading)
  // null = explicitly unauthenticated (show login/signup)
  // Session object = authenticated (show main app tabs)
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [authView, setAuthView] = useState<AuthView>('login');

  // Reset to the login screen whenever the user signs out
  useEffect(() => {
    if (session === null) {
      setAuthView('login');
    }
  }, [session]);

  // Set up Supabase authentication listeners on mount
  useEffect(() => {
    // 1. Subscribe to real-time auth events (e.g., user logs in, logs out, or token refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    // 2. Fetch the initial session state when the app first loads
    // This resolves the 'undefined' loading state to either null or a valid session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });

    // Cleanup the listener when the component unmounts to prevent memory leaks
    return () => subscription.unsubscribe();
  }, []);

  // ==========================================
  // RENDER PHASE 1: Loading State
  // ==========================================
  // Display a loading spinner while Supabase checks for an active session
  if (session === undefined) {
    return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4A90D9" />
        </View>
    );
  }

  // ==========================================
  // RENDER PHASE 2: Unauthenticated State
  // ==========================================
  // If no user is logged in, show the Auth screens instead of the tab navigator
  if (!session) {
    if (authView === 'login') {
      return (
          <LoginScreen
              onLogin={() => {}} // Supabase auth listener automatically handles the state update on success
              onGoToSignupScreen={() => setAuthView('signup')}
          />
      );
    }
    return (
        <SignupScreen
            onGoToLoginScreen={() => setAuthView('login')}
        />
    );
  }

  // ==========================================
  // RENDER PHASE 3: Authenticated State
  // ==========================================
  // The user is logged in. Render the main app navigation.
  return (
      <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#4A90D9',
            tabBarInactiveTintColor: '#BDBDBD',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            headerShown: false,
          }}
      >
        {/* HOME TAB */}
        <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                  <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                    <Ionicons
                        name={focused ? 'home' : 'home-outline'}
                        size={22}
                        color={color}
                    />
                  </View>
              ),
            }}
        />

          {/* BEDTIME TAB - Temporarily disabled to prevent timeline desync
        <Tabs.Screen
            name="bedtime"
            options={{
                title: 'Bedtime',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons
                        name={focused ? 'moon' : 'moon-outline'}
                        size={22}
                        color={color}
                    />
                ),
            }}
        />
        */}


        {/* GAME TAB */}
        <Tabs.Screen
            name="game"
            options={{
              title: 'Game',
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                      name={focused ? 'game-controller' : 'game-controller-outline'}
                      size={22}
                      color={color}
                  />
              ),
            }}
        />

        {/* STATS TAB */}
        <Tabs.Screen
            name="stats"
            options={{
              title: 'Stats',
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                      name={focused ? 'bar-chart' : 'bar-chart-outline'}
                      size={22}
                      color={color}
                  />
              ),
            }}
        />

        {/* PROFILE TAB */}
        <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                      name={focused ? 'person' : 'person-outline'}
                      size={22}
                      color={color}
                  />
              ),
            }}
        />

        {/* ========================================== */}
        {/* HIDDEN / LEGACY SCREENS                      */}
        {/* ========================================== */}
        {/* Setting `href: null` prevents the screen from showing up in the bottom tab bar, */}
        {/* but keeps it registered in the router so you can still navigate to it via code if needed. */}
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="schedule" options={{ href: null }} />
        <Tabs.Screen name="add" options={{ href: null }} />
      </Tabs>
  );
}

// ==========================================
// STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EEEEEE',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  // The 'iconPill' styles create the highlighted background bubble behind the active Home icon
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 20,
  },
  iconPillActive: {
    backgroundColor: '#EBF4FF',
  },
});