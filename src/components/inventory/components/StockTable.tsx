
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertTriangle } from 'lucide-react';

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

interface StockTableProps {
  products: ProductWithStock[];
  isLoading: boolean;
  onAddMovement: (product: ProductWithStock) => void;
}

const StockTable: React.FC<StockTableProps> = ({ products, isLoading, onAddMovement }) => {
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

  const formatStockQuantity = (product: ProductWithStock) => {
    if (product.sell_by_weight) {
      return product.totalStock.toFixed(3);
    }
    return Math.floor(product.totalStock).toString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
        {products?.map((product: ProductWithStock) => {
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
                  {formatStockQuantity(product)} {product.stock_unit}
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
                  onClick={() => onAddMovement(product)}
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
  );
};

export default StockTable;
