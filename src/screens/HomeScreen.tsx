import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  Switch,
  FlatList,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView as RNScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Spinner,
  Center,
  Box,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { useProductStore, Product } from '../store/productStore';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import { getAvatarById } from '../constants/avatarOptions';

const EMPTY_FRIDGE = require('../../assets/kartinka_Home.png');

const getProductStatus = (
  expiryDate: string
): 'good' | 'warning' | 'expired' => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'warning';
  return 'good';
};

export default function HomeScreen({ navigation, route }: any) {
  const { products, loading, error, loadProducts, useProduct } = useProductStore();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'warning' | 'expired'
  >('all');
  const [showFamily, setShowFamily] = useState(false);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [usingProductId, setUsingProductId] = useState<string | null>(null);

  const { user, logout } = useAuthStore();
  const selectedAvatar = getAvatarById(user?.avatarId);

  const successMessage = route?.params?.successMessage;

  useEffect(() => {
    loadProducts(showFamily);
  }, [showFamily, loadProducts]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      if (navigation?.setParams) {
        navigation.setParams({ successMessage: undefined });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [successMessage, navigation]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const status = getProductStatus(product.expiryDate);
      if (selectedFilter === 'all') return true;
      return status === selectedFilter;
    });
  }, [products, selectedFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLongPressProduct = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([id]);
      return;
    }

    toggleSelect(id);
  };

  const handlePressProduct = (id: string) => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }

    navigation.navigate('ProductDetail', { id });
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredProducts.map((p) => p._id));
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert('Удалить продукт', 'Точно удалить этот продукт?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            await loadProducts(showFamily);
            setSelectedIds((prev) => prev.filter((item) => item !== id));
          } catch (error: any) {
            console.log(
              'Delete product error:',
              error?.response?.data || error?.message
            );
            Alert.alert('Ошибка', 'Не удалось удалить продукт.');
          }
        },
      },
    ]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Удалить выбранные',
      `Удалить выбранные продукты: ${selectedIds.length} шт.?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                selectedIds.map((id) => api.delete(`/products/${id}`))
              );
              await loadProducts(showFamily);
              setSelectionMode(false);
              setSelectedIds([]);
            } catch (error: any) {
              console.log(
                'Delete selected products error:',
                error?.response?.data || error?.message
              );
              Alert.alert('Ошибка', 'Не удалось удалить выбранные продукты.');
            }
          },
        },
      ]
    );
  };

  const handleUseProduct = async (item: Product) => {
    if (usingProductId === item._id) return;

    const performUse = async () => {
      try {
        setUsingProductId(item._id);
        await useProduct(item._id, 1);
      } catch (error: any) {
        console.log(
          'Use product error:',
          error?.response?.data || error?.message
        );
        Alert.alert('Ошибка', 'Не удалось уменьшить количество продукта.');
      } finally {
        setUsingProductId(null);
      }
    };

    if (item.quantity <= 1) {
      Alert.alert(
        'Израсходовать последний продукт?',
        `Продукт "${item.name}" будет удалён из списка.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Израсходовать',
            style: 'destructive',
            onPress: performUse,
          },
        ]
      );
      return;
    }

    await performUse();
  };

  const renderEmptyState = () => {
    const noProductsAtAll = products.length === 0 && selectedFilter === 'all';

    return (
      <Center flex={1} px="$6">
        {noProductsAtAll ? (
          <>
            <Image
              source={EMPTY_FRIDGE}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>Холодильник пуст</Text>
            <Text style={styles.emptySubtitle}>
              Добавьте продукты чтобы наполнить его
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons name="filter-alt-off" size={64} color="#9CA3AF" />
            <Text style={[styles.emptyTitle, { marginTop: 16 }]}>
              Ничего не найдено
            </Text>
            <Text style={styles.emptySubtitle}>
              По выбранному фильтру сейчас нет продуктов
            </Text>
          </>
        )}
      </Center>
    );
  };

  const renderCreatorBadge = (item: Product) => {
    if (item.ownerType !== 'family') return null;

    if (!item.createdBy) {
        return (
        <View style={styles.familyBadge}>
            <MaterialIcons name="people" size={16} color="#4B5563" />
        </View>
        );
    }

    const creatorAvatar = getAvatarById(item.createdBy.avatarId);

    return (
        <View
        style={[
            styles.familyBadge,
            { backgroundColor: creatorAvatar.bgColor },
        ]}
        >
        <MaterialIcons
            name={creatorAvatar.iconName as any}
            size={16}
            color={creatorAvatar.iconColor}
        />
        </View>
    );
    };

  const renderItem = ({ item }: { item: Product }) => (
    <Box mb="$3">
      <HStack space="sm" alignItems="center">
        {renderCreatorBadge(item)}
        <VStack flex={1}>
          <ProductCard
            name={item.name}
            quantity={item.quantity}
            unit={item.unit}
            expiryDate={item.expiryDate}
            selected={selectedIds.includes(item._id)}
            selectionMode={selectionMode}
            onPress={() => handlePressProduct(item._id)}
            onLongPress={() => handleLongPressProduct(item._id)}
            onDelete={() => handleDeleteProduct(item._id)}
            onUse={() => handleUseProduct(item)}
          />
        </VStack>
      </HStack>
    </Box>
  );

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Center flex={1}>
          <Spinner size="large" />
        </Center>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Center flex={1}>
          <Text color="$red500">Ошибка: {error}</Text>
          <Button onPress={() => loadProducts(showFamily)} mt="$4">
            <ButtonText>Повторить</ButtonText>
          </Button>
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VStack flex={1} bg="$coolGray50" pt={insets.top > 0 ? '$2' : '$4'}>
        <VStack width="100%" maxWidth={480} alignSelf="center" flex={1}>
          <Box
            mx="$3"
            mt="$2"
            bg="$white"
            borderRadius="$2xl"
            overflow="hidden"
          >
            <HStack
              px="$4"
              py="$4"
              justifyContent="space-between"
              alignItems="center"
            >
              <HStack space="md" alignItems="center" flex={1}>
                <View
                    style={[
                        styles.avatar,
                        { backgroundColor: selectedAvatar.bgColor },
                    ]}
                    >
                    <MaterialIcons
                        name={selectedAvatar.iconName as any}
                        size={26}
                        color={selectedAvatar.iconColor}
                    />
                </View>

                <VStack flex={1}>
                  <Text style={styles.greetingTitle}>Добро пожаловать</Text>
                  <Text style={styles.greetingSubtitle}>
                    {user?.name || 'Пользователь'}
                  </Text>
                </VStack>
              </HStack>

              <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                <MaterialIcons name="notifications-none" size={22} color="#1F2937" />
              </TouchableOpacity>
            </HStack>

            <Box h="$0.5" bg="$coolGray100" />

            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              <Button
                size="xs"
                rounded="$full"
                mr="$2"
                variant={selectedFilter === 'all' ? 'solid' : 'outline'}
                bg={selectedFilter === 'all' ? '$green600' : '$coolGray100'}
                borderColor="$coolGray200"
                onPress={() => setSelectedFilter('all')}
              >
                <ButtonText
                  color={selectedFilter === 'all' ? '$white' : '$coolGray700'}
                >
                  Все продукты
                </ButtonText>
              </Button>

              <Button
                size="xs"
                rounded="$full"
                mr="$2"
                variant={selectedFilter === 'warning' ? 'solid' : 'outline'}
                bg={selectedFilter === 'warning' ? '$coolGray800' : '$coolGray100'}
                borderColor="$coolGray200"
                onPress={() => setSelectedFilter('warning')}
              >
                <ButtonText
                  color={selectedFilter === 'warning' ? '$white' : '$coolGray700'}
                >
                  Скоро просрочатся
                </ButtonText>
              </Button>

              <Button
                size="xs"
                rounded="$full"
                variant={selectedFilter === 'expired' ? 'solid' : 'outline'}
                bg={selectedFilter === 'expired' ? '$red500' : '$coolGray100'}
                borderColor="$coolGray200"
                onPress={() => setSelectedFilter('expired')}
              >
                <ButtonText
                  color={selectedFilter === 'expired' ? '$white' : '$coolGray700'}
                >
                  Просроченные
                </ButtonText>
              </Button>
            </RNScrollView>
          </Box>

          <HStack
            px="$4"
            py="$3"
            mt="$3"
            mx="$3"
            bg="$white"
            borderRadius="$xl"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text color="$coolGray700" fontWeight="$medium">
              Показать семейные продукты
            </Text>
            <Switch value={showFamily} onValueChange={setShowFamily} />
          </HStack>

          {!!successMessage && (
            <Box mx="$4" mt="$3" p="$3" bg="$green100" borderRadius="$lg">
              <Text color="$green700" fontWeight="$medium">
                {successMessage}
              </Text>
            </Box>
          )}

          {selectionMode && (
            <HStack
              mx="$3"
              mt="$3"
              px="$4"
              py="$3"
              bg="$white"
              borderRadius="$xl"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text bold>Выбрано: {selectedIds.length}</Text>

              <HStack space="sm">
                <Button size="sm" variant="outline" onPress={handleSelectAll}>
                  <ButtonText>Все</ButtonText>
                </Button>

                <Button size="sm" bg="$red500" onPress={handleDeleteSelected}>
                  <ButtonText>Удалить</ButtonText>
                </Button>

                <Button size="sm" variant="outline" onPress={handleCancelSelection}>
                  <ButtonText>Отмена</ButtonText>
                </Button>
              </HStack>
            </HStack>
          )}

          <Box px="$4" py="$3" mx="$3">
            <Text color="$coolGray600">Продуктов: {filteredProducts.length}</Text>
          </Box>

          <FlatList
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => loadProducts(showFamily)}
              />
            }
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 110,
              justifyContent: filteredProducts.length === 0 ? 'center' : 'flex-start',
            }}
          />

          <Button
            position="absolute"
            bottom="$5"
            right="$5"
            rounded="$full"
            size="lg"
            bg="$green600"
            onPress={() => navigation.navigate('ChooseProductType')}
          >
            <ButtonText fontSize="$2xl">+</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  familyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyImage: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
});