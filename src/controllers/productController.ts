import { Request, Response } from 'express';
import Product from '../models/Products';
import { AuthRequest } from '../middleware/authMiddleware';


// Получить все продукты


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех продуктов
 *     responses:
 *       200:
 *         description: Список продуктов
 *       500:
 *         description: Ошибка сервера
 */


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

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавить новый продукт
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Продукт создан
 *       400:
 *         description: Неверные данные
 */

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

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Данные продукта
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 expiryDate:
 *                   type: string
 *                   format: date
 *                 quantity:
 *                   type: number
 *                 unit:
 *                   type: string
 *                 userId:
 *                   type: string
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */

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


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить продукт по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Продукт обновлён
 *       404:
 *         description: Продукт не найден
 */

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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить продукт по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Продукт удалён
 *       404:
 *         description: Продукт не найден
 */

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

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Поиск продуктов по названию
 *     description: Возвращает до 10 продуктов, название которых начинается с указанной строки (без учёта регистра).
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Поисковый запрос (минимум 2 символа)
 *     responses:
 *       200:
 *         description: Список продуктов (может быть пустым)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   unit:
 *                     type: string
 *       500:
 *         description: Ошибка сервера
 */

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