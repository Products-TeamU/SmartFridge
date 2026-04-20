import React, { useEffect } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import { Spinner } from '@gluestack-ui/themed';
import AddProductScreen from '../screens/AddProductScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProductScreen from '../screens/EditProductScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { navigationRef } from './RootNavigation';
import RegisterStep1Screen from '../screens/RegisterStep1Screen';
import RegisterStep2Screen from '../screens/RegisterStep2Screen';
import MainTabs from './MainTabs';
import ChooseProductTypeScreen from '../screens/ChooseProductTypeScreen';
import ReceiptEditScreen from '../screens/ReceiptEditScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'SmartFridge://',
    'https://smartfridge-ouxh.onrender.com',
  ],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

function AuthStack() {
  return (
    <Stack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator id="Appstack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ReceiptEdit"
        component={ReceiptEditScreen}
        options={{ headerShown: true, title: 'Редактирование чека' }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ headerShown: true, title: 'Добавить продукт' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Детали продукта' }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ headerShown: true, title: 'Редактировать продукт' }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: true, title: 'Сброс пароля' }}
      />
      <Stack.Screen
        name="ChooseProductType"
        component={ChooseProductTypeScreen}
        options={{ headerShown: true, title: 'Выбор типа' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: true, title: 'Профиль' }}
      />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  return <Spinner size="large" />;
}

export default function AppNavigator() {
  const { token, loadStoredToken, isLoading } = useAuthStore();

  useEffect(() => {
    loadStoredToken();
  }, [loadStoredToken]);

  useEffect(() => {
    if (!token && navigationRef.isReady()) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [token]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}