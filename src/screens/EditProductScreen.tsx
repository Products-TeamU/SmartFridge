import React, { useState, useRef } from 'react';
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
  useToast,
} from '@gluestack-ui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProductStore } from '../store/productStore';
import { Platform } from 'react-native';

const UNITS = ['шт', 'кг', 'л', 'г', 'мл', 'уп'];

export default function EditProductScreen({ route, navigation }: any) {
  const { product } = route.params;
  const toast = useToast();
  const { updateProduct } = useProductStore();

  const [name, setName] = useState(product.name);
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [unit, setUnit] = useState(product.unit);
  const [expiryDate, setExpiryDate] = useState(new Date(product.expiryDate));
  const [category, setCategory] = useState(product.category || '');
  const [price, setPrice] = useState(product.price ? String(product.price) : '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // реф для мгновенной блокировки

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
    // Мгновенная проверка через реф
    if (isSubmittingRef.current) return;
    if (!validate()) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await updateProduct(product._id, {
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
            <ToastTitle>Продукт обновлён</ToastTitle>
          </Toast>
        ),
      });

      navigation.goBack();
    } catch (error) {
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Ошибка при обновлении</ToastTitle>
          </Toast>
        ),
      });
    } finally {
      // Задержка 150 мс перед сбросом флага
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 200);
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
          <InputField value={name} onChangeText={setName} />
        </Input>
        <FormControlError>
          <FormControlErrorText>{errors.name}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <HStack space="sm">
        <FormControl isInvalid={!!errors.quantity} flex={1}>
          <FormControlLabel>
            <FormControlLabelText>Количество</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
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
            <SelectTrigger>
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
        <Button variant="outline" onPress={() => setShowDatePicker(true)}>
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
          <InputField value={category} onChangeText={setCategory} />
        </Input>
      </FormControl>

      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>Цена (необязательно)</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </Input>
      </FormControl>

      <HStack space="md" mt="$4">
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
          bg="$blue500"
          onPress={handleSave}
          isDisabled={isSubmitting}
        >
          <ButtonText>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}