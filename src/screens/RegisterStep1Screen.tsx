import React, { useMemo, useState } from 'react';
import {
  VStack,
  Center,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  InputSlot,
  Button,
  ButtonText,
  Text,
  HStack,
} from '@gluestack-ui/themed';
import { Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function RegisterStep1Screen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return 'Введите email';
    if (!emailRegex.test(value.trim())) return 'Введите корректный email';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) return 'Введите пароль';
    if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
    return '';
  };

  const handleContinue = () => {
    const nextEmailError = validateEmail(normalizedEmail);
    const nextPasswordError = validatePassword(password);

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    navigation.navigate('RegisterStep2', {
      email: normalizedEmail,
      password,
    });
  };

  return (
    <Center flex={1} bg="white" px="$5">
      <VStack space="lg" width="100%" maxWidth={400}>
        <Image
          source={require('../../assets/startlogo.png')}
          style={{ width: 80, height: 80, alignSelf: 'center', marginBottom: 16 }}
        />

        <Text size="2xl" bold textAlign="center">
          Шаг 1. Данные для входа
        </Text>

        <Text fontSize="$sm" color="$textLight500" textAlign="center" mb="$2">
          Укажите email и пароль. Пароль должен содержать минимум 6 символов.
        </Text>

        <FormControl isInvalid={!!emailError}>
          <FormControlLabel>
            <FormControlLabelText>Почта</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="example@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
          {!!emailError && (
            <Text color="$red500" fontSize="$sm" mt="$1">
              {emailError}
            </Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!passwordError}>
          <FormControlLabel>
            <FormControlLabelText>Пароль</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="Минимум 6 символов"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={!showPassword}
            />
            <InputSlot onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#666"
              />
            </InputSlot>
          </Input>
          {!!passwordError && (
            <Text color="$red500" fontSize="$sm" mt="$1">
              {passwordError}
            </Text>
          )}
        </FormControl>

        <Button
          onPress={handleContinue}
          style={{ backgroundColor: '#000000' }}
          rounded="$full"
          height={48}
        >
          <ButtonText fontSize="$md" color="$white">
            Продолжить
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
      </VStack>
    </Center>
  );
}