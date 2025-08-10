import React, { useMemo, useState } from 'react';
import { Family, Fragrance, ProductCategory, Role } from '@/types';
import Input from './ui/Input';
import Button from './ui/Button';
import FragranceRow from './FragranceRow';
import { th } from '@/i18n/th';
import { normalizeText } from '@/lib/utils';

export interface BrandDetailProps {
  role: Role;
  brandSlug: string;
  families: Family[];
  products: ProductCategory[];
  fragrances: Fragrance[];
  onSaveFragrance: (f: Fragrance) => void;
  onToggleActive: (id: string) => void;
}

export const BrandDetail: React.FC<BrandDetailProps> = ({ role, brandSlug, families, products, fragrances, onSaveFragrance, onToggleActive }) => {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Fragrance | null>(null);

  const list = useMemo(() => {
    const nq = normalizeText(q);
    return fragrances.filter(f => {
      if (f.brandSlug !== brandSlug) return false;
      if (role === 'sales') {
        if (f.status !== 'active') return false;
        const saleReady = f.suppliers.some(s => s.isRecommended && (new Date().getTime() - new Date(s.lastVerifiedAt).getTime()) <= 1000*60*60*24*30*6);
        if (!saleReady) return false;
      }
      const hay = normalizeText([
        f.name, f.code, f.brandSlug, f.referenceScents.join(' '), f.primaryFamilyId || '',
        Object.entries(f.fits).map(([k,v]) => `${k}:${v}`).join(' ')
      ].join(' '));
      return !nq || hay.includes(nq);
    });
  }, [fragrances, brandSlug, q, role]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Input placeholder={th.brandDetailSearch} value={q} onChange={e => setQ(e.target.value)} className="flex-1" />
        {(role === 'rd' || role === 'admin') && (
          <Button onClick={() => setEditing(createEmptyFragrance(brandSlug))}>{th.editAddFormula}</Button>
        )}
      </div>
      <div className="divide-y divide-bd bg-sf rounded-lg border border-bd">
        {list.map(f => (
          <FragranceRow key={f.id} fragrance={f} role={role} onEdit={setEditing} onToggleActive={onToggleActive} />
        ))}
        {list.length === 0 && (
          <div className="p-6 text-center text-mu text-sm">ไม่พบข้อมูล</div>
        )}
      </div>

      {editing && (
        <FragranceModal
          families={families}
          products={products}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(f) => { onSaveFragrance(f); setEditing(null); }}
        />
      )}
    </div>
  );
};

function createEmptyFragrance(brandSlug: string): Fragrance {
  return {
    id: `new-${Math.random().toString(36).slice(2)}`,
    brandSlug,
    code: '',
    name: '',
    description: '',
    imageUrl: '',
    isLLFFree: false,
    isAllergenFree: false,
    isSalesPush: false,
    isSPCInUse: false,
    referenceScents: [],
    status: 'active',
    suppliers: [],
    pricing: { vatPercent: 7, excisePercent: 8.8, enableExcise: false },
    primaryFamilyId: null,
    subfamilyIds: [],
    fits: {},
  };
}

interface FragranceModalProps {
  initial: Fragrance;
  families: Family[];
  products: ProductCategory[];
  onSave: (f: Fragrance) => void;
  onClose: () => void;
}

