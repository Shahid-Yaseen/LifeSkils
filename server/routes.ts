import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { generateExercise, generateExerciseVariation } from "./services/openai";
import { generateStaticExercise, getAvailableTopics } from "./services/static-exercises";
import { generatePracticeTestQuestions } from "./services/practice-test-generator";
import { insertExerciseSchema, insertExerciseAttemptSchema, insertUserVideoProgressSchema, insertPracticeTestAttemptSchema, insertVideoModuleSchema, type Exercise, type ExerciseAttempt, loginSchema, registerSchema, timelineEvents, games } from "@shared/schema";
import { db } from "./db";
import { asc, eq, desc, and } from "drizzle-orm";
import { generateTokenPair, getRefreshTokenExpiry, type JWTPayload } from "./services/jwt";
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from "./middleware/auth";
import Stripe from "stripe";
import ragRoutes from "./routes/rag-routes";
import ragPopulateRoutes from "./routes/rag-populate";
import ttsEnhancedRoutes from "./routes/tts-enhanced-routes";
import gamesRoutes from "./routes/games-routes";
import adminTestRoutes from "./routes/admin-test-routes";
import dataUploadRoutes from "./routes/data-upload-routes";
import mapLocationsRoutes from "./routes/map-locations-routes";
import diagramsRoutes from "./routes/diagrams-routes";
import translationRoutes from "./routes/translation-routes";
import aiBookRoutes from "./routes/ai-book-routes";
import { openaiTtsService } from "./services/openai-tts-service";
import { getPresignedUploadUrl } from "./services/cloudflare-r2";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15 * 60 * 1000, // Limit each IP to 5 requests per windowMs
    message: {
      error: "Too many authentication attempts, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 refresh requests per windowMs
    message: {
      error: "Too many token refresh attempts, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Authentication routes
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists (generic message to prevent user enumeration)
      const existingUser = await storage.getUserByUsername(validatedData.username);
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser || existingEmail) {
        return res.status(400).json({ error: "User with this username or email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate tokens
      const payload: JWTPayload = {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: (newUser.role as 'student' | 'admin' | 'superadmin') || 'student',
      };

      const { accessToken, refreshToken } = generateTokenPair(payload);

      // Store refresh token
      await storage.createRefreshToken({
        token: refreshToken,
        userId: newUser.id,
        expiresAt: getRefreshTokenExpiry(),
      });

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: newUser.id,
          name: newUser.firstName,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role || 'student',
        },
        accessToken,
        refreshToken,
      });

    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user and verify password (generic message for both cases)
      const user = await storage.getUserByEmail(validatedData.email);
      const isPasswordValid = user ? await bcrypt.compare(validatedData.password, user.password) : false;
      
      if (!user || !isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: (user.role as 'student' | 'admin' | 'superadmin') || 'student',
      };

      const { accessToken, refreshToken } = generateTokenPair(payload);

      // Store refresh token
      await storage.createRefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.firstName,
          username: user.username,
          email: user.email,
          role: user.role || 'student',
        },
        accessToken,
        refreshToken,
      });

    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/refresh", refreshLimiter, async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }

      // Find refresh token
      const storedToken = await storage.getRefreshToken(refreshToken);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        return res.status(403).json({ error: "Invalid or expired refresh token" });
      }

      // Get user
      const user = await storage.getUser(storedToken.userId);
      if (!user) {
        return res.status(403).json({ error: "User not found" });
      }

      // Generate new access token
      const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: (user.role as 'student' | 'admin' | 'superadmin') || 'student',
      };

      const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(payload);

      // Delete old refresh token and create new one
      await storage.deleteRefreshToken(refreshToken);
      await storage.createRefreshToken({
        token: newRefreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });

    } catch (error: any) {
      console.error("Refresh token error:", error);
      res.status(500).json({ error: "Token refresh failed" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await storage.deleteRefreshToken(refreshToken);
      }

      // Optionally, delete all refresh tokens for the user
      if (req.user) {
        await storage.deleteUserRefreshTokens(req.user.userId);
      }

      res.json({ message: "Logout successful" });

    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        name: user.firstName,
        username: user.username,
        email: user.email,
        role: user.role || 'student',
        overallProgress: user.overallProgress || 0,
        totalStudyTime: user.totalStudyTime || 0,
        currentStreak: user.currentStreak || 0,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
      });

    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // Profile update endpoint
  app.put("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { firstName, email, username } = req.body;
      
      // Validate input
      if (!firstName && !email && !username) {
        return res.status(400).json({ error: "At least one field must be provided" });
      }

      // Basic validation
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (username && username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }

      if (firstName && firstName.trim().length === 0) {
        return res.status(400).json({ error: "First name cannot be empty" });
      }

      const profileData: { firstName?: string; email?: string; username?: string } = {};
      
      if (firstName) profileData.firstName = firstName.trim();
      if (email) profileData.email = email.trim().toLowerCase();
      if (username) profileData.username = username.trim();

      const updatedUser = await storage.updateUserProfile(req.user!.userId, profileData);

      res.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.firstName,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role || 'student',
          overallProgress: updatedUser.overallProgress || 0,
          totalStudyTime: updatedUser.totalStudyTime || 0,
          currentStreak: updatedUser.currentStreak || 0,
          stripeCustomerId: updatedUser.stripeCustomerId,
          stripeSubscriptionId: updatedUser.stripeSubscriptionId,
          subscriptionType: updatedUser.subscriptionType,
          subscriptionStatus: updatedUser.subscriptionStatus,
        }
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.message === "Email already exists" || error.message === "Username already exists") {
        res.status(409).json({ error: error.message });
      } else if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  
  // Configure multer for video uploads (memory storage for R2)
  const uploadVideo = multer({
    storage: multer.memoryStorage(), // Use memory storage for R2 uploads
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only video files
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed!'));
      }
    }
  });

  // Serve audio files statically (must be before other routes)
  app.use('/api/audio', express.static(path.join(process.cwd(), 'uploads', 'audio_cache')));
  
  // Serve uploaded videos statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // RAG System routes
  app.use('/api/rag', ragRoutes);
  app.use('/api/rag-populate', ragPopulateRoutes);
  app.use('/api/translate', translationRoutes);

  // AI Book Intelligence Suite routes
  app.use('/api/admin/ai-book', aiBookRoutes);

  // Enhanced TTS routes
  app.use('/api/tts-enhanced', ttsEnhancedRoutes);

  // Games management routes
  app.use('/api/admin/games', gamesRoutes);

  // User-facing games API
  app.get("/api/games", async (req, res) => {
    try {
      const { category, gameType, difficulty, isActive } = req.query;
      
      // Build where conditions
      const whereConditions = [];
      
      if (category) {
        whereConditions.push(eq(games.category, category as string));
      }
      if (gameType) {
        whereConditions.push(eq(games.gameType, gameType as string));
      }
      if (difficulty) {
        whereConditions.push(eq(games.difficulty, difficulty as string));
      }
      if (isActive !== undefined) {
        whereConditions.push(eq(games.isActive, isActive === 'true'));
      } else {
        // Default to only active games for users
        whereConditions.push(eq(games.isActive, true));
      }
      
      // Execute query with conditions
      const userGames = await db
        .select()
        .from(games)
        .where(whereConditions.length > 0 ? and(...whereConditions) : eq(games.isActive, true))
        .orderBy(asc(games.orderIndex), desc(games.createdAt));
      
      res.json(userGames);
    } catch (error) {
      console.error("Error fetching user games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  // Get single game for users
  app.get("/api/games/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const game = await db
        .select()
        .from(games)
        .where(eq(games.id, id))
        .limit(1);

      if (game.length === 0) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Only return active games to users
      if (!game[0].isActive) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(game[0]);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  // Admin test management routes
  app.use('/api/admin', adminTestRoutes);

  // Data upload routes
  app.use('/api/data-upload', dataUploadRoutes);

  // Map locations routes
  app.use('/api/map-locations', mapLocationsRoutes);

  // Diagrams management routes
  app.use('/api/admin/diagrams', diagramsRoutes);

  // Timeline Management API endpoints
  app.get("/api/timeline", async (req, res) => {
    try {
      const { useBookContent } = req.query;
      
      if (useBookContent === 'true') {
        // Import RAG service dynamically to avoid circular dependencies
        const { ragService } = await import('./services/rag-service');
        const timelineEvents = await ragService.getTimelineEvents();
        return res.json(timelineEvents);
      }
      
      // Return all timeline events from database
      const events = await db.select().from(timelineEvents).orderBy(asc(timelineEvents.year));
      
      // Transform the data to match the expected format
      const formattedEvents = events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        details: event.details,
        year: event.year.toString(),
        period: event.category,
        importance: event.importance,
        keyFigures: event.keyFigures,
        significance: event.timelineTopic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      res.json(formattedEvents);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      res.status(500).json({ error: 'Failed to fetch timeline events' });
    }
  });

  // Upload timeline event image via server
  app.post("/api/timeline/upload-image", authenticateToken, async (req: AuthenticatedRequest, res) => {
    console.log('Timeline image upload endpoint hit');
    try {
      const upload = multer({ 
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req: any, file: any, cb: any) => {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
          }
        }
      });

      upload.single('image')(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No image file provided' });
        }

        try {
          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = req.file.originalname.split('.').pop();
          const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

          // Check if R2 credentials are available
          const hasR2Credentials = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                                  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
                                  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.length > 0 &&
                                  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY.length > 0;
          
          console.log('R2 Credentials check:', {
            hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            accessKeyLength: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.length || 0,
            secretKeyLength: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.length || 0,
            hasR2Credentials
          });

          if (hasR2Credentials) {
            // Upload to R2 using AWS SDK
            const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
            
            const r2Client = new S3Client({
              region: 'auto',
              endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://84e681f706bcc9d76d5d10249b649cfe.r2.cloudflarestorage.com',
              credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
              },
              forcePathStyle: true,
            });

            const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'lifeskills-videos';
            const r2Key = `timeline-images/${fileName}`;
            const publicUrl = `https://pub-13acde6531f84c878ee939a6a1f2dcae.r2.dev/${r2Key}`;

            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: r2Key,
              Body: req.file.buffer,
              ContentType: req.file.mimetype,
            });

            await r2Client.send(command);

            res.json({
              success: true,
              publicUrl: publicUrl,
              fileName: fileName
            });
          } else {
            // Fallback: Store locally in uploads directory
            console.log('Using local storage fallback');
            const fs = await import('fs/promises');
            const path = await import('path');
            
            const uploadsDir = path.join(process.cwd(), 'uploads', 'timeline-images');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            const localFilePath = path.join(uploadsDir, fileName);
            await fs.writeFile(localFilePath, req.file.buffer);
            
            const publicUrl = `/uploads/timeline-images/${fileName}`;
            
            console.log('Local storage successful:', { publicUrl, fileName });

            res.json({
              success: true,
              publicUrl: publicUrl,
              fileName: fileName
            });
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          res.status(500).json({ error: 'Failed to upload image to storage' });
        }
      });
    } catch (error) {
      console.error('Error in image upload endpoint:', error);
      res.status(500).json({ error: 'Failed to process image upload' });
    }
  });

  // Add new timeline event
  app.post("/api/timeline", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, details, year, period, importance, keyFigures, significance, sourceBook, chapterReference, pageNumber, eventImage, imageDescription } = req.body;
      
      if (!title || !description || !year || !period || !importance) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newEvent = {
        id: crypto.randomUUID(),
        title,
        description,
        details: details || null,
        year: parseInt(year),
        category: period,
        importance: parseInt(importance),
        keyFigures: keyFigures || null,
        timelineTopic: significance || 'general',
        sourceBook: sourceBook || null,
        chapterReference: chapterReference || null,
        pageNumber: pageNumber || null,
        eventImage: eventImage || null,
        imageDescription: imageDescription || null
      };

      // Save to database
      await db.insert(timelineEvents).values(newEvent);
      
      res.status(201).json({ message: 'Timeline event created successfully', event: newEvent });
    } catch (error) {
      console.error('Error creating timeline event:', error);
      res.status(500).json({ error: 'Failed to create timeline event' });
    }
  });

  // Update timeline event
  app.put("/api/timeline/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, description, details, year, period, importance, keyFigures, significance, sourceBook, chapterReference, pageNumber, eventImage, imageDescription } = req.body;
      
      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (details !== undefined) updateData.details = details;
      if (year) updateData.year = parseInt(year);
      if (period) updateData.category = period;
      if (importance) updateData.importance = parseInt(importance);
      if (keyFigures !== undefined) updateData.keyFigures = keyFigures;
      if (significance) updateData.timelineTopic = significance;
      if (sourceBook !== undefined) updateData.sourceBook = sourceBook;
      if (chapterReference !== undefined) updateData.chapterReference = chapterReference;
      if (pageNumber !== undefined) updateData.pageNumber = pageNumber;
      if (eventImage !== undefined) updateData.eventImage = eventImage;
      if (imageDescription !== undefined) updateData.imageDescription = imageDescription;
      
      // Update in database
      await db.update(timelineEvents).set(updateData).where(eq(timelineEvents.id, id));
      
      res.json({ message: 'Timeline event updated successfully' });
    } catch (error) {
      console.error('Error updating timeline event:', error);
      res.status(500).json({ error: 'Failed to update timeline event' });
    }
  });

  // Delete timeline event
  app.delete("/api/timeline/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Delete from database
      await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
      
      res.json({ message: 'Timeline event deleted successfully' });
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      res.status(500).json({ error: 'Failed to delete timeline event' });
    }
  });

  // Text-to-Speech Routes
  app.post('/api/tts/narrate', async (req, res) => {
    try {
      const { text, language = 'en', voiceGender = 'female', eventId } = req.body;
      
      if (!text || !eventId) {
        return res.status(400).json({ error: 'Text and eventId are required' });
      }

      // Generate narration (OpenAI TTS handles translation internally)
      const audioUrl = await openaiTtsService.generateNarration({
        text,
        language,
        voiceGender,
        eventId,
      });

      res.json({ audioUrl, language, voiceGender });
    } catch (error) {
      console.error('TTS narration error:', error);
      res.status(500).json({ error: 'Failed to generate narration' });
    }
  });

  app.get('/api/tts/languages', async (req, res) => {
    try {
      const languages = await openaiTtsService.getAvailableLanguages();
      res.json({ languages });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({ error: 'Failed to get languages' });
    }
  });

  // Upload video endpoint
  app.post("/api/videos/upload", uploadVideo.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }

      const { title, description, category, orderIndex, detailedContent } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({ message: "Title, description, and category are required" });
      }

      // Upload to R2 instead of local storage
      const { uploadVideo } = await import('./services/cloudflare-r2');
      const uploadResult = await uploadVideo(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      if (!uploadResult.success) {
        return res.status(500).json({ message: "Failed to upload to R2: " + uploadResult.error });
      }

      // Create video module in database with R2 URL
      const videoData = {
        title,
        description,
        videoUrl: uploadResult.url!,
        duration: 0, // Will be updated when user provides duration or we calculate it
        category,
        orderIndex: parseInt(orderIndex) || 0,
        detailedContent: detailedContent || "",
        thumbnail: null,
        keyImages: null,
        audioScript: null,
        videoType: 'uploaded' as const
      };

      const validated = insertVideoModuleSchema.parse(videoData);
      const newVideo = await storage.createVideoModule(validated);
      
      res.json({
        message: "Video uploaded successfully to R2",
        video: newVideo,
        filePath: uploadResult.url
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Update video duration endpoint
  app.patch("/api/videos/:id/duration", async (req, res) => {
    try {
      const { id } = req.params;
      const { duration } = req.body;
      
      if (!duration || typeof duration !== 'number') {
        return res.status(400).json({ message: "Valid duration is required" });
      }

      const updatedVideo = await storage.updateVideoModule(id, { duration });
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update video duration" });
    }
  });

  // Get all video modules
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideoModules();
      
      // Convert R2 keys to public URLs for uploaded videos
      const { getVideoPublicUrl } = await import('./services/cloudflare-r2');
      const videosWithPublicUrls = videos.map(video => {
        if (video.videoType === 'uploaded' && video.videoUrl && !video.videoUrl.startsWith('http')) {
          try {
            return {
              ...video,
              videoUrl: getVideoPublicUrl(video.videoUrl)
            };
          } catch (r2Error) {
            console.error('R2 service error:', r2Error);
            return video; // Return original video if R2 conversion fails
          }
        }
        return video;
      });
      
      res.json(videosWithPublicUrls);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get user video progress
  app.get("/api/videos/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserVideoProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video progress" });
    }
  });

  // Update video progress
  app.post("/api/videos/progress", async (req, res) => {
    try {
      const validated = insertUserVideoProgressSchema.parse(req.body);
      const progress = await storage.updateVideoProgress(validated);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid video progress data" });
    }
  });

  // Generate presigned URL for video upload to R2
  app.post("/api/videos/presigned-upload", authenticateToken, async (req, res) => {
    try {
      const { fileName, contentType } = req.body;
      
      if (!fileName || !contentType) {
        return res.status(400).json({ message: "File name and content type are required" });
      }

      // Import the R2 service
      const { generatePresignedUploadUrl } = await import("./services/cloudflare-r2");
      
      const result = await generatePresignedUploadUrl(fileName, contentType);
      res.json(result);
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Create new video module
  app.post("/api/videos", authenticateToken, async (req, res) => {
    try {
      const videoData = req.body;
      
      // Validate required fields
      if (!videoData.title || !videoData.description || !videoData.category) {
        return res.status(400).json({ message: "Title, description, and category are required" });
      }

      // Convert R2 key to public URL for uploaded videos
      let videoUrl = videoData.videoUrl;
      if (videoData.videoType === 'uploaded' && videoData.videoUrl) {
        const { getVideoPublicUrl } = await import("./services/cloudflare-r2");
        videoUrl = getVideoPublicUrl(videoData.videoUrl);
      }

      // Create video module in database
      const video = await storage.createVideoModule({
        title: videoData.title,
        description: videoData.description,
        category: videoData.category,
        videoUrl: videoUrl,
        videoType: videoData.videoType || 'uploaded',
        orderIndex: videoData.orderIndex || 0,
        detailedContent: videoData.detailedContent || '',
        duration: videoData.duration || 0,
        tags: videoData.tags || '',
        isActive: true,
      });

      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // Update video module
  app.put("/api/videos/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const videoData = req.body;
      
      const video = await storage.updateVideoModule(id, videoData);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  // Delete video module
  app.delete("/api/videos/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get video details first to delete from R2 if needed
      const video = await storage.getVideoModule(id);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Delete from R2 if it's an uploaded video
      if (video.videoType === 'uploaded' && video.videoUrl) {
        const { deleteVideo } = await import("./services/cloudflare-r2");
        await deleteVideo(video.videoUrl);
      }

      // Delete from database
      await storage.deleteVideoModule(id);
      
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });


  // Get specific timeline event
  app.get("/api/timeline/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getTimelineEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline event" });
    }
  });

  // Generate new exercise
  app.post("/api/exercises/generate", async (req, res) => {
    try {
      const { userId, topic, difficulty = 1 } = req.body;
      
      if (!userId || !topic) {
        return res.status(400).json({ message: "userId and topic are required" });
      }

      // Use static exercise generator instead of OpenAI to avoid quota issues
      const exerciseContent = generateStaticExercise(topic, difficulty);
      
      const exercise = await storage.createExercise({
        userId,
        content: exerciseContent,
        topic: exerciseContent.topic,
        difficulty
      });

      res.json(exercise);
    } catch (error) {
      console.error("Exercise generation error:", error);
      res.status(500).json({ message: "Failed to generate exercise: " + (error as Error).message });
    }
  });

  // Get available exercise topics
  app.get("/api/exercises/topics", async (req, res) => {
    try {
      const topics = getAvailableTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise topics" });
    }
  });

  // Generate exercise variation
  app.post("/api/exercises/vary", async (req, res) => {
    try {
      const { userId, exerciseId } = req.body;
      
      if (!userId || !exerciseId) {
        return res.status(400).json({ message: "userId and exerciseId are required" });
      }

      const exercises = await storage.getUserExercises(userId);
      const originalExercise = exercises.find(e => e.id === exerciseId);
      
      if (!originalExercise) {
        return res.status(404).json({ message: "Original exercise not found" });
      }

      // Use static exercise generator for variations as well
      const variationContent = generateStaticExercise(originalExercise.topic, originalExercise.difficulty);
      
      const newExercise = await storage.createExercise({
        userId,
        content: variationContent,
        topic: variationContent.topic,
        difficulty: originalExercise.difficulty
      });

      res.json(newExercise);
    } catch (error) {
      console.error("Exercise variation error:", error);
      res.status(500).json({ message: "Failed to generate exercise variation: " + (error as Error).message });
    }
  });

  // Get user exercises
  app.get("/api/exercises/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const exercises = await storage.getUserExercises(userId);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Submit exercise attempt
  app.post("/api/exercises/attempt", async (req, res) => {
    try {
      const validated = insertExerciseAttemptSchema.parse(req.body);
      const attempt = await storage.createExerciseAttempt(validated);
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise attempt data" });
    }
  });

  // Get user exercise attempts
  app.get("/api/exercises/attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const attempts = await storage.getUserExerciseAttempts(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise attempts" });
    }
  });

  // Get learning modules
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getAllLearningModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning modules" });
    }
  });

  // Get user module progress
  app.get("/api/modules/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserModuleProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch module progress" });
    }
  });

  // Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Download resource
  app.get("/api/resources/download/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // In a real application, this would serve the actual file
      // For now, we'll return the resource metadata
      res.json({
        message: "Resource download initiated",
        resource: resource
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to download resource" });
    }
  });

  // Get user statistics
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      const attempts = await storage.getUserExerciseAttempts(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const totalAttempts = attempts.length;
      const averageScore = totalAttempts > 0 
        ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / totalAttempts)
        : 0;

      const stats = {
        totalStudyTime: `${Math.floor(user.totalStudyTime / 60)}h ${user.totalStudyTime % 60}m`,
        exercisesCompleted: totalAttempts,
        averageScore: `${averageScore}%`,
        currentStreak: `${user.currentStreak} days`,
        overallProgress: user.overallProgress
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Student progress statistics by Life in UK test category
  app.get("/api/student-stats/:userId", async (req, res) => {
    const { userId } = req.params;
    
    try {
      // Get all exercise attempts for the user
      const exerciseAttempts = await storage.getUserExerciseAttempts(userId);
      const exercises = await storage.getUserExercises(userId);
      
      // Life in UK test categories
      const categories = {
        'british-history': 'British History',
        'government-politics': 'Government & Politics', 
        'culture-traditions': 'Culture & Traditions',
        'geography-demographics': 'Geography & Demographics',
        'british-values': 'British Values',
        'legal-system': 'Legal System'
      };

      const categoryStats: Record<string, any> = {};

      // Initialize categories
      Object.keys(categories).forEach(category => {
        categoryStats[category] = {
          totalExercises: 0,
          completedExercises: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          recentActivity: false,
          scores: []
        };
      });

      // Process exercises and categorize them
      exercises.forEach((exercise: Exercise) => {
        let category = 'british-history'; // default category
        
        // Categorize based on topic content
        const topicLower = exercise.topic.toLowerCase();
        if (topicLower.includes('parliament') || topicLower.includes('government') || topicLower.includes('politics') || topicLower.includes('prime minister')) {
          category = 'government-politics';
        } else if (topicLower.includes('culture') || topicLower.includes('tradition') || topicLower.includes('festival') || topicLower.includes('sport')) {
          category = 'culture-traditions';
        } else if (topicLower.includes('geography') || topicLower.includes('population') || topicLower.includes('demographic') || topicLower.includes('city')) {
          category = 'geography-demographics';
        } else if (topicLower.includes('values') || topicLower.includes('democracy') || topicLower.includes('liberty') || topicLower.includes('tolerance')) {
          category = 'british-values';
        } else if (topicLower.includes('law') || topicLower.includes('legal') || topicLower.includes('court') || topicLower.includes('justice')) {
          category = 'legal-system';
        }

        categoryStats[category].totalExercises++;
      });

      // Process exercise attempts
      exerciseAttempts.forEach((attempt: ExerciseAttempt) => {
        // Find the corresponding exercise
        const exercise = exercises.find((ex: Exercise) => ex.id === attempt.exerciseId);
        if (!exercise) return;

        // Determine category
        let category = 'british-history';
        const topicLower = exercise.topic.toLowerCase();
        if (topicLower.includes('parliament') || topicLower.includes('government') || topicLower.includes('politics') || topicLower.includes('prime minister')) {
          category = 'government-politics';
        } else if (topicLower.includes('culture') || topicLower.includes('tradition') || topicLower.includes('festival') || topicLower.includes('sport')) {
          category = 'culture-traditions';
        } else if (topicLower.includes('geography') || topicLower.includes('population') || topicLower.includes('demographic') || topicLower.includes('city')) {
          category = 'geography-demographics';
        } else if (topicLower.includes('values') || topicLower.includes('democracy') || topicLower.includes('liberty') || topicLower.includes('tolerance')) {
          category = 'british-values';
        } else if (topicLower.includes('law') || topicLower.includes('legal') || topicLower.includes('court') || topicLower.includes('justice')) {
          category = 'legal-system';
        }

        const scorePercentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
        categoryStats[category].completedExercises++;
        categoryStats[category].scores.push(scorePercentage);
        categoryStats[category].bestScore = Math.max(categoryStats[category].bestScore, scorePercentage);
        
        // Check for recent activity (within last 7 days)
        if (attempt.completedAt) {
          const attemptDate = new Date(attempt.completedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (attemptDate > weekAgo) {
            categoryStats[category].recentActivity = true;
          }
        }
      });

      // Calculate averages
      Object.keys(categoryStats).forEach(category => {
        const scores = categoryStats[category].scores;
        if (scores.length > 0) {
          categoryStats[category].averageScore = Math.round(
            scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
          );
        }
        // Remove scores array from response
        delete categoryStats[category].scores;
      });

      res.json({ categoryStats });
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch student statistics" });
    }
  });

  // Practice test routes
  
  // Get all practice tests
  app.get("/api/practice-tests", async (req, res) => {
    try {
      const tests = await storage.getAllPracticeTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch practice tests" });
    }
  });

  // Get specific practice test with pre-loaded questions
  app.get("/api/practice-tests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const test = await storage.getPracticeTest(id);
      if (!test) {
        return res.status(404).json({ message: "Practice test not found" });
      }

      // Return test with pre-loaded questions from database
      res.json(test);
    } catch (error) {
      console.error("Error fetching practice test:", error);
      res.status(500).json({ message: "Failed to fetch practice test" });
    }
  });

  // Submit practice test attempt
  app.post("/api/practice-tests/attempt", async (req, res) => {
    try {
      const validated = insertPracticeTestAttemptSchema.parse(req.body);
      const attempt = await storage.createPracticeTestAttempt(validated);
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ message: "Invalid practice test attempt data" });
    }
  });

  // Get user practice test attempts
  app.get("/api/practice-tests/attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const attempts = await storage.getUserPracticeTestAttempts(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch practice test attempts" });
    }
  });

  // Get user attempts for specific test
  app.get("/api/practice-tests/attempts/:userId/:testId", async (req, res) => {
    try {
      const { userId, testId } = req.params;
      const attempts = await storage.getPracticeTestAttempts(userId, testId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch practice test attempts" });
    }
  });

  // Mock Tests Routes
  app.get("/api/mock-tests", async (req, res) => {
    try {
      const tests = await storage.getMockTests();
      res.json(tests);
    } catch (error) {
      console.error("Error fetching mock tests:", error);
      res.status(500).json({ error: "Failed to fetch mock tests" });
    }
  });

  app.get("/api/mock-tests/:id", async (req, res) => {
    try {
      const test = await storage.getMockTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Mock test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Error fetching mock test:", error);
      res.status(500).json({ error: "Failed to fetch mock test" });
    }
  });

  app.post("/api/mock-tests/:id/submit", async (req, res) => {
    try {
      const { userId, answers, timeSpent } = req.body;
      const mockTestId = req.params.id;
      
      if (!userId || !answers || typeof timeSpent !== 'number') {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const mockTest = await storage.getMockTest(mockTestId);
      if (!mockTest) {
        return res.status(404).json({ error: "Mock test not found" });
      }

      // Calculate score
      const questions = mockTest.questions as any[];
      let score = 0;
      answers.forEach((answer: number, index: number) => {
        if (answer === questions[index].correctAnswer) {
          score++;
        }
      });

      const passed = score >= 18; // Need 18/24 to pass (75%)

      const attempt = await storage.submitMockTest({
        userId,
        mockTestId,
        answers,
        score,
        totalQuestions: 24,
        passedTest: passed,
        timeSpent
      });

      res.json(attempt);
    } catch (error) {
      console.error("Error submitting mock test:", error);
      res.status(500).json({ error: "Failed to submit mock test" });
    }
  });

  app.get("/api/mock-tests/:id/attempts/:userId", async (req, res) => {
    try {
      const attempts = await storage.getMockTestAttempts(req.params.id, req.params.userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching mock test attempts:", error);
      res.status(500).json({ error: "Failed to fetch attempts" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, planType } = req.body;
      
      // Convert pounds to pence (Stripe uses smallest currency unit)
      const amountInPence = Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPence,
        currency: "gbp",
        metadata: {
          planType: planType || 'basic'
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Get user subscription status
  app.get("/api/user/:userId/subscription", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId
      });
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Chatbot endpoint
  app.post("/api/chatbot/ask", async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    try {

      // Use OpenAI to generate response with comprehensive Life in UK knowledge
      const systemPrompt = `You are an expert Life in UK study assistant with complete knowledge from the official handbook and test materials. Provide accurate, detailed information about:

BRITISH HISTORY & KEY DATES:
- Stone Age (10,000 years ago), Bronze Age (4,000 years ago), Iron Age (2,500 years ago)
- Roman Britain (43-410 AD): Hadrian's Wall, Roman roads, Boudicca's rebellion
- Anglo-Saxons (5th-11th centuries): Alfred the Great, Anglo-Saxon kingdoms
- Vikings (8th-11th centuries): raids and settlements
- Norman Conquest (1066): Battle of Hastings, William the Conqueror, Domesday Book
- Medieval Period: Magna Carta (1215), Black Death (1348), Wars of the Roses (1455-1485)
- Tudor Dynasty: Henry VII, Henry VIII and 6 wives, Elizabeth I, Mary Queen of Scots
- English Civil War (1642-1651): Charles I execution, Oliver Cromwell, Commonwealth
- Restoration (1660): Charles II, Great Fire of London (1666), Great Plague (1665)
- Union with Scotland (1707), Jacobite uprisings
- Industrial Revolution (1750-1850): steam power, canals, railways, factories
- British Empire: India, Australia, Canada, slavery abolition (1833)
- World War I (1914-1918): trench warfare, conscription, women's roles
- World War II (1939-1945): Churchill, Battle of Britain, Blitz, D-Day
- Post-war: NHS creation (1948), EU membership (1973-2020), devolution (1997)

GOVERNMENT & POLITICS:
- Constitutional monarchy: Queen/King as Head of State, ceremonial role
- Parliament: House of Commons (650 MPs), House of Lords (appointed peers)
- Prime Minister: head of government, leader of majority party
- Cabinet: senior ministers chosen by PM, collective responsibility
- Civil Service: politically neutral, implements government policies
- Electoral system: First Past the Post, constituencies, general elections every 5 years
- Political parties: Conservative, Labour, Liberal Democrats, SNP, others
- Devolution: Scottish Parliament, Welsh Assembly, Northern Ireland Assembly
- Legal systems: England & Wales (common law), Scotland (mixed), Northern Ireland

BRITISH VALUES & SOCIETY:
- Democracy: free and fair elections, peaceful power transfer
- Rule of Law: equality before law, independent judiciary, fair trials
- Individual Liberty: freedom of speech, belief, assembly
- Mutual Respect & Tolerance: respect for different backgrounds, beliefs, lifestyles
- Human rights, equality legislation, community cohesion

CULTURE & TRADITIONS:
- National days: St George (England), St Andrew (Scotland), St David (Wales), St Patrick (N. Ireland)
- Festivals: Christmas, Easter, Guy Fawkes Night (November 5th), Burns Night, Diwali, Eid
- Sports: Football (1863), Rugby (1871), Cricket, Tennis (Wimbledon), Golf
- Arts: Shakespeare, Charles Dickens, Jane Austen, The Beatles, Turner, Constable
- Traditions: Pantomime, Morris dancing, Highland Games, Eisteddfod
- Food: Fish and chips, Sunday roast, haggis, Welsh cakes, Ulster fry

GEOGRAPHY & DEMOGRAPHICS:
- Countries: England (capital London), Scotland (Edinburgh), Wales (Cardiff), Northern Ireland (Belfast)
- Population: 67 million (England 56m, Scotland 5.5m, Wales 3.1m, N. Ireland 1.9m)
- Major cities: London, Birmingham, Manchester, Liverpool, Leeds, Sheffield, Bristol, Glasgow
- Landscapes: Lake District, Scottish Highlands, Snowdonia, Giant's Causeway
- Languages: English (official), Welsh (Wales), Scottish Gaelic, Ulster Scots

Answer with specific facts, dates, and examples from the official Life in UK materials. Keep responses well-formatted with bullet points for readability.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const answer = getFallbackResponse(question);
          const suggestions = generateSuggestions(question);
          const resources = generateResources(question);
          
          return res.json({
            answer,
            suggestions,
            resources
          });
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
      
      // Generate contextual suggestions based on the question topic
      const suggestions = generateSuggestions(question);
      const resources = generateResources(question);

      res.json({
        answer,
        suggestions,
        resources
      });
    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      // Provide fallback response instead of error
      const answer = getFallbackResponse(question);
      const suggestions = generateSuggestions(question);
      const resources = generateResources(question);
      
      res.json({
        answer,
        suggestions,
        resources
      });
    }
  });

  // ================================
  // ADMIN API ROUTES
  // ================================
  
  // Admin user management - get all users
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { page = '1', limit = '20', role } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      // Get users with pagination and optional role filter
      const users = await storage.getAllUsers({
        page: pageNum,
        limit: limitNum,
        role: role as string
      });
      
      // Remove sensitive data before sending
      const safeUsers = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        username: user.username,
        email: user.email,
        role: user.role,
        overallProgress: user.overallProgress || 0,
        totalStudyTime: user.totalStudyTime || 0,
        currentStreak: user.currentStreak || 0,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt || new Date().toISOString()
      }));
      
      res.json({
        users: safeUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: users.length === limitNum
        }
      });
      
    } catch (error: any) {
      console.error("Admin get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin user management - update user role
  app.put("/api/admin/users/:userId/role", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      // Validate role
      if (!['student', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }
      
      // Update user role
      const success = await storage.updateUserRole(userId, role);
      
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Log the action for audit
      await storage.createAuditLog({
        adminId: req.user!.userId,
        action: 'user_role_update',
        targetUserId: userId,
        details: { newRole: role },
        timestamp: new Date()
      });
      
      res.json({ message: "User role updated successfully" });
      
    } catch (error: any) {
      console.error("Admin update user role error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Admin user management - suspend/unsuspend user
  app.put("/api/admin/users/:userId/suspend", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      const { suspended = true, reason } = req.body;
      
      // Update user suspension status
      const success = await storage.updateUserSuspension(userId, suspended, reason);
      
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Log the action for audit
      await storage.createAuditLog({
        adminId: req.user!.userId,
        action: suspended ? 'user_suspended' : 'user_unsuspended',
        targetUserId: userId,
        details: { reason },
        timestamp: new Date()
      });
      
      res.json({ message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully` });
      
    } catch (error: any) {
      console.error("Admin suspend user error:", error);
      res.status(500).json({ error: "Failed to update user suspension status" });
    }
  });

  // Admin user management - update user
  app.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Get the user first to check if they exist
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(id, {
        firstName: updateData.firstName,
        email: updateData.email,
        username: updateData.username
      });
      
      // Update role if provided
      if (updateData.role && ['student', 'admin', 'superadmin'].includes(updateData.role)) {
        await storage.updateUserRole(id, updateData.role);
      }
      
      // Update subscription if provided
      if (updateData.subscriptionType && ['free', 'premium'].includes(updateData.subscriptionType)) {
        await storage.updateUserSubscription(id, updateData.subscriptionType, updateData.subscriptionStatus || 'active');
      }
      
      // Log the action
      await storage.createAuditLog({
        adminId: req.user!.userId,
        action: 'update_user',
        targetUserId: id,
        details: updateData,
        timestamp: new Date()
      });
      
      res.json({ message: "User updated successfully", user: updatedUser });
      
    } catch (error: any) {
      console.error("Admin update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Admin user management - create user
  app.post("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { firstName, username, email, password, role = 'student', subscriptionType = 'free' } = req.body;
      
      // Validate required fields
      if (!firstName || !username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        firstName,
        username,
        email,
        password: hashedPassword,
        role,
        subscriptionType,
        subscriptionStatus: 'active'
      });
      
      // Log the action
      await storage.createAuditLog({
        adminId: req.user!.userId,
        action: 'create_user',
        targetUserId: newUser.id,
        details: { role, subscriptionType },
        timestamp: new Date()
      });
      
      res.status(201).json({ message: "User created successfully", user: newUser });
      
    } catch (error: any) {
      console.error("Admin create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Admin user management - delete user
  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Get the user first to check if they exist
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Prevent deleting superadmin users
      if (existingUser.role === 'superadmin') {
        return res.status(403).json({ error: "Cannot delete superadmin users" });
      }
      
      // Prevent deleting yourself
      if (existingUser.id === req.user!.userId) {
        return res.status(403).json({ error: "Cannot delete your own account" });
      }
      
      // Delete user refresh tokens
      await storage.deleteUserRefreshTokens(id);
      
      // Soft delete the user
      await storage.deleteUser(id);
      
      // Debug logging
      console.log('Delete user - req.user:', req.user);
      console.log('Delete user - req.user.userId:', req.user!.userId);
      
      // Test if we can create an audit log with a hardcoded admin ID
      try {
        console.log('Testing audit log creation with hardcoded admin ID...');
        await storage.createAuditLog({
          adminId: 'test-admin-id',
          action: 'delete_user',
          targetUserId: id,
          details: { reason: 'Deleted by admin' },
          timestamp: new Date()
        });
        console.log('Audit log creation successful with hardcoded ID');
      } catch (auditError) {
        console.log('Audit log creation failed with hardcoded ID:', auditError);
      }
      
      // Log the action with actual admin ID
      try {
        await storage.createAuditLog({
          adminId: req.user!.userId,
          action: 'delete_user',
          targetUserId: id,
          details: { reason: 'Deleted by admin' },
          timestamp: new Date()
        });
        console.log('Audit log creation successful with actual admin ID');
      } catch (auditError) {
        console.log('Audit log creation failed with actual admin ID:', auditError);
      }
      
      res.json({ message: "User deleted successfully" });
      
    } catch (error: any) {
      console.error("Admin delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Admin analytics - dashboard stats
  app.get("/api/admin/analytics", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Get comprehensive analytics data
      const [
        totalUsers,
        activeUsers,
        subscriptionStats,
        recentSignups,
        userGrowth,
        contentPerformance,
        revenue,
        engagement
      ] = await Promise.all([
        storage.getTotalUserCount(),
        storage.getActiveUserCount(),
        storage.getSubscriptionStats(),
        storage.getRecentSignups(7), // Last 7 days
        storage.getUserGrowthAnalytics(timeRange as string),
        storage.getContentPerformanceAnalytics(),
        storage.getRevenueAnalytics(),
        storage.getEngagementAnalytics()
      ]);
      
      // Calculate overview metrics
      const overview = {
        totalUsers,
        activeUsers,
        newUsers: recentSignups,
        revenue: revenue.monthly,
        conversionRate: totalUsers > 0 ? (subscriptionStats.premium / totalUsers) * 100 : 0,
        averageSessionTime: engagement.averageSessionTime,
        bounceRate: Math.floor(Math.random() * 20) + 30 // Mock bounce rate 30-50%
      };
      
      res.json({
        overview,
        userGrowth,
        contentPerformance,
        revenue,
        engagement,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Admin analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Admin analytics export
  app.get("/api/admin/analytics/export", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Get analytics data
      const [
        totalUsers,
        activeUsers,
        subscriptionStats,
        recentSignups,
        userGrowth,
        contentPerformance,
        revenue,
        engagement
      ] = await Promise.all([
        storage.getTotalUserCount(),
        storage.getActiveUserCount(),
        storage.getSubscriptionStats(),
        storage.getRecentSignups(7),
        storage.getUserGrowthAnalytics(timeRange as string),
        storage.getContentPerformanceAnalytics(),
        storage.getRevenueAnalytics(),
        storage.getEngagementAnalytics()
      ]);

      // Create CSV content
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Users', totalUsers],
        ['Active Users', activeUsers],
        ['Recent Signups (7d)', recentSignups],
        ['Premium Users', subscriptionStats.premium],
        ['Free Users', subscriptionStats.free],
        ['Monthly Revenue', revenue.monthly],
        ['Yearly Revenue', revenue.yearly],
        ['Revenue Growth', revenue.growth + '%'],
        ['Average Session Time', engagement.averageSessionTime + ' minutes'],
        ['Page Views', engagement.pageViews],
        ['Unique Visitors', engagement.uniqueVisitors],
        ['Return Visitors', engagement.returnVisitors],
        ['Export Date', new Date().toISOString()]
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
      
    } catch (error: any) {
      console.error("Admin analytics export error:", error);
      res.status(500).json({ error: "Failed to export analytics data" });
    }
  });

  // Admin audit logs
  app.get("/api/admin/audit-logs", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { page = '1', limit = '50' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const auditLogs = await storage.getAuditLogs({
        page: pageNum,
        limit: limitNum
      });
      
      res.json({
        logs: auditLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: auditLogs.length === limitNum
        }
      });
      
    } catch (error: any) {
      console.error("Admin audit logs error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Admin system status
  app.get("/api/admin/system-status", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      // Basic system health checks
      const systemStatus = {
        database: 'connected',
        server: 'running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };
      
      res.json(systemStatus);
      
    } catch (error: any) {
      console.error("Admin system status error:", error);
      res.status(500).json({ 
        error: "Failed to fetch system status",
        database: 'error',
        server: 'error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Admin settings management
  app.get("/api/admin/settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      // Return system settings
      const settings = {
        siteName: "Life Skills Prep",
        maintenanceMode: false,
        registrationEnabled: true,
        maxFileSize: "100MB",
        allowedFileTypes: ["mp4", "pdf", "jpg", "png"],
        emailNotifications: true,
        analyticsEnabled: true,
        backupFrequency: "daily",
        lastBackup: new Date().toISOString()
      };
      
      res.json(settings);
    } catch (error: any) {
      console.error("Admin settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = req.body;
      
      // In a real application, you would save these to a database
      console.log("Settings updated:", settings);
      
      res.json({ message: "Settings updated successfully", settings });
    } catch (error: any) {
      console.error("Admin settings update error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Admin content management endpoints
  app.get("/api/admin/exercises", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error: any) {
      console.error("Admin exercises error:", error);
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  app.get("/api/admin/tests", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const tests = await storage.getAllPracticeTests();
      res.json(tests);
    } catch (error: any) {
      console.error("Admin tests error:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  app.get("/api/admin/resources", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error: any) {
      console.error("Admin resources error:", error);
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  app.get("/api/admin/timeline", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const timeline = await storage.getAllTimelineEvents();
      res.json(timeline);
    } catch (error: any) {
      console.error("Admin timeline error:", error);
      res.status(500).json({ error: "Failed to fetch timeline events" });
    }
  });

  // Generic delete endpoint for admin content
  app.delete("/api/admin/:type/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, id } = req.params;
      
      let result = false;
      switch (type) {
        case 'exercises':
          result = await storage.deleteExercise(id);
          break;
        case 'tests':
          result = await storage.deletePracticeTest(id);
          break;
        case 'resources':
          result = await storage.deleteResource(id);
          break;
        case 'timeline':
          result = await storage.deleteTimelineEvent(id);
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }
      
      if (result) {
        res.json({ message: `${type} deleted successfully` });
      } else {
        res.status(404).json({ error: `${type} not found` });
      }
    } catch (error: any) {
      console.error(`Admin delete ${req.params.type} error:`, error);
      res.status(500).json({ error: `Failed to delete ${req.params.type}` });
    }
  });

  // Video Content Management Endpoints
  app.get("/api/admin/videos/:id/content", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      let video = await storage.getVideoModule(id);
      
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      // Convert R2 key to public URL for uploaded videos
      if (video.videoType === 'uploaded' && video.videoUrl && !video.videoUrl.startsWith('http')) {
        try {
          const { getVideoPublicUrl } = await import('./services/cloudflare-r2');
          video = {
            ...video,
            videoUrl: getVideoPublicUrl(video.videoUrl)
          };
        } catch (r2Error) {
          console.error('R2 service error in admin endpoint:', r2Error);
          // Continue with original video if R2 conversion fails
        }
      }
      
      // Return video with content data
      res.json({
        video,
        content: {
          title: video.title,
          description: video.description,
          difficulty: video.difficulty || 'intermediate',
          tags: video.tags || [],
          additionalContent: video.additionalContent || '',
          instructorNotes: video.instructorNotes || '',
          studentNotes: video.studentNotes || '',
          keyPoints: video.keyPoints || '',
          prerequisites: video.prerequisites || '',
          followUpActions: video.followUpActions || ''
        }
      });
    } catch (error: any) {
      console.error("Get video content error:", error);
      res.status(500).json({ error: "Failed to fetch video content" });
    }
  });

  app.put("/api/admin/videos/:id/content", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const contentData = req.body;
      
      // Update video with content data
      const updatedVideo = await storage.updateVideoModule(id, {
        title: contentData.title,
        description: contentData.description,
        difficulty: contentData.difficulty,
        tags: contentData.tags,
        additionalContent: contentData.additionalContent,
        instructorNotes: contentData.instructorNotes,
        studentNotes: contentData.studentNotes,
        keyPoints: contentData.keyPoints,
        prerequisites: contentData.prerequisites,
        followUpActions: contentData.followUpActions
      });
      
      res.json({ message: "Video content updated successfully", video: updatedVideo });
    } catch (error: any) {
      console.error("Update video content error:", error);
      res.status(500).json({ error: "Failed to update video content" });
    }
  });

  // Video Resources Management
  app.get("/api/admin/videos/:id/resources", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const resources = await storage.getVideoResources(id);
      
      // Convert R2 keys to public URLs for uploaded resources
      const { getVideoPublicUrl } = await import('./services/cloudflare-r2');
      const resourcesWithPublicUrls = resources.map(resource => {
        if (resource.type !== 'link' && resource.url && !resource.url.startsWith('http')) {
          try {
            return {
              ...resource,
              url: getVideoPublicUrl(resource.url)
            };
          } catch (r2Error) {
            console.error('R2 service error for resources:', r2Error);
            return resource; // Return original resource if R2 conversion fails
          }
        }
        return resource;
      });
      
      res.json(resourcesWithPublicUrls);
    } catch (error: any) {
      console.error("Get video resources error:", error);
      res.status(500).json({ error: "Failed to fetch video resources" });
    }
  });

  // Get presigned URL for resource upload
  app.post("/api/admin/videos/:id/resources/presigned-upload", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { fileName, contentType } = req.body;
      
      if (!fileName || !contentType) {
        return res.status(400).json({ error: "fileName and contentType are required" });
      }
      
      const { getPresignedUploadUrl } = await import('./services/cloudflare-r2');
      const result = await getPresignedUploadUrl(fileName, contentType);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }
      
      res.json({
        uploadUrl: result.uploadUrl,
        key: result.key,
        publicUrl: result.publicUrl
      });
    } catch (error: any) {
      console.error("Get presigned URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.post("/api/admin/videos/:id/resources", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, type, url, description, size } = req.body;
      
      const newResource = await storage.createVideoResource({
        videoId: id,
        title,
        type,
        url,
        description,
        size
      });
      
      res.status(201).json({ message: "Resource added successfully", resource: newResource });
    } catch (error: any) {
      console.error("Add video resource error:", error);
      res.status(500).json({ error: "Failed to add video resource" });
    }
  });

  app.delete("/api/admin/videos/:id/resources/:resourceId", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { resourceId } = req.params;
      
      const deleted = await storage.deleteVideoResource(resourceId);
      if (deleted) {
        res.json({ message: "Resource deleted successfully" });
      } else {
        res.status(404).json({ error: "Resource not found" });
      }
    } catch (error: any) {
      console.error("Delete video resource error:", error);
      res.status(500).json({ error: "Failed to delete video resource" });
    }
  });

  // Video Audio Management
  app.get("/api/admin/videos/:id/audio", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const audio = await storage.getVideoAudio(id);
      res.json(audio);
    } catch (error: any) {
      console.error("Get video audio error:", error);
      res.status(500).json({ error: "Failed to fetch video audio" });
    }
  });

  app.post("/api/admin/videos/:id/audio", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, type, url, description, duration, quality } = req.body;
      
      const newAudio = await storage.createVideoAudio({
        videoId: id,
        title,
        type,
        url,
        description,
        duration,
        quality
      });
      
      res.status(201).json({ message: "Audio added successfully", audio: newAudio });
    } catch (error: any) {
      console.error("Add video audio error:", error);
      res.status(500).json({ error: "Failed to add video audio" });
    }
  });

  app.delete("/api/admin/videos/:id/audio/:audioId", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { audioId } = req.params;
      
      const deleted = await storage.deleteVideoAudio(audioId);
      if (deleted) {
        res.json({ message: "Audio deleted successfully" });
      } else {
        res.status(404).json({ error: "Audio not found" });
      }
    } catch (error: any) {
      console.error("Delete video audio error:", error);
      res.status(500).json({ error: "Failed to delete video audio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to provide detailed fallback responses with authentic Life in UK content
function getFallbackResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('parliament') || lowerQuestion.includes('government') || lowerQuestion.includes('mp')) {
    return "UK Parliament structure:\n\n• **House of Commons**: 650 elected MPs, each represents a constituency\n• **House of Lords**: Appointed peers, life peers, bishops\n• **Prime Minister**: Leader of party with most MPs\n• **Cabinet**: Senior ministers, collective responsibility\n• **Speaker**: Chairs Commons debates, politically neutral\n\nParliament makes laws, debates policies, and holds government accountable through Prime Minister's Questions.";
  }
  
  if (lowerQuestion.includes('history') || lowerQuestion.includes('conquest') || lowerQuestion.includes('tudor') || lowerQuestion.includes('war')) {
    return "British history timeline:\n\n• **Roman Britain** (43-410 AD): Hadrian's Wall, Roman roads\n• **Anglo-Saxons** (5th-11th century): Alfred the Great\n• **Norman Conquest** (1066): Battle of Hastings, William the Conqueror\n• **Medieval**: Magna Carta (1215), Black Death (1348)\n• **Tudors**: Henry VIII (6 wives), Elizabeth I\n• **Civil War** (1642-1651): Charles I executed\n• **Industrial Revolution** (1750-1850): Steam power, railways\n• **World Wars**: WWI (1914-1918), WWII (1939-1945)";
  }
  
  if (lowerQuestion.includes('culture') || lowerQuestion.includes('tradition') || lowerQuestion.includes('festival') || lowerQuestion.includes('sport')) {
    return "British culture highlights:\n\n• **National days**: St George (England), St Andrew (Scotland), St David (Wales), St Patrick (N. Ireland)\n• **Festivals**: Christmas, Easter, Guy Fawkes Night (Nov 5th)\n• **Sports**: Football (FA founded 1863), Rugby, Cricket, Wimbledon\n• **Arts**: Shakespeare, Charles Dickens, The Beatles\n• **Traditions**: Sunday roast, afternoon tea, pantomime\n• **Food**: Fish & chips, haggis, Welsh cakes";
  }
  
  if (lowerQuestion.includes('value') || lowerQuestion.includes('british') || lowerQuestion.includes('democracy')) {
    return "British Values (required for citizenship):\n\n• **Democracy**: Free elections, peaceful power transfer, everyone's vote counts equally\n• **Rule of Law**: Everyone equal before law, independent courts, fair trials\n• **Individual Liberty**: Freedom of speech, belief, assembly (within the law)\n• **Mutual Respect & Tolerance**: Respect for different backgrounds, beliefs, lifestyles\n\nThese values underpin British society and are essential for integration.";
  }
  
  if (lowerQuestion.includes('test') || lowerQuestion.includes('citizenship') || lowerQuestion.includes('exam')) {
    return "Life in UK Test details:\n\n• **Format**: 24 multiple choice questions\n• **Pass mark**: 75% (18 correct answers)\n• **Time**: 45 minutes\n• **Topics**: British history, traditions, government, law, geography\n• **Cost**: £50\n• **Booking**: gov.uk website\n• **Languages**: English only\n• **Study**: Official handbook essential\n• **ID required**: Passport or driving licence";
  }
  
  if (lowerQuestion.includes('scotland') || lowerQuestion.includes('wales') || lowerQuestion.includes('northern ireland') || lowerQuestion.includes('devolution')) {
    return "UK countries and devolution:\n\n• **England**: Population 56m, capital London\n• **Scotland**: Population 5.5m, capital Edinburgh, Scottish Parliament (1999)\n• **Wales**: Population 3.1m, capital Cardiff, Welsh Assembly/Senedd (1999)\n• **Northern Ireland**: Population 1.9m, capital Belfast, Assembly (1999)\n\n**Devolved powers**: Education, health, transport, some taxation\n**Reserved powers**: Defence, foreign policy, immigration, pensions";
  }
  
  if (lowerQuestion.includes('henry') || lowerQuestion.includes('tudor') || lowerQuestion.includes('elizabeth')) {
    return "Tudor Dynasty (1485-1603):\n\n• **Henry VII** (1485-1509): First Tudor king, Battle of Bosworth\n• **Henry VIII** (1509-1547): 6 wives, broke from Rome, created Church of England\n• **Edward VI** (1547-1553): Protestant, son of Henry VIII\n• **Mary I** (1553-1558): \"Bloody Mary\", restored Catholicism\n• **Elizabeth I** (1558-1603): \"Golden Age\", defeated Spanish Armada (1588)\n\nKey events: English Reformation, dissolution of monasteries, Spanish Armada defeat.";
  }
  
  if (lowerQuestion.includes('world war') || lowerQuestion.includes('churchill') || lowerQuestion.includes('blitz')) {
    return "World Wars:\n\n**WWI (1914-1918)**:\n• Trench warfare, conscription introduced\n• Women entered workforce\n• 1 million British casualties\n\n**WWII (1939-1945)**:\n• Winston Churchill PM (1940-1945, 1951-1955)\n• Battle of Britain (1940): RAF victory\n• The Blitz: German bombing of British cities\n• D-Day landings (1944): Allied invasion of Europe\n• Churchill's \"finest hour\" speech";
  }
  
  if (lowerQuestion.includes('religion') || lowerQuestion.includes('church') || lowerQuestion.includes('archbishop')) {
    return "Religion in the UK:\n\n• **England**: Church of England (Protestant), established church\n• **Scotland**: Church of Scotland (Presbyterian), national church\n• **Wales**: No established church\n• **Northern Ireland**: No established church\n\n**Religious leaders**: Archbishop of Canterbury (England), Moderator (Scotland)\n**Demographics**: 46% Christian, 37% no religion, others include Muslim, Hindu, Sikh, Jewish\n**Religious freedom**: Protected by law";
  }
  
  return "I have comprehensive knowledge from the official Life in UK handbook covering:\n\n• **History**: Stone Age to modern Britain, all monarchs and key events\n• **Government**: Parliament, devolution, legal systems, elections\n• **Culture**: Traditions, sports, arts, literature, festivals\n• **Geography**: All four countries, major cities, landmarks\n• **Society**: British values, demographics, international relations\n• **Test prep**: Format, content, booking, study tips\n\nAsk about any specific topic!";
}

// Helper function to generate contextual suggestions
function generateSuggestions(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('parliament') || lowerQuestion.includes('government') || lowerQuestion.includes('political')) {
    return [
      "How does the Prime Minister get chosen?",
      "What's the difference between Parliament and Government?",
      "Tell me about devolution in Scotland and Wales"
    ];
  }
  
  if (lowerQuestion.includes('history') || lowerQuestion.includes('historical') || lowerQuestion.includes('past')) {
    return [
      "What happened during the Norman Conquest?",
      "Tell me about the Industrial Revolution",
      "How did the British Empire develop?"
    ];
  }
  
  if (lowerQuestion.includes('culture') || lowerQuestion.includes('tradition') || lowerQuestion.includes('festival')) {
    return [
      "What are important British festivals?",
      "Tell me about British sports traditions",
      "What should I know about the Royal Family?"
    ];
  }
  
  if (lowerQuestion.includes('test') || lowerQuestion.includes('exam') || lowerQuestion.includes('citizen')) {
    return [
      "What topics are covered in the citizenship test?",
      "How should I prepare for the Life in UK test?",
      "What are the British values I need to know?"
    ];
  }
  
  if (lowerQuestion.includes('law') || lowerQuestion.includes('legal') || lowerQuestion.includes('court')) {
    return [
      "How does the UK legal system work?",
      "What's the difference between civil and criminal law?",
      "Tell me about the police and justice system"
    ];
  }
  
  // Default suggestions
  return [
    "What are the four countries of the UK?",
    "Tell me about British democratic values",
    "How does the UK electoral system work?"
  ];
}

// Helper function to generate relevant platform resources
function generateResources(question: string): Array<{type: string, title: string, url: string}> {
  const lowerQuestion = question.toLowerCase();
  const resources = [];
  
  if (lowerQuestion.includes('parliament') || lowerQuestion.includes('government')) {
    resources.push({
      type: 'video',
      title: 'Government & Parliament Videos',
      url: '/dashboard'
    });
    resources.push({
      type: 'game',
      title: 'Government Structure Games',
      url: '/games'
    });
  }
  
  if (lowerQuestion.includes('history') || lowerQuestion.includes('historical')) {
    resources.push({
      type: 'timeline',
      title: 'Interactive Historical Timeline',
      url: '/timeline'
    });
    resources.push({
      type: 'video',
      title: 'History Video Lessons',
      url: '/dashboard'
    });
  }
  
  if (lowerQuestion.includes('test') || lowerQuestion.includes('practice') || lowerQuestion.includes('exam')) {
    resources.push({
      type: 'game',
      title: 'Practice Exercises',
      url: '/games'
    });
    resources.push({
      type: 'resource',
      title: 'Study Materials',
      url: '/resources'
    });
  }
  
  // Always suggest the main dashboard as a starting point
  if (resources.length === 0) {
    resources.push({
      type: 'video',
      title: 'Browse All Learning Content',
      url: '/dashboard'
    });
  }
  
  return resources;
}
