
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductWithStock {
  id: string;
  name: string;
  sku: string;
  stock_unit: string;
  min_stock: number;
  max_stock: number;
  sell_by_weight: boolean;
  categories?: { name: string };
  subcategories?: { name: string };
  totalStock: number;
  expiringSoon: boolean;
}

export const useStockData = (searchTerm: string) => {
  const productsQuery = useQuery({
    queryKey: ['products-with-stock', searchTerm],
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
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      const { data: products, error } = await query;
      if (error) throw error;

      const productsWithStock = await Promise.all(
        (products || []).map(async (product) => {
          const { data: stockData } = await supabase
            .rpc('get_product_stock', { product_id: product.id });

          const { data: expiringStock } = await supabase
            .from('inventory')
            .select('quantity, expiration_date')
            .eq('product_id', product.id)
            .not('expiration_date', 'is', null)
            .gt('quantity', 0);

          const expiringSoon = (expiringStock || []).some(item => {
            if (!item.expiration_date) return false;
            const expirationDate = new Date(item.expiration_date);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
          });

          return {
            ...product,
            totalStock: stockData || 0,
            expiringSoon,
          } as ProductWithStock;
        })
      );

      return productsWithStock;
    },
  });

  const movementsQuery = useQuery({
    queryKey: ['recent-stock-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (name, sku, stock_unit)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return {
    productsWithStock: productsQuery.data,
    isLoadingProducts: productsQuery.isLoading,
    refetchProducts: productsQuery.refetch,
    recentMovements: movementsQuery.data,
  };
};
