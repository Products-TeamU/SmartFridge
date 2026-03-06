import React, { useState } from 'react';
import { VStack, Text, FormControl, FormControlLabel, FormControlLabelText, Input, InputField, Button, ButtonText } from '@gluestack-ui/themed';
import { Alert } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    Alert.alert('Вход', `Email: ${email}\nПароль: ${password}`);
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
      <Button onPress={handleLogin}>
        <ButtonText>Войти</ButtonText>
      </Button>
      <Button variant="link" onPress={() => navigation.navigate('Register')}>
        <ButtonText>Нет аккаунта? Зарегистрироваться</ButtonText>
      </Button>
    </VStack>
  );
}