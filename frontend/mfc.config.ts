// config/mfc.config.ts
export const MFC_CONFIG = {
 
  officialUsername: 'mfc_oficial', 
  
};

// Функция для проверки, является ли пользователь представителем МФЦ
export const isMfcUser = (username?: string): boolean => {
  if (!username) return false;
  return username === MFC_CONFIG.officialUsername;
};