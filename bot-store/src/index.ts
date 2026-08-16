import { createBot } from './bot';

async function main(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('[bot-store] TELEGRAM_BOT_TOKEN is missing; exiting without polling');
    return;
  }
  const bot = createBot(token);
  await bot.start();
}

void main();
