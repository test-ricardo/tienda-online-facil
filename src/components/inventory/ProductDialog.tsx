
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSuccess: () => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category_id: '',
    subcategory_id: '',
    price: '',
    cost: '',
    sell_by_weight: false,
    stock_unit: 'unit',
    min_stock: '',
    max_stock: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
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
    queryKey: ['subcategories', formData.category_id],
    queryFn: async () => {
      if (!formData.category_id) return [];
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', formData.category_id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.category_id,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        sell_by_weight: product.sell_by_weight || false,
        stock_unit: product.stock_unit || 'unit',
        min_stock: product.min_stock?.toString() || '',
        max_stock: product.max_stock?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        category_id: '',
        subcategory_id: '',
        price: '',
        cost: '',
        sell_by_weight: false,
        stock_unit: 'unit',
        min_stock: '',
        max_stock: '',
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        min_stock: formData.min_stock ? parseFloat(formData.min_stock) : 0,
        max_stock: formData.max_stock ? parseFloat(formData.max_stock) : null,
        subcategory_id: formData.subcategory_id || null,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
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

  const stockUnits = [
    { value: 'unit', label: 'Unidad' },
    { value: 'kg', label: 'Kilogramo' },
    { value: 'gram', label: 'Gramo' },
    { value: 'liter', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'piece', label: 'Pieza' },
    { value: 'box', label: 'Caja' },
    { value: 'pack', label: 'Paquete' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al inventario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_unit">Unidad de Stock</Label>
              <Select value={formData.stock_unit} onValueChange={(value) => setFormData({ ...formData, stock_unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stockUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoría</Label>
              <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories?.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                step="0.001"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_stock">Stock Máximo</Label>
              <Input
                id="max_stock"
                type="number"
                step="0.001"
                value={formData.max_stock}
                onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sell_by_weight"
              checked={formData.sell_by_weight}
              onCheckedChange={(checked) => setFormData({ ...formData, sell_by_weight: checked })}
            />
            <Label htmlFor="sell_by_weight">Se vende por peso/decimales</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
