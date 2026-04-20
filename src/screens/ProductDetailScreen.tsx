import React, { useEffect, useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@gluestack-ui/themed';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { useFamilyStore } from '../store/familyStore';
import { Alert } from 'react-native';
import { Icon } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { products, loadProducts, updateProduct, deleteProduct, useProduct } = useProductStore();
  const { user } = useAuthStore();
  const { family, fetchFamily } = useFamilyStore(); // ← правильно: один раз с fetchFamily
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Защита от множественных нажатий
  const isUsingRef = useRef(false);
  const [isUsing, setIsUsing] = useState(false);
  const isDeletingRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditingRef = useRef(false);

  // Загружаем данные о семье при монтировании
  useEffect(() => {
    fetchFamily(); // ← добавляем загрузку семьи
  }, []);

  useEffect(() => {
    const found = products.find((p) => p._id === id);
    if (found) {
      setProduct(found);
      setLoading(false);
    } else {
      loadProducts().then(() => {
        const p = products.find((p) => p._id === id);
        setProduct(p);
        setLoading(false);
      });
    }
  }, [id, products]);

  // Логирование для отладки
  useEffect(() => {
    console.log('=== ProductDetailScreen mounted ===');
    console.log('product:', product);
    console.log('family:', family);
    console.log('user:', user);
  }, [product, family, user]);

  const canEdit = () => {
    console.log('=== canEdit called ===');
    if (!product) {
      console.log('❌ canEdit: no product');
      return false;
    }
    console.log('✅ product exists');
    console.log('   ownerType:', product.ownerType);
    console.log('   ownerId:', product.ownerId);
    console.log('   family?._id:', family?._id);
    console.log('   user?.id:', user?.id);
    
    if (product.ownerType === 'personal') {
      const isOwner = product.ownerId === user?.id;
      console.log('   personal product, isOwner:', isOwner);
      return isOwner;
    }
    if (product.ownerType === 'family') {
      const hasFamily = !!family;
      console.log('   family product, hasFamily:', hasFamily);
      return hasFamily;
    }
    console.log('❌ canEdit: unknown ownerType');
    return false;
  };

  const handleDelete = async () => {
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      await deleteProduct(id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить продукт');
    } finally {
      setTimeout(() => {
        isDeletingRef.current = false;
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }, 200);
    }
  };

  const handleUse = async () => {
    if (isUsingRef.current) return;
    isUsingRef.current = true;
    setIsUsing(true);

    try {
      await useProduct(id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отметить использование');
    } finally {
      setTimeout(() => {
        isUsingRef.current = false;
        setIsUsing(false);
      }, 200);
    }
  };

  const handleEdit = () => {
    if (isEditingRef.current) return;
    isEditingRef.current = true;
    navigation.navigate('EditProduct', { product });
    setTimeout(() => {
      isEditingRef.current = false;
    }, 300);
  };

  if (loading) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  if (!product) {
    return (
      <Center flex={1}>
        <Text>Продукт не найден</Text>
        <Button onPress={() => navigation.goBack()} mt="$4">
          <ButtonText>Назад</ButtonText>
        </Button>
      </Center>
    );
  }

  return (
    <VStack flex={1} p="$4" bg="$backgroundLight100" space="lg">
      {/* Название */}
      <VStack space="xs">
        <Text fontSize="$sm" color="$coolGray600">Название</Text>
        <Text fontSize="$xl" fontWeight="$bold">{product.name}</Text>
      </VStack>

      {/* Тип продукта с иконкой */}
      <HStack space="sm" alignItems="center">
        {product.ownerType === 'family' && (
          <MaterialIcons name="people" size={20} color="#666" />
        )}
        <Text fontSize="$sm" color="$coolGray600">
          {product.ownerType === 'family' ? 'Семейный продукт' : 'Личный продукт'}
        </Text>
      </HStack>

      {/* Количество и единица */}
      <HStack justifyContent="space-between">
        <VStack space="xs" flex={1}>
          <Text fontSize="$sm" color="$coolGray600">Количество</Text>
          <Text fontSize="$lg">{product.quantity} {product.unit}</Text>
        </VStack>
        <VStack space="xs" flex={1}>
          <Text fontSize="$sm" color="$coolGray600">Срок годности</Text>
          <Text fontSize="$lg">{new Date(product.expiryDate).toLocaleDateString()}</Text>
        </VStack>
      </HStack>

      {/* Категория (если есть) */}
      {product.category && (
        <VStack space="xs">
          <Text fontSize="$sm" color="$coolGray600">Категория</Text>
          <Text fontSize="$lg">{product.category}</Text>
        </VStack>
      )}

      {/* Цена (если есть) */}
      {product.price && (
        <VStack space="xs">
          <Text fontSize="$sm" color="$coolGray600">Цена</Text>
          <Text fontSize="$lg">{product.price} ₽</Text>
        </VStack>
      )}

      {/* Кнопки действий */}
      <VStack space="md" mt="$8">
        <Button
          bg="$green500"
          onPress={handleUse}
          isDisabled={isUsing}
        >
          <ButtonText>{isUsing ? 'Использование...' : 'Использовано'}</ButtonText>
        </Button>
        
        {canEdit() && (
          <Button
            variant="outline"
            onPress={handleEdit}
            isDisabled={isEditingRef.current}
          >
            <ButtonText>Редактировать</ButtonText>
          </Button>
        )}
        
        {canEdit() && (
          <Button
            bg="$red500"
            onPress={() => setShowDeleteDialog(true)}
            isDisabled={isDeleting}
          >
            <ButtonText>Удалить</ButtonText>
          </Button>
        )}
      </VStack>

      {/* Диалог подтверждения удаления */}
      <AlertDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text fontWeight="$bold">Подтверждение удаления</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>Вы уверены, что хотите удалить продукт "{product.name}"?</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onPress={() => setShowDeleteDialog(false)}
              isDisabled={isDeleting}
            >
              <ButtonText>Отмена</ButtonText>
            </Button>
            <Button
              bg="$red500"
              onPress={handleDelete}
              ml="$2"
              isDisabled={isDeleting}
            >
              <ButtonText>{isDeleting ? 'Удаление...' : 'Удалить'}</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
}