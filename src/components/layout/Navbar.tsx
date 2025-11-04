import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold" style={{ color: '#0077B6' }}>
          MeetupApp
        </Link>
        <div className="flex gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

