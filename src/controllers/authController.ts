import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, avatarId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Пользователь с таким email уже существует',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      passwordHash,
      name,
      avatarId: avatarId || 'person-green',
    });

    await newUser.save();

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        avatarId: newUser.avatarId,
      },
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    res.status(500).json({ message: 'Ошибка сервера', error: errorMessage });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarId: user.avatarId || 'person-green',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, email, avatarId } = req.body;

    console.log('updateProfile req.body:', req.body);

    if (!name && !email && !avatarId) {
      return res.status(400).json({
        message: 'Укажите хотя бы одно поле для обновления: name, email или avatarId',
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatarId) updateData.avatarId = avatarId;

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email уже используется другим пользователем',
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    ).select('-passwordHash');

    console.log('updatedUser avatarId:', updatedUser?.avatarId);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      message: 'Профиль обновлён',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatarId: updatedUser.avatarId || 'person-green',
      },
    });
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';

    res.status(500).json({
      message: 'Ошибка обновления профиля',
      error: errorMessage,
    });
  }
};