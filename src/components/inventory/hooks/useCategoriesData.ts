
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCategoriesData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['categories-with-subcategories', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `)
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      refetch();
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría se ha eliminado correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);
      
      if (error) throw error;
      
      refetch();
      toast({
        title: 'Subcategoría eliminada',
        description: 'La subcategoría se ha eliminado correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    categories,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    handleDeleteCategory,
    handleDeleteSubcategory,
  };
};
