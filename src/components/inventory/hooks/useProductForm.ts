
import { useState, useEffect } from 'react';

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category_id: string;
  subcategory_id: string;
  price: string;
  cost: string;
  sell_by_weight: boolean;
  stock_unit: string;
  min_stock: string;
  max_stock: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  sku: '',
  barcode: '',
  category_id: '',
  subcategory_id: '',
  price: '',
  cost: '',
  sell_by_weight: false,
  stock_unit: 'unit',
  min_stock: '',
  max_stock: '',
};

export const useProductForm = (product: any, open: boolean) => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  useEffect(() => {
    console.log('useProductForm - open:', open, 'product:', product);
    
    if (open) {
      if (product) {
        console.log('Loading product data:', product);
        setFormData({
          name: product.name || '',
          description: product.description || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          category_id: product.category_id || '',
          subcategory_id: product.subcategory_id || '',
          price: product.price ? product.price.toString() : '',
          cost: product.cost ? product.cost.toString() : '',
          sell_by_weight: Boolean(product.sell_by_weight),
          stock_unit: product.stock_unit || 'unit',
          min_stock: product.min_stock ? product.min_stock.toString() : '',
          max_stock: product.max_stock ? product.max_stock.toString() : '',
        });
      } else {
        console.log('Resetting form for new product');
        setFormData(initialFormData);
      }
    }
  }, [product, open]);

  return { formData, setFormData };
};
