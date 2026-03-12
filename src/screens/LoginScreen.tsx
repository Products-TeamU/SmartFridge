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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

const handleLogin = async () => {
  console.log('🟢 handleLogin вызван с email:', email);
  if (!email || !password) {
    RNAlert.alert('Ошибка', 'Заполните все поля');
    return;
  }
  console.log('➡️ Вызов login из store...');
  const success = await login(email, password);
  console.log('🔁 Результат login:', success ? 'успех' : 'неудача');
  if (success) {
    console.log('🎉 Успешный вход, навигация должна переключиться');
    // Навигация переключится автоматически, если token обновился в store
  }
};

  return (
    <VStack flex={1} justifyContent="center" px="$4" space="lg" bg="$white">
      <Text size="2xl" bold textAlign="center">Вход</Text>

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
        <Button onPress={handleLogin}>
          <ButtonText>Войти</ButtonText>
        </Button>
      )}

      <Button variant="link" onPress={() => navigation.navigate('Register')}>
        <ButtonText>Нет аккаунта? Зарегистрироваться</ButtonText>
      </Button>
    </VStack>
  );
}