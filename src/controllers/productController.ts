import { Request, Response } from 'express';
import Product from '../models/Products';
import { AuthRequest } from '../middleware/authMiddleware';

// Получить все продукты

export const getAllProducts = async (req: AuthRequest, res: Response) => {
    try {
      console.log('req.user:', req.user);
    // req.user.userId берётся из токена (см. authMiddleware)
    const products = await Product.find({ userId: req.user.userId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать продукт
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, quantity, unit, expiryDate, category, price } = req.body;
    const newProduct = new Product({
      name,
      quantity,
      unit,
      expiryDate,
      category,
      price,
      userId: req.user.userId,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при создании', error });
  }
};

// Получить один продукт по ID
export const getProductById = async (req: AuthRequest, res: Response) => {
    try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId  // проверяем, что продукт принадлежит пользователю
    });
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить продукт
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId }, // проверка владельца
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении' });
  }
};

// Удалить продукт
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json({ message: 'Продукт удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Поиск продуктов
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const userId = (req as any).userId; // из authMiddleware

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json([]); // пустой результат при коротком запросе
    }

    const products = await Product.find({
      ownerId: userId,
      name: { $regex: `^${q}`, $options: 'i' } // начинается с q, без учёта регистра
    })
      .limit(10)
      .select('name unit'); // возвращаем только нужные поля

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Ошибка при поиске' });
  }
};