import React, { useEffect, useState } from 'react';
import { Palette, Save, Settings2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useLoyalty } from '../context/useLoyalty';
import { callFunction } from '../firebase/callable';

interface ProductConfig {
  merchant: {
    merchantId: string; name: string; description?: string; phone?: string; websiteUrl?: string;
    instagramUrl?: string; facebookUrl?: string; whatsappUrl?: string; logoUrl?: string;
    branding?: { primaryColor: string; secondaryColor: string; theme: 'light' | 'dark' };
  };
  program: { id: string; pointsPerUnit: number; minimumRewardPoints: number; maxPointsPerTransaction: number };
}
const defaults: ProductConfig = {
  merchant: { merchantId: '', name: '', description: '', phone: '', websiteUrl: '', instagramUrl: '', facebookUrl: '', whatsappUrl: '', logoUrl: '', branding: { primaryColor: '#4f46e5', secondaryColor: '#06b6d4', theme: 'light' } },
  program: { id: 'default', pointsPerUnit: 1, minimumRewardPoints: 1, maxPointsPerTransaction: 1000000 },
};
export const BusinessSettings: React.FC = () => {
  const { session, refreshMerchant } = useAuth();
  const { campaigns, createReward, updateReward } = useLoyalty();
  const [config, setConfig] = useState<ProductConfig>(defaults);
  const [form, setForm] = useState<ProductConfig>(defaults);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newReward, setNewReward] = useState({ titleEn: '', titleAr: '', titleFr: '', pointsRequired: 50 });

  useEffect(() => {
    if (!session) return;
    void callFunction<ProductConfig>('getMerchantProductConfig', session).then(data => { setConfig(data); setForm(data); });
  }, [session]);

  useEffect(() => {
    const b = form.merchant.branding || defaults.merchant.branding!;
    document.documentElement.style.setProperty('--lh-primary', b.primaryColor);
    document.documentElement.style.setProperty('--lh-secondary', b.secondaryColor);
    return () => { document.documentElement.style.removeProperty('--lh-primary'); document.documentElement.style.removeProperty('--lh-secondary'); };
  }, [form.merchant.branding]);

  const updateProfile = (key: keyof ProductConfig['merchant'], value: string) =>
    setForm(prev => ({ ...prev, merchant: { ...prev.merchant, [key]: value } }));
  const updateBranding = (key: 'primaryColor' | 'secondaryColor' | 'theme', value: string) =>
    setForm(prev => ({ ...prev, merchant: { ...prev.merchant, branding: { ...prev.merchant.branding!, [key]: value } } }));

  const saveAll = async () => {
    if (!session) return;
    setSaving(true); setStatus(null);
    try {
      await callFunction('updateMerchantProfile', session, { ...form.merchant });
      await callFunction('updateMerchantBranding', session, { ...form.merchant.branding });
      await callFunction('updateLoyaltyConfig', session, { ...form.program });
      setConfig(form);
      await refreshMerchant();
      setStatus('Saved successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'PRODUCT_CONFIGURATION_FAILED');
    } finally { setSaving(false); }
  };

  const addConfiguredReward = async () => {
    if (!newReward.titleEn || !newReward.titleAr || !newReward.titleFr) { setStatus('All reward titles are required.'); return; }
    try {
      await createReward({ ...newReward });
      setNewReward({ titleEn: '', titleAr: '', titleFr: '', pointsRequired: 50 });
      setStatus('Reward added.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'REWARD_CREATE_FAILED'); }
  };
  const editReward = async (reward: typeof campaigns[number]) => {
    const points = window.prompt('Reward points required:', String(reward.pointsRequired));
    if (points == null) return;
    const value = Number(points);
    if (!Number.isSafeInteger(value) || value <= 0) { setStatus('Reward points must be a positive whole number.'); return; }
    try { await updateReward(reward.id, { titleEn: reward.titleEn, titleAr: reward.titleAr, titleFr: reward.titleFr, pointsRequired: value }); setStatus('Reward updated.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'REWARD_UPDATE_FAILED'); }
  };

  return <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6">
    <div className="flex items-center gap-3 mb-6"><Settings2 size={20} style={{ color: 'var(--lh-primary)' }} /><div><h2 className="text-xl font-bold">Business settings</h2><p className="text-sm text-gray-500">Configure this merchant without changing source code.</p></div></div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-bold">Business profile</h3>
        {([['name','Business name'],['description','Description'],['phone','Phone'],['websiteUrl','Website'],['instagramUrl','Instagram'],['facebookUrl','Facebook'],['whatsappUrl','WhatsApp'],['logoUrl','Logo URL']] as const).map(([key,label]) =>
          <label key={key} className="block text-sm font-medium"><span>{label}</span><input value={String(form.merchant[key] || '')} onChange={e => updateProfile(key,e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" /></label>
        )}
      </div>
      <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Palette size={18}/> Branding</h3>
        <label className="block text-sm font-medium">Primary color<input type="color" value={form.merchant.branding?.primaryColor || '#4f46e5'} onChange={e=>updateBranding('primaryColor',e.target.value)} className="block mt-1 h-10 w-full rounded" /></label>
        <label className="block text-sm font-medium">Secondary color<input type="color" value={form.merchant.branding?.secondaryColor || '#06b6d4'} onChange={e=>updateBranding('secondaryColor',e.target.value)} className="block mt-1 h-10 w-full rounded" /></label>
        <label className="block text-sm font-medium">Theme<select value={form.merchant.branding?.theme || 'light'} onChange={e=>updateBranding('theme',e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600"><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${form.merchant.branding?.primaryColor}, ${form.merchant.branding?.secondaryColor})` }}>{form.merchant.name || 'Your business'}<div className="text-sm opacity-80">{form.merchant.description || 'Brand preview'}</div></div>
        <h3 className="font-bold pt-2">Loyalty rules</h3>
        <label className="block text-sm font-medium">Points per unit<input type="number" min="1" max="1000" value={form.program.pointsPerUnit} onChange={e=>setForm(p=>({...p,program:{...p.program,pointsPerUnit:Number(e.target.value)}}))} className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" /></label>
        <label className="block text-sm font-medium">Minimum reward points<input type="number" min="1" value={form.program.minimumRewardPoints} onChange={e=>setForm(p=>({...p,program:{...p.program,minimumRewardPoints:Number(e.target.value)}}))} className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" /></label>
        <label className="block text-sm font-medium">Maximum points per transaction<input type="number" min="1" value={form.program.maxPointsPerTransaction} onChange={e=>setForm(p=>({...p,program:{...p.program,maxPointsPerTransaction:Number(e.target.value)}}))} className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" /></label>
      </div>
    </div>
    <div className="mt-8 border-t dark:border-gray-700 pt-6">
      <h3 className="font-bold mb-3">Rewards</h3>
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <input placeholder="English title" value={newReward.titleEn} onChange={e=>setNewReward(p=>({...p,titleEn:e.target.value}))} className="rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" />
        <input placeholder="Arabic title" value={newReward.titleAr} onChange={e=>setNewReward(p=>({...p,titleAr:e.target.value}))} className="rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" />
        <input placeholder="French title" value={newReward.titleFr} onChange={e=>setNewReward(p=>({...p,titleFr:e.target.value}))} className="rounded-lg border px-3 py-2 bg-transparent dark:border-gray-600" />
        <button onClick={()=>void addConfiguredReward()} className="rounded-lg px-3 py-2 text-white font-bold flex items-center justify-center gap-2" style={{background:'var(--lh-primary)'}}><Plus size={16}/> Add reward</button>
      </div>
      <div className="space-y-2">{campaigns.map(reward=><div key={reward.id} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 dark:border-gray-700"><span>{reward.titleEn} — {reward.pointsRequired} pts</span><button onClick={()=>void editReward(reward)} className="text-sm font-bold underline">Edit points</button></div>)}</div>
    </div>
    <div className="mt-6 flex items-center justify-between gap-4"><span className="text-sm text-gray-500">{status || 'Changes are saved server-side per merchant.'}</span><button disabled={saving} onClick={()=>void saveAll()} className="rounded-xl px-5 py-3 text-white font-bold flex items-center gap-2 disabled:opacity-50" style={{background:'var(--lh-primary)'}}><Save size={18}/>{saving?'Saving…':'Save configuration'}</button></div>
  </section>;
};
