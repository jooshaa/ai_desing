import type { ProductDto, OrderDto, StoreDto, OrderStatus } from '@imora/shared-types';

export interface BotStoreState {
  store: StoreDto;
  products: ProductDto[];
  orders: OrderDto[];
  chatLinkedStores: Record<number, string>;
}

export const initialBotState: BotStoreState = {
  store: {
    id: 'store-imora-01',
    name: 'Master Stroy Grand',
    ownerUserId: 'user-store-01',
    phone: '+998 90 123 45 67',
    region: 'Toshkent shahri',
    districts: ['Yunusobod', 'Shayxontohur', 'Chilonzor', 'Mirzo Ulug‘bek'],
    status: 'active',
    logoUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=150&auto=format&fit=crop&q=80'
  },
  products: [
    {
      id: 'prod-101',
      storeId: 'store-imora-01',
      categoryId: 'cat-1',
      name: 'Flizelinli Premium Oboy "Venetsiya Klassik"',
      description: 'Yuviladigan, quyosh nuriga chidamli, zamonaviy bej rangli teksturali oboy.',
      unit: 'rulon',
      imageUrls: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80'],
      attributes: { material: 'Flizelin', rang: 'Och bej' },
      isActive: true,
      price: {
        id: 'price-101',
        price: 245000,
        currency: 'UZS',
        validFrom: new Date().toISOString(),
        inStock: true
      }
    },
    {
      id: 'prod-102',
      storeId: 'store-imora-01',
      categoryId: 'cat-2',
      name: 'Laminat Egger 33-sinf 8mm "Dub Bardolino"',
      description: 'Suvga va tirnalishga chidamli 33-sinf nemis laminati.',
      unit: 'm2',
      imageUrls: ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80'],
      attributes: { sinf: '33', qalinlik: '8 mm' },
      isActive: true,
      price: {
        id: 'price-102',
        price: 165000,
        currency: 'UZS',
        validFrom: new Date().toISOString(),
        inStock: true
      }
    },
    {
      id: 'prod-103',
      storeId: 'store-imora-01',
      categoryId: 'cat-3',
      name: 'Kafel Keraplast Granit "Royal Statuario 60x120"',
      description: 'Katta formatli marmar naqshli silliqlangan keramogranit.',
      unit: 'm2',
      imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'],
      attributes: { olcham: '60x120 sm' },
      isActive: true,
      price: {
        id: 'price-103',
        price: 285000,
        currency: 'UZS',
        validFrom: new Date().toISOString(),
        inStock: true
      }
    },
    {
      id: 'prod-104',
      storeId: 'store-imora-01',
      categoryId: 'cat-4',
      name: "Tikkurila Harmony Emulsiya Bo'yog'i (9L)",
      description: 'Chuqur matli ipaksimon interyer bo‘yog‘i.',
      unit: 'dona',
      imageUrls: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'],
      attributes: { hajmi: '9 Litr' },
      isActive: true,
      price: {
        id: 'price-104',
        price: 680000,
        currency: 'UZS',
        validFrom: new Date().toISOString(),
        inStock: true
      }
    },
    {
      id: 'prod-105',
      storeId: 'store-imora-01',
      categoryId: 'cat-5',
      name: 'Grohe BauEdge Dush va Vanna Smesiteli',
      description: 'Xrom qoplamali, sopol kartrijli Germaniya brendi smesiteli.',
      unit: 'komplekt',
      imageUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'],
      attributes: { brend: 'Grohe' },
      isActive: true,
      price: {
        id: 'price-105',
        price: 1150000,
        currency: 'UZS',
        validFrom: new Date().toISOString(),
        inStock: false
      }
    }
  ],
  orders: [
    {
      id: 'ord-9021',
      userId: 'usr-client-01',
      storeId: 'store-imora-01',
      addressId: 'addr-01',
      status: 'NEW',
      total: 1225000,
      note: 'Eshik tagigacha olib chiqib berish kerak, 4-qavat lift bor.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      items: [
        {
          id: 'item-01',
          productId: 'prod-101',
          qty: 5,
          price: 245000,
          productNameSnapshot: 'Flizelinli Premium Oboy "Venetsiya Klassik"'
        }
      ]
    },
    {
      id: 'ord-9020',
      userId: 'usr-client-02',
      storeId: 'store-imora-01',
      addressId: 'addr-02',
      status: 'CONFIRMED',
      total: 3300000,
      note: 'Iltimos kechki 18:00 dan keyin yetkazilsin.',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      items: [
        {
          id: 'item-02',
          productId: 'prod-102',
          qty: 20,
          price: 165000,
          productNameSnapshot: 'Laminat Egger 33-sinf 8mm "Dub Bardolino"'
        }
      ]
    }
  ],
  chatLinkedStores: {}
};
