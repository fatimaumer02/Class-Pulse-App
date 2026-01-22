import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/authContext'; // <- your auth context

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Auth screens */}
          <Stack.Screen name="(auth)/login" />

          {/* Academic Info screen */}
          <Stack.Screen name="academicInfo" />

          {/* Main app */}
          {/* <Stack.Screen name="(tabs)" /> */}
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}


