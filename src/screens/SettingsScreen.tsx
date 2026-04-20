import React from 'react';
import { VStack, Center, Text } from '@gluestack-ui/themed';

export default function SettingsScreen() {
  return (
    <Center flex={1} bg="white" p="$4">
      <VStack space="lg" width="100%" maxWidth={400}>
        <Text fontSize="$2xl" fontWeight="$bold" textAlign="center">Настройки</Text>
        <Text textAlign="center" color="$gray600">
          Бла-бла-бла, функция переименования аккаунта теперь находится во вкладке "Профиль".
        </Text>
      </VStack>
    </Center>
  );
}