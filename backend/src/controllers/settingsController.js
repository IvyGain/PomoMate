import prisma from '../config/database.js';

// Get user settings
export const getSettings = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        focusDuration: true,
        breakDuration: true,
        longBreakDuration: true,
        autoStartBreak: true,
        autoStartFocus: true,
        soundEnabled: true,
        vibrationEnabled: true,
        theme: true,
      },
    });

    res.json({ settings: user });
  } catch (error) {
    next(error);
  }
};

// Update user settings
export const updateSettings = async (req, res, next) => {
  try {
    const {
      focusDuration,
      breakDuration,
      longBreakDuration,
      autoStartBreak,
      autoStartFocus,
      soundEnabled,
      vibrationEnabled,
      theme,
    } = req.body;

    // Validate durations
    if (focusDuration && (focusDuration < 1 || focusDuration > 120)) {
      return res.status(400).json({ error: 'Focus duration must be between 1 and 120 minutes' });
    }
    if (breakDuration && (breakDuration < 1 || breakDuration > 30)) {
      return res.status(400).json({ error: 'Break duration must be between 1 and 30 minutes' });
    }
    if (longBreakDuration && (longBreakDuration < 1 || longBreakDuration > 60)) {
      return res.status(400).json({ error: 'Long break duration must be between 1 and 60 minutes' });
    }

    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme' });
    }

    // Build update object
    const updateData = {};
    if (focusDuration !== undefined) updateData.focusDuration = focusDuration;
    if (breakDuration !== undefined) updateData.breakDuration = breakDuration;
    if (longBreakDuration !== undefined) updateData.longBreakDuration = longBreakDuration;
    if (autoStartBreak !== undefined) updateData.autoStartBreak = autoStartBreak;
    if (autoStartFocus !== undefined) updateData.autoStartFocus = autoStartFocus;
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled;
    if (vibrationEnabled !== undefined) updateData.vibrationEnabled = vibrationEnabled;
    if (theme !== undefined) updateData.theme = theme;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        focusDuration: true,
        breakDuration: true,
        longBreakDuration: true,
        autoStartBreak: true,
        autoStartFocus: true,
        soundEnabled: true,
        vibrationEnabled: true,
        theme: true,
      },
    });

    res.json({ 
      message: 'Settings updated',
      settings: updatedUser, 
    });
  } catch (error) {
    next(error);
  }
};