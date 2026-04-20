import { Request, Response } from 'express';
import Product from '../models/Products';
import { AuthRequest } from '../middleware/authMiddleware';
import Family from '../models/Family';

const creatorPopulate = {
  path: 'createdBy',
  select: 'name avatarId email',
};

const getUserId = (req: AuthRequest, res: Response): string | null => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Пользователь не авторизован' });
    return null;
  }

  return userId;
};

export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { family } = req.query;

    const ownerIds: string[] = [userId];
    const ownerTypes: string[] = ['personal'];

    if (family === 'true') {
      const familyDoc = await Family.findOne({ 'members.userId': userId });
      if (familyDoc) {
        ownerIds.push(familyDoc._id.toString());
        ownerTypes.push('family');
      }
    }

    const products = await Product.find({
      ownerId: { $in: ownerIds },
      ownerType: { $in: ownerTypes },
    })
      .populate(creatorPopulate)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

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

    const userId = getUserId(req, res);
    if (!userId) return;

    if (!ownerType || !ownerId) {
      return res
        .status(400)
        .json({ message: 'ownerType и ownerId обязательны' });
    }

    if (!['personal', 'family'].includes(ownerType)) {
      return res
        .status(400)
        .json({ message: 'ownerType должен быть personal или family' });
    }

    if (ownerType === 'personal') {
      if (ownerId !== userId) {
        return res
          .status(403)
          .json({ message: 'Нельзя создать продукт для другого пользователя' });
      }
    } else if (ownerType === 'family') {
      const family = await Family.findOne({
        _id: ownerId,
        'members.userId': userId,
      });

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
      createdBy: userId,
    });

    await newProduct.save();
    await newProduct.populate(creatorPopulate);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Ошибка при создании продукта', error });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const product = await Product.findById(req.params.id).populate(
      creatorPopulate
    );

    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    if (product.ownerType === 'personal') {
      if (product.ownerId.toString() !== userId) {
        return res.status(403).json({ message: 'Нет доступа' });
      }
    } else if (product.ownerType === 'family') {
      const family = await Family.findOne({
        _id: product.ownerId,
        'members.userId': userId,
      });
      if (!family) {
        return res.status(403).json({ message: 'Вы не состоите в этой семье' });
      }
    } else {
      return res.status(400).json({ message: 'Неверный тип владельца' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    if (product.ownerType === 'personal') {
      if (product.ownerId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: 'Нет прав на редактирование' });
      }
    } else if (product.ownerType === 'family') {
      const family = await Family.findOne({
        _id: product.ownerId,
        'members.userId': userId,
      });
      if (!family) {
        return res.status(403).json({ message: 'Вы не состоите в этой семье' });
      }
    } else {
      return res.status(400).json({ message: 'Неверный тип владельца' });
    }

    const allowedUpdates = [
      'name',
      'quantity',
      'unit',
      'expiryDate',
      'category',
      'price',
    ];

    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate(creatorPopulate);

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Ошибка при обновлении' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    if (product.ownerType === 'personal') {
      if (product.ownerId.toString() !== userId) {
        return res.status(403).json({ message: 'Нет прав на удаление' });
      }
    } else if (product.ownerType === 'family') {
      const family = await Family.findOne({
        _id: product.ownerId,
        'members.userId': userId,
      });
      if (!family) {
        return res.status(403).json({ message: 'Вы не состоите в этой семье' });
      }
    } else {
      return res.status(400).json({ message: 'Неверный тип владельца' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Продукт удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const searchProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json([]);
    }

    const products = await Product.find({
      ownerId: userId,
      name: { $regex: `^${q}`, $options: 'i' },
    })
      .limit(10)
      .select('name unit');

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Ошибка при поиске' });
  }
};

export const getPersonalProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const products = await Product.find({
      ownerType: 'personal',
      ownerId: userId,
    })
      .populate(creatorPopulate)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('❌ Ошибка в getPersonalProducts:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: String(error) });
  }
};

export const getFamilyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const family = await Family.findOne({ 'members.userId': userId });

    if (!family) {
      return res.status(404).json({ message: 'Вы не состоите в семье' });
    }

    const products = await Product.find({
      ownerType: 'family',
      ownerId: family._id,
    })
      .populate(creatorPopulate)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('❌ Ошибка в getFamilyProducts:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: String(error) });
  }
};