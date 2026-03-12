import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { Spinner } from '@gluestack-ui/themed';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator id="MainTabs">
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return <Spinner size="large" />;
}

export default function AppNavigator() {
  const { token, loadStoredToken, isLoading } = useAuthStore();

  useEffect(() => {
    loadStoredToken();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}