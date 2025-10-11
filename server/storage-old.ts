import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  videoModules,
  userVideoProgress,
  timelineEvents,
  exercises,
  exerciseAttempts,
  learningModules,
  userModuleProgress,
  resources,
  type User, 
  type InsertUser,
  type VideoModule,
  type InsertVideoModule,
  type UserVideoProgress,
  type InsertUserVideoProgress,
  type TimelineEvent,
  type InsertTimelineEvent,
  type Exercise,
  type InsertExercise,
  type ExerciseAttempt,
  type InsertExerciseAttempt,
  type LearningModule,
  type InsertLearningModule,
  type UserModuleProgress,
  type InsertUserModuleProgress,
  type Resource,
  type InsertResource
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: string, progress: number): Promise<void>;
  updateUserStudyTime(userId: string, additionalMinutes: number): Promise<void>;

  // Video methods
  getAllVideoModules(): Promise<VideoModule[]>;
  getVideoModule(id: string): Promise<VideoModule | undefined>;
  createVideoModule(video: InsertVideoModule): Promise<VideoModule>;
  getUserVideoProgress(userId: string): Promise<UserVideoProgress[]>;
  updateVideoProgress(progress: InsertUserVideoProgress): Promise<UserVideoProgress>;

  // Timeline methods
  getAllTimelineEvents(): Promise<TimelineEvent[]>;
  getTimelineEvent(id: string): Promise<TimelineEvent | undefined>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;

  // Exercise methods
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getUserExercises(userId: string): Promise<Exercise[]>;
  createExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt>;
  getUserExerciseAttempts(userId: string): Promise<ExerciseAttempt[]>;

  // Learning module methods
  getAllLearningModules(): Promise<LearningModule[]>;
  getUserModuleProgress(userId: string): Promise<UserModuleProgress[]>;
  updateModuleProgress(progress: InsertUserModuleProgress): Promise<UserModuleProgress>;

  // Resource methods
  getAllResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default video modules
    const defaultVideos: InsertVideoModule[] = [
      {
        title: "British Political System",
        description: "Learn about Parliament, the Prime Minister, and democratic processes",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: 754,
        thumbnail: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        category: "Government",
        orderIndex: 1
      },
      {
        title: "British Culture & Traditions",
        description: "Discover customs, festivals, and cultural practices of the UK",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: 525,
        thumbnail: "https://images.unsplash.com/photo-1467987506553-8f3916508521?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        category: "Culture",
        orderIndex: 2
      },
      {
        title: "British History Overview",
        description: "Key historical events and figures that shaped modern Britain",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: 922,
        thumbnail: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        category: "History",
        orderIndex: 3
      },
      {
        title: "UK Geography & Regions",
        description: "Explore England, Scotland, Wales, and Northern Ireland",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: 668,
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        category: "Geography",
        orderIndex: 4
      }
    ];

    defaultVideos.forEach(video => {
      this.createVideoModule(video);
    });

    // Initialize timeline events
    const defaultEvents: InsertTimelineEvent[] = [
      {
        year: 1066,
        title: "Norman Conquest",
        description: "William the Conqueror defeats Harold II at the Battle of Hastings, fundamentally changing English society and culture.",
        details: "The Norman Conquest marked the beginning of Norman rule in England. William I introduced feudalism, built castles, and changed the English language by adding French influences.",
        category: "Medieval",
        importance: 5
      },
      {
        year: 1215,
        title: "Magna Carta",
        description: "King John signs the Great Charter, establishing the principle that nobody, including the king, is above the law.",
        details: "The Magna Carta limited the power of the monarch and established fundamental rights. It became the foundation for constitutional law and influenced legal systems worldwide.",
        category: "Legal",
        importance: 5
      },
      {
        year: 1707,
        title: "Act of Union",
        description: "The Acts of Union unite the Kingdom of England and Kingdom of Scotland to form the Kingdom of Great Britain.",
        details: "The political union created a single parliament and unified the kingdoms while preserving distinct legal and educational systems in Scotland.",
        category: "Political",
        importance: 4
      },
      {
        year: 1952,
        title: "Elizabeth II Becomes Queen",
        description: "Following her father's death, Elizabeth II ascends to the throne, beginning the modern Elizabethan era.",
        details: "Queen Elizabeth II became monarch at age 25 and ruled for over 70 years, overseeing the transformation of the British Empire into the Commonwealth.",
        category: "Royal",
        importance: 3
      }
    ];

    defaultEvents.forEach(event => {
      this.createTimelineEvent(event);
    });

    // Initialize learning modules
    const defaultModules: InsertLearningModule[] = [
      {
        title: "British Values",
        description: "Democracy, rule of law, liberty",
        orderIndex: 1,
        totalItems: 10
      },
      {
        title: "Government & Politics",
        description: "Parliament, elections, devolution",
        orderIndex: 2,
        totalItems: 15
      },
      {
        title: "History",
        description: "Key events and periods",
        orderIndex: 3,
        totalItems: 20
      },
      {
        title: "Geography",
        description: "Countries, regions, cities",
        orderIndex: 4,
        totalItems: 12
      },
      {
        title: "Culture & Society",
        description: "Traditions, sports, religion",
        orderIndex: 5,
        totalItems: 18
      }
    ];

    defaultModules.forEach(module => {
      this.createLearningModule(module);
    });

    // Initialize resources
    const defaultResources: InsertResource[] = [
      {
        title: "Key Dates Cheatsheet",
        description: "Important historical dates and events",
        fileUrl: "/resources/key-dates.pdf",
        fileSize: "2.3 MB",
        fileType: "PDF",
        category: "History"
      },
      {
        title: "Government Structure",
        description: "Overview of UK government and political system",
        fileUrl: "/resources/government-structure.pdf",
        fileSize: "1.8 MB",
        fileType: "PDF",
        category: "Government"
      },
      {
        title: "UK Geography Map",
        description: "Detailed map of the United Kingdom",
        fileUrl: "/resources/uk-geography-map.pdf",
        fileSize: "4.1 MB",
        fileType: "PDF",
        category: "Geography"
      },
      {
        title: "Practice Test Questions",
        description: "Sample questions for Life in UK test preparation",
        fileUrl: "/resources/practice-questions.pdf",
        fileSize: "956 KB",
        fileType: "PDF",
        category: "Practice"
      }
    ];

    defaultResources.forEach(resource => {
      this.createResource(resource);
    });

    // Create demo user
    this.createUser({
      username: "user123",
      firstName: "Sarah",
      password: "demo"
    });

    // Add demo exercises
    const demoExercise = {
      userId: "user123",
      content: {
        topic: "British Government",
        text: "The United Kingdom has a parliamentary system where [BLANK_1] serves as the head of government, while [BLANK_2] serves as the head of state. The parliament consists of two houses: [BLANK_3] and [BLANK_4]. Elections are held every [BLANK_5] years to choose members of parliament.",
        questions: [
          {
            id: "1",
            question: "Who serves as the head of government?",
            options: ["The Queen", "The Prime Minister", "The Speaker", "The Chancellor"],
            correctAnswer: 1,
            explanation: "The Prime Minister is the head of government in the UK parliamentary system."
          },
          {
            id: "2", 
            question: "Who serves as the head of state?",
            options: ["The Prime Minister", "The President", "The Monarch", "The Speaker"],
            correctAnswer: 2,
            explanation: "The Monarch (currently King Charles III) serves as the head of state."
          },
          {
            id: "3",
            question: "What is one house of parliament?",
            options: ["House of Commons", "House of Lords", "Both A and B", "House of Representatives"],
            correctAnswer: 2,
            explanation: "Parliament consists of both the House of Commons and House of Lords."
          },
          {
            id: "4",
            question: "What is the other house of parliament?",
            options: ["House of Commons", "House of Lords", "Both A and B", "Senate"],
            correctAnswer: 2,
            explanation: "Parliament consists of both the House of Commons and House of Lords."
          },
          {
            id: "5",
            question: "How often are elections held?",
            options: ["Every 3 years", "Every 4 years", "Every 5 years", "Every 6 years"],
            correctAnswer: 2,
            explanation: "UK general elections are held every 5 years."
          }
        ]
      },
      topic: "British Government",
      difficulty: 2
    };

    this.createExercise(demoExercise);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProgress(userId: string, progress: number): Promise<void> {
    await db
      .update(users)
      .set({ overallProgress: progress })
      .where(eq(users.id, userId));
  }

  async updateUserStudyTime(userId: string, additionalMinutes: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      await db
        .update(users)
        .set({ totalStudyTime: user.totalStudyTime + additionalMinutes })
        .where(eq(users.id, userId));
    }
  }

  // Video methods
  async getAllVideoModules(): Promise<VideoModule[]> {
    return await db.select().from(videoModules).orderBy(videoModules.orderIndex);
  }

  async getVideoModule(id: string): Promise<VideoModule | undefined> {
    const [video] = await db.select().from(videoModules).where(eq(videoModules.id, id));
    return video || undefined;
  }

  async createVideoModule(video: InsertVideoModule): Promise<VideoModule> {
    const [videoModule] = await db
      .insert(videoModules)
      .values(video)
      .returning();
    return videoModule;
  }

  async getUserVideoProgress(userId: string): Promise<UserVideoProgress[]> {
    return await db.select().from(userVideoProgress).where(eq(userVideoProgress.userId, userId));
  }

  async updateVideoProgress(progress: InsertUserVideoProgress): Promise<UserVideoProgress> {
    const [existingProgress] = await db
      .select()
      .from(userVideoProgress)
      .where(
        and(
          eq(userVideoProgress.userId, progress.userId),
          eq(userVideoProgress.videoId, progress.videoId)
        )
      );

    if (existingProgress) {
      const [updated] = await db
        .update(userVideoProgress)
        .set({
          completed: progress.completed || false,
          watchTime: progress.watchTime || 0,
          lastWatched: new Date()
        })
        .where(eq(userVideoProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userVideoProgress)
        .values({
          ...progress,
          completed: progress.completed || false,
          watchTime: progress.watchTime || 0,
          lastWatched: new Date()
        })
        .returning();
      return newProgress;
    }
  }

  // Timeline methods
  async getAllTimelineEvents(): Promise<TimelineEvent[]> {
    return await db.select().from(timelineEvents).orderBy(timelineEvents.year);
  }

  async getTimelineEvent(id: string): Promise<TimelineEvent | undefined> {
    const [event] = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
    return event || undefined;
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const [timelineEvent] = await db
      .insert(timelineEvents)
      .values(event)
      .returning();
    return timelineEvent;
  }

  // Exercise methods
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const newExercise: Exercise = {
      ...exercise,
      id,
      difficulty: exercise.difficulty || 1,
      createdAt: new Date()
    };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async getUserExercises(userId: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      exercise => exercise.userId === userId
    );
  }

  async createExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt> {
    const id = randomUUID();
    const exerciseAttempt: ExerciseAttempt = {
      ...attempt,
      id,
      completedAt: new Date()
    };
    this.exerciseAttempts.set(id, exerciseAttempt);
    return exerciseAttempt;
  }

  async getUserExerciseAttempts(userId: string): Promise<ExerciseAttempt[]> {
    return Array.from(this.exerciseAttempts.values()).filter(
      attempt => attempt.userId === userId
    );
  }

  // Learning module methods
  async getAllLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getUserModuleProgress(userId: string): Promise<UserModuleProgress[]> {
    return Array.from(this.userModuleProgress.values()).filter(
      progress => progress.userId === userId
    );
  }

  async updateModuleProgress(progress: InsertUserModuleProgress): Promise<UserModuleProgress> {
    const existingProgress = Array.from(this.userModuleProgress.values()).find(
      p => p.userId === progress.userId && p.moduleId === progress.moduleId
    );

    if (existingProgress) {
      existingProgress.completedItems = progress.completedItems || 0;
      existingProgress.progress = progress.progress || 0;
      this.userModuleProgress.set(existingProgress.id, existingProgress);
      return existingProgress;
    } else {
      const id = randomUUID();
      const newProgress: UserModuleProgress = { 
        ...progress, 
        id,
        completedItems: progress.completedItems || 0,
        progress: progress.progress || 0
      };
      this.userModuleProgress.set(id, newProgress);
      return newProgress;
    }
  }

  private async createLearningModule(module: InsertLearningModule): Promise<LearningModule> {
    const id = randomUUID();
    const learningModule: LearningModule = { ...module, id };
    this.learningModules.set(id, learningModule);
    return learningModule;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: string): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = randomUUID();
    const newResource: Resource = { 
      ...resource, 
      id,
      description: resource.description || null
    };
    this.resources.set(id, newResource);
    return newResource;
  }
}

export const storage = new DatabaseStorage();
