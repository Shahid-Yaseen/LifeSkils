import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://84e681f706bcc9d76d5d10249b649cfe.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Important for R2 compatibility
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'lifeskills-videos';

export interface VideoUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

/**
 * Generate a presigned URL for direct client-side upload to R2
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<PresignedUploadResult> {
  try {
    const key = `videos/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
    
    return {
      uploadUrl,
      key,
      expiresIn,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

/**
 * Get a presigned URL for video access
 */
export async function getVideoAccessUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating access URL:', error);
    throw new Error('Failed to generate access URL');
  }
}

/**
 * Delete a video from R2
 */
export async function deleteVideo(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
}

/**
 * Upload video directly from server (for smaller files or server-side processing)
 */
export async function uploadVideo(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<VideoUploadResult> {
  try {
    const key = `videos/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await r2Client.send(command);
    
    // Generate public URL for R2 bucket using custom domain
    const publicUrl = `https://pub-13acde6531f84c878ee939a6a1f2dcae.r2.dev/${key}`;
    
    return {
      success: true,
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get video metadata
 */
export async function getVideoMetadata(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return null;
  }
}

/**
 * Generate public URL for a video key
 */
export function getVideoPublicUrl(key: string): string {
  return `https://pub-13acde6531f84c878ee939a6a1f2dcae.r2.dev/${key}`;
}

/**
 * Generate presigned URL for resource uploads
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<{ success: boolean; uploadUrl?: string; key?: string; publicUrl?: string; error?: string }> {
  try {
    const key = `resources/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `https://pub-13acde6531f84c878ee939a6a1f2dcae.r2.dev/${key}`;
    
    return {
      success: true,
      uploadUrl,
      key,
      publicUrl,
    };
  } catch (error) {
    console.error('Error generating presigned URL for resources:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    };
  }
}
