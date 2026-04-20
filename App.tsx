import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import { navigate } from './src/navigation/RootNavigation';

export default function App() {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const { path, queryParams } = Linking.parse(url);
      if (path === 'reset-password' && queryParams?.token) {
        setTimeout(() => {
          navigate('ResetPassword', { token: queryParams.token });
        }, 100);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider config={config}>
        <AppNavigator />
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}