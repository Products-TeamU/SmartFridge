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
import { Alert } from 'react-native';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { products, loadProducts, updateProduct, deleteProduct, useProduct } = useProductStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Защита от множественных нажатий
  const isUsingRef = useRef(false);
  const [isUsing, setIsUsing] = useState(false);
  const isDeletingRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditingRef = useRef(false); // хотя редактирование не асинхронное, но для предотвращения двойных переходов

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
    // сбрасываем реф после небольшой задержки, чтобы предотвратить двойные переходы
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
        <Button
          variant="outline"
          onPress={handleEdit}
          isDisabled={isEditingRef.current} // можно и так
        >
          <ButtonText>Редактировать</ButtonText>
        </Button>
        <Button
          bg="$red500"
          onPress={() => setShowDeleteDialog(true)}
          isDisabled={isDeleting}
        >
          <ButtonText>Удалить</ButtonText>
        </Button>
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