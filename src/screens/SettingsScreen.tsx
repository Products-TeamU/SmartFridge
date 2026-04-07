import React, { useState } from 'react';
import { VStack, Center, Input, InputField, Button, ButtonText, Text, Alert, AlertText } from '@gluestack-ui/themed';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function SettingsScreen({ navigation }: any) {
    const { user, setUser } = useAuthStore();
    const [newName, setNewName] = useState(user?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpdateName = async () => {
        if (!newName.trim()) {
            setError('Имя не может быть пустым');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await api.put('/auth/update-profile', { name: newName.trim() });
            if (response.data.user) {
                setUser(response.data.user);
            } else {
                setUser({ ...user, name: newName.trim() });
            }
            alert('Имя успешно обновлено!');
            navigation.goBack();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при обновлении имени');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Center flex={1} bg="white" p="$4">
            <VStack space="lg" width="100%" maxWidth={400}>
                <Text fontSize="$2xl" fontWeight="$bold" textAlign="center">Настройки профиля</Text>
                <VStack space="sm">
                    <Text fontWeight="$bold">Ваше имя</Text>
                    <Input>
                        <InputField
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Введите новое имя"
                        />
                    </Input>
                </VStack>
                {error && (
                    <Alert action="error">
                        <AlertText>{error}</AlertText>
                    </Alert>
                )}
                <Button onPress={handleUpdateName} isDisabled={isLoading} bg="$blue500">
                    <ButtonText>{isLoading ? 'Сохранение...' : 'Сохранить'}</ButtonText>
                </Button>
            </VStack>
        </Center>
    );
}