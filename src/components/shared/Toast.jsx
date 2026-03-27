import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Fixed banner toast (same visual language as Settings). Use with `useToastMessage` or your own state.
 *
 * @param {string} message - Text to show
 * @param {boolean} visible - When false, nothing is rendered
 * @param {'default' | 'destructive'} [variant] - default = dark slate bar; destructive = red for errors
 */
export function Toast({ message, visible, variant = 'default', className }) {
  if (!visible || message == null || String(message).trim() === '') return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed right-4 top-4 z-50 max-w-md rounded-lg border px-4 py-2 text-sm font-medium shadow-lg sm:right-6 sm:top-6',
        variant === 'destructive'
          ? 'border-red-300 bg-red-950 text-red-50'
          : 'border-slate-200/80 bg-slate-900 text-white',
        className,
      )}
    >
      {message}
    </div>
  );
}

/**
 * Banner toast state + helper. Clears automatically after `duration` ms.
 */
export function useToastMessage(duration = 3000) {
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('default');
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage('');
  }, []);

  const showToast = useCallback(
    (msg, options = {}) => {
      const nextVariant = options.variant === 'destructive' ? 'destructive' : 'default';
      const ms = typeof options.duration === 'number' ? options.duration : duration;
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      setVariant(nextVariant);
      setMessage(msg);
      timeoutRef.current = window.setTimeout(() => {
        setMessage('');
        timeoutRef.current = null;
      }, ms);
    },
    [duration],
  );

  return {
    message,
    variant,
    showToast,
    hideToast,
  };
}

/** Sonner toasts (global `<Toaster />` in App) — use when you prefer stacked toasts instead of the banner. */
export { toast } from 'sonner';
