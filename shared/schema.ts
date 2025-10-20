import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default('student'), // 'student' | 'admin' | 'superadmin'
  overallProgress: integer("overall_progress").notNull().default(0),
  totalStudyTime: integer("total_study_time").notNull().default(0), // in minutes
  currentStreak: integer("current_streak").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionType: text("subscription_type"), // 'basic', 'group', 'guidance'
  subscriptionStatus: text("subscription_status"), // 'active', 'canceled', 'past_due'
  isSuspended: boolean("is_suspended").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  suspensionReason: text("suspension_reason"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoModules = pgTable("video_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: integer("duration").notNull(), // in seconds
  thumbnail: text("thumbnail"),
  category: text("category").notNull(),
  orderIndex: integer("order_index").notNull(),
  detailedContent: text("detailed_content"), // Rich text content about the topic
  keyImages: jsonb("key_images"), // Array of relevant images with descriptions
  audioScript: text("audio_script"), // Script for AI voice generation
  // Enhanced content management fields
  videoType: text("video_type").notNull().default('uploaded'), // 'uploaded' | 'youtube'
  isActive: boolean("is_active").notNull().default(true),
  difficulty: text("difficulty").default('intermediate'), // 'beginner' | 'intermediate' | 'advanced'
  tags: jsonb("tags"), // Array of tags
  additionalContent: text("additional_content"), // Additional educational content
  instructorNotes: text("instructor_notes"), // Teaching notes
  studentNotes: text("student_notes"), // Study notes for students
  keyPoints: text("key_points"), // Key points to remember
  prerequisites: text("prerequisites"), // What students should know before
  followUpActions: text("follow_up_actions"), // What to do after watching
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userVideoProgress = pgTable("user_video_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  videoId: varchar("video_id").references(() => videoModules.id).notNull(),
  completed: boolean("completed").notNull().default(false),
  watchTime: integer("watch_time").notNull().default(0), // in seconds
  lastWatched: timestamp("last_watched").defaultNow(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  details: text("details"),
  category: text("category").notNull(), // parliament, documents, voting_rights, territories, trades
  importance: integer("importance").notNull().default(1), // 1-5 scale
  keyFigures: text("key_figures"), // Notable personalities involved
  timelineTopic: text("timeline_topic").notNull(), // Which timeline this belongs to
  eventImage: text("event_image"), // URL to representative image
  imageDescription: text("image_description"), // Description of the image
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: jsonb("content").notNull(), // AI-generated exercise content
  topic: text("topic").notNull(),
  difficulty: integer("difficulty").notNull().default(1), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
});

export const exerciseAttempts = pgTable("exercise_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const learningModules = pgTable("learning_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull(),
  totalItems: integer("total_items").notNull(),
});

export const userModuleProgress = pgTable("user_module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").references(() => learningModules.id).notNull(),
  completedItems: integer("completed_items").notNull().default(0),
  progress: integer("progress").notNull().default(0), // percentage
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(),
  category: text("category").notNull(),
});

export const practiceTests = pgTable("practice_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: integer("difficulty").notNull().default(1), // 1-5 scale
  questions: jsonb("questions").notNull(), // Array of 24 questions with 4 options each
  orderIndex: integer("order_index").notNull(),
});

export const practiceTestAttempts = pgTable("practice_test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  testId: varchar("test_id").references(() => practiceTests.id).notNull(),
  answers: jsonb("answers").notNull(), // User's selected answers
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull().default(24),
  passedTest: boolean("passed_test").notNull(), // true if score >= 18/24 (75%)
  completedAt: timestamp("completed_at").defaultNow(),
});

export const mockTests = pgTable("mock_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  questions: jsonb("questions").notNull(), // Array of exactly 24 questions with 4 options each
  orderIndex: integer("order_index").notNull(),
  difficulty: integer("difficulty").notNull().default(3), // Mock tests are typically medium difficulty
  createdAt: timestamp("created_at").defaultNow(),
});

