import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { Spinner } from '@gluestack-ui/themed';
import AddProductScreen from '../screens/AddProductScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProductScreen from '../screens/EditProductScreen';

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

function AppStack() {
  return (
    <Stack.Navigator id="Appstack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
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
    // Здесь позже можно добавить проверку обновлений (например, expo-updates)
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}