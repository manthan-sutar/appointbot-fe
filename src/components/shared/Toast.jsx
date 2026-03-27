import { useState } from 'react';

export function Toast({ message, visible }) {
  if (!visible || !message) return null;
  return (
    <div className="fixed right-4 top-4 z-50 rounded-lg border border-slate-200/80 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg sm:right-6 sm:top-6">
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  return { toast, showToast };
}
