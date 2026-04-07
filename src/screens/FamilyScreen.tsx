import React, { useState, useEffect } from 'react';
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
  Divider,
  ScrollView,
} from '@gluestack-ui/themed';
import { useFamilyStore } from '../store/familyStore';
import { useAuthStore } from '../store/authStore';
import { Clipboard, Alert as RNAlert } from 'react-native';

export default function FamilyScreen() {
  const { family, isLoading, error, fetchFamily, createFamily, joinFamily, removeMember } = useFamilyStore();
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleCreateFamily = async () => {
    const success = await createFamily(familyName);
    if (success) {
      setShowCreate(false);
      setFamilyName('');
      RNAlert.alert('Успех', 'Семья создана!');
    } else {
      RNAlert.alert('Ошибка', error || 'Не удалось создать семью');
    }
  };

  const handleJoinFamily = async () => {
    const success = await joinFamily(inviteCode);
    if (success) {
      setShowJoin(false);
      setInviteCode('');
      RNAlert.alert('Успех', 'Вы присоединились к семье!');
    } else {
      RNAlert.alert('Ошибка', error || 'Неверный код');
    }
  };

  const copyInviteCode = () => {
    if (family?.inviteCode) {
      Clipboard.setString(family.inviteCode);
      RNAlert.alert('Скопировано', 'Код приглашения скопирован в буфер обмена');
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    RNAlert.alert(
      'Удалить участника',
      `Вы уверены, что хотите удалить ${memberName} из семьи?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => removeMember(memberId) }
      ]
    );
  };

  const isAdmin = family?.members.some(m => m.userId._id === user?.id && m.role === 'admin');

  if (isLoading && !family) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} bg="white">
      <VStack space="lg" p="$5">
        <Heading size="xl" textAlign="center">Семья</Heading>

        {error && (
          <Alert action="error" mb="$3">
            <AlertText>{error}</AlertText>
          </Alert>
        )}

        {!family ? (
          // Нет семьи
          <VStack space="md">
            <Text textAlign="center">Вы ещё не состоите в семье. Создайте свою или присоединитесь по коду.</Text>
            <Button onPress={() => setShowCreate(true)} bg="$black" rounded="$full">
              <ButtonText color="$white">Создать семью</ButtonText>
            </Button>
            <Button onPress={() => setShowJoin(true)} variant="outline" rounded="$full">
              <ButtonText>Присоединиться по коду</ButtonText>
            </Button>
          </VStack>
        ) : (
          // Есть семья
          <VStack space="md">
            <Box bg="$gray100" p="$4" borderRadius="$lg">
              <Text bold size="lg">{family.name}</Text>
              <HStack justifyContent="space-between" alignItems="center" mt="$2">
                <Text>Код приглашения: <Text bold>{family.inviteCode}</Text></Text>
                <Button size="sm" onPress={copyInviteCode} bg="$gray300">
                  <ButtonText fontSize="$xs">Копировать</ButtonText>
                </Button>
              </HStack>
            </Box>

            <Heading size="md">Участники ({family.members.length})</Heading>
            {family.members.map(member => (
              <Box key={member.userId._id} bg="$white" p="$3" borderRadius="$lg" borderWidth={1} borderColor="$gray200">
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text bold>{member.userId.name}</Text>
                    <Text fontSize="$sm" color="$gray500">{member.userId.email}</Text>
                    <Text fontSize="$xs" color="$gray400">Роль: {member.role === 'admin' ? 'Администратор' : 'Участник'}</Text>
                  </VStack>
                  {isAdmin && member.userId._id !== user?.id && (
                    <Button size="sm" bg="$red500" onPress={() => handleRemoveMember(member.userId._id, member.userId.name)}>
                      <ButtonText fontSize="$xs">Удалить</ButtonText>
                    </Button>
                  )}
                </HStack>
              </Box>
            ))}

            {isAdmin && (
              <Button variant="outline" onPress={() => setShowCreate(true)} mt="$2">
                <ButtonText>Изменить название семьи</ButtonText>
              </Button>
            )}

            <Button variant="link" onPress={() => {
              RNAlert.alert(
                'Покинуть семью',
                'Вы уверены? Вы потеряете доступ к семейным продуктам.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Покинуть', style: 'destructive', onPress: async () => {
                    // Используем leaveFamily (нужно реализовать в store)
                    // Временно: удаляем себя через removeMember
                    const success = await removeMember(user!.id);
                    if (success) RNAlert.alert('Вы покинули семью');
                  } }
                ]
              );
            }}>
              <ButtonText color="$red500">Покинуть семью</ButtonText>
            </Button>
          </VStack>
        )}

        {/* Модальное окно создания семьи */}
        {showCreate && (
          <Box bg="white" p="$5" borderRadius="$lg" borderWidth={1} borderColor="$gray300" mt="$3">
            <Heading size="md" mb="$2">Создать семью</Heading>
            <Input mb="$3">
              <InputField placeholder="Название семьи (необязательно)" value={familyName} onChangeText={setFamilyName} />
            </Input>
            <HStack space="md">
              <Button flex={1} onPress={() => { setShowCreate(false); setFamilyName(''); }} variant="outline">
                <ButtonText>Отмена</ButtonText>
              </Button>
              <Button flex={1} onPress={handleCreateFamily} bg="$black">
                <ButtonText>Создать</ButtonText>
              </Button>
            </HStack>
          </Box>
        )}

        {/* Модальное окно присоединения */}
        {showJoin && (
          <Box bg="white" p="$5" borderRadius="$lg" borderWidth={1} borderColor="$gray300" mt="$3">
            <Heading size="md" mb="$2">Присоединиться к семье</Heading>
            <Input mb="$3">
              <InputField placeholder="Введите код приглашения" value={inviteCode} onChangeText={setInviteCode} autoCapitalize="none" />
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
      </VStack>
    </ScrollView>
  );
}