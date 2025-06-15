
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CustomersTab = () => {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">Gestión de Clientes</h3>
          <p>Esta funcionalidad estará disponible en la próxima versión.</p>
          <p className="text-sm mt-2">
            Incluirá: registro de clientes, límites de crédito, historial de compras, etc.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersTab;
