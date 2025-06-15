
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  subcategory?: any;
  type: 'category' | 'subcategory';
  onSuccess: () => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  subcategory,
  type,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ['categories-for-subcategory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: type === 'subcategory',
  });

  useEffect(() => {
    if (type === 'category' && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        category_id: '',
      });
    } else if (type === 'subcategory' && subcategory) {
      setFormData({
        name: subcategory.name || '',
        description: subcategory.description || '',
        category_id: subcategory.category_id || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category_id: '',
      });
    }
  }, [category, subcategory, type, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        ...(type === 'subcategory' && { category_id: formData.category_id }),
      };

      if (type === 'category') {
        if (category) {
          const { error } = await supabase
            .from('categories')
            .update(data)
            .eq('id', category.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([data]);
          if (error) throw error;
        }
      } else {
        if (subcategory) {
          const { error } = await supabase
            .from('subcategories')
            .update(data)
            .eq('id', subcategory.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('subcategories')
            .insert([data]);
          if (error) throw error;
        }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {type === 'category' 
              ? (category ? 'Editar Categoría' : 'Nueva Categoría')
              : (subcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría')
            }
          </DialogTitle>
          <DialogDescription>
            {type === 'category' 
              ? (category ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría')
              : (subcategory ? 'Modifica los datos de la subcategoría' : 'Crea una nueva subcategoría')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {type === 'subcategory' && (
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 
                type === 'category' 
                  ? (category ? 'Actualizar' : 'Crear Categoría')
                  : (subcategory ? 'Actualizar' : 'Crear Subcategoría')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
