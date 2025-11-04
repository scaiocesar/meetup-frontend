import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Calendar, Plus, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/meetups/create', label: 'Create Meetup', icon: Plus },
    { path: '/', label: 'Public Events', icon: Calendar },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/meetups');
    }
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r flex flex-col z-40">
      <div className="px-6 py-6 border-b">
        <Link to="/dashboard" className="text-xl font-semibold" style={{ color: '#0077B6' }}>
          MeetupApp
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-4 py-4 border-t">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Log out
        </Button>
      </div>
    </aside>
  );
};

