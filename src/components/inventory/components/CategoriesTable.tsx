
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Folder, FolderOpen, Edit, Trash2 } from 'lucide-react';

interface CategoriesTableProps {
  categories: any[];
  isLoading: boolean;
  onEditCategory: (category: any) => void;
  onEditSubcategory: (subcategory: any) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteSubcategory: (subcategoryId: string) => void;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  isLoading,
  onEditCategory,
  onEditSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
}) => {
  return (
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
                          onClick={() => onEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteCategory(category.id)}
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
                            onClick={() => onEditSubcategory(subcategory)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onDeleteSubcategory(subcategory.id)}
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
  );
};

export default CategoriesTable;
