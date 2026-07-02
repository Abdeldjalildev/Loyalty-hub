import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (customerId: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const { lang } = useApp();

  useEffect(() => {
    if (!isOpen) return;

    // إعداد الماسح وتحديد المعايير
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // عند نجاح المسح
        onScanSuccess(decodedText);
        scanner.clear().then(() => onClose()).catch(err => console.error(err));
      },
      (error) => {
        // يمكن تجاهل أخطاء البحث المستمر عن كود في الكاميرا لتفادي إزعاج الـ Console
      }
    );

    // تنظيف الكاميرا عند إغلاق النافذة
    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative border border-gray-100 dark:border-gray-700 shadow-xl animate-scale-in">
        
        {/* زر الإغلاق */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {lang === 'ar' ? 'مسح رمز QR للزبون' : lang === 'fr' ? 'Scanner le Code QR' : 'Scan Customer QR Code'}
        </h3>

        {/* الحاوية التي ستظهر فيها الكاميرا */}
        <div className="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div id="qr-reader" className="w-full"></div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          {lang === 'ar' ? 'ضع كود الزبون أمام الكاميرا ليتم التعرف عليه تلقائياً' : lang === 'fr' ? 'Placez le code QR devant la caméra' : 'Place the QR code in front of the camera'}
        </p>
      </div>
    </div>
  );
};