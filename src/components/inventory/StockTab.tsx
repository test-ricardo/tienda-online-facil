
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

const StockTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const { data: inventory, isLoading, refetch } = useQuery({
    queryKey: ['inventory', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('inventory')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            stock_unit,
            min_stock,
            max_stock,
            categories (name),
            subcategories (name)
          )
        `)
        .gt('quantity', 0)
        .order('entry_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por producto y calcular stock total
      const productStock = data.reduce((acc, item) => {
        const productId = item.products.id;
        if (!acc[productId]) {
          acc[productId] = {
            product: item.products,
            totalStock: 0,
            lots: [],
            expiringSoon: false,
          };
        }
        acc[productId].totalStock += parseFloat(item.quantity);
        acc[productId].lots.push(item);
        
        // Verificar si hay lotes próximos a vencer (7 días)
        if (item.expiration_date) {
          const expirationDate = new Date(item.expiration_date);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            acc[productId].expiringSoon = true;
          }
        }
        
        return acc;
      }, {});

      return Object.values(productStock).filter(item => {
        if (!searchTerm) return true;
        return item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      });
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

  const getStockStatus = (product: any, totalStock: number) => {
    const minStock = product.min_stock || 0;
    const maxStock = product.max_stock;
    
    if (totalStock <= minStock) return 'critical';
    if (maxStock && totalStock >= maxStock) return 'excess';
    if (totalStock <= minStock * 1.5) return 'low';
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
                {inventory?.length || 0} productos con stock
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
                    {inventory?.map((item: any) => {
                      const status = getStockStatus(item.product, item.totalStock);
                      
                      return (
                        <TableRow key={item.product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-gray-500">
                                SKU: {item.product.sku}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {item.totalStock.toFixed(3)} {item.product.stock_unit}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.lots.length} lote(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(status)}>
                              {getStatusLabel(status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.expiringSoon && (
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
                              onClick={() => handleAddMovement(item.product)}
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
                        <div className="font-medium text-sm">{movement.products.name}</div>
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
                        {movement.movement_type === 'entry' ? '+' : '-'}{movement.quantity} {movement.products.stock_unit}
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
