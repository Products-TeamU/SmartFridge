import React, { useState, useRef, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Input,
  InputField,
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
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Toast,
  ToastTitle,
  useToast
} from '@gluestack-ui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProductStore } from '../store/productStore';
import { Platform, FlatList, TouchableOpacity } from 'react-native';
import api from '../services/api'; // ✅ импортируем настроенный axios

const UNITS = ['шт', 'кг', 'л', 'г', 'мл', 'уп'];

export default function AddProductScreen({ navigation }: any) {
  const toast = useToast();
  const { addProduct } = useProductStore();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('шт');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Состояния для подсказок
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce для поиска через бэкенд
  useEffect(() => {
    if (name.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`/common/search?q=${name}`);
        console.log('Ответ от API:', response.data);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Ошибка при поиске:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [name]);

  // Выбор подсказки
  const handleSelect = (product: any) => {
    console.log('Выбран продукт:', product);
    setName(product.name);
    if (product.category) setCategory(product.category);
    setSuggestions([]); // сразу очищаем подсказки
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Название обязательно';
    if (!quantity.trim()) newErrors.quantity = 'Количество обязательно';
    else if (isNaN(Number(quantity)) || Number(quantity) <= 0)
      newErrors.quantity = 'Введите положительное число';
    if (!expiryDate) newErrors.expiryDate = 'Выберите срок годности';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmittingRef.current) return;
    if (!validate()) return;

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
      });

      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Продукт добавлен</ToastTitle>
          </Toast>
        ),
      });

      navigation.goBack();
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setExpiryDate(selectedDate);
  };

  return (
    <VStack flex={1} bg="$backgroundLight100" p="$4" space="lg">
      <FormControl isInvalid={!!errors.name}>
        <FormControlLabel>
          <FormControlLabelText>Название</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="Например, Молоко (минимум 2 буквы)"
            value={name}
            onChangeText={setName}
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
            {loading ? (
              <Text p="$3" color="$textLight400">Загрузка...</Text>
            ) : (
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <VStack p="$3" borderBottomWidth={1} borderBottomColor="$borderLight100">
                      <Text bold>{item.name}</Text>
                      {item.category && <Text size="xs" color="$textLight500">{item.category}</Text>}
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

      <HStack space="sm" justifyContent="space-between">
        <FormControl isInvalid={!!errors.quantity} flex={1}>
          <FormControlLabel>
            <FormControlLabelText>Количество</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="2"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </Input>
          <FormControlError>
            <FormControlErrorText>{errors.quantity}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl flex={1}>
          <FormControlLabel>
            <FormControlLabelText>Ед. изм.</FormControlLabelText>
          </FormControlLabel>
          <Select selectedValue={unit} onValueChange={setUnit}>
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
        </FormControl>
      </HStack>

      <FormControl isInvalid={!!errors.expiryDate}>
        <FormControlLabel>
          <FormControlLabelText>Срок годности</FormControlLabelText>
        </FormControlLabel>
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
          <FormControlLabelText>Категория (необязательно)</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="Например, Молочные"
            value={category}
            onChangeText={setCategory}
          />
        </Input>
      </FormControl>

      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>Цена (необязательно)</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="99.90"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </Input>
      </FormControl>

      <HStack space="md" mt="$4">
        <Button flex={1} variant="outline" onPress={() => navigation.goBack()} isDisabled={isSubmitting}>
          <ButtonText>Отмена</ButtonText>
        </Button>
        <Button flex={1} bg="$blue500" onPress={handleSave} isDisabled={isSubmitting}>
          <ButtonText>Сохранить</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}