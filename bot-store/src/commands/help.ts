import type { Context } from 'grammy';

export async function handleHelp(ctx: Context): Promise<void> {
  const helpText =
    `📖 <b>Imora Do‘kon Boti — Buyruqlar Qo‘llanmasi</b>\n\n` +
    `🔹 <b>Asosiy buyruqlar:</b>\n` +
    `• /start — Botni ishga tushirish va menyuni ochish\n` +
    `• /products — Barcha mahsulotlar ro‘yxatini ko‘rish\n` +
    `• /search &lt;nomi&gt; — Mahsulotni nomi bo‘yicha qidirish\n` +
    `• /price &lt;id&gt; &lt;narx&gt; — Tezkor narx o‘zgartirish (masalan: <code>/price prod-101 260000</code>)\n` +
    `• /orders — Kelgan va faol buyurtmalar ro‘yxati\n` +
    `• /stats — Savdo va do‘kon statistikasi\n` +
    `• /profile — Do‘kon ma'lumotlari\n` +
    `• /help — Ushbu yordam oynasi\n\n` +
    `💡 <i>Tugmalar orqali ham barcha amallarni oson bajarishingiz mumkin.</i>`;

  await ctx.reply(helpText, { parse_mode: 'HTML' });
}
