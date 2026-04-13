import { Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Family from '../models/Family';
import Product from '../models/Products';
import { AuthRequest } from '../middleware/authMiddleware';

const generateInviteCode = () => crypto.randomBytes(3).toString('hex');

const getUserId = (req: AuthRequest, res: Response): string | null => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Пользователь не авторизован' });
    return null;
  }

  return userId;
};

const getMemberUserId = (member: any): string => {
  if (!member?.userId) return '';

  if (typeof member.userId === 'string') return member.userId;

  if (member.userId._id) return member.userId._id.toString();

  return member.userId.toString();
};

const getPopulatedFamilyById = async (familyId: string) => {
  return Family.findById(familyId).populate('members.userId', 'name email');
};

// Создание семьи
export const createFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name } = req.body;

    const existing = await Family.findOne({ 'members.userId': userId });
    if (existing) {
      return res.status(400).json({ message: 'Вы уже состоите в семье' });
    }

    let inviteCode = generateInviteCode();
    while (await Family.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const family = new Family({
      name: name?.trim() || 'Моя семья',
      inviteCode,
      members: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          role: 'admin',
        },
      ],
    });

    await family.save();

    const populatedFamily = await getPopulatedFamilyById(family._id.toString());

    return res.status(201).json(populatedFamily);
  } catch (error) {
    console.error('createFamily error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Вступление в семью по коду
export const joinFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { inviteCode } = req.body;

    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({ message: 'Код приглашения обязателен' });
    }

    const existingFamily = await Family.findOne({ 'members.userId': userId });
    if (existingFamily) {
      return res.status(400).json({ message: 'Вы уже состоите в семье' });
    }

    const family = await Family.findOne({ inviteCode: inviteCode.trim() });
    if (!family) {
      return res.status(404).json({ message: 'Неверный код приглашения' });
    }

    const alreadyMember = family.members.some(
      (m) => getMemberUserId(m) === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'Вы уже участник этой семьи' });
    }

    family.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      role: 'member',
    } as any);

    await family.save();

    const populatedFamily = await getPopulatedFamilyById(family._id.toString());

    return res.json(populatedFamily);
  } catch (error) {
    console.error('joinFamily error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение текущей семьи
export const getFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const family = await Family.findOne({ 'members.userId': userId }).populate(
      'members.userId',
      'name email'
    );

    if (!family) {
      return res.status(404).json({ message: 'Вы не состоите в семье' });
    }

    return res.json(family);
  } catch (error) {
    console.error('getFamily error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление участника администратором
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { memberId } = req.params;

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Семья не найдена' });
    }

    const currentMember = family.members.find(
      (m) => getMemberUserId(m) === userId
    );

    if (!currentMember || currentMember.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Только администратор может удалять участников' });
    }

    const memberToRemove = family.members.find(
      (m) => getMemberUserId(m) === memberId
    );

    if (!memberToRemove) {
      return res.status(404).json({ message: 'Участник не найден' });
    }

    if (memberToRemove.role === 'admin') {
      return res.status(400).json({ message: 'Нельзя удалить администратора' });
    }

    family.members = family.members.filter(
      (m) => getMemberUserId(m) !== memberId
    ) as any;

    await family.save();

    const populatedFamily = await getPopulatedFamilyById(family._id.toString());

    return res.json(populatedFamily);
  } catch (error) {
    console.error('removeMember error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Выход из семьи текущего пользователя
export const leaveFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Вы не состоите в семье' });
    }

    const currentMember = family.members.find(
      (m) => getMemberUserId(m) === userId
    );

    if (!currentMember) {
      return res.status(404).json({ message: 'Участник не найден в семье' });
    }

    if (currentMember.role === 'admin') {
      const admins = family.members.filter((m) => m.role === 'admin');

      if (admins.length === 1) {
        return res.status(400).json({
          message:
            'Администратор не может выйти из семьи, пока не передаст права другому участнику или не удалит семью',
        });
      }
    }

    family.members = family.members.filter(
      (m) => getMemberUserId(m) !== userId
    ) as any;

    if (family.members.length === 0) {
      await Product.deleteMany({
        ownerType: 'family',
        ownerId: family._id,
      });

      await Family.findByIdAndDelete(family._id);

      return res.json({ message: 'Вы вышли из семьи. Пустая семья удалена' });
    }

    await family.save();

    return res.json({ message: 'Вы успешно вышли из семьи' });
  } catch (error) {
    console.error('leaveFamily error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление названия семьи
export const updateFamilyName = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Название не может быть пустым' });
    }

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Семья не найдена' });
    }

    const currentMember = family.members.find(
      (m) => getMemberUserId(m) === userId
    );

    if (!currentMember || currentMember.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Только администратор может изменять название' });
    }

    family.name = name.trim();
    await family.save();

    const populatedFamily = await getPopulatedFamilyById(family._id.toString());

    return res.json(populatedFamily);
  } catch (error) {
    console.error('updateFamilyName error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление семьи администратором
export const deleteFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Семья не найдена' });
    }

    const currentMember = family.members.find(
      (m) => getMemberUserId(m) === userId
    );

    if (!currentMember || currentMember.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Только администратор может удалить семью' });
    }

    await Product.deleteMany({
      ownerType: 'family',
      ownerId: family._id,
    });

    await Family.findByIdAndDelete(family._id);

    return res.json({ message: 'Семья и все семейные продукты удалены' });
  } catch (error) {
    console.error('deleteFamily error:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};