
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert?: any;
  onSuccess: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  alert,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    alert_type: 'product',
    reference_id: '',
    days_before_expiration: '7',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ['categories-for-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories-for-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*, categories(name)')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (alert) {
      setFormData({
        alert_type: alert.alert_type || 'product',
        reference_id: alert.reference_id || '',
        days_before_expiration: alert.days_before_expiration?.toString() || '7',
        is_active: alert.is_active ?? true,
      });
    } else {
      setFormData({
        alert_type: 'product',
        reference_id: '',
        days_before_expiration: '7',
        is_active: true,
      });
    }
  }, [alert, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const data = {
        ...formData,
        days_before_expiration: parseInt(formData.days_before_expiration),
        created_by: user.id,
      };

      if (alert) {
        const { error } = await supabase
          .from('expiration_alerts')
          .update(data)
          .eq('id', alert.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expiration_alerts')
          .insert([data]);
        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getOptionsForType = () => {
    switch (formData.alert_type) {
      case 'category':
        return categories?.map(cat => ({ id: cat.id, name: cat.name })) || [];
      case 'subcategory':
        return subcategories?.map(sub => ({ 
          id: sub.id, 
          name: `${sub.name} (${sub.categories?.name})` 
        })) || [];
      case 'product':
        return products?.map(prod => ({ id: prod.id, name: prod.name })) || [];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {alert ? 'Editar Alerta' : 'Nueva Alerta de Vencimiento'}
          </DialogTitle>
          <DialogDescription>
            {alert ? 'Modifica la configuración de la alerta' : 'Configura una nueva alerta de vencimiento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alert_type">Tipo de Alerta *</Label>
            <Select 
              value={formData.alert_type} 
              onValueChange={(value) => setFormData({ ...formData, alert_type: value, reference_id: '' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Categoría</SelectItem>
                <SelectItem value="subcategory">Subcategoría</SelectItem>
                <SelectItem value="product">Producto Específico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_id">
              {formData.alert_type === 'category' && 'Categoría *'}
              {formData.alert_type === 'subcategory' && 'Subcategoría *'}
              {formData.alert_type === 'product' && 'Producto *'}
            </Label>
            <Select 
              value={formData.reference_id} 
              onValueChange={(value) => setFormData({ ...formData, reference_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Seleccionar ${formData.alert_type}`} />
              </SelectTrigger>
              <SelectContent>
                {getOptionsForType().map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days_before_expiration">Días antes del vencimiento *</Label>
            <Input
              id="days_before_expiration"
              type="number"
              min="1"
              max="365"
              value={formData.days_before_expiration}
              onChange={(e) => setFormData({ ...formData, days_before_expiration: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Alerta activa</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : alert ? 'Actualizar' : 'Crear Alerta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDialog;
