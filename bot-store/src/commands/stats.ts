import type { Context } from 'grammy';
import { botApi } from '../services/apiClient';

export async function handleStats(ctx: Context): Promise<void> {
  const [products, orders, store] = await Promise.all([
    botApi.getProducts(),
    botApi.getOrders(),
    botApi.getStoreProfile()
  ]);

  const activeProds = products.filter((p) => p.isActive).length;
  const inStockProds = products.filter((p) => p.price?.inStock).length;
  const newOrders = orders.filter((o) => o.status === 'NEW').length;
  const totalRev = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const message =
    `📊 <b>Do‘kon Statistikasi — ${store.name}</b>\n\n` +
    `📦 <b>Mahsulotlar:</b>\n` +
    `• Jami: <b>${products.length} ta</b>\n` +
    `• Omborda bor: <b>${inStockProds} ta</b>\n` +
    `• Faol ko‘rsatilayotgan: <b>${activeProds} ta</b>\n\n` +
    `🛒 <b>Buyurtmalar:</b>\n` +
    `• Jami: <b>${orders.length} ta</b>\n` +
    `• Yangi (kutilayotgan): <b>${newOrders} ta</b>\n\n` +
    `💰 <b>Umumiy Savdo:</b> <b>${totalRev.toLocaleString()} UZS</b>\n` +
    `⚡ <i>Tizim real vaqt rejimida faoliyat yuritmoqda.</i>`;

  await ctx.reply(message, { parse_mode: 'HTML' });
}
