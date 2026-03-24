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
  InputSlot,
} from '@gluestack-ui/themed';
import { Image, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    // Порядок аргументов: (email, password, name) — если в authStore так
    // Если в authStore register ожидает (name, email, password), поменяйте местами
    const success = await register(email, password, name);
    if (success) {
      // После успешной регистрации и автоматического входа навигация переключится на главный экран
      // Никакой дополнительный переход не нужен.
      console.log('Регистрация успешна, пользователь авторизован');
    } else {
      console.log('Регистрация не удалась');
    }
  };

  return (
    <Center flex={1} bg="white" width="100%" height="100%">
      <VStack width={382} px="$5" py="$4" space="sm">
        <Image
          source={require('../../assets/startlogo.png')}
          style={{ width: 60, height: 60, alignSelf: 'center', marginBottom: 16 }}
        />
        <Text size="2xl" bold textAlign="center">Регистрация</Text>
        <Text fontSize="$sm" color="$textLight500" textAlign="center" mb="$2">
          Создайте аккаунт, заполнив поля ниже
        </Text>

        <FormControl>
          <FormControlLabel><FormControlLabelText>Имя</FormControlLabelText></FormControlLabel>
          <Input><InputField placeholder="Введите имя" value={name} onChangeText={setName} autoCapitalize="words" /></Input>
        </FormControl>

        <FormControl>
          <FormControlLabel><FormControlLabelText>Почта</FormControlLabelText></FormControlLabel>
          <Input><InputField placeholder="example@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></Input>
        </FormControl>

        <FormControl>
          <FormControlLabel><FormControlLabelText>Пароль</FormControlLabelText></FormControlLabel>
          <Input>
            <InputField placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <InputSlot onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#666" />
            </InputSlot>
          </Input>
        </FormControl>

        <Button
          onPress={handleRegister}
          isDisabled={isLoading}
          style={{ backgroundColor: '#000000', paddingHorizontal: 20 }}
          rounded="$full"
          height={48}
          width="100%"
        >
          <ButtonText fontSize="$md" color="$white">{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}</ButtonText>
        </Button>

        <HStack width="100%" justifyContent="center" space="sm" mt="$2">
          <Text color="$textLight500" fontSize="$md">Есть аккаунт?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text color="$black" fontSize="$md" fontWeight="$bold">Войти</Text>
          </TouchableOpacity>
        </HStack>

        {error && <Text color="$red500" textAlign="center" fontSize="$sm">{error}</Text>}
      </VStack>
    </Center>
  );
}