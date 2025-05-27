
import React, { useState, useEffect } from 'react';
import type { ConfirmationModalProps } from '../types';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  promptLabel = "Motiu:",
  showPrompt = false,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancel·lar",
}) => {
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setReason(''); // Reset reason when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (showPrompt && !reason.trim()) {
      // Optional: Add a small inline error or rely on external notification
      alert('Si us plau, introduïu un motiu.');
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="confirmation-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 id="confirmation-modal-title" className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-sm text-gray-700 mb-5 whitespace-pre-wrap">{message}</p>

        {showPrompt && (
          <div className="mb-4">
            <label htmlFor="confirmation-reason" className="block text-sm font-medium text-gray-700 mb-1">
              {promptLabel}
            </label>
            <textarea
              id="confirmation-reason"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Introduïu el motiu aquí..."
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
