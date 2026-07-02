import React, { useState, useEffect } from 'react';
import { useLoyalty } from '../context/LoyaltyContext';
import { useApp } from '../context/AppContext';
import { UserPlus, PlusCircle, Award, Users, BarChart3, QrCode } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QrScannerModal } from './QrScannerModal';


export const MerchantDashboard: React.FC = () => {
  const { customers, campaigns, addPoints, redeemReward, addNewCustomer } = useLoyalty();
const { t, lang, setLang } = useApp();

  // حالة فتح وإغلاق نافذة ماسح الـ QR
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // حالة الإشعار التنبيهي ودالة تشغيله التلقائي
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (msgAr: string, msgFr: string, msgEn: string, type: 'success' | 'error') => {
    const selectedMsg = lang === 'ar' ? msgAr : lang === 'fr' ? msgFr : msgEn;
    setToast({ msg: selectedMsg, type });
  };

  // إخفاء الإشعار تلقائياً بعد 3 ثوانٍ من ظهوره
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // سجل العمليات الأخير محلياً
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    customerName: string;
    type: 'add' | 'redeem';
    amountOrReward: string;
    date: string;
  }>>([]);

  // دالة مساعدة لإضافة عملية جديدة للسجل
  const addTransaction = (customerName: string, type: 'add' | 'redeem', amountOrReward: string) => {
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      type,
      amountOrReward,
      date: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev].slice(0, 5)); // نحتفظ بآخر 5 عمليات فقط لنظافة الواجهة
  };

 // دالة التعامل مع الكود الممسوح بنجاح
  const handleScanSuccess = (customerId: string) => {
    const found = customers.find(c => c.id === customerId);
    if (found) {
      triggerToast(
       ` تم العثور على الزبون: ${found.name}`,
       ` Client trouvé: ${found.name}`,
      `  Customer found: ${found.name}`,
        'success'
      );
    } else {
      triggerToast(
        'عذراً، هذا الحساب غير مسجل لدينا!',
        'Client introuvable !',
        'Customer not found !',
        'error'
      );
    }
  };

  // حالات حقول الزبون الجديد
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // حساب الإحصائيات السريعة
  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const averagePoints = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0;

  // تجهيز البيانات للرسم البياني
  const chartData = customers.map(c => ({
    name: c.name.split(' ')[0], // نأخذ الاسم الأول فقط ليظهر بشكل منسق
    [t('points')]: c.points
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addNewCustomer(name, email, phone);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. أشرطة الإحصائيات (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{lang === 'ar' ? 'إجمالي الزبائن' : lang === 'fr' ? 'Total Clients' : 'Total Customers'}</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalCustomers}</h3>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{lang === 'ar' ? 'النقاط المتداولة' : lang === 'fr' ? 'Points en Circulation' : 'Points in Circulation'}</p>
            <h3 className="text-3xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{totalPoints}</h3>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Award size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{lang === 'ar' ? 'معدل نقاط الزبون' : lang === 'fr' ? 'Moyenne des Points' : 'Average Points / Client'}</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{averagePoints}</h3>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. الرسم البياني لتوزيع النقاط */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'ar' ? 'تحليل نقاط الزبائن' : lang === 'fr' ? 'Analyse des Points' : 'Customer Points Analytics'}
            </h3>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey={t('points')} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. نموذج إضافة زبون جديد */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            {lang === 'ar' ? 'تسجيل زبون جديد' : lang === 'fr' ? 'Nouveau Client' : 'Register New Customer'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{lang === 'ar' ? 'الاسم الكامل' : lang === 'fr' ? 'Nom Complet' : 'Full Name'}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{lang === 'ar' ? 'رقم الهاتف' : lang === 'fr' ? 'Numéro de Téléphone' : 'Phone Number'}</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{lang === 'ar' ? 'البريد الإلكتروني (اختياري)' : lang === 'fr' ? 'Email (Optionnel)' : 'Email (Optional)'}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition shadow-md shadow-indigo-200 dark:shadow-none text-sm">
              {lang === 'ar' ? 'إضافة الحساب' : lang === 'fr' ? 'Ajouter le Compte' : 'Add Account'}
            </button>
          </form>
        </div>
      </div>

     {/* 4. جدول إدارة وعمليات الزبائن */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6">
      
      {/* عنوان القسم وزر ماسح الـ QR معاً في حاوية مرنة واحدة لعدم تدمير بنية الـ JSX */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {lang === 'ar' ? 'قائمة الحسابات النشطة' : lang === 'fr' ? 'Liste des Comptes Actifs' : 'Active Accounts'}
        </h3>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <QrCode size={18} />
          {lang === 'ar' ? 'مسح كود سريع' : 'Scan QR Code'}
        </button>
      </div>

      {/* بداية حاوية الجدول والجدول نفسه بشكل سليم */}
      <div className="overflow-x-auto">
        <table className="w-full text-right rtl:text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">{lang === 'ar' ? 'الزبون' : lang === 'fr' ? 'Client' : 'Client'}</th>
              <th className="px-6 py-3">{lang === 'ar' ? 'الهاتف' : lang === 'fr' ? 'Téléphone' : 'Phone'}</th>
              <th className="px-6 py-3">{t('points')}</th>
              <th className="px-6 py-3 text-center">{lang === 'ar' ? 'العمليات السريعة' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition">
                <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">{customer.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{customer.email || '---'}</div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{customer.phone}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {customer.points} PTS
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                   <button
                      onClick={() => {
                        const pts = prompt(lang === 'ar' ? 'أدخل عدد النقاط لإضافتها:' : lang === 'fr' ? 'Points à ajouter :' : 'Enter points to add:');
                        if (pts && !isNaN(Number(pts))) {
                          addPoints(customer.id, Number(pts));
                          addTransaction(customer.name, 'add', `${pts} PTS`);
                          triggerToast(
                           ` تم شحن نقاط الزبون ${customer.name} بنجاح!`,
                          `  Points ajoutés avec succès à ${customer.name}!`,
                           ` Points successfully added to ${customer.name}!`,
                            'success'
                          );
                        }
                      }}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer"
                      title={lang === 'ar' ? 'إضافة نقاط' : 'Ajouter des points'}
                    >
                      <PlusCircle size={18} />
                    </button>
                   <select
                     onChange={(e) => {
                        if (e.target.value) {
                          const campaign = campaigns.find(camp => camp.id === e.target.value);
                          redeemReward(customer.id, e.target.value);
                          
                          // إضافة العملية للسجل حياً 👇
                          if (campaign) {
                            const rewardName = lang === 'ar' ? campaign.titleAr : lang === 'fr' ? campaign.titleFr : campaign.titleEn;
                            addTransaction(customer.name, 'redeem', rewardName);
                          }

                          e.target.value = '';
                          triggerToast(
                            'تم استبدال المكافأة بنجاح!',
                            'Récompense échangée avec succès !',
                            'Reward redeemed successfully!',
                            'success'
                          );
                        }
                      }}
                      className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-1 text-gray-700 dark:text-gray-200"
                    >
                      <option value="">
                        {lang === 'ar' ? 'استبدال مكافأة...' : lang === 'fr' ? 'Échanger...' : 'Redeem...'}
                      </option>
                      
                      {campaigns.map((camp) => (
                        <option 
                          key={camp.id} 
                          value={camp.id} 
                          disabled={customer.points < camp.pointsCost}
                        >
                          {lang === 'ar' ? camp.titleAr : lang === 'fr' ? camp.titleFr : camp.titleEn} ({camp.pointsCost} PTS)
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* 5. سجل العمليات الأخير الديناميكي */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'ar' ? 'أحدث العمليات (اليوم)' : lang === 'fr' ? 'Activité Récente' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${tx.type === 'add' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{tx.customerName}</span>
                    <span className="text-gray-500 dark:text-gray-400 mx-1.5">
                      {tx.type === 'add' 
                        ? (lang === 'ar' ? 'شحن' : lang === 'fr' ? 'a reçu' : 'received')
                        : (lang === 'ar' ? 'استبدل' : lang === 'fr' ? 'a échangé' : 'redeemed')
                      }
                    </span>
                    <span className={`font-medium ${tx.type === 'add' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
                      {tx.amountOrReward}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-gray-400">
                  <span>{tx.id}</span>
                  <span>{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
     <QrScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />

      {/* عرض مكوّن الإشعار حياً بأسفل الشاشة */}
        {/* عرض مكوّن الإشعار حياً بأسفل الشاشة */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-xl shadow-xl text-white font-bold text-sm transition-all duration-500 transform translate-y-0 animate-bounce ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
};
        