import React, { useMemo, useState } from 'react';
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
  Box,
} from '@gluestack-ui/themed';
import { Image, TouchableOpacity, Alert, ScrollView, StyleSheet, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { AVATAR_OPTIONS, getAvatarById } from '../constants/avatarOptions';

export default function RegisterStep2Screen({ route, navigation }: any) {
  const { email, password } = route.params || {};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('person-green');

  const { register, isLoading, error } = useAuthStore();

  const selectedAvatar = useMemo(
    () => getAvatarById(selectedAvatarId),
    [selectedAvatarId]
  );

  const handleRegister = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      Alert.alert('Ошибка', 'Введите имя и фамилию');
      return;
    }

    const fullName = `${trimmedFirstName} ${trimmedLastName}`;
    const success = await register(email, password, fullName, selectedAvatarId);

    if (!success) {
      Alert.alert('Ошибка', error || 'Не удалось зарегистрироваться');
    }
  };

  if (!email || !password) {
    Alert.alert('Ошибка', 'Данные шага 1 утеряны, начните заново');
    navigation.navigate('RegisterStep1');
    return null;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <Center flex={1} bg="white" px="$5" py="$6">
        <VStack space="lg" width="100%" maxWidth={420}>
          <Image
            source={require('../../assets/startlogo.png')}
            style={{ width: 80, height: 80, alignSelf: 'center', marginBottom: 16 }}
          />

          <Text size="2xl" bold textAlign="center">
            Шаг 2. Профиль
          </Text>

          <Text fontSize="$sm" color="$textLight500" textAlign="center" mb="$2">
            Введите имя и фамилию, а также выберите аватар.
          </Text>

          <Box bg="$white" borderRadius="$2xl" p="$4" borderWidth={1} borderColor="$coolGray200">
            <VStack space="lg" alignItems="center">
              <View
                style={[
                  styles.bigAvatar,
                  { backgroundColor: selectedAvatar.bgColor },
                ]}
              >
                <MaterialIcons
                  name={selectedAvatar.iconName as any}
                  size={44}
                  color={selectedAvatar.iconColor}
                />
              </View>

              <VStack space="sm" width="100%">
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText>Имя</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      placeholder="Иван"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </Input>
                </FormControl>

                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText>Фамилия</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      placeholder="Иванов"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </Input>
                </FormControl>
              </VStack>
            </VStack>
          </Box>

          <Box bg="$white" borderRadius="$2xl" p="$4" borderWidth={1} borderColor="$coolGray200">
            <VStack space="md">
              <Text fontWeight="$bold" fontSize="$lg">
                Выберите аватар
              </Text>

              <HStack flexWrap="wrap" justifyContent="space-between">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = avatar.id === selectedAvatarId;

                  return (
                    <TouchableOpacity
                      key={avatar.id}
                      onPress={() => setSelectedAvatarId(avatar.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.avatarOption,
                        isSelected && styles.avatarOptionSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionCircle,
                          { backgroundColor: avatar.bgColor },
                        ]}
                      >
                        <MaterialIcons
                          name={avatar.iconName as any}
                          size={28}
                          color={avatar.iconColor}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            </VStack>
          </Box>

          <Button
            onPress={handleRegister}
            isDisabled={isLoading}
            style={{ backgroundColor: '#000000' }}
            rounded="$full"
            height={48}
          >
            <ButtonText fontSize="$md" color="$white">
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
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

          {error && (
            <Text color="$red500" textAlign="center" fontSize="$sm">
              {error}
            </Text>
          )}
        </VStack>
      </Center>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bigAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOption: {
    width: '18%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  optionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
});