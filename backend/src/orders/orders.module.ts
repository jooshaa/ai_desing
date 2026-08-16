import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart/cart.entity';
import { CartItem } from './cart/cart-item.entity';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { OrderStatusHistory } from './order/order-status-history.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Order, OrderItem, OrderStatusHistory])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
