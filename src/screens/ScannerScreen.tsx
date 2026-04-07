import React from 'react';
import { Center, Text, Button, ButtonText } from '@gluestack-ui/themed';

export default function ScannerScreen({ navigation }: any) {
    return (
        <Center flex={1} bg="white">
            <Text fontSize="$xl" mb="$4">Сканер чеков</Text>
            <Text textAlign="center" px="$4" mb="$4">
                Здесь будет сканирование чеков и добавление продуктов.
            </Text>
            <Button onPress={() => navigation.goBack()}>
                <ButtonText>Назад</ButtonText>
            </Button>
        </Center>
    );
}