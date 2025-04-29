
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WinRateChart from '@/components/analytics/WinRateChart';
import PnLChart from '@/components/analytics/PnLChart';
import TradeHistoryTable from '@/components/analytics/TradeHistoryTable';
import PerformanceMetricsCard from '@/components/analytics/PerformanceMetricsCard';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<number>(30);
  const { 
    winRateReport, 
    isLoadingWinRate,
    pnlReport,
    isLoadingPnlReport,
    exportReport
  } = useAnalytics(timeframe);

  const handleExport = (format: 'xlsx' | 'csv') => {
    exportReport(format, 'performance', timeframe);
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your trading performance and metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('xlsx')}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export XLSX
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="30" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="7" onClick={() => setTimeframe(7)}>7 Days</TabsTrigger>
            <TabsTrigger value="30" onClick={() => setTimeframe(30)}>30 Days</TabsTrigger>
            <TabsTrigger value="90" onClick={() => setTimeframe(90)}>90 Days</TabsTrigger>
            <TabsTrigger value="180" onClick={() => setTimeframe(180)}>180 Days</TabsTrigger>
            <TabsTrigger value="365" onClick={() => setTimeframe(365)}>1 Year</TabsTrigger>
          </TabsList>
        </div>

        {/* All tabs share the same content but with different timeframes */}
        <TabsContent value="7" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WinRateChart data={winRateReport} isLoading={isLoadingWinRate} />
            <PnLChart days={7} isLoading={false} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <PerformanceMetricsCard data={pnlReport} isLoading={isLoadingPnlReport} />
          </div>
          <TradeHistoryTable isLoading={false} limit={10} />
        </TabsContent>

        <TabsContent value="30" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WinRateChart data={winRateReport} isLoading={isLoadingWinRate} />
            <PnLChart days={30} isLoading={false} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <PerformanceMetricsCard data={pnlReport} isLoading={isLoadingPnlReport} />
          </div>
          <TradeHistoryTable isLoading={false} limit={10} />
        </TabsContent>

        <TabsContent value="90" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WinRateChart data={winRateReport} isLoading={isLoadingWinRate} />
            <PnLChart days={90} isLoading={false} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <PerformanceMetricsCard data={pnlReport} isLoading={isLoadingPnlReport} />
          </div>
          <TradeHistoryTable isLoading={false} limit={10} />
        </TabsContent>

        <TabsContent value="180" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WinRateChart data={winRateReport} isLoading={isLoadingWinRate} />
            <PnLChart days={180} isLoading={false} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <PerformanceMetricsCard data={pnlReport} isLoading={isLoadingPnlReport} />
          </div>
          <TradeHistoryTable isLoading={false} limit={10} />
        </TabsContent>

        <TabsContent value="365" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WinRateChart data={winRateReport} isLoading={isLoadingWinRate} />
            <PnLChart days={365} isLoading={false} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <PerformanceMetricsCard data={pnlReport} isLoading={isLoadingPnlReport} />
          </div>
          <TradeHistoryTable isLoading={false} limit={10} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Analytics;
