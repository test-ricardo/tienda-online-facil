
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface CombosHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCombo: () => void;
}

const CombosHeader: React.FC<CombosHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddCombo,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Combos de Productos</h2>
          <p className="text-gray-600">Gestiona ofertas y combos promocionales</p>
        </div>
        <Button onClick={onAddCombo} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Combo
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar combos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </>
  );
};

export default CombosHeader;
