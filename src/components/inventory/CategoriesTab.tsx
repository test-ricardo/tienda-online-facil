
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Folder, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CategoryDialog from './CategoryDialog';

const CategoriesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
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

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setShowCategoryDialog(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setSelectedCategory(null);
    setShowSubcategoryDialog(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShowCategoryDialog(true);
  };

  const handleAddSubcategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShowSubcategoryDialog(true);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías y Subcategorías</h2>
          <p className="text-gray-600">Organiza tu catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddSubcategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Subcategoría
          </Button>
          <Button onClick={handleAddCategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Categoría
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Lista de Categorías
          </CardTitle>
          <CardDescription>
            {categories?.length || 0} categorías encontradas
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
                  <TableHead>Categoría/Subcategoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Subcategorías</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <React.Fragment key={category.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {category.subcategories?.length || 0} subcategorías
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(category.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {category.subcategories?.map((subcategory: any) => (
                      <TableRow key={subcategory.id} className="bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2 ml-6">
                            <Folder className="h-4 w-4 text-gray-500" />
                            <span>{subcategory.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {subcategory.description}
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {new Date(subcategory.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditSubcategory(subcategory)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        category={selectedCategory}
        type="category"
        onSuccess={() => {
          refetch();
          setShowCategoryDialog(false);
          toast({
            title: selectedCategory ? 'Categoría actualizada' : 'Categoría creada',
            description: 'Los cambios se han guardado correctamente.',
          });
        }}
      />

      {/* Subcategory Dialog */}
      <CategoryDialog
        open={showSubcategoryDialog}
        onOpenChange={setShowSubcategoryDialog}
        subcategory={selectedSubcategory}
        type="subcategory"
        onSuccess={() => {
          refetch();
          setShowSubcategoryDialog(false);
          toast({
            title: selectedSubcategory ? 'Subcategoría actualizada' : 'Subcategoría creada',
            description: 'Los cambios se han guardado correctamente.',
          });
        }}
      />
    </div>
  );
};

export default CategoriesTab;
