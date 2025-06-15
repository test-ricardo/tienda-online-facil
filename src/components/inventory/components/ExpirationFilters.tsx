
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface ExpirationFiltersProps {
  daysAhead: string;
  onDaysAheadChange: (value: string) => void;
}

const ExpirationFilters: React.FC<ExpirationFiltersProps> = ({
  daysAhead,
  onDaysAheadChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="days" className="text-sm font-medium">
              Mostrar productos que vencen en los próximos:
            </label>
            <Input
              id="days"
              type="number"
              value={daysAhead}
              onChange={(e) => onDaysAheadChange(e.target.value)}
              className="w-20"
              min="1"
              max="365"
            />
            <span className="text-sm text-gray-500">días</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpirationFilters;
