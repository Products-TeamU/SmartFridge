import { Request, Response } from 'express';
import CommonProduct from '../models/CommonProduct';

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
    console.error(error);
    res.status(500).json({ message: 'Ошибка' });
  }
};

export const getProductByBarcode = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Not implemented' });
};