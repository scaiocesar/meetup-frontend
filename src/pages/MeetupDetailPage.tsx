import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Meetup, RSVP } from '@/types';
import { Calendar, MapPin, Users, Edit, Trash2, ArrowLeft, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import toast from 'react-hot-toast';

export const MeetupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [attendees, setAttendees] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadMeetup();
      loadAttendees();
    }
  }, [id]);

  const loadMeetup = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMeetup(parseInt(id!));
      setMeetup(data);
    } catch (error) {
      console.error('Failed to load meetup:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendees = async () => {
    try {
      const data = await apiService.getMeetupAttendees(parseInt(id!));
      setAttendees(data);
    } catch (error) {
      console.error('Failed to load attendees:', error);
    }
  };

  const handleRSVP = async () => {
    if (!meetup) return;
    try {
      setIsRSVPLoading(true);
      if (meetup.isUserRSVPed) {
        await apiService.cancelRSVP(meetup.id);
      } else {
        await apiService.rsvpToMeetup(meetup.id);
      }
      await loadMeetup();
      await loadAttendees();
    } catch (error) {
      console.error('Failed to RSVP:', error);
    } finally {
      setIsRSVPLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!meetup) return;
    try {
      setIsDeleting(true);
      await apiService.deleteMeetup(meetup.id);
      toast.success('Meetup deleted successfully');
      
      // Navigate based on authentication status
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete meetup:', error);
      toast.error('Failed to delete meetup. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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

  // Check if user is owner or admin
  // Convert to numbers for comparison to handle any type mismatches
  const isOwner = user?.id && meetup?.createdById && Number(user.id) === Number(meetup.createdById);
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = (isAuthenticated && (isOwner || isAdmin));
  
  // Debug log (remove in production if needed)
  useEffect(() => {
    if (meetup && user) {
      console.log('Meetup Detail Debug:', {
        userId: user.id,
        userRole: user.role,
        meetupCreatedById: meetup.createdById,
        isOwner,
        isAdmin,
        canEdit,
        isAuthenticated
      });
    }
  }, [meetup, user, isOwner, isAdmin, canEdit, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {isAuthenticated ? (
          <div className="flex">
            <Sidebar />
            <div className="flex-1 lg:ml-60">
              <Header />
              <main className="pt-16 pb-6">
                <div className="max-w-4xl mx-auto px-6">
                  <Skeleton className="h-64 w-full mb-6" />
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </main>
            </div>
          </div>
        ) : (
          <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-8">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </>
        )}
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="min-h-screen bg-background">
        {isAuthenticated ? (
          <div className="flex">
            <Sidebar />
            <div className="flex-1 lg:ml-60">
              <Header />
              <main className="pt-16 pb-6">
                <div className="max-w-4xl mx-auto px-6 text-center">
                  <h1 className="text-2xl font-bold mb-4">Meetup not found</h1>
                  <Link to="/">
                    <Button>Back to Meetups</Button>
                  </Link>
                </div>
              </main>
            </div>
          </div>
        ) : (
          <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Meetup not found</h1>
              <Link to="/">
                <Button>Back to Meetups</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  const content = (
    <div className="max-w-4xl mx-auto px-6">
      <Button variant="ghost" onClick={() => {
        if (isAuthenticated) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {meetup.imageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={meetup.imageUrl}
                alt={meetup.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{meetup.title}</h1>
              <p className="text-muted-foreground">Created by {meetup.createdByName}</p>
            </div>
            
            {isAuthenticated && canEdit && (
              <div className="flex gap-2">
                <Link to={`/meetups/${meetup.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About this meetup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{meetup.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendees ({attendees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendees.length === 0 ? (
                  <p className="text-muted-foreground">No attendees yet</p>
                ) : (
                  attendees.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{rsvp.user.name}</p>
                          <p className="text-sm text-muted-foreground">{rsvp.user.email}</p>
                        </div>
                      </div>
                      <Badge variant={rsvp.status === 'CONFIRMED' ? 'secondary' : 'outline'}>
                        {rsvp.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">{formatDate(meetup.date)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{meetup.location}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {meetup.confirmedCount}/{meetup.capacity} confirmed
                    {meetup.waitlistCount > 0 && (
                      <span className="block text-orange-600">
                        {meetup.waitlistCount} on waitlist
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={handleRSVP}
                    disabled={isRSVPLoading}
                    variant={
                      meetup.isUserRSVPed
                        ? 'destructive'
                        : meetup.confirmedCount >= meetup.capacity
                        ? 'outline'
                        : 'default'
                    }
                    className="w-full"
                  >
                    {isRSVPLoading ? (
                      'Loading...'
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        {meetup.isUserRSVPed
                          ? 'Cancel RSVP'
                          : meetup.confirmedCount >= meetup.capacity
                          ? 'Join Waitlist'
                          : 'RSVP Now'}
                      </>
                    )}
                  </Button>
                  
                  {meetup.isUserRSVPed && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      You are {meetup.userRSVPStatus?.toLowerCase()}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Sign in to RSVP for this event
                  </p>
                  <div className="space-y-2">
                    <Link to="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="outline" className="w-full">Create Account</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meetup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{meetup?.title}"? This action cannot be undone and will remove all RSVPs associated with this meetup.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isAuthenticated) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-60">
          <Header />
          <main className="pt-16 pb-6">
            {content}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-8">
        {content}
      </div>
    </div>
  );
};

