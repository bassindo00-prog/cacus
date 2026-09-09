/**
 * Telegram WebApp Integration Helper
 * Provides seamless features when running inside Telegram Mini App
 */

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const initTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Set Header/Background colors to match CapCut dark purple theme
    if (tg.setHeaderColor) tg.setHeaderColor('#0b0c10');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#050608');
  }
};

export const triggerHaptic = (style = 'medium') => {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    return tg.initDataUnsafe.user;
  }
  return null;
};

export const sendDataToBot = (payload) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.sendData(typeof payload === 'string' ? payload : JSON.stringify(payload));
  }
};
