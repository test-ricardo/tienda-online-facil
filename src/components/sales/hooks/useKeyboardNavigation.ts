
export const useKeyboardNavigation = () => {
  const handleTabNavigation = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleSearchKeyPress = async (e: React.KeyboardEvent, filteredProducts: any[], filteredCombos: any[], quantityInputRef: React.RefObject<HTMLInputElement>, searchTerm: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (!searchTerm.trim()) {
        return;
      }
      
      const exactProduct = filteredProducts.find(p => 
        p.barcode === searchTerm || 
        p.sku === searchTerm ||
        p.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      const exactCombo = filteredCombos.find(c =>
        c.name.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactProduct || exactCombo || filteredProducts.length === 1 || 
          (filteredProducts.length === 0 && filteredCombos.length === 1)) {
        setTimeout(() => {
          if (quantityInputRef.current) {
            quantityInputRef.current.focus();
            quantityInputRef.current.select();
          }
        }, 100);
      }
    }
  };

  return {
    handleTabNavigation,
    handleSearchKeyPress,
  };
};
