
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategoryQuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'category' | 'subcategory';
  categoryId?: string;
  onSuccess: (newItem: any) => void;
}

const CategoryQuickAddDialog: React.FC<CategoryQuickAddDialogProps> = ({
  open,
  onOpenChange,
  type,
  categoryId,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (type === 'category') {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: name.trim(), description: description.trim() || null }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Categoría creada',
          description: 'La categoría se ha creado correctamente.',
        });

        onSuccess(data);
      } else {
        if (!categoryId) {
          throw new Error('Se requiere una categoría para crear subcategoría');
        }

        const { data, error } = await supabase
          .from('subcategories')
          .insert([{ 
            name: name.trim(), 
            description: description.trim() || null,
            category_id: categoryId 
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Subcategoría creada',
          description: 'La subcategoría se ha creado correctamente.',
        });

        onSuccess(data);
      }

      setName('');
      setDescription('');
      onOpenChange(false);
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

  const handleCancel = () => {
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Nueva {type === 'category' ? 'Categoría' : 'Subcategoría'}
          </DialogTitle>
          <DialogDescription>
            Crear una nueva {type === 'category' ? 'categoría' : 'subcategoría'} rápidamente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Nombre de la ${type === 'category' ? 'categoría' : 'subcategoría'}`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryQuickAddDialog;
