import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { botApi } from '../services/apiClient';
import type { OrderStatus } from '@imora/shared-types';

export async function handleOrders(ctx: Context): Promise<void> {
  const orders = await botApi.getOrders();

  if (orders.length === 0) {
    await ctx.reply("🛒 Hozircha do'koningizga buyurtmalar kelib tushmagan.");
    return;
  }

  const newOrders = orders.filter((o) => o.status === 'NEW');
  const activeOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'DELIVERING'].includes(o.status));

  let text = `🛒 <b>Do‘kon Buyurtmalari:</b>\n\n`;

  if (newOrders.length > 0) {
    text += `🔔 <b>YANGI BUYURTMALAR (${newOrders.length} ta):</b>\n`;
    newOrders.forEach((o) => {
      text +=
        `• <b>#${o.id.slice(-4).toUpperCase()}</b> — ${o.total.toLocaleString()} UZS\n` +
        `  ${o.items.map((i) => i.productNameSnapshot).join(', ')}\n\n`;
    });
  }

  if (activeOrders.length > 0) {
    text += `⚙️ <b>Jarayondagi buyurtmalar (${activeOrders.length} ta):</b>\n`;
    activeOrders.forEach((o) => {
      text += `• <b>#${o.id.slice(-4).toUpperCase()}</b> [${o.status}] — ${o.total.toLocaleString()} UZS\n`;
    });
  }

  const keyboard = new InlineKeyboard();
  orders.slice(0, 5).forEach((o) => {
    keyboard
      .text(`📋 Buyurtma #${o.id.slice(-4).toUpperCase()} (${o.status})`, `view_order_${o.id}`)
      .row();
  });

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

export async function handleOrderDetails(ctx: Context, orderId: string): Promise<void> {
  const order = await botApi.getOrderById(orderId);
  if (!order) {
    await ctx.reply('❌ Buyurtma topilmadi.');
    return;
  }

  let itemsText = '';
  order.items.forEach((item, i) => {
    itemsText += `${i + 1}. <b>${item.productNameSnapshot}</b>\n   ${item.qty} x ${item.price.toLocaleString()} = <b>${(item.qty * item.price).toLocaleString()} UZS</b>\n`;
  });

  const message =
    `📋 <b>Buyurtma #${order.id.slice(-4).toUpperCase()}</b>\n` +
    `⚡ <b>Holat:</b> <code>${order.status}</code>\n` +
    `🕒 <b>Vaqt:</b> ${new Date(order.createdAt).toLocaleTimeString('uz-UZ')}\n\n` +
    `📦 <b>Mahsulotlar:</b>\n${itemsText}\n` +
    `💰 <b>Jami summa:</b> <b>${order.total.toLocaleString()} UZS</b>\n` +
    (order.note ? `💬 <b>Izoh:</b> <i>«${order.note}»</i>\n\n` : '\n') +
    `Holatni o‘zgartirish uchun tugmani bosing:`;

  const keyboard = new InlineKeyboard();

  if (order.status === 'NEW') {
    keyboard
      .text('✅ Qabul qilish (CONFIRMED)', `order_status_${order.id}_CONFIRMED`)
      .row()
      .text('❌ Rad etish (CANCELLED)', `order_status_${order.id}_CANCELLED`);
  } else if (order.status === 'CONFIRMED') {
    keyboard
      .text('📦 Tayyorlash (PREPARING)', `order_status_${order.id}_PREPARING`)
      .row()
      .text('❌ Bekor qilish', `order_status_${order.id}_CANCELLED`);
  } else if (order.status === 'PREPARING') {
    keyboard
      .text('🚚 Yo‘lga chiqarish (DELIVERING)', `order_status_${order.id}_DELIVERING`)
      .row();
  } else if (order.status === 'DELIVERING') {
    keyboard
      .text('🎉 Yetkazildi (DELIVERED)', `order_status_${order.id}_DELIVERED`)
      .row();
  }

  keyboard.text('🔙 Buyurtmalar ro‘yxati', 'back_to_orders');

  await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}