const FragranceModal: React.FC<FragranceModalProps> = ({ initial, families, products, onSave, onClose }) => {
  const [f, setF] = useState<Fragrance>(initial);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof Fragrance>(key: K, value: Fragrance[K]) {
    setF(prev => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    if (!f.code.trim() || !f.name.trim()) {
      setError('รหัส/ชื่อ ต้องไม่ว่าง');
      return false;
    }
    const invalidTier = f.suppliers.some(s => s.tiers.some(t => Number(t.basePriceTHBPerKg) < 0));
    if (invalidTier) {
      setError('ราคา/กก. ต้องไม่ติดลบ');
      return false;
    }
    setError(null);
    return true;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-sf rounded-lg border border-bd w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-bd flex items-center justify-between sticky top-0 bg-sf">
          <div className="font-semibold">{th.editAddFormula}</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>{th.cancel}</Button>
            <Button onClick={() => { if (validate()) onSave(f); }}>{th.save}</Button>
          </div>
        </div>
        {error && <div className="px-4 pt-3 text-red-500 text-sm">{error}</div>}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="code" value={f.code} onChange={e => setField('code', e.target.value)} />
          <Input placeholder="name" value={f.name} onChange={e => setField('name', e.target.value)} />
          <Input placeholder="imageUrl" value={f.imageUrl || ''} onChange={e => setField('imageUrl', e.target.value)} />
          <Input placeholder="description" value={f.description || ''} onChange={e => setField('description', e.target.value)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.isLLFFree} onChange={e => setField('isLLFFree', e.target.checked)} /> LLF free</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.isAllergenFree} onChange={e => setField('isAllergenFree', e.target.checked)} /> Allergen free</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.isSalesPush} onChange={e => setField('isSalesPush', e.target.checked)} /> Sales push</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.isSPCInUse} onChange={e => setField('isSPCInUse', e.target.checked)} /> SPC มีใช้</label>
          <div className="col-span-full">
            <div className="text-sm mb-2">References</div>
            <TagEditor
              values={f.referenceScents}
              onChange={(vals) => setField('referenceScents', vals)}
              placeholder="เพิ่มอ้างอิง (กด Enter)"
            />
          </div>
          <div>
            <div className="text-sm mb-1">Primary family</div>
            <select value={f.primaryFamilyId || ''} onChange={e => setField('primaryFamilyId', e.target.value || null)} className="w-full h-9 bg-white dark:bg-[#0f1117] border border-bd rounded-md text-sm">
              <option value="">-</option>
              {families.map(fam => <option key={fam.id} value={fam.id}>{fam.name}</option>)}
            </select>
          </div>
          <div>
            <div className="text-sm mb-1">Sub-families</div>
            <select multiple value={f.subfamilyIds} onChange={e => setField('subfamilyIds', Array.from(e.target.selectedOptions).map(o => o.value))} className="w-full min-h-[120px] bg-white dark:bg-[#0f1117] border border-bd rounded-md text-sm"></select>
          </div>
          <div className="col-span-full">
            <div className="text-sm mb-2">Product fit</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2 border border-bd rounded-md p-2">
                  <div className="text-sm">{p.name}</div>
                  <div className="flex items-center gap-1">
                    {(['best','good','avoid'] as const).map(level => (
                      <label key={level} className="text-xs flex items-center gap-1">
                        <input type="radio" name={`fit-${p.id}`} checked={f.fits[p.id] === level} onChange={() => setField('fits', { ...f.fits, [p.id]: level })} /> {level}
                      </label>
                    ))}
                    <label className="text-xs flex items-center gap-1">
                      <input type="radio" name={`fit-${p.id}`} checked={!f.fits[p.id]} onChange={() => { const { [p.id]:_, ...rest } = f.fits; setField('fits', rest as any); }} /> —
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">{th.suppliers}</div>
              <Button size="sm" onClick={() => setField('suppliers', [...f.suppliers, emptySupplier()])}>+ เพิ่มซัพ</Button>
            </div>
            <div className="space-y-3">
              {f.suppliers.map((s, si) => (
                <div key={si} className="border border-bd rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Input placeholder="supplier" value={s.supplier} onChange={e => updateSupplierField(si, 'supplier', e.target.value)} />
                    <Input placeholder="tradeName" value={s.tradeName || ''} onChange={e => updateSupplierField(si, 'tradeName', e.target.value)} />
                    <Input type="number" placeholder="leadTimeDays" value={s.leadTimeDays} onChange={e => updateSupplierField(si, 'leadTimeDays', Number(e.target.value))} />
                    <Input type="date" placeholder="lastVerifiedAt" value={s.lastVerifiedAt.slice(0,10)} onChange={e => updateSupplierField(si, 'lastVerifiedAt', new Date(e.target.value).toISOString())} />
                    <div className="flex items-center gap-2"><input type="checkbox" checked={s.isRecommended} onChange={e => updateSupplierField(si, 'isRecommended', e.target.checked)} /> <span className="text-sm">{th.recommended}</span></div>
                    <select value={s.supplierStatus} onChange={e => updateSupplierField(si, 'supplierStatus', e.target.value as any)} className="h-9 bg-white dark:bg-[#0f1117] border border-bd rounded-md text-sm">
                      <option value="active">Active</option>
                      <option value="stop">Stop</option>
                    </select>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <div>{th.tiers}</div>
                      <Button size="sm" onClick={() => updateSupplierField(si, 'tiers', [...s.tiers, { moqKg: '', basePriceTHBPerKg: '0', enableExcise: false }])}>+ Tier</Button>
                    </div>
                    <div className="space-y-2">
                      {s.tiers.map((t, ti) => (
                        <div key={ti} className="grid grid-cols-3 gap-2">
                          <Input placeholder={th.moq} value={t.moqKg} onChange={e => updateTierField(si, ti, 'moqKg', e.target.value)} />
                          <Input type="number" placeholder={th.pricePerKg} value={t.basePriceTHBPerKg} onChange={e => updateTierField(si, ti, 'basePriceTHBPerKg', e.target.value)} />
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.enableExcise} onChange={e => updateTierField(si, ti, 'enableExcise', e.target.checked)} /> {th.enableExcise}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function updateSupplierField<K extends keyof Fragrance['suppliers'][number]>(index: number, key: K, value: any) {
    setF(prev => {
      const next = [...prev.suppliers];
      const current = { ...next[index], [key]: value } as any;
      next[index] = current;
      return { ...prev, suppliers: next };
    });
  }

  function updateTierField(index: number, tIndex: number, key: 'moqKg'|'basePriceTHBPerKg'|'enableExcise', value: any) {
    setF(prev => {
      const next = [...prev.suppliers];
      const tiers = [...next[index].tiers];
      tiers[tIndex] = { ...tiers[tIndex], [key]: value } as any;
      next[index] = { ...next[index], tiers };
      return { ...prev, suppliers: next };
    });
  }
};

function emptySupplier(): Fragrance['suppliers'][number] {
  return {
    supplier: '', tradeName: '', leadTimeDays: 0, lastVerifiedAt: new Date().toISOString(), supplierStatus: 'active', isRecommended: false, tiers: []
  };
}

const TagEditor: React.FC<{ values: string[]; onChange: (vals: string[]) => void; placeholder?: string; }> = ({ values, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2 border border-bd rounded-md p-2 bg-white dark:bg-[#0f1117]">
      {values.map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 h-7 rounded-full bg-sf border border-bd text-xs">
          {v}
          <button className="text-mu" onClick={() => onChange(values.filter((_, idx) => idx !== i))}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const t = input.trim();
            if (t) onChange([...values, t]);
            setInput('');
          }
        }}
        placeholder={placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
      />
    </div>
  );
};

export default BrandDetail;