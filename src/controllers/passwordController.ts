import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { sendResetEmail } from '../services/emailService';

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Запрос сброса пароля
 *     description: Отправляет на email ссылку для сброса пароля.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Письмо отправлено (если email зарегистрирован)
 *       500:
 *         description: Ошибка сервера
 */

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'Если email зарегистрирован, вы получите письмо' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 час
    await user.save();

    // Замените домен на актуальный URL вашего бэкенда на Render
    const resetLink = `https://smartfridge-ouxh.onrender.com/reset-password?token=${token}`;
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({ message: 'Письмо для сброса пароля отправлено' });
  } catch (error) {
    console.error('Ошибка forgotPassword:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Смена пароля по токену
 *     description: Устанавливает новый пароль, если токен действителен.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Пароль успешно изменён
 *       400:
 *         description: Токен недействителен или истёк
 *       500:
 *         description: Ошибка сервера
 */

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Токен недействителен или истёк' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('Ошибка resetPassword:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};