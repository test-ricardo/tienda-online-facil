
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ExpirationTab = () => {
  const [daysAhead, setDaysAhead] = useState('7');

  const { data: expiringProducts, isLoading } = useQuery({
    queryKey: ['expiring-products', daysAhead],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expiring_products', {
        days_ahead: parseInt(daysAhead)
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['expiration-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expiration_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Get related data separately based on alert_type
      const alertsWithData = await Promise.all(
        (data || []).map(async (alert) => {
          let relatedData = null;
          
          if (alert.alert_type === 'category') {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('name')
              .eq('id', alert.reference_id)
              .single();
            relatedData = categoryData;
          } else if (alert.alert_type === 'subcategory') {
            const { data: subcategoryData } = await supabase
              .from('subcategories')
              .select('name')
              .eq('id', alert.reference_id)
              .single();
            relatedData = subcategoryData;
          } else if (alert.alert_type === 'product') {
            const { data: productData } = await supabase
              .from('products')
              .select('name')
              .eq('id', alert.reference_id)
              .single();
            relatedData = productData;
          }
          
          return {
            ...alert,
            relatedData
          };
        })
      );
      
      return alertsWithData;
    },
  });

  const getDaysColor = (days: number) => {
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Vencimientos</h2>
          <p className="text-gray-600">Monitorea productos próximos a vencer</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Alerta
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="days" className="text-sm font-medium">
                Mostrar productos que vencen en los próximos:
              </label>
              <Input
                id="days"
                type="number"
                value={daysAhead}
                onChange={(e) => setDaysAhead(e.target.value)}
                className="w-20"
                min="1"
                max="365"
              />
              <span className="text-sm text-gray-500">días</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Productos Próximos a Vencer
            </CardTitle>
            <CardDescription>
              {expiringProducts?.length || 0} productos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : expiringProducts?.length === 0 ? (
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
                  {expiringProducts?.map((product, index) => (
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

        {/* Alerts Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Configuradas
            </CardTitle>
            <CardDescription>
              {alerts?.length || 0} alertas activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts?.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">
                      {alert.relatedData?.name || 'Nombre no disponible'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {alert.alert_type === 'category' && 'Categoría'}
                      {alert.alert_type === 'subcategory' && 'Subcategoría'}
                      {alert.alert_type === 'product' && 'Producto'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {alert.days_before_expiration} días
                    </div>
                    <div className="text-xs text-gray-500">
                      antes del vencimiento
                    </div>
                  </div>
                </div>
              ))}
              {alerts?.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay alertas configuradas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpirationTab;
