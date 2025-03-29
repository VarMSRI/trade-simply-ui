
import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 ml-64">
          <div className="container p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
