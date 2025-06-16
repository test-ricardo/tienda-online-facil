
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePurchaseStats = () => {
  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['purchase-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_purchase_stats');

      if (error) throw error;
      return data;
    }
  });

  return {
    stats,
    isLoading,
    error,
  };
};
