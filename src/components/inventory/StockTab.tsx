
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StockMovementDialog from './StockMovementDialog';
import StockTable from './components/StockTable';
import RecentMovements from './components/RecentMovements';
import { useStockData } from './hooks/useStockData';

const StockTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const {
    productsWithStock,
    isLoadingProducts,
    refetchProducts,
    recentMovements,
  } = useStockData(searchTerm);

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
              <StockTable
                products={productsWithStock || []}
                isLoading={isLoadingProducts}
                onAddMovement={handleAddMovement}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <div>
          <RecentMovements movements={recentMovements || []} />
        </div>
      </div>

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
        product={selectedProduct}
        onSuccess={() => {
          refetchProducts();
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
