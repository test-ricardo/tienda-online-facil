
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

interface ProductSearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  quantityInputRef: React.RefObject<HTMLInputElement>;
  customerSelectorRef: React.RefObject<HTMLDivElement>;
  filteredProducts: any[];
  filteredCombos: any[];
  handleSearchKeyPress: (e: React.KeyboardEvent) => void;
  handleTabNavigation: (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => void;
  handleAddProduct: (product: any, quantity?: number) => Promise<void>;
  handleAddCombo: (combo: any) => Promise<void>;
}

const ProductSearchSection: React.FC<ProductSearchSectionProps> = ({
  searchTerm,
  setSearchTerm,
  searchInputRef,
  quantityInputRef,
  customerSelectorRef,
  filteredProducts,
  filteredCombos,
  handleSearchKeyPress,
  handleTabNavigation,
  handleAddProduct,
  handleAddCombo,
}) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar por nombre, SKU o código de barras... (Enter para agregar)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10 text-lg"
              autoComplete="off"
            />
          </div>
          
          {/* Input de cantidad para productos fraccionables */}
          {searchTerm && filteredProducts.length === 1 && (filteredProducts[0].sell_by_weight || filteredProducts[0].stock_unit !== 'unit') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Cantidad ({filteredProducts[0].stock_unit}):
              </label>
              <Input
                ref={quantityInputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ingresa la cantidad"
                className="w-32"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const quantity = parseFloat((e.target as HTMLInputElement).value);
                    if (quantity > 0) {
                      await handleAddProduct(filteredProducts[0], quantity);
                      setSearchTerm('');
                      (e.target as HTMLInputElement).value = '';
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }
                  }
                }}
                onKeyDown={(e) => handleTabNavigation(e, customerSelectorRef)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <Badge variant="secondary">{product.sku}</Badge>
              </div>
              <p className="text-gray-600 text-xs mb-2">
                {product.categories?.name} {product.subcategories && `- ${product.subcategories.name}`}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAddProduct(product)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCombos.map((combo) => (
          <Card key={combo.id} className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm">{combo.name}</h3>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  COMBO
                </Badge>
              </div>
              <p className="text-gray-600 text-xs mb-2">{combo.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-orange-600">
                  ${combo.combo_price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAddCombo(combo)}
                  className="h-8 w-8 p-0 bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductSearchSection;
