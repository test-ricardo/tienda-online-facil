
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCombosData } from './hooks/useCombosData';
import CombosHeader from './components/CombosHeader';
import CombosTable from './components/CombosTable';
import ComboDialog from './ComboDialog';

const CombosTab = () => {
  const [showComboDialog, setShowComboDialog] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const { toast } = useToast();

  const {
    combos,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    isComboActive,
    calculateSavings,
  } = useCombosData();

  const handleEditCombo = (combo: any) => {
    setSelectedCombo(combo);
    setShowComboDialog(true);
  };

  const handleAddCombo = () => {
    setSelectedCombo(null);
    setShowComboDialog(true);
  };

  const handleComboSuccess = () => {
    refetch();
    setShowComboDialog(false);
    toast({
      title: selectedCombo ? 'Combo actualizado' : 'Combo creado',
      description: 'Los cambios se han guardado correctamente.',
    });
  };

  return (
    <div className="space-y-6">
      <CombosHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddCombo={handleAddCombo}
      />

      <CombosTable
        combos={combos || []}
        isLoading={isLoading}
        isComboActive={isComboActive}
        calculateSavings={calculateSavings}
        onEditCombo={handleEditCombo}
      />

      <ComboDialog
        open={showComboDialog}
        onOpenChange={setShowComboDialog}
        combo={selectedCombo}
        onSuccess={handleComboSuccess}
      />
    </div>
  );
};

export default CombosTab;
