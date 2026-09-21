import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Archive, Building2, Palette, Gift } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useLoyalty } from '../context/useLoyalty';

interface Props { onBack: () => void; }

export const MerchantSettings: React.FC<Props> = ({ onBack }) => {
  const { merchant, updateProfile, updateBranding } = useAuth();
  const { program, campaigns, createReward, updateReward } = useLoyalty();
  const [profile, setProfile] = useState({ name: merchant?.merchant.name || '', phone: merchant?.merchant.phone || '', address: merchant?.merchant.address || '', website: merchant?.merchant.website || '' });
  const [branding, setBranding] = useState(merchant?.merchant.branding || { primaryColor: '#4f46e5', accentColor: '#06b6d4', logoUrl: '' });
  const [programForm, setProgramForm] = useState({ name: program?.name || '', pointsPerUnit: String(program?.pointsPerUnit || 1) });
  const [reward, setReward] = useState({ titleEn: '', titleAr: '', titleFr: '', pointsRequired: '50' });
  const [message, setMessage] = useState<string | null>(null);

  if (!merchant || !program) return null;
  const saveProfile = async () => { await updateProfile(profile); setMessage('Business profile saved.'); };
  const saveBranding = async () => { await updateBranding(branding); setMessage('Branding saved.'); };
  const saveProgram = async () => { const pointsPerUnit = Number(programForm.pointsPerUnit); if (!Number.isSafeInteger(pointsPerUnit) || pointsPerUnit <= 0) throw new Error('Points per unit must be a positive whole number.'); await useLoyalty().updateProgram(programForm.name, pointsPerUnit); };
  return <div className="space-y-8 animate-fade-in">
    <div className="flex items-center gap-3"><button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ArrowLeft size={20}/></button><div><h1 className="text-2xl font-bold">Merchant Settings</h1><p className="text-sm text-gray-500">Business profile, branding and loyalty configuration</p></div></div>
    <section className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 space-y-5">
      <h2 className="font-bold flex items-center gap-2"><Building2 size={18}/> Business profile</h2>
      <div className="grid md:grid-cols-2 gap-4">{[['name','Business name'],['phone','Phone'],['address','Address'],['website','Website']].map(([key,label])=><label key={key} className="space-y-1 text-sm"><span>{label}</span><input value={profile[key as keyof typeof profile]} onChange={e=>setProfile({...profile,[key]:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-transparent"/></label>)}</div>
      <button onClick={()=>void saveProfile()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 font-bold"><Save size={16}/>Save profile</button>
    </section>
    <section className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 space-y-5">
      <h2 className="font-bold flex items-center gap-2"><Palette size={18}/> Branding</h2>
      <div className="grid md:grid-cols-3 gap-4"><label className="space-y-1 text-sm">Primary color<input type="color" value={branding.primaryColor} onChange={e=>setBranding({...branding,primaryColor:e.target.value})} className="w-full h-10"/></label><label className="space-y-1 text-sm">Accent color<input type="color" value={branding.accentColor} onChange={e=>setBranding({...branding,accentColor:e.target.value})} className="w-full h-10"/></label><label className="space-y-1 text-sm">Logo URL<input value={branding.logoUrl} onChange={e=>setBranding({...branding,logoUrl:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-transparent"/></label></div>
      <button onClick={()=>void saveBranding()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 font-bold"><Save size={16}/>Save branding</button>
    </section>
    <section className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-6 space-y-5">
      <h2 className="font-bold flex items-center gap-2"><Gift size={18}/> Loyalty configuration</h2>
      <div className="grid md:grid-cols-2 gap-4"><label className="space-y-1 text-sm">Program name<input value={programForm.name} onChange={e=>setProgramForm({...programForm,name:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-transparent"/></label><label className="space-y-1 text-sm">Points per unit<input type="number" min="1" value={programForm.pointsPerUnit} onChange={e=>setProgramForm({...programForm,pointsPerUnit:e.target.value})} className="w-full rounded-xl border px-3 py-2 bg-transparent"/></label></div>
      <button onClick={()=>void saveProgram()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 font-bold"><Save size={16}/>Save loyalty rules</button>
      <div className="grid md:grid-cols-2 gap-4">{campaigns.map(item=><div key={item.id} className="rounded-xl border p-4 space-y-2"><div className="font-bold">{item.titleEn}</div><div className="text-sm text-gray-500">{item.pointsRequired} points</div><button onClick={()=>void updateReward(item.id,{titleEn:item.titleEn,titleAr:item.titleAr,titleFr:item.titleFr,pointsRequired:item.pointsRequired})} className="text-xs underline">Save current reward</button></div>)}</div>
      <div className="border-t pt-4 space-y-3"><div className="font-semibold">Add reward</div><div className="grid md:grid-cols-4 gap-2">{Object.entries(reward).map(([key,value])=><input key={key} value={value} onChange={e=>setReward({...reward,[key]:e.target.value})} placeholder={key} className="rounded-xl border px-3 py-2 bg-transparent text-sm"/>)}</div><button onClick={async()=>{await createReward({...reward,pointsRequired:Number(reward.pointsRequired)});setReward({titleEn:'',titleAr:'',titleFr:'',pointsRequired:'50'});setMessage('Reward created.');}} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 font-bold"><Plus size={16}/>Add reward</button></div>
    </section>
    {message && <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3">{message}</div>}
  </div>;
};
