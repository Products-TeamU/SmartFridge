import { Request, Response } from 'express';
import Family from '../models/Family';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/authMiddleware';
import Product from '../models/Products';
// Генерация уникального кода (6 символов)
const generateInviteCode = () => crypto.randomBytes(3).toString('hex');

// Создание семьи



export const createFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    // Проверяем, не состоит ли пользователь уже в какой-либо семье
    const existing = await Family.findOne({ 'members.userId': userId });
    if (existing) {
      return res.status(400).json({ message: 'Вы уже состоите в семье' });
    }

    let inviteCode = generateInviteCode();
    // Уникальность кода
    while (await Family.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const family = new Family({
      name: name || 'Моя семья',
      inviteCode,
      members: [{ userId, role: 'admin' }],
    });
    await family.save();

    res.status(201).json({ familyId: family._id, inviteCode: family.inviteCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Присоединение к семье по коду



export const joinFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { inviteCode } = req.body;

    const family = await Family.findOne({ inviteCode });
    if (!family) {
      return res.status(404).json({ message: 'Неверный код приглашения' });
    }

    // Проверяем, не состоит ли уже в этой семье
    if (family.members.some(m => m.userId.toString() === userId)) {
      return res.status(400).json({ message: 'Вы уже участник этой семьи' });
    }

    family.members.push({ userId, role: 'member' });
    await family.save();

    res.json({ message: 'Вы присоединились к семье', familyId: family._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение информации о семье текущего пользователя


export const getFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const family = await Family.findOne({ 'members.userId': userId }).populate('members.userId', 'name email');
    if (!family) {
      return res.status(404).json({ message: 'Вы не состоите в семье' });
    }
    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление участника (только admin)



export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { memberId } = req.params;

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Семья не найдена' });
    }

    const currentMember = family.members.find(m => m.userId.toString() === userId);
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ message: 'Только администратор может удалять участников' });
    }

    const memberToRemove = family.members.find(m => m.userId.toString() === memberId);
    if (!memberToRemove) {
      return res.status(404).json({ message: 'Участник не найден' });
    }
    if (memberToRemove.role === 'admin') {
      return res.status(400).json({ message: 'Нельзя удалить администратора' });
    }

    family.members = family.members.filter(m => m.userId.toString() !== memberId);
    await family.save();

    res.json({ message: 'Участник удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить название семьи
export const updateFamilyName = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Название не может быть пустым' });
    }

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Семья не найдена' });
    }

    const member = family.members.find(m => m.userId.toString() === userId);
    if (member?.role !== 'admin') {
      return res.status(403).json({ message: 'Только администратор может изменять название' });
    }

    family.name = name.trim();
    await family.save();

    res.json({ message: 'Название обновлено', family });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить семью (только админ, удаляет все семейные продукты)
export const deleteFamily = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const family = await Family.findOne({ 'members.userId': userId });
    if (!family) {
      return res.status(404).json({ message: 'Семья не найдена' });
    }

    const member = family.members.find(m => m.userId.toString() === userId);
    if (member?.role !== 'admin') {
      return res.status(403).json({ message: 'Только администратор может удалить семью' });
    }

    // Удаляем все продукты, принадлежащие этой семье
    await Product.deleteMany({ ownerType: 'family', ownerId: family._id });
    // Удаляем саму семью
    await Family.findByIdAndDelete(family._id);

    res.json({ message: 'Семья и все семейные продукты удалены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};