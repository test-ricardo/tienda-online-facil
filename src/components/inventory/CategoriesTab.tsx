
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Folder, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CategoriesTab = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías y Subcategorías</h2>
          <p className="text-gray-600">Organiza tu catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Subcategoría
          </Button>
          <Button className="flex items-center gap-2">
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
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
    </div>
  );
};

export default CategoriesTab;
