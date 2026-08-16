import type { Bot } from 'grammy';

export function registerCommands(bot: Bot): void {
  bot.command('start', async (ctx) => {
    await ctx.reply("Imora do'kon bot. Narx yangilash va buyurtmalar shu yerda.");
  });
  bot.command('help', async (ctx) => {
    await ctx.reply('/start — kirish\n/price — narx yangilash (MVP)\n/orders — yangi buyurtmalar');
  });
}
