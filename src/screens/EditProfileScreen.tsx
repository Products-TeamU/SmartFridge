import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert as RNAlert,
} from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Button,
  ButtonText,
  Box,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { AVATAR_OPTIONS, getAvatarById } from '../constants/avatarOptions';

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    user?.avatarId || 'person-green'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedAvatar = useMemo(
    () => getAvatarById(selectedAvatarId),
    [selectedAvatarId]
  );

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Имя не может быть пустым');
      return;
    }

    if (!user) {
      setError('Пользователь не найден');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let updatedUser = {
        ...user,
        name: trimmedName,
        avatarId: selectedAvatarId,
      };

      try {
        const response = await api.put('/auth/update-profile', {
          name: trimmedName,
          avatarId: selectedAvatarId,
        });

        if (response?.data?.user) {
          updatedUser = {
            ...response.data.user,
            avatarId: selectedAvatarId,
          };
        }
      } catch (apiError: any) {
        console.log(
          'Profile API update failed, saving locally:',
          apiError?.response?.data || apiError?.message
        );
      }

      await setUser(updatedUser);

      RNAlert.alert('Готово', 'Профиль обновлён');
      navigation.goBack();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка при сохранении профиля');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <VStack space="lg" p="$4">
        <Box bg="$white" borderRadius="$2xl" p="$5">
          <VStack space="lg" alignItems="center">
            <View
              style={[
                styles.bigAvatar,
                { backgroundColor: selectedAvatar.bgColor },
              ]}
            >
              <MaterialIcons
                name={selectedAvatar.iconName}
                size={44}
                color={selectedAvatar.iconColor}
              />
            </View>

            <VStack space="sm" width="100%">
              <Text fontWeight="$bold">Имя</Text>
              <Input>
                <InputField
                  value={name}
                  onChangeText={setName}
                  placeholder="Введите имя"
                />
              </Input>
              {!!error && (
                <Text color="$red500" fontSize="$sm">
                  {error}
                </Text>
              )}
            </VStack>
          </VStack>
        </Box>

        <Box bg="$white" borderRadius="$2xl" p="$5">
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
                        name={avatar.iconName}
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

        <HStack space="md">
          <Button
            flex={1}
            variant="outline"
            onPress={() => navigation.goBack()}
            isDisabled={isSaving}
          >
            <ButtonText>Отмена</ButtonText>
          </Button>

          <Button
            flex={1}
            bg="$green600"
            onPress={handleSave}
            isDisabled={isSaving}
          >
            <ButtonText>
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </ButtonText>
          </Button>
        </HStack>
      </VStack>
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