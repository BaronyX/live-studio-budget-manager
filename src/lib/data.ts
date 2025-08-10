import { hasSB, supabase } from './supabase';
import { Brand, Family, Fragrance, ProductCategory, Supplier, SupplierTier } from '@/types';

import { seedBrands, seedFamilies, seedFragrances, seedProducts } from '@/data/seeds';

export interface LoadedData {
  brands: Brand[];
  families: Family[];
  products: ProductCategory[];
  fragrances: Fragrance[];
}

export async function loadAll(): Promise<LoadedData> {
  if (!hasSB || !supabase) {
    // Local Demo Mode
    return {
      brands: seedBrands,
      families: seedFamilies,
      products: seedProducts,
      fragrances: seedFragrances,
    };
  }

  const [brandsRes, famRes, prodRes, fragRes, supRes, tierRes, subfamRes, fitRes, refRes, refMapRes] = await Promise.all([
    supabase.from('brands').select('*').order('name', { ascending: true }),
    supabase.from('fragrance_families').select('*').order('name', { ascending: true }),
    supabase.from('product_categories').select('*').order('name', { ascending: true }),
    supabase.from('fragrances').select('*'),
    supabase.from('suppliers').select('*'),
    supabase.from('supplier_tiers').select('*'),
    supabase.from('fragrance_subfamilies_map').select('*'),
    supabase.from('fragrance_fit_products').select('*'),
    supabase.from('references_master').select('*'),
    supabase.from('fragrance_references_map').select('*'),
  ]);

  const error = brandsRes.error || famRes.error || prodRes.error || fragRes.error || supRes.error || tierRes.error || subfamRes.error || fitRes.error || refRes.error || refMapRes.error;
  if (error) throw error;

  const brands: Brand[] = (brandsRes.data || []).map((b: any) => ({ id: b.id, name: b.name, slug: b.slug, is_active: b.is_active }));
  const families: Family[] = (famRes.data || []).map((f: any) => ({ id: f.id, slug: f.slug, name: f.name }));
  const products: ProductCategory[] = (prodRes.data || []).map((p: any) => ({ id: p.id, slug: p.slug, name: p.name }));

  // Build maps
  const fragranceIdToSuppliers: Record<string, Supplier[]> = {};
  for (const s of (supRes.data || [])) {
    const sup: Supplier = {
      id: s.id,
      supplier: s.supplier,
      tradeName: s.trade_name || undefined,
      leadTimeDays: s.lead_time_days,
      lastVerifiedAt: s.last_verified_at,
      supplierStatus: s.supplier_status,
      isRecommended: s.is_recommended,
      tiers: [],
    };
    (fragranceIdToSuppliers[s.fragrance_id] ||= []).push(sup);
  }
  // tiers
  for (const t of (tierRes.data || [])) {
    const tier: SupplierTier = {
      moqKg: t.moq_kg || '',
      basePriceTHBPerKg: String(t.base_price_thb_per_kg ?? ''),
      enableExcise: !!t.enable_excise,
    };
    const supplierId = t.supplier_id as string;
    // find supplier in all lists
    for (const supList of Object.values(fragranceIdToSuppliers)) {
      const sup = supList.find(s => s.id === supplierId);
      if (sup) {
        sup.tiers.push(tier);
        break;
      }
    }
  }

  const fragranceIdToSubfamilies: Record<string, string[]> = {};
  for (const sf of (subfamRes.data || [])) {
    (fragranceIdToSubfamilies[sf.fragrance_id] ||= []).push(sf.family_id);
  }

  const fragranceIdToFits: Record<string, Record<string, 'best'|'good'|'avoid'>> = {};
  for (const fit of (fitRes.data || [])) {
    const id = fit.fragrance_id as string;
    (fragranceIdToFits[id] ||= {} as any)[fit.product_category_id] = fit.fit_level;
  }

  const refIdToName: Record<string, string> = {};
  for (const r of (refRes.data || [])) {
    refIdToName[r.id] = r.name as string;
  }
  const fragranceIdToRefs: Record<string, string[]> = {};
  for (const m of (refMapRes.data || [])) {
    const name = refIdToName[m.reference_id];
    if (name) (fragranceIdToRefs[m.fragrance_id] ||= []).push(name);
  }

  const fragrances: Fragrance[] = (fragRes.data || []).map((f: any) => ({
    id: f.id,
    brandSlug: f.brand_slug,
    code: f.code,
    name: f.name,
    description: f.description || undefined,
    imageUrl: f.image_url || undefined,
    isLLFFree: f.is_llf_free,
    isAllergenFree: f.is_allergen_free,
    isSalesPush: f.is_sales_push,
    isSPCInUse: f.is_spc_in_use,
    status: f.status,
    primaryFamilyId: f.primary_family_id,
    subfamilyIds: fragranceIdToSubfamilies[f.id] || [],
    referenceScents: fragranceIdToRefs[f.id] || [],
    suppliers: fragranceIdToSuppliers[f.id] || [],
    pricing: { vatPercent: 7, excisePercent: 8.8, enableExcise: false },
    fits: (fragranceIdToFits[f.id] || {}) as any,
  }));

  return { brands, families, products, fragrances };
}

