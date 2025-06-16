
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PaymentsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pagos a Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Funcionalidad de pagos en desarrollo.
            </p>
            <Badge variant="secondary" className="mt-2">
              Próximamente
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsTab;
