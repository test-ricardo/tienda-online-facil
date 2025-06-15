
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SalesData {
  todaySales: number;
  totalTransactions: number;
  cashSales: number;
  cardSales: number;
  averageTicket: number;
}

const SalesDataSection: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData>({
    todaySales: 0,
    totalTransactions: 0,
    cashSales: 0,
    cardSales: 0,
    averageTicket: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch today's sales
      const { data: sales, error } = await supabase
        .from('sales')
        .select('total_amount, payment_method')
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .eq('sale_status', 'completed');

      if (error) throw error;

      if (sales) {
        const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const totalTransactions = sales.length;
        const cashSales = sales
          .filter(sale => sale.payment_method === 'cash')
          .reduce((sum, sale) => sum + sale.total_amount, 0);
        const cardSales = sales
          .filter(sale => sale.payment_method === 'card')
          .reduce((sum, sale) => sum + sale.total_amount, 0);
        const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

        setSalesData({
          todaySales: totalSales,
          totalTransactions,
          cashSales,
          cardSales,
          averageTicket,
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ventas del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-2xl font-bold">${salesData.todaySales.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="text-2xl font-bold">{salesData.totalTransactions}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ticket Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-2xl font-bold">${salesData.averageTicket.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ventas por Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Efectivo
            </span>
            <span className="font-bold">${salesData.cashSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              Tarjetas
            </span>
            <span className="font-bold">${salesData.cardSales.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDataSection;
