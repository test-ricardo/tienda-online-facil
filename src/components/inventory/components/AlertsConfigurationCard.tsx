
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';

interface Alert {
  id: string;
  alert_type: string;
  days_before_expiration: number;
  relatedData?: {
    name: string;
  };
}

interface AlertsConfigurationCardProps {
  alerts: Alert[] | undefined;
  onEditAlert: (alert: Alert) => void;
  onDeleteAlert: (alertId: string) => void;
}

const AlertsConfigurationCard: React.FC<AlertsConfigurationCardProps> = ({
  alerts,
  onEditAlert,
  onDeleteAlert,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas Configuradas
        </CardTitle>
        <CardDescription>
          {alerts?.length || 0} alertas activas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts?.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-sm">
                  {alert.relatedData?.name || 'Nombre no disponible'}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {alert.alert_type === 'category' && 'Categoría'}
                  {alert.alert_type === 'subcategory' && 'Subcategoría'}
                  {alert.alert_type === 'product' && 'Producto'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {alert.days_before_expiration} días
                  </div>
                  <div className="text-xs text-gray-500">
                    antes del vencimiento
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditAlert(alert)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {alerts?.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No hay alertas configuradas
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsConfigurationCard;
