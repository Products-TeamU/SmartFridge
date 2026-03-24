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
  Alert,
  AlertText,
} from '@gluestack-ui/themed';
import { Alert as RNAlert } from 'react-native';
import api from '../services/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      RNAlert.alert('Ошибка', 'Введите email');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      // Даже если email не найден, сервер вернёт 200 с сообщением "Если email зарегистрирован, вы получите письмо"
      RNAlert.alert('Успех', response.data.message || 'Письмо отправлено, проверьте почту');
      navigation.goBack();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка отправки';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center flex={1} bg="white">
      <VStack width={382} px="$5" py="$4" space="lg">
        <Text size="2xl" bold textAlign="center">Восстановление пароля</Text>
        <Text fontSize="$sm" color="$textLight500" textAlign="center">
          Введите ваш email, и мы отправим ссылку для сброса пароля
        </Text>

        <FormControl>
          <FormControlLabel><FormControlLabelText>Email</FormControlLabelText></FormControlLabel>
          <Input>
            <InputField
              placeholder="example@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
        </FormControl>

        {error && (
          <Alert action="error">
            <AlertText>{error}</AlertText>
          </Alert>
        )}

        <Button
          onPress={handleSend}
          isDisabled={isLoading}
          style={{ backgroundColor: '#000000' }}
          rounded="$full"
          height={48}
        >
          <ButtonText fontSize="$md" color="$white">
            {isLoading ? 'Отправка...' : 'Отправить'}
          </ButtonText>
        </Button>

        <Button variant="link" onPress={() => navigation.navigate('Login')}>
          <ButtonText>Назад</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}