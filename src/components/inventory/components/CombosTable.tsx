
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, DollarSign, Edit } from 'lucide-react';

interface CombosTableProps {
  combos: any[];
  isLoading: boolean;
  isComboActive: (combo: any) => boolean;
  calculateSavings: (combo: any) => number;
  onEditCombo: (combo: any) => void;
}

const CombosTable: React.FC<CombosTableProps> = ({
  combos,
  isLoading,
  isComboActive,
  calculateSavings,
  onEditCombo,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Lista de Combos
        </CardTitle>
        <CardDescription>
          {combos?.length || 0} combos encontrados
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
                <TableHead>Combo</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ahorro</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combos?.map((combo) => {
                const active = isComboActive(combo);
                const savings = calculateSavings(combo);
                
                return (
                  <TableRow key={combo.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{combo.name}</div>
                        {combo.description && (
                          <div className="text-sm text-gray-500">{combo.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {combo.combo_items.map((item: any, index: number) => (
                          <div key={index} className="text-sm">
                            {item.quantity}x {item.products.name}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {combo.combo_price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-green-600 font-medium">
                        ${savings.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(combo.start_date).toLocaleDateString()}</div>
                        {combo.end_date && (
                          <div className="text-gray-500">
                            hasta {new Date(combo.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={active ? 'default' : 'secondary'}>
                        {active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCombo(combo)}
                      >
                        <Edit className="h-4 w-4" />
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
  );
};

export default CombosTable;
