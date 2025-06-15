
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCombosData = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: combos, isLoading, refetch } = useQuery({
    queryKey: ['combos', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('product_combos')
        .select(`
          *,
          combo_items (
            quantity,
            products (name, price, stock_unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const isComboActive = (combo: any) => {
    const now = new Date();
    const startDate = new Date(combo.start_date);
    const endDate = combo.end_date ? new Date(combo.end_date) : null;
    
    return combo.is_active && 
           now >= startDate && 
           (!endDate || now <= endDate);
  };

  const calculateSavings = (combo: any) => {
    const individualTotal = combo.combo_items.reduce((sum: number, item: any) => {
      return sum + (item.products.price * item.quantity);
    }, 0);
    return individualTotal - combo.combo_price;
  };

  return {
    combos,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    isComboActive,
    calculateSavings,
  };
};
