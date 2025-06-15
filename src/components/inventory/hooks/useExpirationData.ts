
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useExpirationData = () => {
  const [daysAhead, setDaysAhead] = useState('7');
  const { toast } = useToast();

  const { data: expiringProducts, isLoading } = useQuery({
    queryKey: ['expiring-products', daysAhead],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expiring_products', {
        days_ahead: parseInt(daysAhead)
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['expiration-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expiration_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Get related data separately based on alert_type
      const alertsWithData = await Promise.all(
        (data || []).map(async (alert) => {
          let relatedData = null;
          
          if (alert.alert_type === 'category') {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('name')
              .eq('id', alert.reference_id)
              .single();
            relatedData = categoryData;
          } else if (alert.alert_type === 'subcategory') {
            const { data: subcategoryData } = await supabase
              .from('subcategories')
              .select('name')
              .eq('id', alert.reference_id)
              .single();
            relatedData = subcategoryData;
          } else if (alert.alert_type === 'product') {
            const { data: productData } = await supabase
              .from('products')
              .select('name')
              .eq('id', alert.reference_id)
              .single();
            relatedData = productData;
          }
          
          return {
            ...alert,
            relatedData
          };
        })
      );
      
      return alertsWithData;
    },
  });

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('expiration_alerts')
        .delete()
        .eq('id', alertId);
      
      if (error) throw error;
      
      refetchAlerts();
      toast({
        title: 'Alerta eliminada',
        description: 'La alerta se ha eliminado correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    daysAhead,
    setDaysAhead,
    expiringProducts,
    isLoading,
    alerts,
    refetchAlerts,
    handleDeleteAlert,
  };
};
