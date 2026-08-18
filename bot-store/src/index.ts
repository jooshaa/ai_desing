import { createBot } from './bot';
import { loadConfig } from './config';

async function main(): Promise<void> {
  const config = loadConfig();

  if (!config.token) {
    console.warn(
      '[bot-store] TELEGRAM_BOT_TOKEN is missing. Bot server initialized in idle mode (ready for polling once token is set in .env).'
    );
    return;
  }

  const bot = createBot(config.token);

  console.log('[bot-store] Starting Imora Store Telegram Bot polling...');

  // Graceful shutdown handling
  const stopRunner = () => {
    console.log('[bot-store] Stopping bot polling...');
    bot.stop();
  };

  process.once('SIGINT', stopRunner);
  process.once('SIGTERM', stopRunner);

  await bot.start();
}

void main();