export const mockTestAttempts = pgTable("mock_test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  mockTestId: varchar("mock_test_id").references(() => mockTests.id).notNull(),
  answers: jsonb("answers").notNull(), // User's selected answers (array of 24 numbers)
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull().default(24),
  passedTest: boolean("passed_test").notNull(), // true if score >= 18/24 (75%)
  timeSpent: integer("time_spent").notNull(), // in seconds (max 2700 = 45 minutes)
  completedAt: timestamp("completed_at").defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // 'create', 'update', 'delete'
  entity: text("entity").notNull(), // 'user', 'practiceTest', 'mockTest', etc.
  entityId: text("entity_id").notNull(),
  before: jsonb("before"), // Previous state
  after: jsonb("after"), // New state
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video Resources Table
export const videoResources = pgTable("video_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => videoModules.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'pdf', 'link', 'file', 'image'
  url: text("url").notNull(),
  description: text("description"),
  size: text("size"), // File size for files
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video Audio Table
export const videoAudio = pgTable("video_audio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => videoModules.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'narration', 'accessibility', 'background'
  url: text("url").notNull(),
  description: text("description"),
  duration: text("duration"), // Audio duration
  quality: text("quality"), // Audio quality
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVideoModuleSchema = createInsertSchema(videoModules).omit({
  id: true,
});

export const insertUserVideoProgressSchema = createInsertSchema(userVideoProgress).omit({
  id: true,
  lastWatched: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseAttemptSchema = createInsertSchema(exerciseAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertLearningModuleSchema = createInsertSchema(learningModules).omit({
  id: true,
});

export const insertUserModuleProgressSchema = createInsertSchema(userModuleProgress).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export const insertPracticeTestSchema = createInsertSchema(practiceTests).omit({
  id: true,
});

export const insertPracticeTestAttemptSchema = createInsertSchema(practiceTestAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertMockTestSchema = createInsertSchema(mockTests).omit({
  id: true,
  createdAt: true,
});

export const insertMockTestAttemptSchema = createInsertSchema(mockTestAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertVideoResourceSchema = createInsertSchema(videoResources).omit({
  id: true,
  uploadedAt: true,
  createdAt: true,
});

export const insertVideoAudioSchema = createInsertSchema(videoAudio).omit({
  id: true,
  uploadedAt: true,
  createdAt: true,
});

// RAG System Tables
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author"),
  isbn: text("isbn"),
  description: text("description"),
  filePath: text("file_path"), // Path to the original file
  totalPages: integer("total_pages"),
  totalChunks: integer("total_chunks").default(0),
  isProcessed: boolean("is_processed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookSummaries = pgTable("book_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  summaryText: text("summary_text").notNull(), // Full AI-generated summary
  chapterBreakdowns: jsonb("chapter_breakdowns"), // Array of chapter summaries
  keyTopics: jsonb("key_topics"), // Array of key topics identified
  estimatedCounts: jsonb("estimated_counts"), // Estimated counts for tests, events, games
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookChunks = pgTable("book_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  pageNumber: integer("page_number"),
  chapterTitle: text("chapter_title"),
  sectionTitle: text("section_title"),
  embedding: text("embedding"), // JSON string of the embedding vector
  tokenCount: integer("token_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedTopics = pgTable("generated_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  chapterNumber: integer("chapter_number"),
  orderIndex: integer("order_index").notNull(),
  difficulty: text("difficulty").default('intermediate'),
  prerequisites: text("prerequisites"),
  keyPoints: jsonb("key_points"), // Array of key points
  content: text("content"), // Generated explanation content
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedTests = pgTable("generated_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  topicId: varchar("topic_id").references(() => generatedTopics.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  testType: text("test_type").notNull(), // 'multiple_choice' | 'short_answer' | 'fill_blank' | 'essay'
  questions: jsonb("questions").notNull(), // Array of question objects
  difficulty: text("difficulty").default('intermediate'),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score").default(70),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTestAttempts = pgTable("user_test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  testId: varchar("test_id").notNull().references(() => generatedTests.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(), // User's answers
  score: integer("score"),
  isPassed: boolean("is_passed"),
  timeSpent: integer("time_spent"), // in seconds
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// RAG Schemas for validation
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookSummarySchema = createInsertSchema(bookSummaries).omit({
  id: true,
  createdAt: true,
});

export const insertBookChunkSchema = createInsertSchema(bookChunks).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedTopicSchema = createInsertSchema(generatedTopics).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedTestSchema = createInsertSchema(generatedTests).omit({
  id: true,
  createdAt: true,
});

export const insertUserTestAttemptSchema = createInsertSchema(userTestAttempts).omit({
  id: true,
  startedAt: true,
});

// Games Management Tables
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'ai-generated', 'true-false', 'matching', 'flip-cards'
  gameType: text("game_type").notNull(), // Specific game type from components
  difficulty: text("difficulty").notNull().default('intermediate'), // 'beginner', 'intermediate', 'advanced'
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  instructions: text("instructions"), // How to play instructions
  estimatedTime: integer("estimated_time"), // Estimated completion time in minutes
  tags: jsonb("tags"), // Array of tags for categorization
  // Game-specific data structures
  trueFalseQuestions: jsonb("true_false_questions"), // Array of true/false questions
  matchingPairs: jsonb("matching_pairs"), // Array of 2-column matching pairs
  tripleMatches: jsonb("triple_matches"), // Array of 3-column matching data
  flipCards: jsonb("flip_cards"), // Array of flip card data
  aiTopics: jsonb("ai_topics"), // Array of AI exercise topics
  gameData: jsonb("game_data"), // Additional game-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Map Locations Management
export const mapLocations = pgTable("map_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  region: text("region").notNull(),
  type: text("type").notNull(), // 'capital', 'attraction', 'historical', 'artistic', 'literary'
  coordinates: jsonb("coordinates").notNull(), // { lat: number, lng: number }
  description: text("description").notNull(),
  details: text("details"),
  notablePeople: jsonb("notable_people"), // Array of strings
  lifeInUKInfo: jsonb("life_in_uk_info"), // Object with population, government, culture, economy, testRelevance
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMapLocationSchema = createInsertSchema(mapLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMapLocation = z.infer<typeof insertMapLocationSchema>;
export type MapLocation = typeof mapLocations.$inferSelect;

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export type InsertVideoModule = z.infer<typeof insertVideoModuleSchema>;
export type VideoModule = typeof videoModules.$inferSelect;



export type InsertUserVideoProgress = z.infer<typeof insertUserVideoProgressSchema>;
export type UserVideoProgress = typeof userVideoProgress.$inferSelect;

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertExerciseAttempt = z.infer<typeof insertExerciseAttemptSchema>;
export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;



export type InsertLearningModule = z.infer<typeof insertLearningModuleSchema>;
export type LearningModule = typeof learningModules.$inferSelect;

export type InsertUserModuleProgress = z.infer<typeof insertUserModuleProgressSchema>;
export type UserModuleProgress = typeof userModuleProgress.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertPracticeTest = z.infer<typeof insertPracticeTestSchema>;
export type PracticeTest = typeof practiceTests.$inferSelect;

export type InsertPracticeTestAttempt = z.infer<typeof insertPracticeTestAttemptSchema>;
export type PracticeTestAttempt = typeof practiceTestAttempts.$inferSelect;

export type InsertMockTest = z.infer<typeof insertMockTestSchema>;
export type MockTest = typeof mockTests.$inferSelect;

export type InsertMockTestAttempt = z.infer<typeof insertMockTestAttemptSchema>;
export type MockTestAttempt = typeof mockTestAttempts.$inferSelect;

export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;

export type InsertVideoResource = z.infer<typeof insertVideoResourceSchema>;
export type VideoResource = typeof videoResources.$inferSelect;

export type InsertVideoAudio = z.infer<typeof insertVideoAudioSchema>;
export type VideoAudio = typeof videoAudio.$inferSelect;

// RAG System Types
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertBookSummary = z.infer<typeof insertBookSummarySchema>;
export type BookSummary = typeof bookSummaries.$inferSelect;

export type InsertBookChunk = z.infer<typeof insertBookChunkSchema>;
export type BookChunk = typeof bookChunks.$inferSelect;

export type InsertGeneratedTopic = z.infer<typeof insertGeneratedTopicSchema>;
export type GeneratedTopic = typeof generatedTopics.$inferSelect;

export type InsertGeneratedTest = z.infer<typeof insertGeneratedTestSchema>;
export type GeneratedTest = typeof generatedTests.$inferSelect;

export type InsertUserTestAttempt = z.infer<typeof insertUserTestAttemptSchema>;
export type UserTestAttempt = typeof userTestAttempts.$inferSelect;

// Diagrams Management Tables
export const diagrams = pgTable("diagrams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'government', 'justice', 'parliament'
  section: text("section").notNull(), // 'executive', 'legislative', 'judicial', 'criminal', 'civil', 'commons', 'lords', etc.
  content: jsonb("content").notNull(), // Structured content data
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Visual elements
  icon: text("icon"), // Lucide icon name
  color: text("color"), // Color theme
  // Additional metadata
  tags: jsonb("tags"), // Array of tags
  keyPoints: jsonb("key_points"), // Array of key points
  relatedTopics: jsonb("related_topics"), // Array of related topic IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const diagramComponents = pgTable("diagram_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diagramId: varchar("diagram_id").notNull().references(() => diagrams.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'card', 'hierarchy', 'process', 'list', 'grid'
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Component-specific data
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Styling
  backgroundColor: text("background_color"),
  borderColor: text("border_color"),
  textColor: text("text_color"),
  // Additional properties
  metadata: jsonb("metadata"), // Additional component metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDiagramSchema = createInsertSchema(diagrams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiagramComponentSchema = createInsertSchema(diagramComponents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiagram = z.infer<typeof insertDiagramSchema>;
export type Diagram = typeof diagrams.$inferSelect;

export type InsertDiagramComponent = z.infer<typeof insertDiagramComponentSchema>;
export type DiagramComponent = typeof diagramComponents.$inferSelect;

// Role validation schema
export const roleSchema = z.enum(['student', 'admin', 'superadmin']);
