import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import jwt from 'jsonwebtoken';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Неверные данные
 */

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Проверяем, есть ли введённый email уже в базе данных
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Создаём пользователя
    const newUser = new User({
      email,
      passwordHash,
      name,
    });

    // Сохраняем пользователя в базу
    await newUser.save();

    // Отвечаем клиенту (не возвращаем пароль)
    res.status(201).json({ message: 'Пользователь успешно создан', user: { email, name } });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    res.status(500).json({ message: 'Ошибка сервера', error: errorMessage });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход, возвращает токен и данные пользователя
 *       401:
 *         description: Неверные учётные данные
 */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // 1. Найти пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    // 2. Сравнить пароль
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    // 3. Сгенерировать JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    // 4. Вернуть токен и данные пользователя (без пароля)
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};