import React, { useState } from 'react';
import {
  VStack,
  Center,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  Button,
  ButtonText,
  Text,
  HStack,
} from '@gluestack-ui/themed';
import { Image, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function RegisterStep2Screen({ route, navigation }: any) {
  const { email, password } = route.params || {};
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleRegister = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Введите имя и фамилию');
      return;
    }
    const fullName = `${firstName} ${lastName}`;
    const success = await register(email, password, fullName);
    if (!success) {
      Alert.alert('Ошибка', error || 'Не удалось зарегистрироваться');
    }
  };

  if (!email || !password) {
    Alert.alert('Ошибка', 'Данные шага 1 утеряны, начните заново');
    navigation.navigate('RegisterStep1');
    return null;
  }

  return (
    <Center flex={1} bg="white" px="$5">
      <VStack space="lg" width="100%" maxWidth={400}>
        <Image
          source={require('../../assets/startlogo.png')}
          style={{ width: 80, height: 80, alignSelf: 'center', marginBottom: 16 }}
        />
        <Text size="2xl" bold textAlign="center">
          Шаг 2. Укажите персональные данные
        </Text>
        <Text fontSize="$sm" color="$textLight500" textAlign="center" mb="$2">
          Введите ваше имя и фамилию для успешного завершения регистрации.
        </Text>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Имя</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="Иван"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </Input>
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Фамилия</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="Иванов"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </Input>
        </FormControl>

        <Button
          onPress={handleRegister}
          isDisabled={isLoading}
          style={{ backgroundColor: '#000000' }}
          rounded="$full"
          height={48}
        >
          <ButtonText fontSize="$md" color="$white">
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </ButtonText>
        </Button>

        <HStack justifyContent="center" space="sm" mt="$2">
          <Text color="$textLight500">Уже есть аккаунт?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text color="$black" fontWeight="$bold">
              Войти
            </Text>
          </TouchableOpacity>
        </HStack>

        {error && (
          <Text color="$red500" textAlign="center" fontSize="$sm">
            {error}
          </Text>
        )}
      </VStack>
    </Center>
  );
}