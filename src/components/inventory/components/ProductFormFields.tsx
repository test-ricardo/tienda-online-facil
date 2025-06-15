
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ProductFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  subcategories: any[];
}

const stockUnits = [
  { value: 'unit', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'gram', label: 'Gramo' },
  { value: 'liter', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
  { value: 'piece', label: 'Pieza' },
  { value: 'box', label: 'Caja' },
  { value: 'pack', label: 'Paquete' },
];

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  formData,
  setFormData,
  categories,
  subcategories,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_unit">Unidad de Stock</Label>
          <Select value={formData.stock_unit} onValueChange={(value) => setFormData({ ...formData, stock_unit: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stockUnits.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategoría</Label>
          <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar subcategoría" />
            </SelectTrigger>
            <SelectContent>
              {subcategories?.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">Costo *</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Precio *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_stock">Stock Mínimo</Label>
          <Input
            id="min_stock"
            type="number"
            step="0.001"
            value={formData.min_stock}
            onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_stock">Stock Máximo</Label>
          <Input
            id="max_stock"
            type="number"
            step="0.001"
            value={formData.max_stock}
            onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="sell_by_weight"
          checked={formData.sell_by_weight}
          onCheckedChange={(checked) => setFormData({ ...formData, sell_by_weight: checked })}
        />
        <Label htmlFor="sell_by_weight">Se vende por peso/decimales</Label>
      </div>
    </div>
  );
};

export default ProductFormFields;
