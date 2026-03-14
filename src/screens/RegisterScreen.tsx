import React, { useState } from 'react';
import {
  VStack,
  Text,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  Button,
  ButtonText,
  Alert,
  AlertText,
  Spinner,
} from '@gluestack-ui/themed';
import { Alert as RNAlert } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      RNAlert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    const success = await register(email, password, name);
    if (success) {
      RNAlert.alert('Успех', 'Регистрация прошла успешно!');
      navigation.navigate('Login');
    }
  };

  return (
    <VStack flex={1} justifyContent="center" px="$4" space="lg" bg="$white">
      <Text size="2xl" bold textAlign="center">Регистрация</Text>

      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>Имя</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="Введите имя"
            value={name}
            onChangeText={setName}
          />
        </Input>
      </FormControl>

      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="Введите email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>
      </FormControl>

      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>Пароль</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Input>
      </FormControl>

      {error && (
        <Alert action="error">
          <AlertText>{error}</AlertText>
        </Alert>
      )}

      {isLoading ? (
        <Spinner size="large" />
      ) : (
        <Button onPress={handleRegister}>
          <ButtonText>Зарегистрироваться</ButtonText>
        </Button>
      )}

      <Button variant="link" onPress={() => navigation.navigate('Login')}>
        <ButtonText>Уже есть аккаунт? Войти</ButtonText>
      </Button>
    </VStack>
  );
}