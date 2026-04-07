import React, { useEffect, useState } from 'react';
import { RefreshControl, Switch, FlatList } from 'react-native';
import {
    VStack,
    HStack,
    Text,
    Button,
    ButtonText,
    Spinner,
    Center,
    Box,
    Icon,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { useProductStore, Product } from '../store/productStore';
import { ProductCard } from '../components/ProductCard';

// Функция для определения статуса продукта
const getProductStatus = (expiryDate: string): 'good' | 'warning' | 'expired' => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    return 'good';
};

export default function HomeScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const { products, loading, error, loadProducts } = useProductStore();

    // Состояние для выбранного фильтра
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'warning' | 'expired'>('all');
    const [showFamily, setShowFamily] = useState(false);

    // Фильтрация продуктов на основе выбранного фильтра
    const filteredProducts = products.filter((product) => {
        const status = getProductStatus(product.expiryDate);
        if (selectedFilter === 'all') return true;
        return status === selectedFilter;
    });

    useEffect(() => {
        loadProducts(showFamily);
    }, [showFamily]);

    // Явно типизированный renderItem
    const renderItem = ({ item }: { item: Product }) => (
        <Box mb="$2" p="$2">
            <HStack space="md" alignItems="center">
                {item.ownerType === 'family' && (
                    <Icon as={MaterialIcons} name="people" size={20} color="#666" />
                )}
                <VStack flex={1}>
                    <ProductCard
                        name={item.name}
                        quantity={item.quantity}
                        unit={item.unit}
                        expiryDate={item.expiryDate}
                        onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
                    />
                </VStack>
            </HStack>
        </Box>
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
                <Button onPress={() => loadProducts(showFamily)} mt="$4">
                    <ButtonText>Повторить</ButtonText>
                </Button>
            </Center>
        );
    }

    return (
        <VStack flex={1} bg="$coolGray50">
            {/* Шапка */}
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

            {/* Переключатель семейных продуктов */}
            <HStack p="$4" bg="$white" borderBottomWidth={1} borderBottomColor="$coolGray200" justifyContent="space-between" alignItems="center">
                <Text bold>Показать семейные продукты</Text>
                <Switch value={showFamily} onValueChange={setShowFamily} />
            </HStack>

            {/* Кнопки фильтров (горизонтальные) */}
            <HStack space="sm" p="$4" bg="$white" borderBottomWidth={1} borderBottomColor="$coolGray200">
                <Button
                    size="sm"
                    variant={selectedFilter === 'all' ? 'solid' : 'outline'}
                    bg={selectedFilter === 'all' ? '$blue500' : 'transparent'}
                    onPress={() => setSelectedFilter('all')}
                    flex={1}
                >
                    <ButtonText color={selectedFilter === 'all' ? '$white' : '$blue500'}>Все</ButtonText>
                </Button>
                <Button
                    size="sm"
                    variant={selectedFilter === 'warning' ? 'solid' : 'outline'}
                    bg={selectedFilter === 'warning' ? '$yellow500' : 'transparent'}
                    onPress={() => setSelectedFilter('warning')}
                    flex={1}
                >
                    <ButtonText color={selectedFilter === 'warning' ? '$white' : '$yellow600'}>Скоро</ButtonText>
                </Button>
                <Button
                    size="sm"
                    variant={selectedFilter === 'expired' ? 'solid' : 'outline'}
                    bg={selectedFilter === 'expired' ? '$red500' : 'transparent'}
                    onPress={() => setSelectedFilter('expired')}
                    flex={1}
                >
                    <ButtonText color={selectedFilter === 'expired' ? '$white' : '$red500'}>Просрочено</ButtonText>
                </Button>
            </HStack>

            {/* Список продуктов */}
            <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadProducts(showFamily)} />}
                ListEmptyComponent={
                    <Center flex={1} mt="$10">
                        <Text>Нет продуктов</Text>
                        <Text fontSize="$sm" color="$coolGray500">Нажмите + чтобы добавить</Text>
                    </Center>
                }
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
            />

            {/* Кнопка добавления */}
            <Button
                position="absolute"
                bottom="$4"
                right="$4"
                rounded="$full"
                size="lg"
                bg="$blue500"
                onPress={() => navigation.navigate('ChooseProductType')}
            >
                <ButtonText fontSize="$2xl">+</ButtonText>
            </Button>
        </VStack>
    );
}