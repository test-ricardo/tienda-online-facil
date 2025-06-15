
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProductsData } from './hooks/useProductsData';
import ProductsHeader from './components/ProductsHeader';
import ProductsTable from './components/ProductsTable';
import ProductDialog from './ProductDialog';

const ProductsTab = () => {
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const {
    products,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    getProductStock,
  } = useProductsData();

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductDialog(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductDialog(true);
  };

  const handleProductSuccess = () => {
    refetch();
    setShowProductDialog(false);
    toast({
      title: selectedProduct ? 'Producto actualizado' : 'Producto creado',
      description: 'Los cambios se han guardado correctamente.',
    });
  };

  return (
    <div className="space-y-6">
      <ProductsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddProduct={handleAddProduct}
      />

      <ProductsTable
        products={products || []}
        isLoading={isLoading}
        getProductStock={getProductStock}
        onEditProduct={handleEditProduct}
      />

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={selectedProduct}
        onSuccess={handleProductSuccess}
      />
    </div>
  );
};

export default ProductsTab;
