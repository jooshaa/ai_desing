import type { Bot } from 'grammy';
import { handleStart } from './start';
import { handleHelp } from './help';
import { handleProducts } from './products';
import { handlePriceCommand, handlePriceProductSelection } from './price';
import { handleOrders, handleOrderDetails } from './orders';
import { handleStats } from './stats';
import { handleProfile } from './profile';
import { botApi } from '../services/apiClient';
import type { OrderStatus } from '@imora/shared-types';

export function registerCommands(bot: Bot): void {
  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('products', async (ctx) => handleProducts(ctx));
  bot.command('search', async (ctx) => {
    const text = ctx.message?.text || '';
    const query = text.replace('/search', '').trim();
    await handleProducts(ctx, query);
  });
  bot.command('price', handlePriceCommand);
  bot.command('orders', handleOrders);
  bot.command('stats', handleStats);
  bot.command('profile', handleProfile);

  // Reply Keyboard text taps
  bot.hears('📦 Mahsulotlar', async (ctx) => handleProducts(ctx));
  bot.hears('🛒 Buyurtmalar', handleOrders);
  bot.hears('💰 Narx yangilash', handlePriceCommand);
  bot.hears('📊 Statistika', handleStats);
  bot.hears('🏪 Do‘kon profili', handleProfile);
  bot.hears('❓ Yordam', handleHelp);

  // Callback Queries for interactive Inline buttons
  bot.callbackQuery(/^select_prod_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    await ctx.answerCallbackQuery();
    await handlePriceProductSelection(ctx, productId);
  });

  bot.callbackQuery(/^edit_price_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    await ctx.answerCallbackQuery();
    await handlePriceProductSelection(ctx, productId);
  });

  bot.callbackQuery(/^set_price_(.+)_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    const newPrice = Number(ctx.match[2]);
    const updated = await botApi.updateProductPrice(productId, newPrice);
    await ctx.answerCallbackQuery({ text: 'Narx yangilandi!' });
    if (updated) {
      await ctx.reply(
        `✅ <b>Narx o‘zgartirildi!</b>\n` +
        `📦 ${updated.name}: <b>${newPrice.toLocaleString()} UZS</b>`,
        { parse_mode: 'HTML' }
      );
    }
  });

  bot.callbackQuery(/^toggle_stock_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    const updated = await botApi.toggleProductStock(productId);
    await ctx.answerCallbackQuery({ text: 'Ombor holati o‘zgardi' });
    if (updated) {
      await ctx.reply(
        `🔄 <b>Zaxira holati o‘zgardi!</b>\n` +
        `📦 ${updated.name}: ${updated.price?.inStock ? '✅ Omborda bor' : '❌ Tugagan'}`,
        { parse_mode: 'HTML' }
      );
    }
  });

  bot.callbackQuery(/^view_order_(.+)$/, async (ctx) => {
    const orderId = ctx.match[1];
    await ctx.answerCallbackQuery();
    await handleOrderDetails(ctx, orderId);
  });

  bot.callbackQuery(/^order_status_(.+)_(.+)$/, async (ctx) => {
    const orderId = ctx.match[1];
    const newStatus = ctx.match[2] as OrderStatus;
    const updated = await botApi.updateOrderStatus(orderId, newStatus);
    await ctx.answerCallbackQuery({ text: `Buyurtma: ${newStatus}` });
    if (updated) {
      await ctx.reply(
        `⚡ <b>Buyurtma #${updated.id.slice(-4).toUpperCase()} yangilandi!</b>\n` +
        `Yangi holat: <code>${newStatus}</code>`,
        { parse_mode: 'HTML' }
      );
    }
  });

  bot.callbackQuery('back_to_products', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleProducts(ctx);
  });

  bot.callbackQuery('back_to_orders', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleOrders(ctx);
  });
}
