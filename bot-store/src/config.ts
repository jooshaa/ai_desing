export interface BotConfig {
  token: string;
  apiUrl: string;
  defaultStoreId: string;
}

export function loadConfig(): BotConfig {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    defaultStoreId: process.env.STORE_ID || 'store-imora-01'
  };
}
