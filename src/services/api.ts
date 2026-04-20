import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const EMULATOR_URL = 'http://10.0.2.2:5000/api';
// const PHYSICAL_DEVICE_URL = 'http://10.177.160.13:5000/api';
const EMULATOR_URL = 'https://smartfridge-ouxh.onrender.com/api';
const PHYSICAL_DEVICE_URL = 'https://smartfridge-ouxh.onrender.com/api';
const PRODUCTION_URL = 'https://smartfridge-ouxh.onrender.com/api';

const DEV_URL = PHYSICAL_DEVICE_URL;
// const DEV_URL = EMULATOR_URL;

const BASE_URL = __DEV__ ? DEV_URL : PRODUCTION_URL;

console.log('[API] Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (isFormData) {
    config.headers.delete('Content-Type');
  } else {
    config.headers.set('Content-Type', 'application/json');
  }

  console.log(
    `[API] Запрос: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
  );
  console.log('[API] isFormData:', isFormData);

  return config;
});

export default api;
export { BASE_URL };