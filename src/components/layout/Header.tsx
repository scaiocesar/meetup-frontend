import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <Link to="/meetups/create">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Meetup
          </Button>
        </Link>
      </div>
    </header>
  );
};

