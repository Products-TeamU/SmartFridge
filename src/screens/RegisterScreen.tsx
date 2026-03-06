import React, { useState } from 'react';
import { VStack, Text, FormControl, FormControlLabel, FormControlLabelText, Input, InputField, Button, ButtonText } from '@gluestack-ui/themed';
import { Alert } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    Alert.alert('Регистрация', `Имя: ${name}\nEmail: ${email}\nПароль: ${password}`);
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
      <Button onPress={handleRegister}>
        <ButtonText>Зарегистрироваться</ButtonText>
      </Button>
      <Button variant="link" onPress={() => navigation.navigate('Login')}>
        <ButtonText>Уже есть аккаунт? Войти</ButtonText>
      </Button>
    </VStack>
  );
}