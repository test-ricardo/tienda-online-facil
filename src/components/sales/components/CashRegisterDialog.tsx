
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign } from 'lucide-react';
import { useCashRegister } from '../hooks/useCashRegister';
import CashRegisterStatus from './CashRegisterStatus';
import CashRegisterOperations from './CashRegisterOperations';
import CashCountSection from './CashCountSection';
import SalesDataSection from './SalesDataSection';

interface CashRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CashRegisterDialog: React.FC<CashRegisterDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    registerState,
    cashCount,
    calculateTotal,
    handleCountChange,
    handleOpenRegister,
    handleCloseRegister,
  } = useCashRegister();

  // Permite cambiar de tab programáticamente (usar en cierre)
  const [activeTab, setActiveTab] = useState('register');
  // Estado para comentario de cierre de caja
  const [closeNote, setCloseNote] = useState('');
  // Indica si mostrar resumen final de cierre
  const [showCloseSummary, setShowCloseSummary] = useState(false);
  // Loading state al cerrar caja
  const [isClosing, setIsClosing] = useState(false);

  // Cuando se dispara Cerrar desde la otra tab, se cambia a "count"
  const handleGotoCountAndClose = () => {
    setActiveTab('count');
    setShowCloseSummary(true);
  };

  // Confirmar cierre de caja (en tab arqueo)
  const handleConfirmClose = async () => {
    setIsClosing(true);
    await handleCloseRegister(closeNote || undefined);
    setIsClosing(false);
    setShowCloseSummary(false);
    setCloseNote('');
    setActiveTab('register');
    // Opcional: podrías cerrar el diálogo aquí también: onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gestión de Caja
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register">Caja</TabsTrigger>
            <TabsTrigger value="count">Arqueo</TabsTrigger>
            <TabsTrigger value="sales">Ventas del Día</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CashRegisterStatus registerState={registerState} />
              <CashRegisterOperations
                registerState={registerState}
                onOpenRegister={handleOpenRegister}
                // Ahora envía a "arqueo" en vez de cerrar al tiro
                onCloseRegister={handleGotoCountAndClose}
              />
            </div>
          </TabsContent>

          <TabsContent value="count" className="space-y-4">
            <CashCountSection
              cashCount={cashCount}
              registerState={registerState}
              onCountChange={handleCountChange}
              calculateTotal={calculateTotal}
              //
              showCloseSummary={showCloseSummary}
              onShowCloseSummary={setShowCloseSummary}
              closeNote={closeNote}
              setCloseNote={setCloseNote}
              onConfirmClose={handleConfirmClose}
              isClosing={isClosing}
            />
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <SalesDataSection />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CashRegisterDialog;
