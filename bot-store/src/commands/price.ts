import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { botApi } from '../services/apiClient';

export async function handlePriceCommand(ctx: Context): Promise<void> {
  const text = ctx.message?.text || '';
  const parts = text.trim().split(/\s+/);

  // Format: /price <productId> <newPrice>
  if (parts.length >= 3) {
    const productId = parts[1];
    const newPrice = Number(parts[2].replace(/[^0-9]/g, ''));

    if (isNaN(newPrice) || newPrice <= 0) {
      await ctx.reply("❌ Noto'g'ri narx formati. Masalan: <code>/price prod-101 250000</code>", {
        parse_mode: 'HTML'
      });
      return;
    }

    const updated = await botApi.updateProductPrice(productId, newPrice);
    if (!updated) {
      await ctx.reply(`❌ <code>${productId}</code> ID li mahsulot topilmadi.`, {
        parse_mode: 'HTML'
      });
      return;
    }

    await ctx.reply(
      `✅ <b>Narx muvaffaqiyatli yangilandi! (AC-04)</b>\n\n` +
      `📦 <b>Mahsulot:</b> ${updated.name}\n` +
      `💰 <b>Yangi narx:</b> ${newPrice.toLocaleString()} UZS / ${updated.unit}\n` +
      `⚡ Imora katalogida darhol yangilandi.`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  // If no args provided, show product selection keyboard
  const products = await botApi.getProducts();
  const keyboard = new InlineKeyboard();

  products.slice(0, 8).forEach((p) => {
    keyboard
      .text(`💰 ${p.name.slice(0, 20)} (${(p.price?.price || 0).toLocaleString()} UZS)`, `edit_price_${p.id}`)
      .row();
  });

  await ctx.reply(
    `💰 <b>Tezkor Narx Yangilash (AC-04)</b>\n\n` +
    `Narxni o‘zgartirish uchun mahsulotni tanlang yoki to‘g‘ridan-to‘g‘ri buyruq yuboring:\n` +
    `<code>/price &lt;mahsulot_id&gt; &lt;yangi_narx&gt;</code>\n\n` +
    `<i>Masalan:</i> <code>/price prod-101 260000</code>`,
    {
      parse_mode: 'HTML',
      reply_markup: keyboard
    }
  );
}

export async function handlePriceProductSelection(ctx: Context, productId: string): Promise<void> {
  const prod = await botApi.getProductById(productId);
  if (!prod) {
    await ctx.reply('❌ Mahsulot topilmadi.');
    return;
  }

  const currentPrice = prod.price?.price || 0;
  const keyboard = new InlineKeyboard()
    .text(`+5% (${Math.round(currentPrice * 1.05).toLocaleString()})`, `set_price_${prod.id}_${Math.round(currentPrice * 1.05)}`)
    .text(`+10% (${Math.round(currentPrice * 1.1).toLocaleString()})`, `set_price_${prod.id}_${Math.round(currentPrice * 1.1)}`)
    .row()
    .text(`-5% (${Math.round(currentPrice * 0.95).toLocaleString()})`, `set_price_${prod.id}_${Math.round(currentPrice * 0.95)}`)
    .text(`-10% (${Math.round(currentPrice * 0.9).toLocaleString()})`, `set_price_${prod.id}_${Math.round(currentPrice * 0.9)}`)
    .row()
    .text(prod.price?.inStock ? '❌ Zaxiradan chiqarish' : '✅ Omborda bor deb belgilash', `toggle_stock_${prod.id}`)
    .row()
    .text('🔙 Orqaga', 'back_to_products');

  await ctx.reply(
    `📦 <b>Mahsulot:</b> ${prod.name}\n` +
    `🆔 <b>ID:</b> <code>${prod.id}</code>\n` +
    `💰 <b>Joriy narx:</b> ${currentPrice.toLocaleString()} UZS / ${prod.unit}\n` +
    `📦 <b>Ombor holati:</b> ${prod.price?.inStock ? '✅ Omborda bor' : '❌ Tugagan'}\n\n` +
    `Yangi narxni tanlang yoki quyidagicha yuboring:\n` +
    `<code>/price ${prod.id} &lt;yangi_narx&gt;</code>`,
    {
      parse_mode: 'HTML',
      reply_markup: keyboard
    }
  );
}
