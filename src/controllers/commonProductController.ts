import { Request, Response } from 'express';
import CommonProduct from '../models/CommonProduct'; // используем твою модель общих продуктов

/**
 * @swagger
 * /api/common/search:
 *   get:
 *     summary: Поиск общих продуктов по названию
 *     description: Возвращает до 10 общих продуктов, название которых начинается с указанной строки (без учёта регистра). Используется для автодополнения при добавлении продукта.
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
 *                   category:
 *                     type: string
 *       500:
 *         description: Ошибка сервера
 */

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