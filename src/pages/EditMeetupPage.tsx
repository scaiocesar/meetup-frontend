import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, MapPin, Users, ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Meetup } from '@/types';

const meetupSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Date must be in the future',
  }),
  location: z.string().min(3, 'Location is required'),
  capacity: z.number().min(1).max(1000),
  imageUrl: z.string().optional(),
});

type MeetupFormValues = z.infer<typeof meetupSchema>;

export const EditMeetupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MeetupFormValues>({
    resolver: zodResolver(meetupSchema),
  });

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (id) {
      loadMeetup();
    }
  }, [id]);

  const loadMeetup = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMeetup(parseInt(id!));
      setMeetup(data);
      
      const date = new Date(data.date);
      const formattedDate = date.toISOString().slice(0, 16);
      
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('date', formattedDate);
      setValue('location', data.location);
      setValue('capacity', data.capacity);
      setValue('imageUrl', data.imageUrl || '');
    } catch (error) {
      console.error('Failed to load meetup:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (jpg, png, gif, or webp)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setValue('imageUrl', '');
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const url = await apiService.uploadImage(selectedFile);
      setValue('imageUrl', url);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: MeetupFormValues) => {
    if (selectedFile && !data.imageUrl) {
      await handleUploadImage();
      if (!data.imageUrl) return;
    }

    try {
      const updatedMeetup = await apiService.updateMeetup(parseInt(id!), data);
      navigate(`/meetups/${updatedMeetup.id}`);
    } catch (error) {
      console.error('Failed to update meetup:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Meetup not found</h1>
        <Button onClick={() => navigate('/')}>Back to Meetups</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(`/meetups/${id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meetup
        </Button>
        <CardTitle className="text-3xl mb-2">Edit Meetup</CardTitle>
        <p className="text-muted-foreground">Update your meetup details</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Enter meetup title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your meetup..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date">Date & Time *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="datetime-local"
                    className="pl-10"
                    {...register('date')}
                  />
                </div>
                {errors.date && (
                  <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter location"
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="capacity">Capacity *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="1000"
                  className="pl-10"
                  {...register('capacity', { valueAsNumber: true })}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current attendees: {meetup.confirmedCount} (cannot reduce below this number)
              </p>
              {errors.capacity && (
                <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image">Image (optional)</Label>
              {!imagePreview && !imageUrl ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm mb-2">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF or WEBP (max 5MB)</p>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview || imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedFile && !imageUrl && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleUploadImage}
                        disabled={isUploading}
                        size="sm"
                      >
                        {isUploading ? 'Uploading...' : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  )}
                  {imageUrl && (
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove Image
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/meetups/${id}`)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1">
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

