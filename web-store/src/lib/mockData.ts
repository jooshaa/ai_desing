import { CategoryDto, ProductDto, StoreDto, OrderDto, UserDto } from './types';

export const INITIAL_CATEGORIES: CategoryDto[] = [
  {
    id: 'cat-1',
    parentId: null,
    nameUz: 'Devor qoplamalari va Oboylar',
    nameRu: 'Настенные покрытия и Обои',
    slug: 'wall-coverings',
    sort: 1,
    icon: 'wallpaper'
  },
  {
    id: 'cat-2',
    parentId: null,
    nameUz: 'Pol qoplamalari (Laminat, Parket)',
    nameRu: 'Напольные покрытия (Ламинат, Паркет)',
    slug: 'floor-coverings',
    sort: 2,
    icon: 'layers'
  },
  {
    id: 'cat-3',
    parentId: null,
    nameUz: 'Keramik plitka va Kafel',
    nameRu: 'Керамическая плитка и Кафель',
    slug: 'tiles',
    sort: 3,
    icon: 'grid'
  },
  {
    id: 'cat-4',
    parentId: null,
    nameUz: "Bo'yoqlar va Gruntovkalar",
    nameRu: 'Краски и Грунтовки',
    slug: 'paints',
    sort: 4,
    icon: 'paint'
  },
  {
    id: 'cat-5',
    parentId: null,
    nameUz: 'Santexnika va Vanna jihozlari',
    nameRu: 'Сантехника и Оборудование',
    slug: 'sanitary',
    sort: 5,
    icon: 'droplet'
  },
  {
    id: 'cat-6',
    parentId: null,
    nameUz: 'Yoritish va Elektr jihozlari',
    nameRu: 'Освещение и Электрика',
    slug: 'lighting',
    sort: 6,
    icon: 'sun'
  }
];

export const INITIAL_STORE: StoreDto = {
  id: 'store-imora-01',
  name: 'Master Stroy Grand',
  ownerUserId: 'user-store-01',
  phone: '+998 90 123 45 67',
  region: 'Toshkent shahri',
  districts: ['Yunusobod', 'Shayxontohur', 'Chilonzor', 'Mirzo Ulug‘bek'],
  status: 'active',
  logoUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_USER: UserDto = {
  id: 'user-store-01',
  phone: '+998 90 123 45 67',
  name: 'Otabek Nurmuhammedov',
  role: 'store',
  isActive: true,
  createdAt: new Date().toISOString()
};

export const INITIAL_PRODUCTS: ProductDto[] = [
  {
    id: 'prod-101',
    storeId: 'store-imora-01',
    categoryId: 'cat-1',
    name: 'Flizelinli Premium Oboy "Venetsiya Klassik"',
    description: 'Yuviladigan, quyosh nuriga chidamli, zamonaviy bej rangli teksturali oboy. Yashash xonasi va yotoqxona uchun ideal.',
    unit: 'rulon',
    imageUrls: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80'
    ],
    attributes: {
      material: 'Flizelin',
      olcham: '1.06m x 10m',
      rang: 'Och bej',
      ishlab_chiqaruvchi: 'Germaniya'
    },
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
    description: 'Suvga va tirnalishga chidamli 33-sinf nemis laminati. 4 tomonlama faskali.',
    unit: 'm2',
    imageUrls: [
      'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80'
    ],
    attributes: {
      sinf: '33',
      qalinlik: '8 mm',
      faska: '4V',
      yuzasi: 'Matoviy yog‘och fakturasi'
    },
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
    description: 'Katta formatli marmar naqshli silliqlangan keramogranit. Devor va pol uchun.',
    unit: 'm2',
    imageUrls: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
    ],
    attributes: {
      olcham: '60x120 sm',
      yuzasi: 'Polirovkali oyna',
      qalinlik: '9 mm',
      turi: 'Keramogranit'
    },
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
    description: 'Chuqur matli ipaksimon interyer bo‘yog‘i. Yuvishga o‘ta chidamli, hidsiz va ekologik toza.',
    unit: 'dona',
    imageUrls: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
    ],
    attributes: {
      hajmi: '9 Litr',
      yaltiroqlik: 'Chuqur mat',
      qoplash_maydoni: '80-100 m2'
    },
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
    description: 'Xrom qoplamali, sopol kartrijli Germaniya brendi smesiteli. 5 yil kafolat.',
    unit: 'komplekt',
    imageUrls: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
    ],
    attributes: {
      brend: 'Grohe',
      qoplama: 'StarLight Chrome',
      kafolat: '5 yil'
    },
    isActive: true,
    price: {
      id: 'price-105',
      price: 1150000,
      currency: 'UZS',
      validFrom: new Date().toISOString(),
      inStock: false
    }
  },
  {
    id: 'prod-106',
    storeId: 'store-imora-01',
    categoryId: 'cat-6',
    name: 'Trek Yoritgich LED Magnitli Tizim 12W 4000K',
    description: 'Zamonaviy minimalizm uslubidagi magnitli trek chirog‘i. Neytral oq yorug‘lik.',
    unit: 'dona',
    imageUrls: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
    ],
    attributes: {
      quvvat: '12W',
      rang_harorati: '4000K (Neytral)',
      kuchlanish: 'DC 48V'
    },
    isActive: true,
    price: {
      id: 'price-106',
      price: 145000,
      currency: 'UZS',
      validFrom: new Date().toISOString(),
      inStock: true
    }
  }
];

