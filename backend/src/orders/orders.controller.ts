import { Controller, Get, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('cart')
  cart() {
    return this.orders.getCart();
  }

  @Get('orders')
  list() {
    return this.orders.listMine();
  }

  @Get('products/:id/offers')
  offers(@Param('id') id: string, @Query('sort') sort?: 'price' | 'distance') {
    return this.orders.compareOffers(id, sort);
  }
}
