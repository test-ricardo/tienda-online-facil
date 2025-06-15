
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Calendar, Package, DollarSign, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ComboDialog from './ComboDialog';

const CombosTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showComboDialog, setShowComboDialog] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const { toast } = useToast();

  const { data: combos, isLoading, refetch } = useQuery({
    queryKey: ['combos', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('product_combos')
        .select(`
          *,
          combo_items (
            quantity,
            products (name, price, stock_unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const isComboActive = (combo: any) => {
    const now = new Date();
    const startDate = new Date(combo.start_date);
    const endDate = combo.end_date ? new Date(combo.end_date) : null;
    
    return combo.is_active && 
           now >= startDate && 
           (!endDate || now <= endDate);
  };

  const calculateSavings = (combo: any) => {
    const individualTotal = combo.combo_items.reduce((sum: number, item: any) => {
      return sum + (item.products.price * item.quantity);
    }, 0);
    return individualTotal - combo.combo_price;
  };

  const handleEditCombo = (combo: any) => {
    setSelectedCombo(combo);
    setShowComboDialog(true);
  };

  const handleAddCombo = () => {
    setSelectedCombo(null);
    setShowComboDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Combos de Productos</h2>
          <p className="text-gray-600">Gestiona ofertas y combos promocionales</p>
        </div>
        <Button onClick={handleAddCombo} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Combo
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar combos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Combos Table */}
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
                          onClick={() => handleEditCombo(combo)}
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

      {/* Combo Dialog */}
      <ComboDialog
        open={showComboDialog}
        onOpenChange={setShowComboDialog}
        combo={selectedCombo}
        onSuccess={() => {
          refetch();
          setShowComboDialog(false);
          toast({
            title: selectedCombo ? 'Combo actualizado' : 'Combo creado',
            description: 'Los cambios se han guardado correctamente.',
          });
        }}
      />
    </div>
  );
};

export default CombosTab;
