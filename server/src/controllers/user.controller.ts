import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const {
      learnedLanguages,
      xp,
      firstName,
      lastName,
      dateOfBirth,
      skillLevel,
      email,
    } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });

    if (firstName !== undefined) {
      user.firstName = String(firstName).trim() || undefined;
    }

    if (lastName !== undefined) {
      user.lastName = String(lastName).trim() || undefined;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Bu email artıq istifadə olunur' });
      }
      user.email = normalizedEmail;
    }

    if (dateOfBirth !== undefined) {
      const parsed = new Date(dateOfBirth);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Tarix formatı yanlışdır' });
      }
      user.dateOfBirth = parsed;
    }

    if (skillLevel !== undefined) {
      const allowed = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (!allowed.includes(skillLevel)) {
        return res.status(400).json({ success: false, message: 'Skill level yanlışdır' });
      }
      user.skillLevel = skillLevel;
    }

    if (learnedLanguages !== undefined) {
      user.learnedLanguages = learnedLanguages;
    }
    if (typeof xp === 'number') {
      user.xp = xp;
    }

    await user.save();

    const safeUser = await User.findById(user._id).select('-password');

    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCharacter = async (req: AuthRequest, res: Response) => {
  try {
    const { gender, emotion, clothing, hairColor, skin, clothingColor, username } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });

    // Character fields güncəllə
    if (gender) user.character.gender = gender;
    if (emotion) user.character.emotion = emotion;
    if (clothing) user.character.clothing = clothing;
    if (hairColor) user.character.hairColor = hairColor;
    if (skin) user.character.skin = skin;
    if (clothingColor) user.character.clothingColor = clothingColor;
    if (username) {
      // Character username unikallığını yoxla
      const existingUser = await User.findOne({ 'character.username': username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Bu personaj adı artıq istifadə olunub' });
      }
      user.character.username = username;
    }

    await user.save();

    res.json({ success: true, data: user.character });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};