export async function saveFragranceOnline(f: Fragrance): Promise<void> {
  if (!hasSB || !supabase) return;
  // Upsert fragrance
  const { data: fragData, error: fragErr } = await supabase
    .from('fragrances')
    .upsert({
      id: f.id,
      brand_slug: f.brandSlug,
      code: f.code,
      name: f.name,
      description: f.description || null,
      image_url: f.imageUrl || null,
      is_llf_free: !!f.isLLFFree,
      is_allergen_free: !!f.isAllergenFree,
      is_sales_push: !!f.isSalesPush,
      is_spc_in_use: !!f.isSPCInUse,
      status: f.status,
      primary_family_id: f.primaryFamilyId,
    })
    .select('id')
    .single();
  if (fragErr) throw fragErr;
  const fragranceId = fragData!.id as string;

  // Clean and re-insert mappings that are easier to rebuild
  await supabase.from('fragrance_subfamilies_map').delete().eq('fragrance_id', fragranceId);
  for (const famId of f.subfamilyIds) {
    const { error } = await supabase.from('fragrance_subfamilies_map').upsert({ fragrance_id: fragranceId, family_id: famId });
    if (error) throw error;
  }

  await supabase.from('fragrance_fit_products').delete().eq('fragrance_id', fragranceId);
  for (const [pid, level] of Object.entries(f.fits)) {
    const { error } = await supabase.from('fragrance_fit_products').upsert({ fragrance_id: fragranceId, product_category_id: pid, fit_level: level });
    if (error) throw error;
  }

  // References: ensure master rows exist (by name only here), then map
  const { data: allRefs } = await supabase.from('references_master').select('*');
  const nameToId = new Map<string, string>((allRefs || []).map(r => [r.name as string, r.id as string]));
  await supabase.from('fragrance_references_map').delete().eq('fragrance_id', fragranceId);
  for (const name of f.referenceScents) {
    let id = nameToId.get(name);
    if (!id) {
      const { data, error } = await supabase.from('references_master').insert({ name }).select('id').single();
      if (error) throw error;
      id = data!.id as string;
      nameToId.set(name, id);
    }
    const { error } = await supabase.from('fragrance_references_map').upsert({ fragrance_id: fragranceId, reference_id: id });
    if (error) throw error;
  }

  // Suppliers and tiers: replace all
  await supabase.from('suppliers').delete().eq('fragrance_id', fragranceId);
  for (const s of f.suppliers) {
    const { data: ins, error } = await supabase.from('suppliers').insert({
      fragrance_id: fragranceId,
      supplier: s.supplier,
      trade_name: s.tradeName || null,
      lead_time_days: s.leadTimeDays,
      last_verified_at: s.lastVerifiedAt,
      supplier_status: s.supplierStatus,
      is_recommended: s.isRecommended,
    }).select('id').single();
    if (error) throw error;
    const supplierId = ins!.id as string;
    for (const t of s.tiers) {
      const { error: terr } = await supabase.from('supplier_tiers').insert({
        supplier_id: supplierId,
        moq_kg: t.moqKg,
        base_price_thb_per_kg: Number(t.basePriceTHBPerKg),
        enable_excise: t.enableExcise,
      });
      if (terr) throw terr;
    }
  }
}

export async function updateFragranceStatusOnline(id: string, status: 'active'|'inactive'): Promise<void> {
  if (!hasSB || !supabase) return;
  const { error } = await supabase.from('fragrances').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function toggleBrandActiveOnline(slug: string, isActive: boolean): Promise<void> {
  if (!hasSB || !supabase) return;
  const { error } = await supabase.from('brands').update({ is_active: isActive }).eq('slug', slug);
  if (error) throw error;
}

export async function markSupplierVerifiedOnline(fragranceId: string, supplierId: string): Promise<void> {
  if (!hasSB || !supabase) return;
  const { error } = await supabase.from('suppliers').update({ last_verified_at: new Date().toISOString() }).eq('id', supplierId).eq('fragrance_id', fragranceId);
  if (error) throw error;
}

export async function stopSupplierOnline(fragranceId: string, supplierId: string): Promise<void> {
  if (!hasSB || !supabase) return;
  const { error } = await supabase.from('suppliers').update({ supplier_status: 'stop' }).eq('id', supplierId).eq('fragrance_id', fragranceId);
  if (error) throw error;
}