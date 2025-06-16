
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProductForm } from './hooks/useProductForm';
import { validateProductData, prepareProductData } from './utils/productValidation';
import ProductFormFields from './components/ProductFormFields';

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { formData, setFormData } = useProductForm(product, open);
  const queryClient = useQueryClient();

  const { data: categories, refetch: refetchCategories } = useQuery({
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

  const { data: subcategories, refetch: refetchSubcategories } = useQuery({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateProductData(formData);
      const data = prepareProductData(formData);

      if (product) {
        console.log('Actualizando producto:', product.id, data);
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id);
        if (error) throw error;
        
        toast({
          title: 'Producto actualizado',
          description: 'El producto se ha actualizado correctamente.',
        });
      } else {
        console.log('Creando nuevo producto:', data);
        const { error } = await supabase
          .from('products')
          .insert([data]);
        if (error) throw error;
        
        toast({
          title: 'Producto creado',
          description: 'El producto se ha creado correctamente.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Refrescar categorías y subcategorías cuando se agreguen nuevas
  const handleCategorySuccess = (newCategory: any) => {
    refetchCategories();
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    setFormData({ ...formData, category_id: newCategory.id, subcategory_id: '' });
  };

  const handleSubcategorySuccess = (newSubcategory: any) => {
    refetchSubcategories();
    queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    setFormData({ ...formData, subcategory_id: newSubcategory.id });
  };

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

        <form onSubmit={handleSubmit}>
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            categories={categories || []}
            subcategories={subcategories || []}
          />

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
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
