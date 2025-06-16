
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseStats {
  total_invoices: number;
  total_amount: number;
  pending_invoices: number;
  pending_amount: number;
  top_supplier: string;
  avg_invoice_amount: number;
}

export const usePurchaseStats = () => {
  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['purchase-stats'],
    queryFn: async (): Promise<PurchaseStats[]> => {
      const { data, error } = await supabase.rpc('get_purchase_stats');

      if (error) throw error;
      return data || [];
    }
  });

  return {
    stats,
    isLoading,
    error,
  };
};
