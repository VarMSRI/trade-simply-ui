
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  History,
  Home,
  LineChart,
  ListOrdered,
  PieChart,
  Settings,
  Star,
} from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const mainNavLinks = [
    { to: "/", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { to: "/trading", icon: <LineChart className="h-4 w-4" />, label: "Trading" },
    { to: "/portfolio", icon: <PieChart className="h-4 w-4" />, label: "Portfolio" },
    { to: "/watchlist", icon: <Star className="h-4 w-4" />, label: "Watchlist" },
    { to: "/orders", icon: <ListOrdered className="h-4 w-4" />, label: "Orders" },
    { to: "/history", icon: <History className="h-4 w-4" />, label: "History" },
    { to: "/analytics", icon: <BarChart3 className="h-4 w-4" />, label: "Analytics" },
  ];

  const secondaryNavLinks = [
    { to: "/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="font-bold text-xl text-primary">TradeSimply</div>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {mainNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              active={currentPath === link.to}
            />
          ))}
        </nav>
        <div className="mt-auto px-2 py-2">
          <nav className="grid gap-1">
            {secondaryNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                active={currentPath === link.to}
              />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
