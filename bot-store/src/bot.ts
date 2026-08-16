import { Bot } from 'grammy';
import { registerCommands } from './commands';

export function createBot(token: string): Bot {
  const bot = new Bot(token);
  registerCommands(bot);
  return bot;
}
