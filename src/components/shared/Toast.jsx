import { toast } from 'sonner';

export function useToast() {
  function showToast(msg) {
    toast.success(msg);
  }

  return { showToast };
}

export { toast };
