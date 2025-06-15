
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
  saleNumber?: string;
  paymentMethod?: string;
}

export const useSalesHistoryData = () => {
  const [filters, setFilters] = useState<SalesFilters>({});

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales-history', filters],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customers (name, customer_code),
          sale_items (
            *,
            products (name),
            product_combos (name)
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
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
      let query = supabase
        .from('sales')
        .select('total_amount, created_at');

      // Aplicar los mismos filtros
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
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
      
      const totalSales = data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const salesCount = data?.length || 0;
      
      return {
        totalSales,
        salesCount,
        averageSale: salesCount > 0 ? totalSales / salesCount : 0,
      };
    },
  });

  return {
    sales,
    salesSummary,
    isLoading,
    filters,
    setFilters,
  };
};
