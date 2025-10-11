# Video Upload System Setup Guide

## Overview
This guide will help you set up the comprehensive video upload system with Cloudflare R2 integration for the LifeSkillsPrep platform.

## Features Implemented

### ✅ Core Features
- **Video Upload System**: Support for MP4 files and YouTube embeds
- **Cloudflare R2 Integration**: Direct upload to R2 storage with presigned URLs
- **Video Categories**: Government, History, Culture, Geography, Law, Education, Sports, Arts, Economy, Society
- **Enhanced Video Player**: Controls, fullscreen, duration display, progress tracking
- **Rich Content Tabs**: Video, detailed content, resources, notes
- **Progress Tracking**: Video completion tracking and user progress
- **Admin Management**: Complete admin interface for video management

### 🎥 Video Upload Types
1. **File Upload**: Direct MP4/MOV/AVI file upload to Cloudflare R2
2. **YouTube Embed**: YouTube video integration with thumbnail generation

### 📊 Admin Features
- Video management dashboard
- Upload new videos with rich metadata
- Edit/delete existing videos
- Category filtering and search
- Video statistics and analytics

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/lifeskills"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key-here"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key-here"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
VITE_STRIPE_PUBLIC_KEY="pk_test_your-stripe-publishable-key"

# Server Configuration
PORT=8080

# Cloudflare R2 Configuration (REQUIRED for video uploads)
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-r2-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="lifeskills-videos"
```

## Cloudflare R2 Setup

### 1. Create R2 Bucket
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket named `lifeskills-videos`
4. Set appropriate permissions (public read for video access)

### 2. Generate API Credentials
1. Go to "Manage R2 API Tokens"
2. Create a new API token with R2 permissions
3. Copy the Access Key ID and Secret Access Key
4. Add them to your `.env` file

### 3. Configure CORS (Optional)
If you need CORS for direct browser uploads:
```json
[
  {
    "AllowedOrigins": ["http://localhost:8080", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Database Schema

The system uses the following database tables:

### Video Modules
- `id`: Unique identifier
- `title`: Video title
- `description`: Video description
- `category`: Video category
- `videoUrl`: R2 key or YouTube URL
- `videoType`: 'uploaded' or 'youtube'
- `orderIndex`: Display order
- `detailedContent`: Rich HTML content
- `duration`: Video duration in seconds
- `tags`: Comma-separated tags
- `isActive`: Whether video is active

### User Video Progress
- `id`: Unique identifier
- `userId`: User ID
- `videoId`: Video ID
- `progress`: Completion percentage (0-100)
- `completed`: Boolean completion status
- `lastWatchedAt`: Last watch timestamp

## API Endpoints

### Video Management
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Create new video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/presigned-upload` - Get presigned upload URL

### Video Progress
- `GET /api/videos/progress/:userId` - Get user progress
- `POST /api/videos/progress` - Update video progress

## Usage

### For Students
1. Navigate to the dashboard
2. Click on "Video Library" section
3. Browse videos by category
4. Click on any video to watch
5. Progress is automatically tracked

### For Admins
1. Login to admin panel (`/admin/login`)
2. Navigate to "Video Management" (`/admin/videos`)
3. Click "Add Video" to upload new content
4. Fill in video details and metadata
5. Choose upload type (file or YouTube)
6. Save and publish

## File Structure

```
client/src/
├── components/
│   ├── enhanced-video-upload.tsx      # Video upload component
│   ├── enhanced-video-library.tsx     # Video library display
│   └── video-section.tsx              # Existing video section
├── pages/
│   ├── admin/
│   │   └── AdminVideoManagement.tsx   # Admin video management
│   └── video-upload.tsx               # Existing upload page
server/
├── services/
│   └── cloudflare-r2.ts               # R2 integration service
└── routes.ts                          # API routes
```

## Testing

### Test Video Upload
1. Start the development server: `npm run dev`
2. Login as admin: `admin@example.com` / `admin123`
3. Navigate to `/admin/videos`
4. Click "Add Video"
5. Test both file upload and YouTube embed

### Test Video Library
1. Login as regular user
2. Navigate to dashboard
3. Check video library section
4. Test video playback and progress tracking

## Troubleshooting

### Common Issues

1. **R2 Upload Fails**
   - Check R2 credentials in `.env`
   - Verify bucket exists and has correct permissions
   - Check CORS settings if using browser uploads

2. **Videos Not Loading**
   - Verify R2 bucket is public or has proper access
   - Check video URLs in database
   - Test R2 access URLs manually

3. **Progress Not Tracking**
   - Check database connection
   - Verify user authentication
   - Check API endpoint responses

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=video-upload,cloudflare-r2
```

## Security Considerations

1. **File Validation**: Only allow video file types
2. **Size Limits**: Set reasonable file size limits (500MB recommended)
3. **Access Control**: Ensure only admins can upload/delete videos
4. **R2 Permissions**: Use least-privilege access for R2 credentials

## Performance Optimization

1. **CDN**: Use Cloudflare CDN for video delivery
2. **Compression**: Compress videos before upload
3. **Thumbnails**: Generate thumbnails for better UX
4. **Caching**: Implement proper caching for video metadata

## Future Enhancements

- [ ] Video transcoding for multiple formats
- [ ] Automatic thumbnail generation
- [ ] Video analytics and viewing statistics
- [ ] Batch upload functionality
- [ ] Video playlist management
- [ ] Offline video support
- [ ] Video subtitles and captions
