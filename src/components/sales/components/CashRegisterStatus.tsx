
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface CashRegisterState {
  isOpen: boolean;
  currentAmount: number;
  startTime: Date | null;
  endTime: Date | null;
}

interface CashRegisterStatusProps {
  registerState: CashRegisterState;
}

const CashRegisterStatus: React.FC<CashRegisterStatusProps> = ({ registerState }) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'No iniciado';
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Estado de Caja
          {registerState.isOpen ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${registerState.isOpen ? 'text-green-600' : 'text-gray-400'}`}>
            ${registerState.currentAmount.toFixed(2)}
          </div>
          <p className="text-gray-600">Efectivo en caja</p>
        </div>
        
        <div className="space-y-2">
          <Badge 
            variant={registerState.isOpen ? "default" : "secondary"} 
            className="w-full justify-center py-2"
          >
            <Clock className="h-4 w-4 mr-2" />
            {registerState.isOpen ? (
              <>
                Turno iniciado: {formatTime(registerState.startTime)}
                <br />
                <span className="text-xs">{formatDate(registerState.startTime)}</span>
              </>
            ) : (
              registerState.endTime ? (
                <>
                  Turno cerrado: {formatTime(registerState.endTime)}
                  <br />
                  <span className="text-xs">{formatDate(registerState.endTime)}</span>
                </>
              ) : (
                'Caja cerrada'
              )
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashRegisterStatus;
