
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StockMovementDialog from './StockMovementDialog';

interface ProductWithStock {
  id: string;
  name: string;
  sku: string;
  stock_unit: string;
  min_stock: number;
  max_stock: number;
  categories?: { name: string };
  subcategories?: { name: string };
  totalStock: number;
  expiringSoon: boolean;
}

const StockTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  // Obtener productos con su stock calculado
  const { data: productsWithStock, isLoading, refetch } = useQuery({
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

      // Para cada producto, calcular el stock total
      const productsWithStock = await Promise.all(
        (products || []).map(async (product) => {
          const { data: stockData } = await supabase
            .rpc('get_product_stock', { product_id: product.id });

          // Verificar si hay productos próximos a vencer
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

  const { data: recentMovements } = useQuery({
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

  const getStockStatus = (product: ProductWithStock) => {
    const minStock = product.min_stock || 0;
    const maxStock = product.max_stock;
    
    if (product.totalStock <= minStock) return 'critical';
    if (maxStock && product.totalStock >= maxStock) return 'excess';
    if (product.totalStock <= minStock * 1.5) return 'low';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'low': return 'secondary';
      case 'excess': return 'outline';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return 'Crítico';
      case 'low': return 'Bajo';
      case 'excess': return 'Exceso';
      default: return 'Normal';
    }
  };

  const handleAddMovement = (product: any) => {
    setSelectedProduct(product);
    setShowMovementDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Stock</h2>
          <p className="text-gray-600">Monitorea niveles de inventario y movimientos</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Current */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Actual
              </CardTitle>
              <CardDescription>
                {productsWithStock?.length || 0} productos con stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Alertas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsWithStock?.map((product: ProductWithStock) => {
                      const status = getStockStatus(product);
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                SKU: {product.sku}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {product.totalStock.toFixed(3)} {product.stock_unit}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(status)}>
                              {getStatusLabel(status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.expiringSoon && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Próximo a vencer
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddMovement(product)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Movimiento
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Movimientos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements?.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {movement.movement_type === 'entry' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{movement.products?.name}</div>
                        <div className="text-xs text-gray-500">
                          {movement.movement_type === 'entry' ? 'Entrada' : 
                           movement.movement_type === 'exit' ? 'Salida' :
                           movement.movement_type === 'sale' ? 'Venta' :
                           movement.movement_type === 'waste' ? 'Merma' : 'Ajuste'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-sm ${
                        movement.movement_type === 'entry' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.movement_type === 'entry' ? '+' : '-'}{movement.quantity} {movement.products?.stock_unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
        product={selectedProduct}
        onSuccess={() => {
          refetch();
          setShowMovementDialog(false);
          toast({
            title: 'Movimiento registrado',
            description: 'El movimiento de stock se ha registrado correctamente.',
          });
        }}
      />
    </div>
  );
};

export default StockTab;
