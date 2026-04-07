// MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AddProductScreen from '../screens/AddProductScreen';
import FamilyScreen from '../screens/FamilyScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
      <Tab.Screen name="Family" component={FamilyScreen} options={{ title: 'Семья' }} />
      <Tab.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Добавить' }} />
    </Tab.Navigator>
  );
}