
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const LowStockAlerts = () => {
  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ['low-stock-products'],
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
          
          const currentStock = stockData || 0;
          const isLowStock = currentStock <= (product.min_stock || 0);
          
          return {
            ...product,
            currentStock,
            isLowStock
          };
        })
      );

      return productsWithStock.filter(p => p.isLowStock);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alertas de Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Cargando alertas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Alertas de Stock Bajo
          {lowStockProducts && lowStockProducts.length > 0 && (
            <Badge variant="destructive">{lowStockProducts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!lowStockProducts || lowStockProducts.length === 0 ? (
          <div className="text-center text-green-600 py-4">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p>¡Todos los productos tienen stock suficiente!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-800">{product.name}</h4>
                  <p className="text-sm text-red-600">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-800">
                    {product.currentStock} {product.stock_unit}
                  </div>
                  <div className="text-sm text-red-600">
                    Mín: {product.min_stock || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;
