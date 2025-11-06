import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import type { Meetup } from '@/types';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export const PublicEventsPage: React.FC = () => {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [filteredMeetups, setFilteredMeetups] = useState<Meetup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadMeetups();
  }, []);

  useEffect(() => {
    filterMeetups();
  }, [meetups, searchTerm]);

  const loadMeetups = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMeetups();
      setMeetups(data);
    } catch (err) {
      console.error('Error loading meetups:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMeetups = () => {
    if (!searchTerm.trim()) {
      setFilteredMeetups(meetups);
      return;
    }
    const filtered = meetups.filter(meetup =>
      meetup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meetup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meetup.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMeetups(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpotsAvailable = (meetup: Meetup) => {
    const confirmed = meetup.confirmedCount || 0;
    const total = meetup.capacity;
    return Math.max(0, total - confirmed);
  };

  const getStatusBadge = (meetup: Meetup) => {
    const available = getSpotsAvailable(meetup);
    if (available === 0) {
      return <Badge variant="destructive">Full</Badge>;
    } else if (available <= 5) {
      return <Badge variant="outline" className="text-orange-600">{available} spots left</Badge>;
    } else {
      return <Badge variant="secondary">{available} spots available</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
          <p className="text-muted-foreground">Discover and join amazing meetups in your community</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredMeetups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="mb-2">
                {searchTerm ? 'No events found' : 'No events available'}
              </CardTitle>
              <CardDescription className="mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new events'}
              </CardDescription>
              {!searchTerm && !isAuthenticated && (
                <Link to="/register">
                  <Button>Be the first to create an event</Button>
                </Link>
              )}
              {!searchTerm && isAuthenticated && (
                <Link to="/meetups/create">
                  <Button>Create Your First Event</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetups.map((meetup) => (
                  <Link key={meetup.id} to={`/meetups/${meetup.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {meetup.imageUrl && (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={apiService.getImageUrl(meetup.imageUrl) || ''}
                          alt={meetup.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide image if it fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{meetup.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {meetup.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(meetup.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{meetup.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{meetup.confirmedCount}/{meetup.capacity} attendees</span>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        {getStatusBadge(meetup)}
                        <span className="text-sm text-primary font-medium">View Details →</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredMeetups.length > 0 && !isAuthenticated && (
              <Card className="mt-12 text-center">
                <CardHeader>
                  <CardTitle>Want to create your own event?</CardTitle>
                  <CardDescription>
                    Join our community and start organizing amazing meetups
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                  <Link to="/register">
                    <Button>Sign Up Free</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline">Already have an account?</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