export const INITIAL_ORDERS: OrderDto[] = [
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
  },
  {
    id: 'ord-9019',
    userId: 'usr-client-03',
    storeId: 'store-imora-01',
    addressId: 'addr-03',
    status: 'PREPARING',
    total: 5700000,
    note: 'Plitkalar sinib ketmasligi uchun ehtiyotkorlik bilan qadoqlansin.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    items: [
      {
        id: 'item-03',
        productId: 'prod-103',
        qty: 20,
        price: 285000,
        productNameSnapshot: 'Kafel Keraplast Granit "Royal Statuario 60x120"'
      }
    ]
  },
  {
    id: 'ord-9018',
    userId: 'usr-client-04',
    storeId: 'store-imora-01',
    addressId: 'addr-04',
    status: 'DELIVERING',
    total: 1360000,
    note: 'Haydovchi yetib borganda qo‘ng‘iroq qilsin (+998 97 765 43 21).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    items: [
      {
        id: 'item-04',
        productId: 'prod-104',
        qty: 2,
        price: 680000,
        productNameSnapshot: "Tikkurila Harmony Emulsiya Bo'yog'i (9L)"
      }
    ]
  },
  {
    id: 'ord-9017',
    userId: 'usr-client-05',
    storeId: 'store-imora-01',
    addressId: 'addr-05',
    status: 'DELIVERED',
    total: 1450000,
    note: 'Mijoz to‘liq qabul qilib oldi.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    items: [
      {
        id: 'item-05',
        productId: 'prod-106',
        qty: 10,
        price: 145000,
        productNameSnapshot: 'Trek Yoritgich LED Magnitli Tizim 12W 4000K'
      }
    ]
  }
];

export const UZBEK_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Farg‘ona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Buxoro viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Qoraqalpog‘iston Respublikasi'
];

export const REGION_DISTRICTS: Record<string, string[]> = {
  'Toshkent shahri': [
    'Yunusobod', 'Shayxontohur', 'Chilonzor', 'Mirzo Ulug‘bek',
    'Yakkasaroy', 'Mirobod', 'Yashnobod', 'Olmazor',
    'Uchtepa', 'Sergeli', 'Bektemir', 'Yangihayot'
  ],
  'Samarqand viloyati': [
    'Samarqand shahri', 'Pastdarg‘om', 'Toyloq', 'Urgut',
    'Bulung‘ur', 'Jomboy', 'Payariq', 'Ishtixon'
  ],
  'Farg‘ona viloyati': [
    'Farg‘ona shahri', 'Marg‘ilon shahri', 'Qo‘qon shahri', 'Quvasoy',
    'Beshariq', 'Bag‘dod', 'Oltiariq', 'Rishton'
  ]
};
