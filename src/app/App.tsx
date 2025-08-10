import React, { useMemo, useState } from 'react';
import { Role, Brand, Fragrance, Family, ProductCategory } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { th } from '@/i18n/th';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import BrandExplorer from '@/components/BrandExplorer';
import BrandDetail from '@/components/BrandDetail';
import Admin from '@/components/Admin';
import { hasSB } from '@/lib/supabase';
import { seedBrands, seedFamilies, seedFragrances, seedProducts } from '@/data/seeds';
import { loadAll, saveFragranceOnline, toggleBrandActiveOnline, updateFragranceStatusOnline, markSupplierVerifiedOnline, stopSupplierOnline } from '@/lib/data';

export default function App() {
  const { theme, setTheme } = useTheme();

  const [role, setRole] = useState<Role>('sales');
  const [page, setPage] = useState<'home'|'brand'|'admin'>('home');
  const [currentBrand, setCurrentBrand] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>(seedBrands);
  const [fragrances, setFragrances] = useState<Fragrance[]>(seedFragrances);
  const [families, setFamilies] = useState<Family[]>(seedFamilies);
  const [products, setProducts] = useState<ProductCategory[]>(seedProducts);

  React.useEffect(() => {
    if (hasSB) {
      loadAll().then(({ brands, families, products, fragrances }) => {
        setBrands(brands); setFamilies(families); setProducts(products); setFragrances(fragrances);
      }).catch(() => {/* fallback to demo seeds on error */});
    }
  }, []);

  const currentBrandName = useMemo(() => brands.find(b => b.slug === currentBrand)?.name ?? '', [brands, currentBrand]);

  function handleSaveFragrance(f: Fragrance) {
    setFragrances(prev => {
      const exists = prev.some(x => x.id === f.id);
      if (exists) return prev.map(x => (x.id === f.id ? f : x));
      return [f, ...prev];
    });
    if (hasSB) saveFragranceOnline(f).catch(console.error);
  }

  function handleToggleActive(id: string) {
    setFragrances(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' } : f));
    if (hasSB) {
      const next = fragrances.find(x => x.id === id)?.status === 'active' ? 'inactive' : 'active';
      updateFragranceStatusOnline(id, next as any).catch(console.error);
    }
  }

  function handleToggleBrandActive(slug: string) {
    setBrands(prev => prev.map(b => b.slug === slug ? { ...b, is_active: !b.is_active } : b));
    if (hasSB) {
      const isActive = !(brands.find(b => b.slug === slug)?.is_active);
      toggleBrandActiveOnline(slug, isActive).catch(console.error);
    }
  }

  function handleMarkVerified(fId: string, supplierIndex: number) {
    setFragrances(prev => prev.map(f => f.id === fId ? { ...f, suppliers: f.suppliers.map((s, i) => i === supplierIndex ? { ...s, lastVerifiedAt: new Date().toISOString() } : s) } : f));
    if (hasSB) {
      const supplierId = fragrances.find(f => f.id === fId)?.suppliers[supplierIndex]?.id;
      if (supplierId) markSupplierVerifiedOnline(fId, supplierId).catch(console.error);
    }
  }

  function handleStopSupplier(fId: string, supplierIndex: number) {
    setFragrances(prev => prev.map(f => f.id === fId ? { ...f, suppliers: f.suppliers.map((s, i) => i === supplierIndex ? { ...s, supplierStatus: 'stop' } : s) } : f));
    if (hasSB) {
      const supplierId = fragrances.find(f => f.id === fId)?.suppliers[supplierIndex]?.id;
      if (supplierId) stopSupplierOnline(fId, supplierId).catch(console.error);
    }
  }

  function handleActivateFragrance(id: string) {
    setFragrances(prev => prev.map(f => f.id === id ? { ...f, status: 'active' } : f));
  }

  return (
    <div className="min-h-full flex flex-col">
      <TopBar
        role={role}
        onHome={() => { setPage('home'); setCurrentBrand(null); }}
        onAdmin={() => setPage('admin')}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onDemoLogin={() => {
          const code = prompt('รหัสเดโม: rd1234 หรือ admin1234');
          if (code === 'rd1234') setRole('rd');
          else if (code === 'admin1234') setRole('admin');
          else if (code === 'sales' || code === 'logout') setRole('sales');
          else alert('รหัสไม่ถูกต้อง');
        }}
        hasSupabase={hasSB}
      />
      <main className="max-w-6xl w-full mx-auto p-4 space-y-4">
        {page === 'home' && (
          <BrandExplorer
            role={role}
            brands={brands}
            fragrances={fragrances}
            onSelectBrand={(slug) => { setCurrentBrand(slug); setPage('brand'); }}
            onAddBrand={() => {
              const name = prompt('ชื่อแบรนด์');
              if (!name) return;
              const slug = name.toLowerCase().replace(/\s+/g, '-');
              setBrands(prev => [{ id: `b-${Date.now()}`, name, slug, is_active: true }, ...prev]);
            }}
          />
        )}
        {page === 'brand' && currentBrand && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{currentBrandName}</h2>
              <Button variant="secondary" onClick={() => setPage('home')}>ย้อนกลับ</Button>
            </div>
            <BrandDetail
              role={role}
              brandSlug={currentBrand}
              families={families}
              products={products}
              fragrances={fragrances}
              onSaveFragrance={handleSaveFragrance}
              onToggleActive={handleToggleActive}
            />
          </section>
        )}
        {page === 'admin' && (
          <Admin
            brands={brands}
            fragrances={fragrances}
            onToggleBrandActive={handleToggleBrandActive}
            onMarkVerified={handleMarkVerified}
            onStopSupplier={handleStopSupplier}
            onActivateFragrance={handleActivateFragrance}
          />
        )}
      </main>
      <footer className="text-center text-xs text-mu py-6">Mode: {hasSB ? 'Online (Supabase)' : 'Local Demo'} • Role: {role}</footer>
    </div>
  );
}

function TopBar(props: {
  role: Role;
  onHome: () => void;
  onAdmin: () => void;
  theme: 'light'|'dark';
  onToggleTheme: () => void;
  onDemoLogin: () => void;
  hasSupabase: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-bd">
      <div className="max-w-6xl mx-auto p-3 flex items-center gap-2">
        <Button variant="ghost" onClick={props.onHome}>{th.home}</Button>
        <div className="font-semibold">{th.appTitle}</div>
        <div className="flex-1" />
        <Button variant="ghost" onClick={props.onAdmin}>{th.admin}</Button>
        <Button variant="secondary" onClick={props.onToggleTheme}>{props.theme === 'dark' ? '🌙' : '☀️'} {th.theme}</Button>
        {!props.hasSupabase && (
          <Button onClick={props.onDemoLogin}>{th.loginDemo}</Button>
        )}
      </div>
    </header>
  );
}