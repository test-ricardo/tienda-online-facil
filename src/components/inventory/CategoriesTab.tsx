
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCategoriesData } from './hooks/useCategoriesData';
import CategoriesHeader from './components/CategoriesHeader';
import CategoriesTable from './components/CategoriesTable';
import CategoryDialog from './CategoryDialog';

const CategoriesTab = () => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { toast } = useToast();

  const {
    categories,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    handleDeleteCategory,
    handleDeleteSubcategory,
  } = useCategoriesData();

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

  const handleCategorySuccess = () => {
    refetch();
    setShowCategoryDialog(false);
    toast({
      title: selectedCategory ? 'Categoría actualizada' : 'Categoría creada',
      description: 'Los cambios se han guardado correctamente.',
    });
  };

  const handleSubcategorySuccess = () => {
    refetch();
    setShowSubcategoryDialog(false);
    toast({
      title: selectedSubcategory ? 'Subcategoría actualizada' : 'Subcategoría creada',
      description: 'Los cambios se han guardado correctamente.',
    });
  };

  return (
    <div className="space-y-6">
      <CategoriesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddCategory={handleAddCategory}
        onAddSubcategory={handleAddSubcategory}
      />

      <CategoriesTable
        categories={categories || []}
        isLoading={isLoading}
        onEditCategory={handleEditCategory}
        onEditSubcategory={handleEditSubcategory}
        onDeleteCategory={handleDeleteCategory}
        onDeleteSubcategory={handleDeleteSubcategory}
      />

      {/* Category Dialog */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        category={selectedCategory}
        type="category"
        onSuccess={handleCategorySuccess}
      />

      {/* Subcategory Dialog */}
      <CategoryDialog
        open={showSubcategoryDialog}
        onOpenChange={setShowSubcategoryDialog}
        subcategory={selectedSubcategory}
        type="subcategory"
        onSuccess={handleSubcategorySuccess}
      />
    </div>
  );
};

export default CategoriesTab;
