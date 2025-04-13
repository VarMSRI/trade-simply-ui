
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LoaderCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart,
  Building,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { InstrumentFundamentals } from '@/types/fundamentals';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FundamentalsCardProps {
  fundamentals: InstrumentFundamentals | null;
  isLoading: boolean;
  error: Error | null;
}

type MetricKey = 'Stock P/E' | 'Dividend Yield' | 'ROE' | 'ROCE' | 'Book Value' | 'Market Cap' | 'High / Low' | 'Face Value';

const FundamentalsCard: React.FC<FundamentalsCardProps> = ({ 
  fundamentals, 
  isLoading, 
  error 
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    'Stock P/E', 'Dividend Yield', 'ROE'
  ]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading Fundamentals
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">Fetching company data...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            Error Loading Fundamentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to fetch company data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!fundamentals) {
    return null;
  }
  
  const { metadata } = fundamentals.fundamentals;
  
  const availableMetrics: MetricKey[] = [
    'Stock P/E', 'Dividend Yield', 'ROE', 'ROCE', 'Book Value', 
    'Market Cap', 'High / Low', 'Face Value'
  ];
  
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
        return <BarChart className="h-4 w-4 text-blue-500" />;
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
  
  const toggleMetric = (metric: MetricKey) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              {fundamentals.instrument_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {fundamentals.instrument_symbol}
              </Badge>
              <Badge variant="outline" className="bg-secondary/10">
                {fundamentals.instrument_exchange}
              </Badge>
            </div>
          </div>
          <Popover open={isCustomizing} onOpenChange={setIsCustomizing}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setIsCustomizing(!isCustomizing)}
              >
                {isCustomizing ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Done
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Customize
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-2">
                <h4 className="font-medium">Select Metrics</h4>
                <div className="grid grid-cols-1 gap-2">
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
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {selectedMetrics.map((metric) => (
            <div key={metric} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              {getIcon(metric)}
              <div>
                <div className="text-xs text-muted-foreground">{metric}</div>
                <div className="font-medium">{formatValue(metric, metadata[metric])}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundamentalsCard;
