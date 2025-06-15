
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
  saleNumber?: string;
  paymentMethod?: string;
}

export const useSalesHistoryData = () => {
  const [filters, setFilters] = useState<SalesFilters>({});

  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ['sales-history', filters],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customers (name, customer_code),
          sale_items (
            id,
            item_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.dateFrom) {
        query = query.gte('created_at', `${filters.dateFrom}T00:00:00.000Z`);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', `${filters.dateTo}T23:59:59.999Z`);
      }
      
      if (filters.customerName) {
        query = query.ilike('customer_name', `%${filters.customerName}%`);
      }
      
      if (filters.saleNumber) {
        query = query.ilike('sale_number', `%${filters.saleNumber}%`);
      }
      
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const { data: salesSummary } = useQuery({
    queryKey: ['sales-summary', filters],
    queryFn: async () => {
      if (!sales || sales.length === 0) return null;
      
      // Filtrar ventas no canceladas para el resumen
      const activeSales = sales.filter(sale => sale.sale_status !== 'cancelled');
      
      const totalSales = activeSales.reduce((sum, sale) => sum + sale.total_amount, 0);
      const salesCount = activeSales.length;
      const averageSale = salesCount > 0 ? totalSales / salesCount : 0;
      
      return {
        totalSales,
        salesCount,
        averageSale,
      };
    },
    enabled: !!sales,
  });

  return {
    sales,
    salesSummary,
    isLoading,
    filters,
    setFilters,
    refetchSales: refetch,
  };
};
