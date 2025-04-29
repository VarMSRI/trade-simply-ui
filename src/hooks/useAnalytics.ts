
import { useQuery } from '@tanstack/react-query';
import analyticsService, {
  WinRateReportResponse,
  PortfolioStatusResponse,
  PnLReportResponse,
  InstrumentAnalyticsResponse
} from '@/services/analyticsService';
import { useToast } from './use-toast';

export const useAnalytics = (days: number = 30) => {
  const { toast } = useToast();

  const {
    data: winRateReport,
    isLoading: isLoadingWinRate,
    error: winRateError
  } = useQuery({
    queryKey: ['winRateReport', days],
    queryFn: () => analyticsService.getWinRateReport(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch win rate report:', error);
        toast({
          title: 'Error',
          description: 'Failed to load win rate data',
          variant: 'destructive',
        });
      }
    }
  });

  const {
    data: portfolioStatus,
    isLoading: isLoadingPortfolioStatus,
    error: portfolioStatusError
  } = useQuery({
    queryKey: ['portfolioStatus'],
    queryFn: analyticsService.getPortfolioStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch portfolio status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load portfolio status data',
          variant: 'destructive',
        });
      }
    }
  });

  const {
    data: pnlReport,
    isLoading: isLoadingPnlReport,
    error: pnlReportError
  } = useQuery({
    queryKey: ['pnlReport', days],
    queryFn: () => analyticsService.getPnLReport(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch PNL report:', error);
        toast({
          title: 'Error',
          description: 'Failed to load PNL data',
          variant: 'destructive',
        });
      }
    }
  });

  const getInstrumentAnalytics = (instrumentToken: number, days: number = 30) => {
    return useQuery({
      queryKey: ['instrumentAnalytics', instrumentToken, days],
      queryFn: () => analyticsService.getInstrumentAnalytics(instrumentToken, days),
      staleTime: 5 * 60 * 1000, // 5 minutes
      meta: {
        onError: (error: Error) => {
          console.error(`Failed to fetch instrument analytics for token ${instrumentToken}:`, error);
          toast({
            title: 'Error',
            description: 'Failed to load instrument analytics data',
            variant: 'destructive',
          });
        }
      }
    });
  };

  const exportReport = async (format: 'xlsx' | 'csv', reportType: string, days: number = 30) => {
    try {
      let blob: Blob;
      
      if (format === 'xlsx') {
        blob = await analyticsService.exportXLSXReport(reportType, days);
      } else {
        blob = await analyticsService.exportCSVReport(reportType, days);
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${days}days.${format}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: `${reportType} report has been downloaded`,
      });
    } catch (error) {
      console.error(`Error exporting ${format} report:`, error);
      toast({
        title: 'Error',
        description: `Failed to download ${format} report`,
        variant: 'destructive',
      });
    }
  };

  return {
    winRateReport,
    isLoadingWinRate,
    winRateError,
    
    portfolioStatus,
    isLoadingPortfolioStatus,
    portfolioStatusError,
    
    pnlReport,
    isLoadingPnlReport,
    pnlReportError,
    
    getInstrumentAnalytics,
    exportReport
  };
};

export default useAnalytics;
