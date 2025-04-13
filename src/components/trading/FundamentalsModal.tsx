
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  TrendingUp,
  LineChart,
  PlusCircle,
  BarChart4,
  DollarSign,
  Percent,
  Building,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { InstrumentFundamentals } from '@/types/fundamentals';
import { Instrument } from '@/types/watchlist';
import { toast } from 'sonner';

interface FundamentalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInstrument: Instrument | null;
  fundamentals: InstrumentFundamentals | null;
  isLoading: boolean;
  error: Error | null;
  onAddToWatchlist: (instrument: Instrument) => void;
}

type MetricKey = 'Stock P/E' | 'Dividend Yield' | 'ROE' | 'ROCE' | 'Book Value' | 'Market Cap' | 'High / Low' | 'Face Value';

const FundamentalsModal: React.FC<FundamentalsModalProps> = ({
  open,
  onOpenChange,
  selectedInstrument,
  fundamentals,
  isLoading,
  error,
  onAddToWatchlist
}) => {
  const navigate = useNavigate();
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    'Stock P/E', 'Dividend Yield', 'ROE'
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!selectedInstrument) return null;
  
  const handleTradeClick = () => {
    onOpenChange(false);
    navigate(`/trading?symbol=${selectedInstrument.tradingsymbol}`);
    toast.success(`Ready to trade ${selectedInstrument.tradingsymbol}`);
  };
  
  const handleAddToWatchlist = () => {
    onAddToWatchlist(selectedInstrument);
    onOpenChange(false);
  };
  
  const availableMetrics: MetricKey[] = [
    'Stock P/E', 'Dividend Yield', 'ROE', 'ROCE', 'Book Value', 
    'Market Cap', 'High / Low', 'Face Value'
  ];
  
  const toggleMetric = (metric: MetricKey) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };
  
  const formatValue = (key: string, value: any): string => {
    if (key === 'Market Cap') {
      return `₹${(value / 10000000000).toFixed(2)}B`;
    }
    if (key === 'Dividend Yield' || key === 'ROE' || key === 'ROCE') {
      return `${value}%`;
    }
    if (key === 'Book Value') {
      return `₹${value}`;
    }
    return value.toString();
  };
  
  const getIcon = (key: string) => {
    switch(key) {
      case 'Stock P/E': 
        return <BarChart4 className="h-4 w-4 text-blue-500" />;
      case 'Dividend Yield': 
        return <Percent className="h-4 w-4 text-green-500" />;
      case 'ROE': 
      case 'ROCE': 
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'Book Value': 
        return <BookOpen className="h-4 w-4 text-orange-500" />;
      case 'Market Cap': 
        return <DollarSign className="h-4 w-4 text-green-500" />;
      default: 
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl font-bold">
              {selectedInstrument.name || selectedInstrument.tradingsymbol}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {selectedInstrument.tradingsymbol}
              </Badge>
              <Badge variant="outline" className="bg-secondary/10">
                {selectedInstrument.exchange || 'NSE'}
              </Badge>
              {selectedInstrument.last_price && (
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  ₹{selectedInstrument.last_price}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Fundamentals</TabsTrigger>
            <TabsTrigger value="customize">Customize View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Loading fundamentals...</p>
              </div>
            ) : error ? (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-950/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-500">Error loading fundamentals</p>
                  <p className="text-sm text-muted-foreground">
                    Unable to fetch company data. Please try again later.
                  </p>
                </div>
              </div>
            ) : fundamentals ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedMetrics.map((metric) => (
                  <div key={metric} className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    {getIcon(metric)}
                    <div>
                      <div className="text-xs text-muted-foreground">{metric}</div>
                      <div className="font-medium">
                        {formatValue(metric, fundamentals.fundamentals.metadata[metric])}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Click "View Fundamentals" to load company metrics
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="customize" className="pt-4">
            <div className="space-y-3">
              <h4 className="font-medium">Select Metrics to Display</h4>
              <div className="grid grid-cols-2 gap-3">
                {availableMetrics.map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`metric-${metric}`}
                      checked={selectedMetrics.includes(metric)}
                      onCheckedChange={() => toggleMetric(metric)}
                    />
                    <label 
                      htmlFor={`metric-${metric}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {metric}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
          {!fundamentals && !isLoading && !error && (
            <Button 
              variant="outline" 
              onClick={() => selectedInstrument && fundamentals}
              className="w-full sm:w-auto"
            >
              <BarChart4 className="h-4 w-4 mr-2" />
              View Fundamentals
            </Button>
          )}
          <Button 
            onClick={handleAddToWatchlist}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add to Watchlist
          </Button>
          <Button 
            onClick={handleTradeClick}
            className="w-full sm:w-auto"
          >
            <LineChart className="h-4 w-4 mr-2" />
            Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FundamentalsModal;
