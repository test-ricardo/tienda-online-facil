
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useExpirationData } from './hooks/useExpirationData';
import ExpirationHeader from './components/ExpirationHeader';
import ExpirationFilters from './components/ExpirationFilters';
import ExpiringProductsCard from './components/ExpiringProductsCard';
import AlertsConfigurationCard from './components/AlertsConfigurationCard';
import AlertDialog from './AlertDialog';

const ExpirationTab = () => {
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { toast } = useToast();

  const {
    daysAhead,
    setDaysAhead,
    expiringProducts,
    isLoading,
    alerts,
    refetchAlerts,
    handleDeleteAlert,
  } = useExpirationData();

  const handleEditAlert = (alert: any) => {
    setSelectedAlert(alert);
    setShowAlertDialog(true);
  };

  const handleAddAlert = () => {
    setSelectedAlert(null);
    setShowAlertDialog(true);
  };

  const handleAlertSuccess = () => {
    refetchAlerts();
    setShowAlertDialog(false);
    toast({
      title: selectedAlert ? 'Alerta actualizada' : 'Alerta creada',
      description: 'Los cambios se han guardado correctamente.',
    });
  };

  return (
    <div className="space-y-6">
      <ExpirationHeader onAddAlert={handleAddAlert} />

      <ExpirationFilters
        daysAhead={daysAhead}
        onDaysAheadChange={setDaysAhead}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpiringProductsCard
          products={expiringProducts}
          isLoading={isLoading}
        />

        <AlertsConfigurationCard
          alerts={alerts}
          onEditAlert={handleEditAlert}
          onDeleteAlert={handleDeleteAlert}
        />
      </div>

      <AlertDialog
        open={showAlertDialog}
        onOpenChange={setShowAlertDialog}
        alert={selectedAlert}
        onSuccess={handleAlertSuccess}
      />
    </div>
  );
};

export default ExpirationTab;
