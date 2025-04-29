
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Briefcase, 
  Star, 
  ClipboardList, 
  User, 
  BellRing,
  FileBarChart
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/trading', icon: BarChart3, label: 'Trading' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/analytics', icon: FileBarChart, label: 'Analytics' },
  { path: '/watchlist', icon: Star, label: 'Watchlist' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/recommendations', icon: BellRing, label: 'Recommendations' },
  { path: '/profile', icon: User, label: 'Profile' }
];

const AppSidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="fixed inset-y-0 left-0 z-10 w-64 transform bg-background border-r border-border py-4 overflow-y-auto">
      <div className="px-4 mb-4">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold">Paper Trader</h1>
        </Link>
      </div>
      <nav>
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AppSidebar;
