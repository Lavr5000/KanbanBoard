import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Zustand store providers
import { stores } from '../services/store';
import { initializeStores } from '../services/store';

// Global Error Boundary for production stability
import { ErrorBoundary } from 'react-error-boundary';
import { ReactNode } from 'react';

function ErrorMessage({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={24} color="#dc3545" />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Something went wrong</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' }}>{error.message}</Text>
      <TouchableOpacity
        onPress={resetErrorBoundary}
        style={{ backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 }}
      >
        <Text style={{ color: 'white', fontSize: 14 }}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

// Root providers wrapper
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {children}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Main app layout component
export default function RootLayout() {
  // Initialize stores on app start
  React.useEffect(() => {
    initializeStores();
  }, []);

  return (
    <Providers>
      <StatusBar style="auto" />
      <Stack
          screenOptions={{
            headerShown: false,
            statusBarStyle: 'auto',
            statusBarTranslucent: true,
            animation: 'fade'
          }}
        >
          {/* Welcome screen - temporary */}
          <Stack.Screen name="index" />

          {/* Tab navigation */}
          <Stack.Screen name="(tabs)" />

          {/* Modal screens */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />

          {/* Loading screen */}
          <Stack.Screen
            name="loading"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false
            }}
          />
        </Stack>
      </Providers>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    gap: 15,
  }
});

// Fix for ESM modules
import * as React from 'react';