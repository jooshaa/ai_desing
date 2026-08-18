import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { botApi } from '../services/apiClient';

export async function handleProducts(ctx: Context, query?: string): Promise<void> {
  const products = await botApi.getProducts(query);

  if (products.length === 0) {
    await ctx.reply(
      query
        ? `🔍 «${query}» so‘rovi bo‘yicha mahsulotlar topilmadi.`
        : "📦 Hozircha do'koningizda mahsulotlar mavjud emas."
    );
    return;
  }

  let text = `📦 <b>Do‘kon Mahsulotlari (${products.length} ta):</b>\n\n`;

  products.slice(0, 10).forEach((p, idx) => {
    const stockBadge = p.price?.inStock ? '✅ Omborda bor' : '❌ Tugagan';
    const priceFormatted = (p.price?.price || 0).toLocaleString();
    text +=
      `<b>${idx + 1}. ${p.name}</b>\n` +
      `🆔 Kod: <code>${p.id}</code>\n` +
      `💰 Narx: <b>${priceFormatted} UZS</b> / ${p.unit}\n` +
      `📦 Holat: ${stockBadge}\n\n`;
  });

  const keyboard = new InlineKeyboard();
  products.slice(0, 5).forEach((p) => {
    keyboard
      .text(`✏️ ${p.name.slice(0, 18)}...`, `select_prod_${p.id}`)
      .row();
  });

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}
