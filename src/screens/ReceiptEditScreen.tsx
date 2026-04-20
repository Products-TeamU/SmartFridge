import React, { useMemo, useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Button,
  ButtonText,
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  Icon,
  ChevronDownIcon,
} from '@gluestack-ui/themed';
import { ScrollView, Alert } from 'react-native';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { useFamilyStore } from '../store/familyStore';

const UNITS = ['шт', 'кг', 'л', 'г', 'мл', 'уп'] as const;

type ReceiptItem = {
  name: string;
  qty: number | null;
  unit: string | null;
  price: number | null;
  rawLine?: string;
};

export default function ReceiptEditScreen({ route, navigation }: any) {
  const initialItems: ReceiptItem[] = route.params?.items || [];
  const rawText: string = route.params?.rawText || '';

  const { addProduct } = useProductStore();
  const { user } = useAuthStore();
  const { family } = useFamilyStore();

  const [isSavingAll, setIsSavingAll] = useState(false);
  const [ownerType, setOwnerType] = useState<'personal' | 'family'>(
    route.params?.ownerType || 'personal'
  );

  const normalizeQty = (value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : 1;
  };

  const normalizePrice = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const defaultExpiryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  const [items, setItems] = useState<ReceiptItem[]>(
    initialItems.map((item) => ({
      ...item,
      qty: normalizeQty(item.qty),
      unit: item.unit || 'шт',
    }))
  );

  const handleChangeItem = (
    index: number,
    field: keyof ReceiptItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === 'qty') {
          if (value.trim() === '') {
            return {
              ...item,
              qty: null,
            };
          }

          const parsed = Number(value.replace(',', '.'));
          return {
            ...item,
            qty: Number.isFinite(parsed) ? parsed : null,
          };
        }

        if (field === 'price') {
          if (value.trim() === '') {
            return {
              ...item,
              price: null,
            };
          }

          const parsed = Number(value.replace(',', '.'));
          return {
            ...item,
            price: Number.isFinite(parsed) ? parsed : null,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert('Удалить строку', 'Убрать этот товар из списка?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          setItems((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleOpenAddProduct = (item: ReceiptItem) => {
    navigation.navigate('AddProduct', {
      prefill: {
        name: item.name,
        quantity: normalizeQty(item.qty),
        unit: item.unit || 'шт',
        price: item.price,
      },
      ownerType,
    });
  };

  const cleanedItems = useMemo(
    () =>
      items.filter((item) => item.name?.trim().length > 0),
    [items]
  );

  const handleAddAll = async () => {
    if (cleanedItems.length === 0) {
      Alert.alert('Нет товаров', 'Нет корректных товаров для добавления.');
      return;
    }

    if (ownerType === 'personal' && !user?.id) {
      Alert.alert('Ошибка', 'Пользователь не авторизован.');
      return;
    }

    if (ownerType === 'family' && !family?._id) {
      Alert.alert('Ошибка', 'Вы не состоите в семье.');
      return;
    }

    try {
      setIsSavingAll(true);

      for (const item of cleanedItems) {
        await addProduct({
          name: item.name.trim(),
          quantity: normalizeQty(item.qty),
          unit: item.unit || 'шт',
          expiryDate: defaultExpiryDate,
          category: undefined,
          price: normalizePrice(item.price),
          ownerType,
          ownerId: ownerType === 'personal' ? user!.id : family!._id,
        });
      }

      Alert.alert(
        'Успешно',
        `Добавлено товаров: ${cleanedItems.length}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    } catch (error: any) {
      console.log('Add all error status:', error?.response?.status);
      console.log('Add all error data:', error?.response?.data);
      console.log('Add all error message:', error?.message);

      Alert.alert(
        'Ошибка',
        error?.response?.data?.message || 'Не удалось добавить все товары.'
      );
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <VStack flex={1} bg="$backgroundLight100">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="lg">
          <VStack space="xs">
            <Text fontSize="$2xl" fontWeight="$bold">
              Редактирование чека
            </Text>
            <Text color="$gray500">
              Проверьте распознанные товары, исправьте ошибки и добавьте всё сразу.
            </Text>
            <Text color="$gray500">
              Если количество не распознано, автоматически будет поставлено 1.
            </Text>
          </VStack>

          {!!family && (
            <VStack space="sm">
              <Text color="$gray500">Куда сохранять товары:</Text>
              <HStack space="sm">
                <Button
                  flex={1}
                  variant={ownerType === 'personal' ? 'solid' : 'outline'}
                  onPress={() => setOwnerType('personal')}
                >
                  <ButtonText>Личные</ButtonText>
                </Button>

                <Button
                  flex={1}
                  variant={ownerType === 'family' ? 'solid' : 'outline'}
                  onPress={() => setOwnerType('family')}
                >
                  <ButtonText>Семейные</ButtonText>
                </Button>
              </HStack>
            </VStack>
          )}

          {items.length === 0 ? (
            <VStack bg="$white" p="$4" borderRadius="$lg" space="sm">
              <Text fontWeight="$bold">Нет распознанных товаров</Text>
              <Text color="$gray500">
                OCR не нашёл подходящих строк товара. Попробуйте другой чек или фото получше.
              </Text>
            </VStack>
          ) : (
            items.map((item, index) => (
              <VStack
                key={index}
                bg="$white"
                p="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$borderLight200"
                space="md"
              >
                <Text fontWeight="$bold">Товар #{index + 1}</Text>

                <VStack space="xs">
                  <Text size="sm" color="$gray500">
                    Название
                  </Text>
                  <Input>
                    <InputField
                      value={item.name}
                      onChangeText={(value) =>
                        handleChangeItem(index, 'name', value)
                      }
                      placeholder="Название товара"
                    />
                  </Input>
                </VStack>

                <HStack space="sm">
                  <VStack flex={1} space="xs">
                    <Text size="sm" color="$gray500">
                      Количество
                    </Text>
                    <Input>
                      <InputField
                        value={item.qty !== null ? String(item.qty) : ''}
                        onChangeText={(value) =>
                          handleChangeItem(index, 'qty', value)
                        }
                        keyboardType="numeric"
                        placeholder="1"
                      />
                    </Input>
                  </VStack>

                  <VStack flex={1} space="xs">
                    <Text size="sm" color="$gray500">
                      Ед. изм.
                    </Text>
                    <Select
                      selectedValue={item.unit || 'шт'}
                      onValueChange={(value) =>
                        handleChangeItem(index, 'unit', value)
                      }
                    >
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder="Выберите" />
                        <Icon as={ChevronDownIcon} mr="$3" />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          {UNITS.map((u) => (
                            <SelectItem key={u} label={u} value={u} />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </VStack>
                </HStack>

                <VStack space="xs">
                  <Text size="sm" color="$gray500">
                    Цена
                  </Text>
                  <Input>
                    <InputField
                      value={item.price !== null ? String(item.price) : ''}
                      onChangeText={(value) =>
                        handleChangeItem(index, 'price', value)
                      }
                      keyboardType="numeric"
                      placeholder="0.00"
                    />
                  </Input>
                </VStack>

                {!!item.rawLine && (
                  <VStack space="xs">
                    <Text size="sm" color="$gray500">
                      Исходная строка OCR
                    </Text>
                    <Text size="sm">{item.rawLine}</Text>
                  </VStack>
                )}

                <HStack space="sm">
                  <Button
                    flex={1}
                    variant="outline"
                    action="secondary"
                    onPress={() => handleRemoveItem(index)}
                  >
                    <ButtonText>Удалить</ButtonText>
                  </Button>

                  <Button
                    flex={1}
                    bg="$blue500"
                    onPress={() => handleOpenAddProduct(item)}
                  >
                    <ButtonText>Открыть в добавлении</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            ))
          )}

          {!!rawText && (
            <VStack
              bg="$white"
              p="$4"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderLight200"
              space="sm"
            >
              <Text fontWeight="$bold">Сырой текст OCR</Text>
              <Text size="sm" color="$gray600">
                {rawText}
              </Text>
            </VStack>
          )}

          <VStack space="sm">
            <Text color="$gray500">
              Готовых строк для добавления: {cleanedItems.length}
            </Text>

            <Button
              bg="$green600"
              onPress={handleAddAll}
              isDisabled={isSavingAll || cleanedItems.length === 0}
            >
              <ButtonText>
                {isSavingAll ? 'Добавляем...' : 'Добавить все'}
              </ButtonText>
            </Button>

            <Button variant="outline" onPress={() => navigation.goBack()}>
              <ButtonText>Назад к сканеру</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}