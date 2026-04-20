import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VStack,
  Center,
  Box,
  Text,
  Button,
  ButtonText,
  Input,
  InputField,
  Heading,
  HStack,
  Spinner,
  Alert,
  AlertText,
  ScrollView,
} from '@gluestack-ui/themed';
import { useFocusEffect } from '@react-navigation/native';
import { useFamilyStore } from '../store/familyStore';
import { useAuthStore } from '../store/authStore';
import { Alert as RNAlert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FamilyScreen() {
  const {
    family,
    isLoading,
    error,
    fetchFamily,
    createFamily,
    joinFamily,
    removeMember,
    updateFamilyName,
    leaveFamily,
    deleteFamily,
  } = useFamilyStore();

  const { user } = useAuthStore();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const hadFamilyRef = useRef(false);
  const intentionalExitRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      fetchFamily();
    }, [fetchFamily])
  );

  useEffect(() => {
    if (family) {
      hadFamilyRef.current = true;
      return;
    }

    if (!family && !isLoading && hadFamilyRef.current) {
      if (!intentionalExitRef.current) {
        RNAlert.alert('Информация', 'Вы больше не состоите в семье');
      }

      hadFamilyRef.current = false;
      intentionalExitRef.current = false;
    }
  }, [family, isLoading]);

  const handleCreateFamily = async () => {
    const success = await createFamily(familyName);
    if (success) {
      setShowCreate(false);
      setFamilyName('');
      RNAlert.alert('Успех', 'Семья создана!');
    } else {
      RNAlert.alert('Ошибка', useFamilyStore.getState().error || 'Не удалось создать семью');
    }
  };

  const handleJoinFamily = async () => {
    const success = await joinFamily(inviteCode);
    if (success) {
      setShowJoin(false);
      setInviteCode('');
      RNAlert.alert('Успех', 'Вы присоединились к семье!');
    } else {
      RNAlert.alert('Ошибка', useFamilyStore.getState().error || 'Неверный код');
    }
  };

  const handleUpdateFamilyName = async () => {
    if (!editNameValue.trim()) {
      RNAlert.alert('Ошибка', 'Название не может быть пустым');
      return;
    }

    const success = await updateFamilyName(editNameValue.trim());
    if (success) {
      setShowEditName(false);
      setEditNameValue('');
      RNAlert.alert('Успех', 'Название семьи изменено');
    } else {
      RNAlert.alert('Ошибка', useFamilyStore.getState().error || 'Не удалось изменить название');
    }
  };

  const handleDeleteFamily = () => {
    RNAlert.alert(
      'Удалить семью',
      'Вы уверены? Все семейные продукты будут удалены безвозвратно. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            intentionalExitRef.current = true;
            const success = await deleteFamily();

            if (success) {
              RNAlert.alert('Успех', 'Семья удалена');
            } else {
              intentionalExitRef.current = false;
              RNAlert.alert('Ошибка', useFamilyStore.getState().error || 'Не удалось удалить семью');
            }
          },
        },
      ]
    );
  };

  const handleLeaveFamily = () => {
    RNAlert.alert(
      'Покинуть семью',
      'Вы уверены? Вы потеряете доступ к семейным продуктам.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Покинуть',
          style: 'destructive',
          onPress: async () => {
            intentionalExitRef.current = true;
            const success = await leaveFamily();

            if (success) {
              RNAlert.alert('Успех', 'Вы покинули семью');
            } else {
              intentionalExitRef.current = false;
              RNAlert.alert('Ошибка', useFamilyStore.getState().error || 'Не удалось покинуть семью');
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    RNAlert.alert(
      'Удалить участника',
      `Вы уверены, что хотите удалить ${memberName} из семьи?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            const success = await removeMember(memberId);

            if (success) {
              RNAlert.alert('Успех', `${memberName} удалён из семьи`);
            } else {
              RNAlert.alert('Ошибка', useFamilyStore.getState().error || 'Не удалось удалить участника');
            }
          },
        },
      ]
    );
  };

  const copyInviteCode = () => {
    if (family?.inviteCode) {
      Clipboard.setString(family.inviteCode);
      RNAlert.alert('Скопировано', 'Код приглашения скопирован в буфер обмена');
    }
  };

  const isAdmin = family?.members.some(
    (m) => m.userId._id === user?.id && m.role === 'admin'
  );

  if (isLoading && !family) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack space="lg" p="$5">
          <Heading size="xl" textAlign="center">
            Семья
          </Heading>

          {error && (
            <Alert action="error" mb="$3">
              <AlertText>{error}</AlertText>
            </Alert>
          )}

          {!family ? (
            <VStack space="md" flex={1} justifyContent="center" alignItems="center">
              <Text textAlign="center">
                Вы ещё не состоите в семье. Создайте свою или присоединитесь по коду.
              </Text>

              <Button onPress={() => setShowCreate(true)} bg="$black" rounded="$full" width="80%">
                <ButtonText color="$white">Создать семью</ButtonText>
              </Button>

              <Button onPress={() => setShowJoin(true)} variant="outline" rounded="$full" width="80%">
                <ButtonText>Присоединиться по коду</ButtonText>
              </Button>
            </VStack>
          ) : (
            <VStack space="md">
              <Box bg="$gray100" p="$4" borderRadius="$lg">
                <Text bold size="lg">{family.name}</Text>

                <HStack justifyContent="space-between" alignItems="center" mt="$2">
                  <Text>
                    Код приглашения: <Text bold>{family.inviteCode}</Text>
                  </Text>

                  <Button size="sm" onPress={copyInviteCode} bg="$gray300">
                    <ButtonText fontSize="$xs">Копировать</ButtonText>
                  </Button>
                </HStack>
              </Box>

              <Heading size="md">Участники ({family.members.length})</Heading>

              {family.members.map((member) => (
                <Box
                  key={member.userId._id}
                  bg="$white"
                  p="$3"
                  borderRadius="$lg"
                  borderWidth={1}
                  borderColor="$gray200"
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack>
                      <Text bold>{member.userId.name}</Text>
                      <Text fontSize="$sm" color="$gray500">{member.userId.email}</Text>
                      <Text fontSize="$xs" color="$gray400">
                        Роль: {member.role === 'admin' ? 'Администратор' : 'Участник'}
                      </Text>
                    </VStack>

                    {isAdmin && member.userId._id !== user?.id && (
                      <Button
                        size="sm"
                        bg="$red500"
                        onPress={() => handleRemoveMember(member.userId._id, member.userId.name)}
                      >
                        <ButtonText fontSize="$xs">Удалить</ButtonText>
                      </Button>
                    )}
                  </HStack>
                </Box>
              ))}

              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setEditNameValue(family.name);
                      setShowEditName(true);
                    }}
                    mt="$2"
                  >
                    <ButtonText>Изменить название семьи</ButtonText>
                  </Button>

                  <Button bg="$red500" onPress={handleDeleteFamily} mt="$2">
                    <ButtonText color="$white">Удалить семью</ButtonText>
                  </Button>
                </>
              )}

              {!isAdmin && (
                <Button variant="link" onPress={handleLeaveFamily}>
                  <ButtonText color="$red500">Покинуть семью</ButtonText>
                </Button>
              )}
            </VStack>
          )}

          {showCreate && (
            <Box bg="white" p="$5" borderRadius="$lg" borderWidth={1} borderColor="$gray300" mt="$3" alignItems="center">
              <Heading size="md" mb="$2" textAlign="center">Создать семью</Heading>

              <Input mb="$3">
                <InputField
                  placeholder="Название семьи (необязательно)"
                  value={familyName}
                  onChangeText={setFamilyName}
                  textAlign="center"
                />
              </Input>

              <HStack space="md" justifyContent="center">
                <Button flex={1} onPress={() => { setShowCreate(false); setFamilyName(''); }} variant="outline">
                  <ButtonText>Отмена</ButtonText>
                </Button>

                <Button flex={1} onPress={handleCreateFamily} bg="$black">
                  <ButtonText>Создать</ButtonText>
                </Button>
              </HStack>
            </Box>
          )}

          {showJoin && (
            <Box bg="white" p="$5" borderRadius="$lg" borderWidth={1} borderColor="$gray300" mt="$3">
              <Heading size="md" mb="$2">Присоединиться к семье</Heading>

              <Input mb="$3">
                <InputField
                  placeholder="Введите код приглашения"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="none"
                />
              </Input>

              <HStack space="md">
                <Button flex={1} onPress={() => { setShowJoin(false); setInviteCode(''); }} variant="outline">
                  <ButtonText>Отмена</ButtonText>
                </Button>

                <Button flex={1} onPress={handleJoinFamily} bg="$black">
                  <ButtonText>Присоединиться</ButtonText>
                </Button>
              </HStack>
            </Box>
          )}

          {showEditName && (
            <Box bg="white" p="$5" borderRadius="$lg" borderWidth={1} borderColor="$gray300" mt="$3">
              <Heading size="md" mb="$2">Изменить название семьи</Heading>

              <Input mb="$3">
                <InputField
                  placeholder="Новое название"
                  value={editNameValue}
                  onChangeText={setEditNameValue}
                />
              </Input>

              <HStack space="md">
                <Button flex={1} onPress={() => { setShowEditName(false); setEditNameValue(''); }} variant="outline">
                  <ButtonText>Отмена</ButtonText>
                </Button>

                <Button flex={1} onPress={handleUpdateFamilyName} bg="$black">
                  <ButtonText>Сохранить</ButtonText>
                </Button>
              </HStack>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}