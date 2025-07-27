import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  LogOut,
  Home,
  Shield,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { title: 'Dashboard', url: `/${user?.role?.toLowerCase()}`, icon: Home },
    ];

    switch (user?.role) {
      case 'Admin':
        return [
          ...baseItems,
          { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
          { title: 'Users', url: '/admin/users', icon: Users },
          { title: 'Transactions', url: '/admin/transactions', icon: CreditCard },
          { title: 'Settings', url: '/admin/settings', icon: Settings },
        ];
      case 'Client':
        return [
          ...baseItems,
          { title: 'Transactions', url: '/client/transactions', icon: CreditCard },
          { title: 'Analytics', url: '/client/analytics', icon: TrendingUp },
          { title: 'Reports', url: '/client/reports', icon: BarChart3 },
        ];
      case 'User':
        return [
          ...baseItems,
          { title: 'Transactions', url: '/user/transactions', icon: CreditCard },
          { title: 'Budget', url: '/user/budget', icon: Wallet },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const isActive = (path: string) => location.pathname === path;

  const getNavClassName = (path: string) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-sidebar-accent",
    "text-sidebar-foreground hover:text-sidebar-accent-foreground",
    isActive(path) && "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
  );

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "w-64 lg:translate-x-0"
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-primary rounded-lg p-2">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">FinanceHub</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            ×
          </Button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary rounded-full p-2">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{user?.username}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  className={getNavClassName(item.url)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6">
          <Separator className="mb-4 bg-sidebar-border" />
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;