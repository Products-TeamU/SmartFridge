import React, { useEffect, useState } from 'react';
import {
  VStack,
  Center,
  Button,
  ButtonText,
  Heading,
  Text,
  Spinner,
} from '@gluestack-ui/themed';
import { useFamilyStore } from '../store/familyStore';

export default function ChooseProductTypeScreen({ navigation }: any) {
  const { family, isLoading, fetchFamily } = useFamilyStore();
  const [isCheckingFamily, setIsCheckingFamily] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFamily = async () => {
      try {
        await fetchFamily();
      } finally {
        if (isMounted) {
          setIsCheckingFamily(false);
        }
      }
    };

    loadFamily();

    return () => {
      isMounted = false;
    };
  }, [fetchFamily]);

  if (isCheckingFamily || isLoading) {
    return (
      <Center flex={1} bg="white" p="$4">
        <VStack space="md" alignItems="center">
          <Spinner size="large" />
          <Text color="$gray500">Проверяем данные семьи...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Center flex={1} bg="white" p="$4">
      <VStack space="lg" width="100%" maxWidth={400}>
        <Heading textAlign="center">Куда добавить?</Heading>

        <Text textAlign="center" color="$gray500">
          Выберите, где будет храниться продукт
        </Text>

        <Button
          bg="$blue500"
          onPress={() =>
            navigation.navigate('AddProduct', { ownerType: 'personal' })
          }
          rounded="$full"
          height={50}
        >
          <ButtonText>📦 В личный список</ButtonText>
        </Button>

        {family ? (
          <Button
            bg="$green500"
            onPress={() =>
              navigation.navigate('AddProduct', { ownerType: 'family' })
            }
            rounded="$full"
            height={50}
          >
            <ButtonText>👨‍👩‍👧‍👦 В список семьи</ButtonText>
          </Button>
        ) : (
          <Button
            variant="outline"
            onPress={() =>
              navigation.navigate('MainTabs', { screen: 'Family' })
            }
            rounded="$full"
          >
            <ButtonText>➕ Создать семью</ButtonText>
          </Button>
        )}
      </VStack>
    </Center>
  );
}