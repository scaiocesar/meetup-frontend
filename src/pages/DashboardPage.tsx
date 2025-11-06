import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import type { Meetup } from '@/types';
import { Calendar, MapPin, Users, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardPage: React.FC = () => {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [filteredMeetups, setFilteredMeetups] = useState<Meetup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeetups();
  }, []);

  useEffect(() => {
    const filtered = meetups.filter(meetup =>
      meetup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meetup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meetup.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMeetups(filtered);
  }, [meetups, searchTerm]);

  const loadMeetups = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMeetups();
      setMeetups(data);
    } catch (error) {
      console.error('Failed to load meetups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (meetup: Meetup) => {
    if (meetup.isUserRSVPed) {
      return meetup.userRSVPStatus === 'CONFIRMED' 
        ? <Badge variant="secondary">You're confirmed</Badge>
        : <Badge variant="outline" className="text-orange-600">You're on waitlist</Badge>;
    }
    if (meetup.confirmedCount >= meetup.capacity) {
      return <Badge variant="destructive">Fully booked</Badge>;
    }
    return <Badge variant="default">{meetup.capacity - meetup.confirmedCount} spots left</Badge>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Meetups</h1>
        <Link to="/meetups/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Meetup
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meetups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
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
              {searchTerm ? 'No meetups found' : 'No meetups yet'}
            </CardTitle>
            {!searchTerm && (
              <Link to="/meetups/create">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Meetup
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
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
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{meetup.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate">{formatDate(meetup.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{meetup.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{meetup.confirmedCount}/{meetup.capacity} attendees</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t">
                    {getStatusBadge(meetup)}
                    <span className="text-sm text-primary font-medium">View →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

