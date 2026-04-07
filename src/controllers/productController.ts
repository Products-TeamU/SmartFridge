import { Request, Response } from 'express';
import Product from '../models/Products';
import { AuthRequest } from '../middleware/authMiddleware';
import Family from '../models/Family';

// Получить все продукты


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список продуктов
 *     description: Возвращает личные продукты пользователя. Если передан параметр `family=true`, также возвращает продукты семьи, в которой состоит пользователь.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: family
 *         schema:
 *           type: boolean
 *         description: Если true, включить семейные продукты.
 *         example: true
 *     responses:
 *       200:
 *         description: Список продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Ошибка сервера
 */


export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { family } = req.query; // ?family=true

    // Базовые фильтры: личные продукты
    const ownerIds: string[] = [userId];
    const ownerTypes: string[] = ['personal'];

    if (family === 'true') {
      // Находим семью пользователя
      const familyDoc = await Family.findOne({ 'members.userId': userId });
      if (familyDoc) {
        ownerIds.push(familyDoc._id.toString());
        ownerTypes.push('family');
      }
    }

    const products = await Product.find({
      ownerId: { $in: ownerIds },
      ownerType: { $in: ownerTypes },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать продукт

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый продукт
 *     description: Создаёт личный или семейный продукт. Требуется авторизация.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - expiryDate
 *               - ownerType
 *               - ownerId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название продукта
 *                 example: Молоко
 *               quantity:
 *                 type: number
 *                 description: Количество
 *                 example: 2
 *               unit:
 *                 type: string
 *                 description: Единица измерения (шт, кг, л)
 *                 example: л
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Срок годности
 *                 example: 2026-05-01
 *               category:
 *                 type: string
 *                 description: Категория (необязательно)
 *                 example: Молочные
 *               price:
 *                 type: number
 *                 description: Цена (необязательно)
 *                 example: 89.90
 *               ownerType:
 *                 type: string
 *                 enum: [personal, family]
 *                 description: Тип владельца (личный или семейный)
 *               ownerId:
 *                 type: string
 *                 description: ID владельца (userId для personal, familyId для family)
 *     responses:
 *       201:
 *         description: Продукт создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные данные (отсутствуют обязательные поля, неверный ownerType)
 *       403:
 *         description: Недостаточно прав (например, попытка создать семейный продукт не для своей семьи)
 *       500:
 *         description: Ошибка сервера
 */

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      quantity,
      unit,
      expiryDate,
      category,
      price,
      ownerType,
      ownerId,
    } = req.body;
    const userId = req.user.userId;

    // Проверка обязательных полей
    if (!ownerType || !ownerId) {
      return res.status(400).json({ message: 'ownerType и ownerId обязательны' });
    }
    if (!['personal', 'family'].includes(ownerType)) {
      return res.status(400).json({ message: 'ownerType должен быть personal или family' });
    }

    // Проверка прав
    if (ownerType === 'personal') {
      if (ownerId !== userId) {
        return res.status(403).json({ message: 'Нельзя создать продукт для другого пользователя' });
      }
    } else if (ownerType === 'family') {
      const family = await Family.findOne({ _id: ownerId, 'members.userId': userId });
      if (!family) {
        return res.status(403).json({ message: 'Вы не состоите в этой семье' });
      }
    }

    const newProduct = new Product({
      name,
      quantity,
      unit,
      expiryDate,
      category,
      price,
      ownerType,
      ownerId,
      // Поле userId можно оставить для обратной совместимости, но не обязательно
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Ошибка при создании продукта', error });
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

// Личные продукты
export const getPersonalProducts = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== getPersonalProducts called ===');
    console.log('req.user:', req.user);
    
    const userId = req.user?.userId;
    console.log('userId:', userId);
    
    if (!userId) {
      console.log('userId отсутствует');
      return res.status(401).json({ message: 'Не авторизован' });
    }
    
    console.log('Выполняем Product.find...');
    const products = await Product.find({ ownerType: 'personal', ownerId: userId });
    console.log('Найдено продуктов:', products.length);
    
    res.json(products);
  } catch (error) {
    console.error('❌ Ошибка в getPersonalProducts:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: String(error) });
  }
};

export const getFamilyProducts = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== getFamilyProducts called ===');
    console.log('req.user:', req.user);
    
    const userId = req.user?.userId;
    console.log('userId:', userId);
    
    if (!userId) {
      console.log('userId отсутствует');
      return res.status(401).json({ message: 'Не авторизован' });
    }
    
    console.log('Ищем семью...');
    const family = await Family.findOne({ 'members.userId': userId });
    console.log('Семья найдена:', family);
    
    if (!family) {
      console.log('Семья не найдена');
      return res.status(404).json({ message: 'Вы не состоите в семье' });
    }
    
    console.log('Ищем семейные продукты...');
    const products = await Product.find({ ownerType: 'family', ownerId: family._id });
    console.log('Найдено продуктов:', products.length);
    
    res.json(products);
  } catch (error) {
    console.error('❌ Ошибка в getFamilyProducts:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: String(error) });
  }
};