import React from 'react';
import { VStack, Text, Button, ButtonText } from '@gluestack-ui/themed';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <VStack flex={1} justifyContent="center" alignItems="center" space="lg" p="$4">
      <Text size="3xl" bold>👋 Привет, {user?.name || 'пользователь'}!</Text>
      <Text>Это главный экран. Здесь скоро будет список продуктов.</Text>
      <Button onPress={logout} bg="$red500">
        <ButtonText>Выйти</ButtonText>
      </Button>
    </VStack>
  );
}