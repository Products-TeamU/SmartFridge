import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Center, Text, Button, ButtonText, VStack } from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScannerScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);

  const sendImageToOcr = async (asset: ImagePicker.ImagePickerAsset) => {
    console.log('--- SEND IMAGE TO OCR ---');
    console.log('asset:', asset);
    console.log('asset.uri:', asset?.uri);
    console.log('asset.fileName:', asset?.fileName);
    console.log('asset.mimeType:', asset?.mimeType);
    console.log('asset.fileSize:', asset?.fileSize);

    const token = await AsyncStorage.getItem('token');

    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      name: asset.fileName || 'receipt.jpg',
      type: asset.mimeType || 'image/jpeg',
    } as any);

    console.log('FormData prepared with field: image');

    const response = await fetch('http://10.177.160.13:5000/api/ocr/receipt', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      body: formData,
    });

    const rawText = await response.text();
    console.log('OCR response status:', response.status);
    console.log('OCR response raw:', rawText);

    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      throw new Error(data?.message || 'OCR request failed');
    }

    navigation.navigate('ReceiptEdit', {
      items: data.parsedItems || [],
      rawText: data.rawText || '',
      lines: data.lines || [],
    });
  };

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Нет доступа', 'Разрешите доступ к галерее.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.2,
      });

      console.log('Gallery result:', result);

      if (result.canceled) return;

      setIsLoading(true);

      const asset = result.assets[0];
      await sendImageToOcr(asset);
    } catch (error: any) {
      console.log('Gallery OCR error message:', error?.message);
      console.log('Gallery OCR full error:', error);

      Alert.alert(
        'Ошибка',
        error?.message || 'Не удалось обработать изображение из галереи.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Нет доступа', 'Разрешите доступ к камере.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.2,
        cameraType: ImagePicker.CameraType.back,
      });

      console.log('Camera result:', result);

      if (result.canceled) return;

      setIsLoading(true);

      const asset = result.assets[0];
      await sendImageToOcr(asset);
    } catch (error: any) {
      console.log('Camera OCR error message:', error?.message);
      console.log('Camera OCR full error:', error);

      Alert.alert(
        'Ошибка',
        error?.message || 'Не удалось обработать фото с камеры.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center flex={1} bg="white" px="$5">
      <VStack space="lg" width="100%" maxWidth={400}>
        <Text fontSize="$2xl" bold textAlign="center">
          Сканер чеков
        </Text>

        <Text textAlign="center" color="$gray500">
          Сфотографируйте чек или выберите готовое фото, затем проверьте распознанные товары.
        </Text>

        <Button onPress={handleTakePhoto} isDisabled={isLoading}>
          <ButtonText>{isLoading ? 'Обработка...' : 'Сделать фото'}</ButtonText>
        </Button>

        <Button
          variant="outline"
          onPress={handlePickFromGallery}
          isDisabled={isLoading}
        >
          <ButtonText>{isLoading ? 'Обработка...' : 'Выбрать из галереи'}</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}