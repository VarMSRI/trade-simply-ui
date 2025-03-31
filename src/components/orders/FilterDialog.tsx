
import React from 'react';
import { Filter } from 'lucide-react';
import { OrderStatus } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import OrderFilters from './OrderFilters';

interface FilterDialogProps {
  isMobile: boolean;
  status: OrderStatus | undefined;
  startDate: string;
  endDate: string;
  onStatusChange: (value: OrderStatus | undefined) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isMobile,
  status,
  startDate,
  endDate,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Filter Orders</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <OrderFilters
              status={status}
              startDate={startDate}
              endDate={endDate}
              onStatusChange={onStatusChange}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
              onReset={onReset}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Orders</DialogTitle>
        </DialogHeader>
        <OrderFilters
          status={status}
          startDate={startDate}
          endDate={endDate}
          onStatusChange={onStatusChange}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onReset={onReset}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
