// Mock data per il sistema di gestione coupon

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'archived';
  usageCount: number;
  maxUsage?: number;
  conditions?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalRedemptions: number;
  monthlyGrowth: number;
}

export const mockCoupons: Coupon[] = [
  {
    id: '1',
    title: 'Benvenuto Nuovo Cliente',
    description: 'Sconto di benvenuto per i nuovi clienti su tutti i piatti principali',
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    expiryDate: '2024-12-31',
    status: 'active',
    usageCount: 45,
    maxUsage: 100,
    conditions: 'Valido solo per primi acquisti, minimo 25€',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Happy Hour Speciale',
    description: 'Offerta speciale per l\'happy hour dalle 17:00 alle 19:00',
    code: 'HAPPY5',
    discountType: 'fixed',
    discountValue: 5,
    expiryDate: '2024-11-30',
    status: 'active',
    usageCount: 78,
    maxUsage: 200,
    conditions: 'Valido dalle 17:00 alle 19:00, solo bevande',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    title: 'Weekend Gourmet',
    description: 'Sconto weekend su menù degustazione e piatti gourmet',
    code: 'WEEKEND15',
    discountType: 'percentage',
    discountValue: 15,
    expiryDate: '2024-10-15',
    status: 'expired',
    usageCount: 23,
    maxUsage: 50,
    conditions: 'Solo sabato e domenica, menu degustazione',
    createdAt: '2024-01-10'
  },
  {
    id: '4',
    title: 'Pranzo Business',
    description: 'Offerta dedicata ai pranzi di lavoro con menu fisso',
    code: 'BUSINESS10',
    discountType: 'fixed',
    discountValue: 10,
    expiryDate: '2024-12-15',
    status: 'active',
    usageCount: 156,
    maxUsage: 300,
    conditions: 'Lunedì-Venerdì 12:00-15:00, menu business',
    createdAt: '2024-03-05'
  },
  {
    id: '5',
    title: 'Estate Fresca',
    description: 'Sconto su piatti freddi e bevande rinfrescanti',
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    expiryDate: '2024-09-30',
    status: 'expired',
    usageCount: 89,
    maxUsage: 150,
    conditions: 'Solo piatti freddi e bevande, periodo estivo',
    createdAt: '2024-06-01'
  },
  {
    id: '6',
    title: 'Coppia Romantica',
    description: 'Offerta speciale per cene romantiche per due persone',
    code: 'LOVE30',
    discountType: 'percentage',
    discountValue: 30,
    expiryDate: '2025-02-14',
    status: 'active',
    usageCount: 12,
    maxUsage: 80,
    conditions: 'Solo cene, minimo 2 persone, menu fisso romantico',
    createdAt: '2024-10-01'
  }
];

export const mockStats: DashboardStats = {
  totalCoupons: 6,
  activeCoupons: 4,
  expiredCoupons: 2,
  totalRedemptions: 403,
  monthlyGrowth: 15.8
};

export const menuItems = [
  {
    id: '1',
    name: 'Pollo alle Spezie',
    price: 18.50,
    image: '/src/assets/dish-chicken.jpg',
    category: 'Secondi Piatti'
  },
  {
    id: '2',
    name: 'Kebab di Agnello',
    price: 22.00,
    image: '/src/assets/dish-kebab.jpg',
    category: 'Secondi Piatti'
  },
  {
    id: '3',
    name: 'Insalata Mediterranea',
    price: 12.50,
    image: '/src/assets/dish-salad.jpg',
    category: 'Primi Piatti'
  }
];