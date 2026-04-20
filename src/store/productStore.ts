import { create } from 'zustand';
import api from '../services/api';

export interface ProductCreator {
  _id: string;
  name: string;
  email?: string;
  avatarId?: string;
}

export interface Product {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category?: string;
  price?: number;
  ownerType: 'personal' | 'family';
  ownerId: string;
  createdBy?: ProductCreator | null;
}

export interface ProductInput {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category?: string;
  price?: number;
  ownerType: 'personal' | 'family';
  ownerId: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: (includeFamily?: boolean) => Promise<void>;
  addProduct: (product: ProductInput) => Promise<void>;
  updateProduct: (id: string, updatedData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  useProduct: (id: string, quantityToReduce?: number) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  loadProducts: async (includeFamily = false) => {
    set({ loading: true, error: null });
    try {
      const url = includeFamily ? '/products?family=true' : '/products';
      const response = await api.get(url);
      set({ products: response.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  addProduct: async (product) => {
    try {
      const response = await api.post('/products', product);
      set({ products: [...get().products, response.data] });
    } catch (err: any) {
      console.error('Ошибка добавления продукта:', err);
      throw err;
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      const currentProduct = get().products.find((p) => p._id === id);
      if (!currentProduct) throw new Error('Продукт не найден локально');

      const payload: any = {};
      if (updatedData.name !== undefined) payload.name = updatedData.name;
      if (updatedData.quantity !== undefined) payload.quantity = updatedData.quantity;
      if (updatedData.unit !== undefined) payload.unit = updatedData.unit;
      if (updatedData.expiryDate !== undefined) payload.expiryDate = updatedData.expiryDate;
      if (updatedData.category !== undefined) payload.category = updatedData.category;
      if (updatedData.price !== undefined) payload.price = updatedData.price;

      const response = await api.put(`/products/${id}`, payload);

      set({
        products: get().products.map((p) =>
          p._id === id ? { ...p, ...response.data } : p
        ),
      });
    } catch (err: any) {
      console.error('Ошибка обновления продукта:', err);
      throw err;
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
    const product = get().products.find((p) => p._id === id);
    if (!product) return;

    const newQuantity = product.quantity - quantityToReduce;
    if (newQuantity <= 0) {
      await get().deleteProduct(id);
    } else {
      await get().updateProduct(id, { quantity: newQuantity });
    }
  },
}));