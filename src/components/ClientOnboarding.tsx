import React from 'react';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useLoyalty } from '../context/useLoyalty';

export const ClientOnboarding: React.FC = () => {
  const { merchant } = useAuth();
  const { customers, campaigns, program } = useLoyalty();
  if (!merchant || !program) return null;

  const checks = [
    { label: 'Business name configured', done: merchant.merchant.name.trim().length >= 2 },
    { label: 'Business description added', done: Boolean(merchant.merchant.description?.trim()) },
    { label: 'Branding configured', done: Boolean(merchant.merchant.branding?.primaryColor && merchant.merchant.branding?.secondaryColor) },
    { label: 'Loyalty rules configured', done: program.pointsPerUnit >= 1 && program.minimumRewardPoints >= 1 },
    { label: 'At least one reward created', done: campaigns.length > 0 },
    { label: 'At least one customer added', done: customers.length > 0 },
  ];
  const completed = checks.filter(item => item.done).length;
  const ready = completed === checks.length;

  return (
    <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800" aria-labelledby="client-onboarding-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--lh-primary)' }}>Client onboarding</p>
          <h2 id="client-onboarding-title" className="mt-1 text-xl font-bold">{ready ? 'Your loyalty program is ready' : 'Complete your setup'}</h2>
          <p className="mt-1 text-sm text-gray-500">{completed}/{checks.length} setup steps completed. Finish these steps before your first client launch.</p>
        </div>
        <a href="#business-settings" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--lh-primary)' }}>
          Open settings <ExternalLink size={15} />
        </a>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map(check => (
          <div key={check.label} className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm dark:border-gray-700">
            {check.done ? <CheckCircle2 size={17} className="text-emerald-600" /> : <Circle size={17} className="text-gray-400" />}
            <span className={check.done ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500'}>{check.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
