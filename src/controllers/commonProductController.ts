import { Request, Response } from 'express';
import CommonProduct from '../models/CommonProduct'; // используем твою модель общих продуктов

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const products = await CommonProduct.find({
      name: { $regex: `^${q}`, $options: 'i' }
    })
      .limit(10)
      .select('name category');

    res.json(products);
  } catch (error) {
    console.error('Ошибка при поиске:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};