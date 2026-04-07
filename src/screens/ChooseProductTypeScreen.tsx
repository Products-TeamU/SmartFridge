import React from 'react';
import { VStack, Center, Button, ButtonText, Heading, Text } from '@gluestack-ui/themed';
import { useFamilyStore } from '../store/familyStore';

export default function ChooseProductTypeScreen({ navigation }: any) {
    const { family } = useFamilyStore();

    return (
        <Center flex={1} bg="white" p="$4">
            <VStack space="lg" width="100%" maxWidth={400}>
                <Heading textAlign="center">Куда добавить?</Heading>
                <Text textAlign="center" color="$gray500">
                    Выберите, где будет храниться продукт
                </Text>

                <Button
                    bg="$blue500"
                    onPress={() => navigation.navigate('AddProduct', { ownerType: 'personal' })}
                    rounded="$full"
                    height={50}
                >
                    <ButtonText>📦 В личный список</ButtonText>
                </Button>

                {family && (
                    <Button
                        bg="$green500"
                        onPress={() => navigation.navigate('AddProduct', { ownerType: 'family' })}
                        rounded="$full"
                        height={50}
                    >
                        <ButtonText>👨‍👩‍👧‍👦 В список семьи</ButtonText>
                    </Button>
                )}

                {!family && (
                    <Button
                        variant="outline"
                        onPress={() => navigation.navigate('Family')}
                        rounded="$full"
                    >
                        <ButtonText>➕ Создать семью</ButtonText>
                    </Button>
                )}
            </VStack>
        </Center>
    );
}