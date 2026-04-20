import React from 'react';
import { TouchableOpacity, StyleSheet, Alert as RNAlert, View } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Center,
  Box,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { getAvatarById } from '../constants/avatarOptions';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const avatar = getAvatarById(user?.avatarId);

  const settingsItems = [
    {
      id: 'profile',
      title: 'Профиль',
      subtitle: 'Изменить имя и аватар',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      subtitle: 'Настройки уведомлений появятся позже',
      icon: 'notifications-none',
      onPress: () => RNAlert.alert('Скоро', 'Этот раздел добавим позже'),
    },
    {
      id: 'about',
      title: 'О приложении',
      subtitle: 'SmartFridge MVP',
      icon: 'info-outline',
      onPress: () =>
        RNAlert.alert(
          'О приложении',
          'SmartFridge — приложение для учёта продуктов и контроля сроков годности.'
        ),
    },
  ];

  return (
    <Center flex={1} bg="$coolGray50" px="$4">
      <VStack space="lg" width="100%" maxWidth={440}>
        <Box bg="$white" borderRadius="$2xl" p="$4">
          <HStack space="md" alignItems="center">
            <View
              style={[
                styles.avatar,
                { backgroundColor: avatar.bgColor },
              ]}
            >
              <MaterialIcons
                name={avatar.iconName}
                size={28}
                color={avatar.iconColor}
              />
            </View>

            <VStack flex={1}>
              <Text fontSize="$lg" fontWeight="$bold">
                {user?.name || 'Пользователь'}
              </Text>
              <Text color="$coolGray500">{user?.email || 'Без email'}</Text>
            </VStack>
          </HStack>
        </Box>

        <Box bg="$white" borderRadius="$2xl" overflow="hidden">
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.8}
              style={[
                styles.row,
                index !== settingsItems.length - 1 && styles.rowBorder,
              ]}
            >
              <HStack alignItems="center" space="md" flex={1}>
                <View style={styles.iconWrap}>
                  <MaterialIcons name={item.icon} size={22} color="#374151" />
                </View>

                <VStack flex={1}>
                  <Text fontWeight="$semibold">{item.title}</Text>
                  <Text fontSize="$sm" color="$coolGray500">
                    {item.subtitle}
                  </Text>
                </VStack>
              </HStack>

              <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </Box>

        <Button bg="$red500" onPress={logout}>
          <ButtonText>Выйти</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});