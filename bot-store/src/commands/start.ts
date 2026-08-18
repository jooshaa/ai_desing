import { Keyboard, InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { botApi } from '../services/apiClient';

export async function handleStart(ctx: Context): Promise<void> {
  const text = ctx.message?.text || '';
  const parts = text.split(' ');
  const authPayload = parts[1];

  if (authPayload && ctx.chat?.id) {
    const storeId = authPayload.replace('auth_', '');
    botApi.linkChatToStore(ctx.chat.id, storeId);
  }

  const store = await botApi.getStoreProfile();

  const mainKeyboard = new Keyboard()
    .text('📦 Mahsulotlar')
    .text('🛒 Buyurtmalar')
    .row()
    .text('💰 Narx yangilash')
    .text('📊 Statistika')
    .row()
    .text('🏪 Do‘kon profili')
    .text('❓ Yordam')
    .resized();

  const welcomeMessage =
    `🏛 <b>Imora Do‘kon Botiga xush kelibsiz!</b>\n\n` +
    `🏪 <b>Do‘kon:</b> ${store.name}\n` +
    `📍 <b>Hudud:</b> ${store.region}\n` +
    `📞 <b>Telefon:</b> ${store.phone}\n` +
    `⚡ <b>Holat:</b> Faol (Online)\n\n` +
    `Bu bot orqali siz:\n` +
    `• Mahsulot narxlarini 1 soniyada yangilashingiz (AC-04)\n` +
    `• Yangi buyurtmalarni qabul qilishingiz va holatini o‘zgartirishingiz mumkin (AC-06).\n\n` +
    `Quyidagi menyudan kerakli bo‘limni tanlang:`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'HTML',
    reply_markup: mainKeyboard
  });
}
