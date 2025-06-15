
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ReportsTab = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  
  const [dateTo, setDateTo] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  // Sales analytics
  const { data: salesAnalytics } = useQuery({
    queryKey: ['sales-analytics', dateFrom, dateTo],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          total_amount,
          created_at,
          payment_method,
          sale_items (
            quantity,
            item_name,
            total_price
          )
        `)
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo + 'T23:59:59');

      if (error) throw error;

      // Process data for charts
      const dailySales = sales?.reduce((acc: any, sale) => {
        const date = new Date(sale.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + sale.total_amount;
        return acc;
      }, {}) || {};

      const paymentMethodStats = sales?.reduce((acc: any, sale) => {
        acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount;
        return acc;
      }, {}) || {};

      const topProducts = sales?.flatMap(sale => sale.sale_items || [])
        .reduce((acc: any, item) => {
          acc[item.item_name] = (acc[item.item_name] || 0) + item.quantity;
          return acc;
        }, {}) || {};

      return {
        totalSales: sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
        salesCount: sales?.length || 0,
        dailySales: Object.entries(dailySales).map(([date, amount]) => ({ date, amount })),
        paymentMethods: Object.entries(paymentMethodStats).map(([method, amount]) => ({ method, amount })),
        topProducts: Object.entries(topProducts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([product, quantity]) => ({ product, quantity }))
      };
    },
  });

  // Inventory analytics
  const { data: inventoryAnalytics } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;

      const productsWithStock = await Promise.all(
        (products || []).map(async (product) => {
          const { data: stockData } = await supabase
            .rpc('get_product_stock', { product_id: product.id });
          
          return {
            ...product,
            currentStock: stockData || 0
          };
        })
      );

      const lowStockCount = productsWithStock.filter(p => p.currentStock <= (p.min_stock || 0)).length;
      const totalValue = productsWithStock.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);

      return {
        totalProducts: productsWithStock.length,
        lowStockCount,
        totalValue,
        stockDistribution: productsWithStock.map(p => ({
          name: p.name,
          stock: p.currentStock,
          value: p.currentStock * p.cost
        })).sort((a, b) => b.value - a.value).slice(0, 10)
      };
    },
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Date filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales">Análisis de Ventas</TabsTrigger>
          <TabsTrigger value="inventory">Análisis de Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold">${salesAnalytics?.totalSales.toFixed(2) || '0.00'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Número de Ventas</p>
                  <p className="text-2xl font-bold">{salesAnalytics?.salesCount || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Venta Promedio</p>
                  <p className="text-2xl font-bold">
                    ${salesAnalytics && salesAnalytics.salesCount > 0 
                      ? (salesAnalytics.totalSales / salesAnalytics.salesCount).toFixed(2) 
                      : '0.00'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas Diarias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesAnalytics?.dailySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas']} />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesAnalytics?.paymentMethods || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({method, amount}) => `${method}: $${Number(amount).toFixed(2)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {(salesAnalytics?.paymentMethods || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top products */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesAnalytics?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold">{inventoryAnalytics?.totalProducts || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold">{inventoryAnalytics?.lowStockCount || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                  <p className="text-2xl font-bold">${inventoryAnalytics?.totalValue.toFixed(2) || '0.00'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Valor por Producto (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventoryAnalytics?.stockDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Valor']} />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsTab;
