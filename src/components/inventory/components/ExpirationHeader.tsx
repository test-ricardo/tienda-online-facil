
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ExpirationHeaderProps {
  onAddAlert: () => void;
}

const ExpirationHeader: React.FC<ExpirationHeaderProps> = ({
  onAddAlert,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Control de Vencimientos</h2>
        <p className="text-gray-600">Monitorea productos próximos a vencer</p>
      </div>
      <Button onClick={onAddAlert} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nueva Alerta
      </Button>
    </div>
  );
};

export default ExpirationHeader;
