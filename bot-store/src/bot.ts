import { Bot } from 'grammy';
import { registerCommands } from './commands';

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // Global Error Handler
  bot.catch((err) => {
    console.error('[bot-store] Error in bot execution:', err);
  });

  registerCommands(bot);
  return bot;
}
