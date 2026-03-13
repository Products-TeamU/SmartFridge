import { create } from 'zustand';
import api from '../services/api';

export interface Product {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category?: string;
  price?: number;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, '_id'>) => Promise<void>;
  updateProduct: (id: string, updatedData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  useProduct: (id: string, quantityToReduce?: number) => Promise<void>; // опционально
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/products');
      set({ products: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const response = await api.post('/products', product);
      set({ products: [...get().products, response.data] });
    } catch (err: any) {
      console.error('Ошибка добавления продукта:', err);
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      const response = await api.put(`/products/${id}`, updatedData);
      set({
        products: get().products.map((p) =>
          p._id === id ? response.data : p
        ),
      });
    } catch (err: any) {
      console.error('Ошибка обновления продукта:', err);
      throw err; // чтобы обработать в UI
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/${id}`);
      set({ products: get().products.filter((p) => p._id !== id) });
    } catch (err: any) {
      console.error('Ошибка удаления продукта:', err);
      throw err;
    }
  },

  useProduct: async (id, quantityToReduce = 1) => {
    // Находим продукт
    const product = get().products.find((p) => p._id === id);
    if (!product) return;

    const newQuantity = product.quantity - quantityToReduce;
    if (newQuantity <= 0) {
      // Если количество стало 0 или меньше, удаляем продукт
      await get().deleteProduct(id);
    } else {
      // Иначе обновляем количество
      await get().updateProduct(id, { quantity: newQuantity });
    }
  },
}));