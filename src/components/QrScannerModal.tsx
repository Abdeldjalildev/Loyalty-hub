import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (customerId: string) => void;
}

/**
 * QrScannerModal component. Renders an overlay module initiating
 * hardware camera permissions to handle real-time code verification.
 */
export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const { t } = useApp();

  useEffect(() => {
    if (!isOpen) return;

    // Configure the scanner dimensions and properties
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear()
          .then(() => onClose())
          .catch(err => console.error("Error clearing scanner on success:", err));
      },
      () => {
        // Continuous lookup errors can be safely ignored to keep the console clean
      }
    );

    // Secure component cleanup lifecycle on unmount/close
    return () => {
      scanner.clear()
        .catch(err => console.error("Failed to clear scanner on unmount:", err));
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative border border-gray-100 dark:border-gray-700 shadow-xl animate-scale-in">
        
        {/* Close Action Trigger Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('scanTitle')}
        </h3>

        {/* Camera Feed Capture DOM target container */}
        <div className="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div id="qr-reader" className="w-full"></div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          {t('scanCameraInstruction')}
        </p>
      </div>
    </div>
  );
};