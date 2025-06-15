
interface ValidationData {
  name: string;
  sku: string;
  category_id: string;
  price: string;
  cost: string;
}

export const validateProductData = (data: ValidationData) => {
  if (!data.name.trim()) {
    throw new Error('El nombre del producto es requerido');
  }
  if (!data.sku.trim()) {
    throw new Error('El SKU es requerido');
  }
  if (!data.category_id) {
    throw new Error('La categoría es requerida');
  }
  if (!data.price || parseFloat(data.price) <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }
  if (!data.cost || parseFloat(data.cost) <= 0) {
    throw new Error('El costo debe ser mayor a 0');
  }
};

export const prepareProductData = (formData: any) => {
  return {
    name: formData.name.trim(),
    description: formData.description.trim() || null,
    sku: formData.sku.trim(),
    barcode: formData.barcode.trim() || null,
    category_id: formData.category_id,
    subcategory_id: formData.subcategory_id || null,
    price: parseFloat(formData.price),
    cost: parseFloat(formData.cost),
    sell_by_weight: formData.sell_by_weight,
    stock_unit: formData.stock_unit,
    min_stock: formData.min_stock ? parseFloat(formData.min_stock) : 0,
    max_stock: formData.max_stock ? parseFloat(formData.max_stock) : null,
  };
};
