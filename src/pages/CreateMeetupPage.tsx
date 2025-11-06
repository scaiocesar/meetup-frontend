import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, MapPin, Users, ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

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

export const CreateMeetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MeetupFormValues>({
    resolver: zodResolver(meetupSchema),
    defaultValues: {
      capacity: 10,
    },
  });

  const imageUrl = watch('imageUrl');

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

  const onSubmit = async (data: MeetupFormValues) => {
    console.log('onSubmit called with data:', data);
    
    try {
      // Step 1: Create meetup WITHOUT image first (to avoid large payload)
      const meetupData: any = {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        capacity: data.capacity,
      };
      
      console.log('Creating meetup (without image)...');
      const meetup = await apiService.createMeetup(meetupData);
      console.log('Meetup created successfully with id:', meetup.id);
      
      // Step 2: If there's an image file, upload it and update the meetup
      if (selectedFile) {
        console.log('Uploading image for meetup...');
        try {
          await apiService.uploadMeetupImage(meetup.id, selectedFile);
          console.log('Image uploaded successfully');
        } catch (imageError: any) {
          console.error('Failed to upload image, but meetup was created:', imageError);
          // Don't fail the whole operation if image upload fails
          alert('Meetup created but image upload failed. You can add the image later by editing.');
        }
      }
      
      navigate(`/meetups/${meetup.id}`);
    } catch (error: any) {
      console.error('Failed to create meetup - Full error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create meetup';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create Meetup</h1>
        <p className="text-muted-foreground">Share your event with the community</p>
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
                  {selectedFile && (
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
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Meetup
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

