
import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order';

interface ActiveFiltersProps {
  status: OrderStatus | undefined;
  startDate: string;
  endDate: string;
  onClearStatus: () => void;
  onClearStartDate: () => void;
  onClearEndDate: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  status,
  startDate,
  endDate,
  onClearStatus,
  onClearStartDate,
  onClearEndDate,
}) => {
  if (!status && !startDate && !endDate) return null;
  
  return (
    <div>
      {status && (
        <Badge className="mr-2">
          Status: {status}
          <button 
            className="ml-1 hover:text-primary" 
            onClick={onClearStatus}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {startDate && (
        <Badge className="mr-2">
          From: {format(new Date(startDate), 'PP')}
          <button 
            className="ml-1 hover:text-primary" 
            onClick={onClearStartDate}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {endDate && (
        <Badge className="mr-2">
          To: {format(new Date(endDate), 'PP')}
          <button 
            className="ml-1 hover:text-primary" 
            onClick={onClearEndDate}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilters;
