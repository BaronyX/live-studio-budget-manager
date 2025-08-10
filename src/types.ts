export type Role = 'sales' | 'rd' | 'admin';

export interface Brand { id: string; name: string; slug: string; is_active: boolean; }
export interface ReferenceMaster { id: string; brand_name?: string; code?: string|null; name: string; }
export interface SupplierTier { moqKg: string; basePriceTHBPerKg: string; enableExcise: boolean; }
export interface Supplier {
  id?: string; supplier: string; tradeName?: string; leadTimeDays: number;
  lastVerifiedAt: string; supplierStatus: 'active'|'stop'; isRecommended: boolean; tiers: SupplierTier[];
}
export interface Fits { [productId: string]: 'best'|'good'|'avoid'; }
export interface Fragrance {
  id: string; brandSlug: string; code: string; name: string; description?: string; imageUrl?: string;
  isLLFFree?: boolean; isAllergenFree?: boolean; isSalesPush?: boolean; isSPCInUse?: boolean;
  referenceScents: string[]; status: 'active'|'inactive';
  suppliers: Supplier[]; pricing?: { vatPercent: number; excisePercent: number; enableExcise: boolean; };
  primaryFamilyId: string|null; subfamilyIds: string[]; fits: Fits;
}
export interface Family { id: string; slug: string; name: string; }
export interface ProductCategory { id: string; slug: string; name: string; }

export interface SearchFilters {
  q?: string;
  familyId?: string | null;
  fit?: 'best'|'good'|'avoid'|null;
}