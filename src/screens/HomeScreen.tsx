import React, { useEffect } from 'react';
import { RefreshControl } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  FlatList,
  Spinner,
  Center,
} from '@gluestack-ui/themed';
import { useAuthStore } from '../store/authStore';
import { useProductStore, Product } from '../store/productStore';
import { ProductCard } from '../components/ProductCard';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { products, loading, error, loadProducts } = useProductStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      name={item.name}
      quantity={item.quantity}
      unit={item.unit}
      expiryDate={item.expiryDate}
      onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
    />
  );

  if (loading && products.length === 0) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center flex={1}>
        <Text color="$red500">Ошибка: {error}</Text>
        <Button onPress={loadProducts} mt="$4">
          <ButtonText>Повторить</ButtonText>
        </Button>
      </Center>
    );
  }

  return (
    <VStack flex={1} bg="$coolGray50">
      <HStack
        p="$4"
        bg="$white"
        borderBottomWidth={1}
        borderBottomColor="$coolGray200"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="$xl" fontWeight="$bold">👋 {user?.name || 'Гость'}</Text>
        <Button size="sm" onPress={logout} bg="$red500">
          <ButtonText>Выйти</ButtonText>
        </Button>
      </HStack>

      <FlatList
        data={products}
        renderItem={renderItem as any}
        keyExtractor={(item) => (item as any)._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProducts} />}
        ListEmptyComponent={
          <Center flex={1} mt="$10">
            <Text>Нет продуктов</Text>
            <Text fontSize="$sm" color="$coolGray500">Нажмите + чтобы добавить</Text>
          </Center>
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      />

      <Button
        position="absolute"
        bottom="$4"
        right="$4"
        rounded="$full"
        size="lg"
        bg="$blue500"
        onPress={() => navigation.navigate('AddProduct')}
      >
        <ButtonText fontSize="$2xl">+</ButtonText>
      </Button>
    </VStack>
  );
}