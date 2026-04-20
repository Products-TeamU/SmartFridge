import React, { useState } from 'react';
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

  const handleContinue = () => {
    if (!email || !password) {
      alert('Заполните все поля');
      return;
    }
    navigation.navigate('RegisterStep2', { email, password });
  };

  return (
    <Center flex={1} bg="white" px="$5">
      <VStack space="lg" width="100%" maxWidth={400}>
        <Image
          source={require('../../assets/startlogo.png')}
          style={{ width: 80, height: 80, alignSelf: 'center', marginBottom: 16 }}
        />
        <Text size="2xl" bold textAlign="center">
          Шаг 1. Введите данные учётной записи
        </Text>
        <Text fontSize="$sm" color="$textLight500" textAlign="center" mb="$2">
          Пожалуйста, введите email и придумайте надёжный пароль для входа в систему.
        </Text>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Почта</FormControlLabelText>
          </FormControlLabel>
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

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Пароль</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <InputSlot onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#666" />
            </InputSlot>
          </Input>
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