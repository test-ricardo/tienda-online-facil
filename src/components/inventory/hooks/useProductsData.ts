
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductsData = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (name),
          subcategories (name)
        `)
        .eq('is_active', true)
        .order('name');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: stockData } = useQuery({
    queryKey: ['product-stock'],
    queryFn: async () => {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('id')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const stockPromises = (productsData || []).map(async (product) => {
        const { data: stockResult } = await supabase
          .rpc('get_product_stock', { product_id: product.id });
        return {
          product_id: product.id,
          stock: stockResult || 0
        };
      });
      
      return Promise.all(stockPromises);
    },
  });

  const getProductStock = (productId: string) => {
    const stockItem = stockData?.find(s => s.product_id === productId);
    return stockItem?.stock || 0;
  };

  return {
    products,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    getProductStock,
  };
};
