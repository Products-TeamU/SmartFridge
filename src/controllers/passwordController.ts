import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { sendResetEmail } from '../services/emailService';

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Всегда возвращаем одинаковый ответ для безопасности
    if (!user) {
      return res.status(200).json({ message: 'Если email зарегистрирован, вы получите письмо' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 час
    await user.save();

    const resetLink = `SmartFridge://reset-password?token=${token}`; // глубокая ссылка для приложения
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({ message: 'Письмо для сброса пароля отправлено' });
  } catch (error) {
    console.error('Ошибка forgotPassword:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

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