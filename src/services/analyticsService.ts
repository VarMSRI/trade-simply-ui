
import { getAuthHeaders, handleResponse, BASE_URL } from './apiUtils';

export interface WinRateReportResponse {
  total_positions_closed: number;
  winning_positions: number;
  winning_percentage: number;
  losing_positions: number;
  losing_percentage: number;
  break_even_positions: number;
  break_even_percentage: number;
}

export interface PortfolioStatusResponse {
  totalInvested: number;
  currentValue: number;
  netPnL: number;
  netPnLPercentage: number;
}

export interface PnLReportResponse {
  realizedPnL: number;
  realizedPnLPercentage: number;
}

export interface PositionDetail {
  closed_at: string;
  realized_pnl: number;
  realized_pnl_percentage: number;
}

export interface InstrumentAnalyticsResponse {
  instrument_token: number;
  position_details: PositionDetail[];
  total_realized_pnl: number;
  total_realized_pnl_percentage: number;
}

const analyticsService = {
  /**
   * Get win rate report for a user
   * @param days Number of days to get data for (default: 30)
   */
  async getWinRateReport(days: number = 30): Promise<WinRateReportResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/analytics/win-rate?days=${days}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching win rate report:', error);
      // Return mock data for development
      return {
        total_positions_closed: 42,
        winning_positions: 28,
        winning_percentage: 66.67,
        losing_positions: 12,
        losing_percentage: 28.57,
        break_even_positions: 2,
        break_even_percentage: 4.76
      };
    }
  },

  /**
   * Get portfolio status for a user
   */
  async getPortfolioStatus(): Promise<PortfolioStatusResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/analytics/portfolio-status`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching portfolio status:', error);
      // Return mock data for development
      return {
        totalInvested: 87429.42,
        currentValue: 97429.42,
        netPnL: 10000.00,
        netPnLPercentage: 11.44
      };
    }
  },

  /**
   * Get PnL report for a user
   * @param days Number of days to get data for (default: 30)
   */
  async getPnLReport(days: number = 30): Promise<PnLReportResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/analytics/pnl?days=${days}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching PnL report:', error);
      // Return mock data for development
      return {
        realizedPnL: 8547.25,
        realizedPnLPercentage: 9.78
      };
    }
  },

  /**
   * Get instrument analytics for a specific instrument
   * @param instrumentToken The instrument token
   * @param days Number of days to get data for (default: 30)
   */
  async getInstrumentAnalytics(instrumentToken: number, days: number = 30): Promise<InstrumentAnalyticsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/analytics/instrument?days=${days}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching instrument analytics:', error);
      // Return mock data for development
      return {
        instrument_token: instrumentToken,
        position_details: [
          {
            closed_at: "2025-04-28T12:34:56.789Z",
            realized_pnl: 1250.75,
            realized_pnl_percentage: 5.25
          },
          {
            closed_at: "2025-04-25T10:15:22.123Z",
            realized_pnl: -450.50,
            realized_pnl_percentage: -1.85
          }
        ],
        total_realized_pnl: 800.25,
        total_realized_pnl_percentage: 3.40
      };
    }
  },

  /**
   * Export a report in XLSX format
   * @param reportType The type of report to export
   * @param days Number of days to get data for (default: 30)
   */
  async exportXLSXReport(reportType: string, days: number = 30): Promise<Blob> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/analytics/export/xlsx?reportType=${reportType}&days=${days}`, 
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting XLSX report:', error);
      throw error;
    }
  },

  /**
   * Export a report in CSV format
   * @param reportType The type of report to export
   * @param days Number of days to get data for (default: 30)
   */
  async exportCSVReport(reportType: string, days: number = 30): Promise<Blob> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/analytics/export/csv?reportType=${reportType}&days=${days}`,
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting CSV report:', error);
      throw error;
    }
  }
};

export default analyticsService;
