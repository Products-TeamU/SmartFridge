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
import { useAuthStore } from '../store/authStore';
import { Alert as RNAlert } from 'react-native';

export default function ResetPasswordScreen({ route, navigation }: any) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = route.params?.token;
  const { resetPassword, error, logout } = useAuthStore();

  if (!token) {
    RNAlert.alert('Ошибка', 'Ссылка для сброса пароля недействительна');
    navigation.goBack();
    return null;
  }

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      RNAlert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      RNAlert.alert('Ошибка', 'Пароль должен содержать не менее 6 символов');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await resetPassword(token, newPassword);
      if (success) {
        await logout();
        RNAlert.alert('Успех', 'Пароль успешно изменён. Теперь вы можете войти');
        navigation.navigate('Login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Center flex={1} bg="white">
      <VStack width={382} px="$5" py="$4" space="lg">
        <Text size="2xl" bold textAlign="center">Сброс пароля</Text>
        <Text fontSize="$sm" color="$textLight500" textAlign="center">
          Введите новый пароль для вашей учётной записи
        </Text>

        <FormControl>
          <FormControlLabel><FormControlLabelText>Новый пароль</FormControlLabelText></FormControlLabel>
          <Input>
            <InputField
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Не менее 6 символов"
            />
          </Input>
        </FormControl>

        <FormControl>
          <FormControlLabel><FormControlLabelText>Подтвердите пароль</FormControlLabelText></FormControlLabel>
          <Input>
            <InputField
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Повторите пароль"
            />
          </Input>
        </FormControl>

        {error && (
          <Alert action="error">
            <AlertText>{error}</AlertText>
          </Alert>
        )}

        <Button
          onPress={handleReset}
          isDisabled={isSubmitting}
          style={{ backgroundColor: '#000000' }}
          rounded="$full"
          height={48}
        >
          <ButtonText fontSize="$md" color="$white">
            {isSubmitting ? 'Сохранение...' : 'Сбросить пароль'}
          </ButtonText>
        </Button>

        <Button variant="link" onPress={() => navigation.navigate('Login')}>
          <ButtonText>Назад</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}