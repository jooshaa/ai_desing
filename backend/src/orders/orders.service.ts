import { Injectable, NotImplementedException } from '@nestjs/common';
import type { CartDto, OfferDto, OrderDto } from '@imora/shared-types';

@Injectable()
export class OrdersService {
  getCart(): CartDto {
    throw new NotImplementedException('Cart not implemented');
  }

  listMine(): OrderDto[] {
    throw new NotImplementedException('Order list not implemented');
  }

  compareOffers(_productId: string, _sort?: 'price' | 'distance'): OfferDto[] {
    throw new NotImplementedException('Price compare not implemented');
  }
}
