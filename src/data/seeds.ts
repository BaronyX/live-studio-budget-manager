import { Brand, Family, Fragrance, ProductCategory } from '@/types';

export const seedBrands: Brand[] = [
  { id: 'b1', name: 'Harmonia Perfume', slug: 'harmonia', is_active: true },
  { id: 'b2', name: 'Bloom Labs', slug: 'bloom', is_active: true },
  { id: 'b3', name: 'Noir Essence', slug: 'noir', is_active: false },
];

export const seedFamilies: Family[] = [
  { id: 'floral', slug: 'floral', name: 'Floral' },
  { id: 'citrus', slug: 'citrus', name: 'Citrus' },
  { id: 'woody', slug: 'woody', name: 'Woody' },
];

export const seedProducts: ProductCategory[] = [
  { id: 'shampoo', slug: 'shampoo', name: 'Shampoo' },
  { id: 'bodywash', slug: 'bodywash', name: 'Body Wash' },
  { id: 'lotion', slug: 'lotion', name: 'Lotion' },
  { id: 'detergent', slug: 'detergent', name: 'Detergent' },
];

export const seedFragrances: Fragrance[] = [
  {
    id: 'f1', brandSlug: 'harmonia', code: 'HP001', name: 'Harmonia Bloom',
    description: 'Floral fresh for daily care', imageUrl: '',
    isLLFFree: true, isAllergenFree: false, isSalesPush: true, isSPCInUse: true,
    referenceScents: ['Chanel Chance', 'Daisy'], status: 'active',
    suppliers: [
      {
        supplier: 'AromaX', tradeName: 'Bloom A1', leadTimeDays: 14,
        lastVerifiedAt: new Date(Date.now() - 1000*60*60*24*30*2).toISOString(),
        supplierStatus: 'active', isRecommended: true,
        tiers: [
          { moqKg: '5', basePriceTHBPerKg: '1200', enableExcise: false },
          { moqKg: '25', basePriceTHBPerKg: '1100', enableExcise: false }
        ]
      }
    ],
    pricing: { vatPercent: 7, excisePercent: 8.8, enableExcise: false },
    primaryFamilyId: 'floral', subfamilyIds: ['citrus'],
    fits: { shampoo: 'best', bodywash: 'good', lotion: 'good' }
  },
  {
    id: 'f2', brandSlug: 'bloom', code: 'BLM-007', name: 'Citrus Pop',
    description: 'Sparkling citrus for cleansing', imageUrl: '',
    isLLFFree: true, isAllergenFree: true, isSalesPush: false, isSPCInUse: false,
    referenceScents: ['CK One'], status: 'active',
    suppliers: [
      {
        supplier: 'Scentify', tradeName: 'C-POP 9', leadTimeDays: 21,
        lastVerifiedAt: new Date(Date.now() - 1000*60*60*24*30*7).toISOString(),
        supplierStatus: 'active', isRecommended: true,
        tiers: [
          { moqKg: '10', basePriceTHBPerKg: '950', enableExcise: true }
        ]
      }
    ],
    pricing: { vatPercent: 7, excisePercent: 8.8, enableExcise: true },
    primaryFamilyId: 'citrus', subfamilyIds: [],
    fits: { shampoo: 'good', bodywash: 'best', detergent: 'avoid' }
  },
  {
    id: 'f3', brandSlug: 'noir', code: 'NR-88', name: 'Noir Deep',
    description: 'Woody amber for premium', imageUrl: '',
    isLLFFree: false, isAllergenFree: false, isSalesPush: false, isSPCInUse: false,
    referenceScents: ['Sauvage'], status: 'inactive',
    suppliers: [],
    pricing: { vatPercent: 7, excisePercent: 8.8, enableExcise: false },
    primaryFamilyId: 'woody', subfamilyIds: [],
    fits: { lotion: 'good' }
  }
];