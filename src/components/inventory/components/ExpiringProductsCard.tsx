
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface ExpiringProduct {
  product_name: string;
  quantity: number;
  expiration_date: string;
  days_until_expiry: number;
}

interface ExpiringProductsCardProps {
  products: ExpiringProduct[] | undefined;
  isLoading: boolean;
}

const ExpiringProductsCard: React.FC<ExpiringProductsCardProps> = ({
  products,
  isLoading,
}) => {
  const getDaysColor = (days: number) => {
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Productos Próximos a Vencer
        </CardTitle>
        <CardDescription>
          {products?.length || 0} productos encontrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay productos próximos a vencer
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{product.product_name}</div>
                  </TableCell>
                  <TableCell>
                    {product.quantity}
                  </TableCell>
                  <TableCell>
                    {new Date(product.expiration_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDaysColor(product.days_until_expiry)}>
                      {product.days_until_expiry} día(s)
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiringProductsCard;
