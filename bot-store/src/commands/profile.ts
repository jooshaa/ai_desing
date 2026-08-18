import type { Context } from 'grammy';
import { botApi } from '../services/apiClient';

export async function handleProfile(ctx: Context): Promise<void> {
  const store = await botApi.getStoreProfile();

  const message =
    `🏪 <b>Do‘kon Profili</b>\n\n` +
    `🏢 <b>Nomi:</b> ${store.name}\n` +
    `📞 <b>Telefon:</b> ${store.phone}\n` +
    `📍 <b>Hudud:</b> ${store.region}\n` +
    `🗺 <b>Tumanlar:</b> ${store.districts.join(', ')}\n` +
    `⚡ <b>Holat:</b> ${store.status.toUpperCase()}\n` +
    `🆔 <b>Do‘kon ID:</b> <code>${store.id}</code>\n\n` +
    `🌐 <b>Do‘kon veb paneli:</b> <code>http://localhost:3002</code>`;

  await ctx.reply(message, { parse_mode: 'HTML' });
}
