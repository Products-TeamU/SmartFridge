import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import AddProductScreen from '../screens/AddProductScreen';
import FamilyScreen from '../screens/FamilyScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SettingsScreen from '../screens/SettingsScreen';

type MainTabParamList = {
  Home: undefined;
  Family: undefined;
  Scanner: undefined;
  Settings: undefined;
  Add: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName: React.ComponentProps<typeof Ionicons>['name'] =
            route.name === 'Home'
              ? focused
                ? 'home'
                : 'home-outline'
              : route.name === 'Family'
              ? focused
                ? 'people'
                : 'people-outline'
              : route.name === 'Scanner'
              ? focused
                ? 'camera'
                : 'camera-outline'
              : route.name === 'Settings'
              ? focused
                ? 'settings'
                : 'settings-outline'
              : focused
              ? 'add-circle'
              : 'add-circle-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
      <Tab.Screen name="Family" component={FamilyScreen} options={{ title: 'Семья' }} />
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Сканер' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки' }} />
      <Tab.Screen name="Add" component={AddProductScreen} options={{ title: 'Добавить' }} />
    </Tab.Navigator>
  );
}