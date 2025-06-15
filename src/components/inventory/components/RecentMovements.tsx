
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Movement {
  id: string;
  movement_type: string;
  quantity: number;
  created_at: string;
  products?: {
    name: string;
    sku: string;
    stock_unit: string;
  };
}

interface RecentMovementsProps {
  movements: Movement[];
}

const RecentMovements: React.FC<RecentMovementsProps> = ({ movements }) => {
  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'entry': return 'Entrada';
      case 'exit': return 'Salida';
      case 'sale': return 'Venta';
      case 'waste': return 'Merma';
      default: return 'Ajuste';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Movimientos Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements?.map((movement) => (
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
                    {getMovementTypeLabel(movement.movement_type)}
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
  );
};

export default RecentMovements;
