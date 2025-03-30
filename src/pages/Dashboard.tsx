
import React from 'react';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import StockChart from '@/components/dashboard/StockChart';
import PortfolioHoldings from '@/components/dashboard/PortfolioHoldings';
import DashboardWatchlist from '@/components/dashboard/DashboardWatchlist';
import OrderForm from '@/components/trading/OrderForm';
import MarketNews from '@/components/dashboard/MarketNews';

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your portfolio.
        </p>
      </div>

      <div className="space-y-6">
        <PortfolioSummary />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StockChart />
          <OrderForm />
        </div>

        <PortfolioHoldings />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardWatchlist />
          <MarketNews />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
