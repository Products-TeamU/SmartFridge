import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -------------------------------------------------
// НАСТРОЙКА БАЗОВОГО URL ДЛЯ РАЗНЫХ ОКРУЖЕНИЙ
// -------------------------------------------------

// Адрес для Android эмулятора (специальный адрес для доступа к localhost компьютера)
const EMULATOR_URL = 'https://smartfridge-ouxh.onrender.com/api';

// Адрес для реального устройства (IP твоего компьютера в локальной сети)
// Убедись, что IP актуален (может меняться при перезагрузке роутера)
const PHYSICAL_DEVICE_URL = 'https://smartfridge-ouxh.onrender.com/api';// Адрес для продакшена (когда появится реальный сервер)
const PRODUCTION_URL = 'https://smartfridge-ouxh.onrender.com/api';// -------------------------------------------------
// __DEV__ – встроенная переменная React Native:
//   true  – режим разработки (например, запуск через Expo или Metro)
//   false – продакшен-сборка (APK)

// РУЧНОЙ ПЕРЕКЛЮЧАТЕЛЬ ДЛЯ РАЗРАБОТКИ:
// Раскомментируй нужную строку, в зависимости от того, где тестируешь.
const DEV_URL = PHYSICAL_DEVICE_URL;   // для реального телефона
// const DEV_URL = EMULATOR_URL;       // для эмулятора

// Итоговый базовый URL
const BASE_URL = __DEV__ ? DEV_URL : PRODUCTION_URL;

console.log('[API] Base URL:', BASE_URL); // ← добавили лог базового URL

// -------------------------------------------------
// СОЗДАНИЕ И НАСТРОЙКА AXIOS-ИНСТАНСА
// -------------------------------------------------
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов – добавляем токен авторизации, если он есть
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Логируем полный URL запроса
  console.log(`[API] Запрос: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

export default api;