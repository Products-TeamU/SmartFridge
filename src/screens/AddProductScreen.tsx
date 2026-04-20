import React, { useEffect, useRef, useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Toast,
  ToastTitle,
  useToast,
  Box,
} from '@gluestack-ui/themed';
import {
  Platform,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { useFamilyStore } from '../store/familyStore';

const UNITS = ['шт', 'кг', 'л', 'г', 'мл', 'уп'];
const QUICK_EXPIRY_DAYS = [1, 3, 7, 30];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export default function AddProductScreen({ route, navigation }: any) {
  const { ownerType: initialOwnerType } = route.params || {};
  const toast = useToast();
  const { addProduct } = useProductStore();
  const { user } = useAuthStore();
  const { family } = useFamilyStore();

  const quantityRef = useRef<any>(null);
  const categoryRef = useRef<any>(null);
  const priceRef = useRef<any>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('шт');
  const [expiryDate, setExpiryDate] = useState(addDays(new Date(), 7));
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [ownerType, setOwnerType] = useState<'personal' | 'family'>(
    initialOwnerType || 'personal'
  );
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const prefill = route.params?.prefill;

    if (!prefill) return;

    if (prefill.name) setName(prefill.name);
    if (prefill.quantity !== null && prefill.quantity !== undefined) {
      setQuantity(String(prefill.quantity));
    }
    if (prefill.unit) setUnit(prefill.unit);
    if (prefill.price !== null && prefill.price !== undefined) {
      setPrice(String(prefill.price));
    }
  }, [route.params]);

  useEffect(() => {
    if (ownerType === 'personal') {
      setOwnerId(user?.id);
    } else {
      setOwnerId(family?._id);
    }
  }, [ownerType, user, family]);

  useEffect(() => {
    if (name.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await api.get(`/common/search?q=${name}`);
        setSuggestions(response.data);
      } catch (error: any) {
        console.error('Ошибка при поиске:', error?.response?.data || error?.message);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [name]);

  const handleSelectSuggestion = (product: any) => {
    setName(product.name);
    if (product.category) setCategory(product.category);
    setSuggestions([]);
    setTimeout(() => quantityRef.current?.focus?.(), 50);
  };

  const changeQuantity = (delta: number) => {
    const current = Number(quantity || '0');
    const safeCurrent = Number.isNaN(current) ? 1 : current;
    const next = Math.max(1, safeCurrent + delta);
    setQuantity(String(next));

    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: '' }));
    }
  };

  const setQuickExpiry = (days: number) => {
    setExpiryDate(addDays(new Date(), days));
    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: '' }));
    }
  };

  const resetFormForNext = () => {
    setName('');
    setQuantity('1');
    setExpiryDate(addDays(new Date(), 7));
    setCategory('');
    setPrice('');
    setSuggestions([]);
    setErrors({});
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Название обязательно';

    if (!quantity.trim()) {
      newErrors.quantity = 'Количество обязательно';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = 'Введите положительное число';
    }

    if (!expiryDate) {
      newErrors.expiryDate = 'Выберите срок годности';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = async (stayOnScreen: boolean) => {
    if (isSubmittingRef.current) return;
    if (!validate()) return;

    if (ownerType === 'personal' && !user?.id) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Ошибка: пользователь не авторизован</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    if (ownerType === 'family' && !family?._id) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Ошибка: вы не состоите в семье</ToastTitle>
          </Toast>
        ),
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await addProduct({
        name: name.trim(),
        quantity: parseFloat(quantity),
        unit,
        expiryDate: expiryDate.toISOString().split('T')[0],
        category: category.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        ownerType,
        ownerId: ownerType === 'personal' ? user!.id : family!._id,
      });

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>
              {stayOnScreen ? 'Сохранено, можно добавить следующий' : 'Продукт добавлен'}
            </ToastTitle>
          </Toast>
        ),
      });

      if (stayOnScreen) {
        resetFormForNext();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Ошибка при добавлении</ToastTitle>
          </Toast>
        ),
      });
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 150);
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);
      if (errors.expiryDate) {
        setErrors((prev) => ({ ...prev, expiryDate: '' }));
      }
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <VStack space="lg">
        {!initialOwnerType && family && (
          <HStack space="md">
            <Button
              flex={1}
              variant={ownerType === 'personal' ? 'solid' : 'outline'}
              onPress={() => setOwnerType('personal')}
            >
              <ButtonText>📦 Личный</ButtonText>
            </Button>
            <Button
              flex={1}
              variant={ownerType === 'family' ? 'solid' : 'outline'}
              onPress={() => setOwnerType('family')}
            >
              <ButtonText>👨‍👩‍👧‍👦 Семейный</ButtonText>
            </Button>
          </HStack>
        )}

        <Text fontSize="$sm" color="$gray500" textAlign="center">
          {ownerType === 'family'
            ? 'Продукт будет добавлен в общий список семьи'
            : 'Продукт будет виден только вам'}
        </Text>

        <Box bg="$white" borderRadius="$2xl" p="$4">
          <VStack space="md">
            <Text fontSize="$lg" fontWeight="$bold">
              Быстрое добавление
            </Text>

            <FormControl isInvalid={!!errors.name}>
              <FormControlLabel>
                <FormControlLabelText>Название</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  autoFocus
                  placeholder="Например, Молоко"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => quantityRef.current?.focus?.()}
                />
              </Input>

              {suggestions.length > 0 && (
                <VStack
                  bg="$white"
                  borderWidth={1}
                  borderColor="$borderLight200"
                  borderRadius="$sm"
                  mt="$1"
                  maxHeight={200}
                  style={{ overflow: 'hidden' }}
                >
                  {loadingSuggestions ? (
                    <Text p="$3" color="$textLight400">
                      Загрузка...
                    </Text>
                  ) : (
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item, index) => `${item._id || index}`}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => handleSelectSuggestion(item)}
                          activeOpacity={0.7}
                        >
                          <VStack
                            p="$3"
                            borderBottomWidth={1}
                            borderBottomColor="$borderLight100"
                          >
                            <Text bold>{item.name}</Text>
                            {item.category && (
                              <Text size="xs" color="$textLight500">
                                {item.category}
                              </Text>
                            )}
                          </VStack>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </VStack>
              )}

              <FormControlError>
                <FormControlErrorText>{errors.name}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.quantity}>
              <FormControlLabel>
                <FormControlLabelText>Количество</FormControlLabelText>
              </FormControlLabel>

              <HStack space="sm" alignItems="center">
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => changeQuantity(-1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>

                <Input flex={1}>
                  <InputField
                    ref={quantityRef}
                    placeholder="1"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={(text) => {
                      setQuantity(text);
                      if (errors.quantity) {
                        setErrors((prev) => ({ ...prev, quantity: '' }));
                      }
                    }}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => categoryRef.current?.focus?.()}
                  />
                </Input>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => changeQuantity(1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </HStack>

              <FormControlError>
                <FormControlErrorText>{errors.quantity}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <VStack space="xs">
              <Text fontWeight="$medium">Единица измерения</Text>
              <HStack flexWrap="wrap">
                {UNITS.map((u) => {
                  const active = unit === u;
                  return (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setUnit(u)}
                      activeOpacity={0.8}
                      style={[
                        styles.chip,
                        active && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            </VStack>

            <FormControl isInvalid={!!errors.expiryDate}>
              <FormControlLabel>
                <FormControlLabelText>Срок годности</FormControlLabelText>
              </FormControlLabel>

              <HStack flexWrap="wrap" mb="$2">
                {QUICK_EXPIRY_DAYS.map((days) => (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setQuickExpiry(days)}
                    activeOpacity={0.8}
                    style={styles.quickDateChip}
                  >
                    <Text style={styles.quickDateChipText}>+{days}д</Text>
                  </TouchableOpacity>
                ))}
              </HStack>

              <Button
                variant="outline"
                onPress={() => setShowDatePicker(true)}
                justifyContent="flex-start"
              >
                <ButtonText>{expiryDate.toLocaleDateString()}</ButtonText>
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={expiryDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}

              <FormControlError>
                <FormControlErrorText>{errors.expiryDate}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Категория</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  ref={categoryRef}
                  placeholder="Например, Молочные"
                  value={category}
                  onChangeText={setCategory}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => priceRef.current?.focus?.()}
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Цена</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  ref={priceRef}
                  placeholder="99.90"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  returnKeyType="done"
                  onSubmitEditing={() => saveProduct(false)}
                />
              </Input>
            </FormControl>
          </VStack>
        </Box>

        <HStack space="md">
          <Button
            flex={1}
            variant="outline"
            onPress={() => navigation.goBack()}
            isDisabled={isSubmitting}
          >
            <ButtonText>Отмена</ButtonText>
          </Button>

          <Button
            flex={1}
            variant="outline"
            onPress={() => saveProduct(true)}
            isDisabled={isSubmitting}
          >
            <ButtonText>
              {isSubmitting ? 'Сохранение...' : 'Сохр. и ещё'}
            </ButtonText>
          </Button>
        </HStack>

        <Button
          bg="$blue500"
          onPress={() => saveProduct(false)}
          isDisabled={isSubmitting}
        >
          <ButtonText>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  qtyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipText: {
    color: '#374151',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  quickDateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    marginRight: 8,
    marginBottom: 8,
  },
  quickDateChipText: {
    color: '#047857',
    fontWeight: '600',
  },
});