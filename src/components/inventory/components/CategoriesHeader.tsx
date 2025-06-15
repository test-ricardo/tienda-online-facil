
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface CategoriesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCategory: () => void;
  onAddSubcategory: () => void;
}

const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddCategory,
  onAddSubcategory,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías y Subcategorías</h2>
          <p className="text-gray-600">Organiza tu catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddSubcategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Subcategoría
          </Button>
          <Button onClick={onAddCategory} className="flex items-center gap-2">
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </>
  );
};

export default CategoriesHeader;
