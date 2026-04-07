import React, { useState } from 'react';
import {
  VStack,
  Center,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputSlot,
  InputField,
  Button,
  ButtonText,
  Text,
  HStack,
} from '@gluestack-ui/themed';
import { Image, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons'; // ← добавить

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false); // ← добавить
  const handleLogin = async () => {
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <Center flex={1} bg="white" width="100%" height="100%">
      <VStack
        width={382}
        px="$5"
        py="$4"
        space="sm"
      >
        {/* Логотип */}
        <Image
          source={require('../../assets/startlogo.png')}
          style={{
            width: 60,
            height: 60,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />

        <Text size="2xl" bold textAlign="center">
          Добро пожаловать
        </Text>
        <Text fontSize="$sm" color="$textLight500" textAlign="center" mb="$2">
          Пожалуйста, введите ваш логин и пароль для входа в систему
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
              secureTextEntry={!showPassword} // ← изменить
            />
            <InputSlot onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#666"
              />
            </InputSlot>
          </Input>
        </FormControl>
        
        {/* Ссылка "Забыли пароль?" – прижата вправо */}
        <HStack width="100%" justifyContent="flex-end" mt="$1">
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text color="$black" fontSize="$md" fontWeight="$bold">Забыли пароль?</Text>
          </TouchableOpacity>
        </HStack>

        {/* Кнопка входа */}
        <Button
          onPress={handleLogin}
          isDisabled={isLoading}
          style={{
            backgroundColor: '#000000',
            paddingHorizontal: 20,
          }}
          rounded="$full"
          height={48}
          width="100%"
        >
          <ButtonText fontSize="$md" color="$white">
            {isLoading ? 'Вход...' : 'Войти'}
          </ButtonText>
        </Button>

        {/* Строка "Нет аккаунта? Зарегистрироваться" */}
        <HStack width="100%" justifyContent="center" space="sm" mt="$2">
          <Text color="$textLight500" fontSize="$md">Нет аккаунта?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterStep1')}>
            <Text color="$black" fontSize="$md" fontWeight="$bold">
              Зарегистрироваться
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