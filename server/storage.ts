import { eq, and } from "drizzle-orm";
import { db } from "./db";
import bcrypt from "bcrypt";
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
  practiceTests,
  practiceTestAttempts,
  mockTests,
  mockTestAttempts,
  refreshTokens,
  adminAuditLogs,
  videoResources,
  videoAudio,
  type User, 
  type InsertUser,
  type AdminAuditLog,
  type InsertAdminAuditLog,
  type VideoModule,
  type VideoResource,
  type InsertVideoResource,
  type VideoAudio,
  type InsertVideoAudio,
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
  type InsertResource,
  type PracticeTest,
  type InsertPracticeTest,
  type PracticeTestAttempt,
  type InsertPracticeTestAttempt,
  type MockTest,
  type InsertMockTest,
  type MockTestAttempt,
  type InsertMockTestAttempt,
  type RefreshToken,
  type InsertRefreshToken
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: string, progress: number): Promise<void>;
  updateUserStudyTime(userId: string, additionalMinutes: number): Promise<void>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserSubscription(userId: string, subscriptionType: string, subscriptionStatus: string): Promise<User>;
  updateUserProfile(userId: string, profileData: { firstName?: string; email?: string; username?: string }): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<boolean>;
  updateUserSuspension(userId: string, suspended: boolean, reason?: string): Promise<boolean>;
  deleteUser(userId: string): Promise<boolean>;
  getAllUsers(options?: { page?: number; limit?: number; role?: string }): Promise<User[]>;
  getTotalUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getSubscriptionStats(): Promise<{ premium: number; free: number; total: number }>;
  getRecentSignups(days: number): Promise<number>;
  getUserStats(): Promise<{ totalUsers: number; activeUsers: number; adminUsers: number; }>;

  // Admin audit methods
  createAuditLog(log: { adminId: string; action: string; targetUserId?: string; details?: any; timestamp: Date }): Promise<void>;
  getAuditLogs(options: { page: number; limit: number }): Promise<AdminAuditLog[]>;

  // Authentication methods
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;

  // Video methods
  getAllVideoModules(): Promise<VideoModule[]>;
  getVideoModule(id: string): Promise<VideoModule | undefined>;
  createVideoModule(video: InsertVideoModule): Promise<VideoModule>;
  updateVideoModule(id: string, updates: Partial<InsertVideoModule>): Promise<VideoModule>;
  deleteVideoModule(id: string): Promise<boolean>;
  getUserVideoProgress(userId: string): Promise<UserVideoProgress[]>;
  updateVideoProgress(progress: InsertUserVideoProgress): Promise<UserVideoProgress>;
  
  // Video Resources methods
  getVideoResources(videoId: string): Promise<VideoResource[]>;
  createVideoResource(resource: InsertVideoResource): Promise<VideoResource>;
  updateVideoResource(id: string, updates: Partial<InsertVideoResource>): Promise<VideoResource>;
  deleteVideoResource(id: string): Promise<boolean>;
  
  // Video Audio methods
  getVideoAudio(videoId: string): Promise<VideoAudio[]>;
  createVideoAudio(audio: InsertVideoAudio): Promise<VideoAudio>;
  updateVideoAudio(id: string, updates: Partial<InsertVideoAudio>): Promise<VideoAudio>;
  deleteVideoAudio(id: string): Promise<boolean>;

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
  deleteResource(id: string): Promise<boolean>;

  // Exercise methods
  getAllExercises(): Promise<Exercise[]>;
  deleteExercise(id: string): Promise<boolean>;

  // Practice test methods
  deletePracticeTest(id: string): Promise<boolean>;

  // Timeline methods
  deleteTimelineEvent(id: string): Promise<boolean>;

  // Practice test methods
  getAllPracticeTests(): Promise<PracticeTest[]>;
  getPracticeTest(id: string): Promise<PracticeTest | undefined>;
  createPracticeTest(test: InsertPracticeTest): Promise<PracticeTest>;
  createPracticeTestAttempt(attempt: InsertPracticeTestAttempt): Promise<PracticeTestAttempt>;
  getUserPracticeTestAttempts(userId: string): Promise<PracticeTestAttempt[]>;
  getPracticeTestAttempts(userId: string, testId: string): Promise<PracticeTestAttempt[]>;

  // Mock test methods
  getMockTests(): Promise<MockTest[]>;
  getMockTest(id: string): Promise<MockTest | undefined>;
  createMockTest(test: InsertMockTest): Promise<MockTest>;
  submitMockTest(attempt: InsertMockTestAttempt): Promise<MockTestAttempt>;
  getMockTestAttempts(mockTestId: string, userId: string): Promise<MockTestAttempt[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Initialize admin user first
    await this.initializeAdminUser();
    // Initialize mock tests
    await this.initializeMockTests();
    // Initialize default video modules
    const existingVideos = await db.select().from(videoModules);
    if (existingVideos.length === 0) {
      const defaultVideos: InsertVideoModule[] = [
        // Government Category Videos
        {
          title: "How UK Parliament Works",
          description: "Complete guide to the UK parliamentary system, democracy, and the legislative process for Life in UK test preparation",
          videoUrl: "https://www.youtube.com/embed/BGVgjqbpRp0",
          duration: 450,
          thumbnail: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Government",
          orderIndex: 1,
          detailedContent: "The UK Parliament is the supreme legislative body of the United Kingdom. It consists of two houses: the House of Commons and the House of Lords. The House of Commons is made up of 650 elected Members of Parliament (MPs) who represent constituencies across the UK. The House of Lords contains appointed members including life peers, bishops, and hereditary peers. Parliament's main functions include making laws, debating national issues, and scrutinizing the work of government. The legislative process involves three readings in each house, committee stages, and Royal Assent. Understanding Parliament is crucial for UK citizenship as it represents the democratic foundation of British society.",
          keyImages: JSON.stringify([
            {
              url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
              description: "Houses of Parliament and Big Ben - Symbol of British Democracy"
            },
            {
              url: "https://images.unsplash.com/photo-1555469810-c9d4c0b9e6dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
              description: "House of Commons Chamber - Where MPs debate and vote"
            }
          ]),
          audioScript: "Welcome to understanding how the UK Parliament works. Parliament is the heart of British democracy, consisting of two houses: the House of Commons and the House of Lords. The House of Commons has 650 elected Members of Parliament who represent constituencies across England, Scotland, Wales, and Northern Ireland. These MPs are chosen by the people through democratic elections held at least every five years. The House of Lords contains appointed members including life peers who bring expertise from various fields, bishops from the Church of England, and a small number of hereditary peers. Parliament's primary role is to make laws that govern the United Kingdom. This happens through a careful process where proposed laws, called bills, go through multiple readings and committee stages in both houses before receiving Royal Assent from the monarch."
        },
        {
          title: "UK Electoral System Explained",
          description: "Understanding elections, voting, political parties, and democratic processes in the United Kingdom",
          videoUrl: "https://www.youtube.com/embed/r9rGX91rq5I",
          duration: 380,
          thumbnail: "https://images.unsplash.com/photo-1555469810-c9d4c0b9e6dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Government",
          orderIndex: 2,
          detailedContent: "The UK uses a First Past the Post electoral system for general elections. Citizens aged 18 and over can vote, and elections must be held at least every five years. The country is divided into 650 constituencies, each electing one MP. Political parties include Conservative, Labour, Liberal Democrats, Scottish National Party, and others. The party with the most MPs usually forms the government, with their leader becoming Prime Minister. Voters register with local councils and vote at polling stations or by post. Understanding the electoral system is essential for participating in UK democracy.",
          keyImages: JSON.stringify([
            {
              url: "https://images.unsplash.com/photo-1586616925216-bed07ab60479?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
              description: "Voting ballot box - Democratic participation in action"
            }
          ]),
          audioScript: "The UK electoral system is based on First Past the Post voting. Every citizen aged 18 and over has the right to vote in general elections, which must be held at least every five years. The UK is divided into 650 constituencies, and each elects one Member of Parliament. The main political parties include the Conservative Party, Labour Party, Liberal Democrats, and regional parties like the Scottish National Party. The party that wins the most seats usually forms the government, and their leader becomes Prime Minister."
        },
        {
          title: "British Constitution and Laws",
          description: "Learn about the UK's unwritten constitution, rule of law, and legal system fundamentals",
          videoUrl: "https://www.youtube.com/embed/o8mQLtU7f7s",
          duration: 520,
          thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Government",
          orderIndex: 3
        },
        
        // History Category Videos
        {
          title: "British History Overview",
          description: "Key historical events, figures, and developments that shaped modern Britain for Life in UK test preparation",
          videoUrl: "https://www.youtube.com/embed/Uc1vrO6iL0U",
          duration: 720,
          thumbnail: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "History",
          orderIndex: 4
        },
        {
          title: "Medieval Britain and Norman Conquest",
          description: "The Norman Conquest of 1066, medieval period, and development of English society and institutions",
          videoUrl: "https://www.youtube.com/embed/MD58X5n7npc",
          duration: 615,
          thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "History",
          orderIndex: 5
        },
        {
          title: "Industrial Revolution in Britain",
          description: "The transformation of Britain during the Industrial Revolution and its impact on modern society",
          videoUrl: "https://www.youtube.com/embed/zhL5DCizj5c",
          duration: 480,
          thumbnail: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "History",
          orderIndex: 6
        },
        
        // Geography Category Videos
        {
          title: "Geography of the United Kingdom",
          description: "Physical geography, countries, capitals, and regions of England, Scotland, Wales, and Northern Ireland",
          videoUrl: "https://www.youtube.com/embed/O37yJBFRrfg",
          duration: 420,
          thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Geography",
          orderIndex: 7
        },
        {
          title: "UK Counties and Cities",
          description: "Major cities, counties, and administrative divisions across the four nations of the United Kingdom",
          videoUrl: "https://www.youtube.com/embed/rNu8XDBSn10",
          duration: 360,
          thumbnail: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Geography",
          orderIndex: 8
        },
        
        // Culture Category Videos
        {
          title: "British Culture and Traditions",
          description: "British values, customs, festivals, and multicultural society essential for Life in UK test success",
          videoUrl: "https://www.youtube.com/embed/UM-Q_zpuJGU",
          duration: 540,
          thumbnail: "https://images.unsplash.com/photo-1520637836862-4d197d17c926?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Culture",
          orderIndex: 9
        },
        {
          title: "British Sports and Entertainment",
          description: "Popular sports, entertainment, arts, and cultural activities that define British society",
          videoUrl: "https://www.youtube.com/embed/FWo6_M3bXKo",
          duration: 435,
          thumbnail: "https://images.unsplash.com/photo-1467987506553-8f3916508521?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Culture",
          orderIndex: 10
        },
        {
          title: "British Values and Society",
          description: "Democracy, rule of law, individual liberty, mutual respect, and tolerance in modern British society",
          videoUrl: "https://www.youtube.com/embed/Tr4VHvL6YCA",
          duration: 390,
          thumbnail: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
          category: "Culture",
          orderIndex: 11
        }
      ];

      for (const video of defaultVideos) {
        await this.createVideoModule(video);
      }
    }

    // Initialize timeline events
    const existingEvents = await db.select().from(timelineEvents);
    if (existingEvents.length === 0) {
      await this.initializeTimelineEvents();
    }

    // Initialize learning modules
    const existingModules = await db.select().from(learningModules);
    if (existingModules.length === 0) {
      const defaultModules: InsertLearningModule[] = [
        {
          title: "British Values",
          description: "Democracy, Rule of Law, Individual Liberty, and Mutual Respect",
          totalItems: 8,
          orderIndex: 1
        },
        {
          title: "UK Government",
          description: "Parliament, Prime Minister, and the political system",
          totalItems: 12,
          orderIndex: 2
        },
        {
          title: "British History",
          description: "Key events and figures that shaped modern Britain",
          totalItems: 15,
          orderIndex: 3
        },
        {
          title: "Geography & Culture",
          description: "UK regions, traditions, and cultural practices",
          totalItems: 10,
          orderIndex: 4
        }
      ];

      for (const module of defaultModules) {
        await db.insert(learningModules).values(module);
      }
    }

    // Initialize resources
    const existingResources = await db.select().from(resources);
    if (existingResources.length === 0) {
      const defaultResources: InsertResource[] = [
        {
          title: "Key Dates Cheatsheet",
          description: "Important historical dates for the Life in UK test",
          fileUrl: "/downloads/key-dates.pdf",
          fileSize: "2.4 MB",
          fileType: "PDF",
          category: "Study Guide"
        },
        {
          title: "Government Structure Guide",
          description: "Detailed breakdown of UK government structure",
          fileUrl: "/downloads/government-guide.pdf",
          fileSize: "1.8 MB",
          fileType: "PDF",
          category: "Reference"
        },
        {
          title: "Practice Test Questions",
          description: "100 sample questions similar to the actual test",
          fileUrl: "/downloads/practice-questions.pdf",
          fileSize: "3.2 MB",
          fileType: "PDF",
          category: "Practice"
        }
      ];

      for (const resource of defaultResources) {
        await this.createResource(resource);
      }
    }

    // TODO: Uncomment demo user creation after database schema is updated
    // Create demo user and exercise
    // const existingUsers = await db.select().from(users);
    // if (existingUsers.length === 0) {
    //   const demoUser = await this.createUser({
    //     name: "Sarah Johnson",
    //     username: "user123",
    //     firstName: "Sarah",
    //     password: "demo",
    //     email: "sarah@example.com"
    //   });
    // }

    // Initialize practice tests
    await this.initializePracticeTestsIfNeeded();
    
    // Initialize historical timeline events
    await this.initializeHistoricalTimelineIfNeeded();
    
    // Initialize cultural and social timeline events
    await this.initializePopulationMigrationTimelineIfNeeded();
    await this.initializeSportsAthleticsTimelineIfNeeded();
    await this.initializeLiteratureTimelineIfNeeded();
    await this.initializeBritishHolidaysTimelineIfNeeded();
    await this.initializeBritishSportsTimelineIfNeeded();
  }

  private async initializeAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.role, 'admin'));
    
    if (existingAdmin.length === 0) {
      console.log('No admin user found, creating initial admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Create admin user
      const adminUser = await db.insert(users).values({
        firstName: 'Administrator',
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        overallProgress: 0,
        totalStudyTime: 0,
        currentStreak: 0
      }).returning();
      
      console.log(`Admin user created with email: ${adminEmail}`);
      console.log(`Admin username: ${adminUsername}`);
      console.log(`Admin password: ${adminPassword}`);
      console.log('Please change the password after first login!');
    }
  }

  private async initializePracticeTestsIfNeeded() {
    const { initializePracticeTests } = await import("./services/practice-tests");
    await initializePracticeTests(this);
  }

  private async initializeHistoricalTimelineIfNeeded() {
    const existingHistoricalEvents = await db.select().from(timelineEvents).where(eq(timelineEvents.timelineTopic, 'historical'));
    if (existingHistoricalEvents.length === 0) {
      const historicalEvents: InsertTimelineEvent[] = [
        {
          year: -10000,
          title: "Early Stone Age Settlements",
          description: "First evidence of human settlements in Britain during the Mesolithic period. Hunter-gatherer communities establish permanent settlements.",
          details: "Archaeological evidence shows the first permanent human settlements in Britain during the Mesolithic period. These early communities developed sophisticated hunting and gathering techniques, establishing the foundation for future civilizations. Sites like Star Carr in Yorkshire provide evidence of these early settlements with advanced tool-making and seasonal migration patterns.",
          category: "Prehistoric",
          importance: 4,
          keyFigures: "Mesolithic hunters and gatherers",
          timelineTopic: "historical"
        },
        {
          year: -6000,
          title: "Neolithic Revolution Begins",
          description: "Introduction of farming and permanent settlements. Construction of early monuments begins across Britain.",
          details: "The Neolithic Revolution transforms Britain from a hunter-gatherer society to an agricultural one. This period sees the introduction of farming, domestication of animals, and the beginning of permanent settlements. Early monuments and ceremonial sites begin construction, showing sophisticated social organization and religious beliefs.",
          category: "Prehistoric",
          importance: 4,
          keyFigures: "Neolithic farmers and monument builders",
          timelineTopic: "historical"
        },
        {
          year: -4000,
          title: "Great Monument Building",
          description: "Construction of major Neolithic monuments including early phases of Stonehenge and long barrows across Britain.",
          details: "This period marks the construction of Britain's most famous prehistoric monuments. The early phases of Stonehenge begin, along with numerous long barrows, cursus monuments, and causewayed enclosures. These massive undertakings demonstrate sophisticated social organization, astronomical knowledge, and religious practices that would influence British culture for millennia.",
          category: "Prehistoric",
          importance: 5,
          keyFigures: "Neolithic architects and astronomers",
          timelineTopic: "historical"
        },
        {
          year: -3000,
          title: "Bronze Age Begins",
          description: "Introduction of bronze working and trade networks. Sophisticated burial practices and ceremonial sites develop.",
          details: "The Bronze Age brings revolutionary changes to British society with the introduction of metal working. Trade networks extend across Europe, bringing new technologies and cultural influences. Sophisticated burial practices emerge, including the famous burial mounds and the completion of Stonehenge's iconic stone circle arrangement.",
          category: "Prehistoric",
          importance: 4,
          keyFigures: "Bronze Age metalworkers and traders",
          timelineTopic: "historical"
        },
        {
          year: -55,
          title: "Julius Caesar's First Invasion",
          description: "Julius Caesar launches the first Roman invasion of Britain, encountering fierce resistance from Celtic tribes.",
          details: "Julius Caesar leads the first Roman expedition to Britain, landing in Kent with two legions. Though the invasion is brief and primarily a reconnaissance mission, it marks the first recorded contact between Britain and the Roman Empire. Caesar encounters sophisticated Celtic societies with advanced weaponry, fortified settlements, and complex political structures. The invasion establishes Britain's place in Roman consciousness and sets the stage for future conquest.",
          category: "Roman",
          importance: 4,
          keyFigures: "Julius Caesar, Celtic tribal leaders",
          timelineTopic: "historical"
        },
        {
          year: 43,
          title: "Roman Conquest of Britain",
          description: "Emperor Claudius launches the successful Roman conquest of Britain. Beginning of 400 years of Roman rule.",
          details: "Emperor Claudius orders the invasion of Britain under Aulus Plautius, marking the beginning of nearly four centuries of Roman rule. The conquest transforms Britain dramatically, introducing Roman law, architecture, engineering, and urban planning. Major cities like Londinium (London), Camulodunum (Colchester), and Eboracum (York) are established. The Romans build extensive road networks, aqueducts, and defensive structures including Hadrian's Wall.",
          category: "Roman",
          importance: 5,
          keyFigures: "Emperor Claudius, Aulus Plautius, Caratacus",
          timelineTopic: "historical"
        },
        {
          year: 410,
          title: "End of Roman Rule",
          description: "Romans withdraw from Britain. Beginning of the Anglo-Saxon period and the Dark Ages.",
          details: "The Roman Empire withdraws from Britain as it faces mounting pressures elsewhere. Emperor Honorius tells British cities to arrange their own defenses. This marks the end of nearly 400 years of Roman rule and the beginning of the Anglo-Saxon period. Without Roman protection, Britain becomes vulnerable to invasions from Angles, Saxons, and Jutes from Germanic lands, fundamentally changing the cultural and linguistic landscape.",
          category: "Roman",
          importance: 5,
          keyFigures: "Emperor Honorius, Romano-British leaders",
          timelineTopic: "historical"
        },
        {
          year: 600,
          title: "Anglo-Saxon Kingdoms Established",
          description: "Anglo-Saxon kingdoms dominate Britain. Conversion to Christianity spreads across the land.",
          details: "The Anglo-Saxon kingdoms of Wessex, Mercia, Northumbria, and others become firmly established across England. This period sees the gradual conversion to Christianity, largely through the missions of Augustine of Canterbury and Irish monks. Anglo-Saxon culture, language, and law systems develop, laying the foundation for English identity. The period produces remarkable art, literature (including early English poetry), and the development of Anglo-Saxon English language.",
          category: "Anglo-Saxon",
          importance: 4,
          keyFigures: "St. Augustine, Anglo-Saxon kings",
          timelineTopic: "historical"
        },
        {
          year: 789,
          title: "First Viking Raids",
          description: "Vikings begin raiding British coasts. Start of the Viking Age in Britain with attacks on monasteries and settlements.",
          details: "The first recorded Viking raid occurs at Portland in Dorset, followed by the famous attack on Lindisfarne monastery in 793. These raids mark the beginning of the Viking Age in Britain, bringing centuries of conflict, settlement, and cultural exchange. Vikings establish settlements, trade routes, and eventually kingdoms in parts of Britain, significantly influencing British culture, language, and society.",
          category: "Viking",
          importance: 4,
          keyFigures: "Viking raiders and settlers",
          timelineTopic: "historical"
        },
        {
          year: 1066,
          title: "Norman Conquest",
          description: "William the Conqueror defeats Harold II at the Battle of Hastings. Norman rule transforms English society.",
          details: "The Norman Conquest fundamentally transforms England when William of Normandy defeats King Harold II at the Battle of Hastings. This pivotal event introduces Norman-French culture, language, and feudal system to England. The Normans build castles, cathedrals, and establish a new aristocracy. The conquest affects language, law, architecture, and social structure, creating the foundation of medieval English society that influences Britain to this day.",
          category: "Norman",
          importance: 5,
          keyFigures: "William the Conqueror, King Harold II",
          timelineTopic: "historical"
        },
        {
          year: 1215,
          title: "Magna Carta Signed",
          description: "King John signs the Magna Carta at Runnymede, establishing limits on royal power and foundation of constitutional government.",
          details: "King John signs the Magna Carta at Runnymede under pressure from rebellious barons. This historic document establishes the principle that even the king is subject to the law and limits royal power. It guarantees certain rights and liberties, including due process and protection from illegal imprisonment. The Magna Carta becomes the foundation of constitutional government and influences legal systems worldwide, including the US Constitution.",
          category: "Constitutional",
          importance: 5,
          keyFigures: "King John, rebellious barons, Archbishop Stephen Langton",
          timelineTopic: "historical"
        },
        {
          year: 1284,
          title: "Conquest of Wales",
          description: "Edward I completes the conquest of Wales. The Statute of Rhuddlan establishes English rule over Wales.",
          details: "Edward I completes the conquest of Wales with the defeat of Llywelyn ap Gruffudd, the last native Prince of Wales. The Statute of Rhuddlan introduces English law and administration to Wales, though Welsh customs are partially preserved. Edward builds a ring of massive castles including Caernarfon, Conwy, and Harlech to secure English rule. This marks the beginning of formal English dominion over Wales, though Welsh identity and culture persist.",
          category: "Territorial",
          importance: 4,
          keyFigures: "Edward I, Llywelyn ap Gruffudd",
          timelineTopic: "historical"
        },
        {
          year: 1314,
          title: "Battle of Bannockburn",
          description: "Robert the Bruce defeats Edward II, securing Scottish independence. Scotland remains independent for centuries.",
          details: "Robert the Bruce leads the Scots to a decisive victory over Edward II's English army at Bannockburn, near Stirling. This victory secures Scottish independence and establishes Robert as undisputed King of Scotland. The battle demonstrates superior Scottish military tactics and national determination. Scotland remains independent from England for several more centuries, maintaining its own monarchy, laws, and institutions.",
          category: "Military",
          importance: 4,
          keyFigures: "Robert the Bruce, Edward II",
          timelineTopic: "historical"
        },
        {
          year: 1348,
          title: "Black Death Arrives",
          description: "The Black Death reaches Britain, killing one-third of the population. Profound social and economic changes follow.",
          details: "The Black Death (bubonic plague) reaches Britain through trade routes, devastating the population. An estimated one-third of Britain's population dies, causing profound social, economic, and religious upheaval. The massive population decline leads to labor shortages, rising wages, and social mobility. Traditional feudal structures begin to break down, and survivors question religious and social authorities. This tragedy paradoxically contributes to long-term social progress and economic development.",
          category: "Social",
          importance: 5,
          keyFigures: "Plague victims and survivors across Britain",
          timelineTopic: "historical"
        },
        {
          year: 1415,
          title: "Battle of Agincourt",
          description: "Henry V's victory over French forces during the Hundred Years' War. Demonstrates English military prowess.",
          details: "Henry V leads English forces to a stunning victory over a much larger French army at Agincourt during the Hundred Years' War. The battle showcases the effectiveness of English longbowmen and military tactics. This victory makes Henry V a legendary figure and demonstrates English military capability. The battle is immortalized in Shakespeare's plays and remains a symbol of English courage and determination against overwhelming odds.",
          category: "Military",
          importance: 4,
          keyFigures: "Henry V, English longbowmen",
          timelineTopic: "historical"
        },
        {
          year: 1455,
          title: "Wars of the Roses Begin",
          description: "Civil wars between the Houses of York and Lancaster begin. Three decades of intermittent conflict for the English throne.",
          details: "The Wars of the Roses begin between the Houses of York (white rose) and Lancaster (red rose) for control of the English throne. These civil wars span thirty years with intermittent battles, political intrigue, and changing fortunes. The conflict involves major battles like Towton and Bosworth Field, and produces legendary figures like Richard III and Henry Tudor. The wars ultimately end feudalism and establish the Tudor dynasty.",
          category: "Civil War",
          importance: 4,
          keyFigures: "Richard III, Henry Tudor, various nobles",
          timelineTopic: "historical"
        },
        {
          year: 1485,
          title: "Battle of Bosworth Field",
          description: "Henry Tudor defeats Richard III, ending the Wars of the Roses and founding the Tudor dynasty.",
          details: "Henry Tudor defeats Richard III at the Battle of Bosworth Field, ending the Wars of the Roses and founding the Tudor dynasty. Richard III dies in battle, and Henry becomes Henry VII. The victory unites the Houses of York and Lancaster through Henry's marriage to Elizabeth of York. This marks the end of medieval England and the beginning of the Tudor period, which brings stability, prosperity, and cultural renaissance to England.",
          category: "Dynasty",
          importance: 5,
          keyFigures: "Henry VII, Richard III",
          timelineTopic: "historical"
        },
        {
          year: 1509,
          title: "Henry VIII Becomes King",
          description: "Henry VIII ascends to the throne at age 17. His reign will transform England's relationship with Europe and religion.",
          details: "Henry VIII becomes king at age 17, inheriting a stable and prosperous kingdom from his father Henry VII. Initially a Catholic king who earns the title 'Defender of the Faith' from the Pope, Henry will later break with Rome over his desire to divorce Catherine of Aragon. His reign brings the English Reformation, the dissolution of monasteries, and England's emergence as a major European power with a strong navy.",
          category: "Monarchy",
          importance: 5,
          keyFigures: "Henry VIII",
          timelineTopic: "historical"
        },
        {
          year: 1547,
          title: "Edward VI Becomes King",
          description: "Henry VIII dies; his 9-year-old son Edward VI becomes king. Protestant reforms accelerate under his regency.",
          details: "Edward VI becomes king at age 9 following Henry VIII's death. During his minority, Protestant reforms accelerate under the influence of his regents, particularly Edward Seymour and John Dudley. The Book of Common Prayer is introduced, and Protestant doctrine becomes more firmly established. Though his reign is brief, Edward's Protestant policies significantly advance the English Reformation and shape England's religious future.",
          category: "Religious",
          importance: 3,
          keyFigures: "Edward VI, Edward Seymour, John Dudley",
          timelineTopic: "historical"
        },
        {
          year: 1553,
          title: "Mary I Becomes Queen",
          description: "Mary Tudor becomes queen and attempts to restore Catholicism. Beginning of the Marian persecution of Protestants.",
          details: "Mary I, daughter of Henry VIII and Catherine of Aragon, becomes queen and attempts to restore Catholicism to England. Her reign sees the persecution of Protestants, earning her the nickname 'Bloody Mary.' Nearly 300 Protestants are burned at the stake, including prominent religious leaders like Thomas Cranmer. Despite her efforts, Mary fails to permanently restore Catholicism, and her persecution creates Protestant martyrs who strengthen the Protestant cause.",
          category: "Religious",
          importance: 3,
          keyFigures: "Mary I, Thomas Cranmer, Protestant martyrs",
          timelineTopic: "historical"
        },
        {
          year: 1558,
          title: "Elizabeth I Becomes Queen",
          description: "Elizabeth I ascends to the throne, beginning the Elizabethan Age. Golden age of English culture and maritime power.",
          details: "Elizabeth I becomes queen at age 25, beginning one of England's most celebrated reigns. The Elizabethan Age sees a flowering of English culture with Shakespeare, Marlowe, and other literary giants. England becomes a major maritime power, defeating the Spanish Armada in 1588. Elizabeth establishes religious compromise, promotes trade and exploration, and creates the foundation for England's later emergence as a global power.",
          category: "Golden Age",
          importance: 5,
          keyFigures: "Elizabeth I, William Shakespeare, Francis Drake",
          timelineTopic: "historical"
        },
        {
          year: 1588,
          title: "Defeat of the Spanish Armada",
          description: "English navy defeats the Spanish Armada, establishing England as a major naval power and securing Protestant rule.",
          details: "The English navy, aided by storms, defeats the Spanish Armada sent by Philip II to invade England and restore Catholicism. This victory establishes England as a major European naval power and secures Elizabeth I's Protestant rule. The defeat ends Spanish dominance of the seas and opens the way for English colonial expansion. The victory is celebrated as divine providence protecting Protestant England and marks England's emergence as a maritime superpower.",
          category: "Naval",
          importance: 5,
          keyFigures: "Elizabeth I, Francis Drake, Charles Howard",
          timelineTopic: "historical"
        },
        {
          year: 1603,
          title: "Union of Crowns",
          description: "James VI of Scotland becomes James I of England, uniting the Scottish and English crowns under one monarch.",
          details: "James VI of Scotland becomes James I of England following Elizabeth I's death, creating the Union of Crowns. This personal union unites Scotland and England under one monarch for the first time, though they remain separate kingdoms with separate parliaments and laws. James brings ideas about divine right of kings and works toward closer union between the kingdoms. This begins the Stuart dynasty in England and sets the stage for eventual political union.",
          category: "Union",
          importance: 4,
          keyFigures: "James VI/I",
          timelineTopic: "historical"
        },
        {
          year: 1625,
          title: "Charles I Becomes King",
          description: "Charles I ascends to the throne. His belief in divine right and conflicts with Parliament lead toward civil war.",
          details: "Charles I becomes king with strong beliefs in divine right of kings and absolute monarchy. His conflicts with Parliament over taxation, religion, and royal prerogatives create constitutional crises. Charles attempts to rule without Parliament, imposes ship money, and promotes High Church Anglicanism that many consider too close to Catholicism. These actions create the conditions that lead to civil war and eventually his own execution.",
          category: "Constitutional Crisis",
          importance: 4,
          keyFigures: "Charles I, Parliamentary leaders",
          timelineTopic: "historical"
        },
        {
          year: 1640,
          title: "Long Parliament Begins",
          description: "Charles I recalls Parliament after 11 years of personal rule. Beginning of constitutional conflict that leads to civil war.",
          details: "After 11 years of ruling without Parliament, Charles I is forced to recall Parliament due to financial pressures from war with Scotland. The Long Parliament immediately begins attacking royal policies, impeaching the king's ministers, and demanding constitutional reforms. Parliament refuses to be dissolved and passes acts limiting royal power. This marks the point of no return in the constitutional conflict between king and Parliament.",
          category: "Parliamentary",
          importance: 4,
          keyFigures: "Charles I, John Pym, parliamentary leaders",
          timelineTopic: "historical"
        },
        {
          year: 1642,
          title: "English Civil War Begins",
          description: "Civil war breaks out between King Charles I and Parliament. Beginning of revolutionary period in British history.",
          details: "The English Civil War begins when Charles I raises his standard at Nottingham, marking the start of armed conflict between Royalists (Cavaliers) and Parliamentarians (Roundheads). The war divides families and communities across England. Parliament's forces, eventually led by Oliver Cromwell's New Model Army, prove superior. The conflict fundamentally questions the nature of government, royal authority, and religious settlement in England.",
          category: "Civil War",
          importance: 5,
          keyFigures: "Charles I, Oliver Cromwell, parliamentary generals",
          timelineTopic: "historical"
        },
        {
          year: 1646,
          title: "First Civil War Ends",
          description: "Charles I surrenders to Scottish forces. Parliament gains control but struggles to reach settlement with the king.",
          details: "The First Civil War ends with Charles I's surrender to Scottish forces, who later hand him over to Parliament. Parliament has won militarily but struggles to reach a political settlement. Charles refuses to accept limitations on royal power and continues to negotiate from captivity. His intransigence and secret negotiations with foreign powers convince many that he cannot be trusted, leading toward more radical solutions.",
          category: "Civil War",
          importance: 4,
          keyFigures: "Charles I, Oliver Cromwell, Scottish Covenanters",
          timelineTopic: "historical"
        },
        {
          year: 1658,
          title: "Death of Oliver Cromwell",
          description: "Oliver Cromwell dies. His son Richard proves unable to maintain the Protectorate, leading toward restoration.",
          details: "Oliver Cromwell, Lord Protector of England, dies after nearly a decade of republican rule. His son Richard Cromwell becomes Lord Protector but lacks his father's authority and political skill. The Protectorate begins to collapse as military leaders, Parliament, and the public grow weary of republican government. General George Monck begins negotiations for the restoration of monarchy, recognizing that only a king can provide the stability England needs.",
          category: "Republican",
          importance: 4,
          keyFigures: "Oliver Cromwell, Richard Cromwell, George Monck",
          timelineTopic: "historical"
        },
        {
          year: 1660,
          title: "Restoration of Monarchy",
          description: "Charles II restored to the throne. End of the Commonwealth and return to constitutional monarchy.",
          details: "Charles II is restored to the throne, ending the Commonwealth period and returning England to monarchy. The Restoration brings relief after years of republican government, but also establishes important precedents about parliamentary power. Charles II rules as a constitutional monarch, acknowledging Parliament's crucial role. The period sees cultural flowering, scientific advancement through the Royal Society, and the beginning of party politics with Whigs and Tories.",
          category: "Restoration",
          importance: 5,
          keyFigures: "Charles II, George Monck",
          timelineTopic: "historical"
        },
        {
          year: 1665,
          title: "Great Plague of London",
          description: "Bubonic plague devastates London, killing about 100,000 people. Major public health crisis of the 17th century.",
          details: "The Great Plague of London kills approximately 100,000 people, about a quarter of London's population. The plague spreads rapidly through overcrowded areas, causing panic and social disruption. Many wealthy citizens flee to the countryside, while the poor bear the brunt of the disease. The crisis leads to improved understanding of disease transmission and public health measures. The plague ends mysteriously in 1666, possibly due to the Great Fire of London destroying infected areas.",
          category: "Health Crisis",
          importance: 3,
          keyFigures: "London plague victims, medical practitioners",
          timelineTopic: "historical"
        },
        {
          year: 1679,
          title: "Habeas Corpus Act",
          description: "Parliament passes the Habeas Corpus Act, protecting citizens from arbitrary imprisonment and strengthening civil liberties.",
          details: "Parliament passes the Habeas Corpus Act, one of the most important civil liberties laws in British history. The act requires that anyone detained must be brought before a court and prevents arbitrary imprisonment. It strengthens the principle established in the Magna Carta that no one can be imprisoned without due process. This law becomes a cornerstone of English liberty and influences legal systems throughout the English-speaking world.",
          category: "Civil Rights",
          importance: 4,
          keyFigures: "Parliamentary leaders, legal reformers",
          timelineTopic: "historical"
        },
        {
          year: 1685,
          title: "James II Becomes King",
          description: "James II, a Catholic, becomes king. His attempts to restore Catholicism create constitutional crisis.",
          details: "James II becomes king as England's first openly Catholic monarch since Mary I. His attempts to restore Catholic influence through the Declaration of Indulgence, appointment of Catholics to key positions, and maintenance of a standing army create widespread Protestant opposition. James's actions violate established laws and customs, leading to fears of Catholic tyranny. His policies unite Whigs and Tories in opposition and set the stage for revolution.",
          category: "Religious Crisis",
          importance: 4,
          keyFigures: "James II, Protestant opponents",
          timelineTopic: "historical"
        },
        {
          year: 1688,
          title: "Glorious Revolution",
          description: "William of Orange invited to take the throne. James II flees, establishing constitutional monarchy and parliamentary supremacy.",
          details: "Protestant nobles invite William of Orange to take the throne, leading to James II's flight and the Glorious Revolution. This bloodless revolution establishes the principle of parliamentary supremacy and constitutional monarchy. William and Mary accept the throne under conditions that limit royal power and guarantee Protestant succession. The revolution creates the foundation of modern British democracy and constitutional government.",
          category: "Constitutional Revolution",
          importance: 5,
          keyFigures: "William III, Mary II, James II",
          timelineTopic: "historical"
        },
        {
          year: 1689,
          title: "Bill of Rights",
          description: "Parliament passes the Bill of Rights, establishing limits on royal power and guaranteeing parliamentary rights.",
          details: "Parliament passes the Bill of Rights, which establishes fundamental principles of constitutional monarchy. The bill limits royal power, guarantees parliamentary rights, ensures regular parliaments, and prohibits Catholic succession. It establishes freedom of speech in Parliament, the right to petition the crown, and prohibits cruel and unusual punishment. This document becomes a model for constitutional governments worldwide and forms part of Britain's unwritten constitution.",
          category: "Constitutional",
          importance: 5,
          keyFigures: "William III, Mary II, Parliamentary leaders",
          timelineTopic: "historical"
        },
        {
          year: 1695,
          title: "End of Press Censorship",
          description: "The Licensing Act expires, ending pre-publication censorship and establishing freedom of the press.",
          details: "The Licensing Act expires and Parliament chooses not to renew it, effectively ending pre-publication censorship in England. This marks the beginning of press freedom and allows newspapers, pamphlets, and books to be published without government approval. The end of censorship promotes political debate, scientific discussion, and cultural development. England becomes one of the first countries with a relatively free press, contributing to the development of public opinion and democratic discourse.",
          category: "Press Freedom",
          importance: 4,
          keyFigures: "Publishers, writers, parliamentarians",
          timelineTopic: "historical"
        },
        {
          year: 1702,
          title: "Anne Becomes Queen",
          description: "Anne becomes the last Stuart monarch. Her reign sees the Act of Union with Scotland and major military victories.",
          details: "Anne becomes queen as the last Stuart monarch, inheriting the throne from William III. Her reign sees major achievements including the Act of Union with Scotland in 1707, creating the Kingdom of Great Britain. Under the Duke of Marlborough's military leadership, Britain wins major victories in the War of Spanish Succession. Anne's reign establishes Britain as a major European power and creates the political and military foundation for future expansion.",
          category: "Monarchy",
          importance: 4,
          keyFigures: "Queen Anne, Duke of Marlborough",
          timelineTopic: "historical"
        },
        {
          year: 1707,
          title: "Act of Union with Scotland",
          description: "England and Scotland unite to form the Kingdom of Great Britain. End of separate Scottish Parliament.",
          details: "The Act of Union unites England and Scotland into the Kingdom of Great Britain, creating a single Parliament at Westminster. Scotland retains its legal system, church, and educational system but loses its separate parliament. The union creates economic benefits for Scotland through access to English markets and colonies, while England gains security and stability. This political union, combined with the earlier Union of Crowns, creates the foundation of modern Britain.",
          category: "Political Union",
          importance: 5,
          keyFigures: "Queen Anne, Scottish and English negotiators",
          timelineTopic: "historical"
        },
        {
          year: 1714,
          title: "Hanoverian Succession",
          description: "George I becomes king, beginning the Hanoverian dynasty. Protestant succession secured.",
          details: "George I of Hanover becomes king following Anne's death, securing the Protestant succession as established by the Act of Settlement. As a German prince with limited English, George relies heavily on ministers, inadvertently strengthening parliamentary government and the role of the Prime Minister. The Hanoverian succession ensures Protestant rule and creates closer ties with continental Europe, while also leading to Jacobite attempts to restore the Stuart line.",
          category: "Dynasty",
          importance: 4,
          keyFigures: "George I, Hanoverian courtiers",
          timelineTopic: "historical"
        },
        {
          year: 1721,
          title: "Robert Walpole Becomes First Prime Minister",
          description: "Robert Walpole becomes Britain's first Prime Minister, establishing the office and cabinet government.",
          details: "Robert Walpole becomes Britain's first Prime Minister, though the title isn't officially used until later. His long tenure (1721-1742) establishes the office and cabinet government system. Walpole demonstrates that effective government requires parliamentary support and creates precedents for ministerial responsibility. His policies promote trade, avoid foreign wars, and encourage economic growth, laying the foundation for Britain's later prosperity and power.",
          category: "Constitutional Development",
          importance: 4,
          keyFigures: "Robert Walpole",
          timelineTopic: "historical"
        },
        {
          year: 1746,
          title: "Battle of Culloden",
          description: "Government forces defeat Jacobite army at Culloden, ending the Jacobite rising and Highland clan system.",
          details: "The Battle of Culloden ends the Jacobite rising of 1745 and effectively ends the clan system in the Scottish Highlands. The Duke of Cumberland's government forces decisively defeat Charles Edward Stuart's Jacobite army, ending hopes of Stuart restoration. The aftermath sees harsh suppression of Highland culture, including bans on Highland dress and weapons. This victory secures the Hanoverian succession and begins the transformation of the Highlands into part of modern Britain.",
          category: "Military",
          importance: 4,
          keyFigures: "Duke of Cumberland, Charles Edward Stuart (Bonnie Prince Charlie)",
          timelineTopic: "historical"
        },
        {
          year: 1760,
          title: "George III Becomes King",
          description: "George III ascends to the throne at age 22, beginning a 60-year reign that spans the Industrial Revolution and American independence.",
          details: "George III becomes king, determined to restore royal authority and be more involved in government than his predecessors. His reign sees major challenges including the American Revolution, Napoleonic Wars, and the beginning of the Industrial Revolution. Despite periods of mental illness, George III's long reign witnesses Britain's transformation into a global industrial and naval power, though it also sees the loss of the American colonies.",
          category: "Monarchy",
          importance: 4,
          keyFigures: "George III, Lord Bute, various Prime Ministers",
          timelineTopic: "historical"
        },
        {
          year: 1766,
          title: "Declaratory Act",
          description: "Parliament passes the Declaratory Act asserting its right to tax American colonies, escalating tensions that lead to revolution.",
          details: "Following the repeal of the Stamp Act, Parliament passes the Declaratory Act asserting its absolute authority to make laws binding the American colonies 'in all cases whatsoever.' This act demonstrates Parliament's unwillingness to accept limitations on its authority over the colonies. The act escalates constitutional tensions between Britain and America, contributing to the chain of events that leads to the American Revolution and the loss of Britain's most valuable colonies.",
          category: "Colonial",
          importance: 3,
          keyFigures: "King George III, Parliamentary leaders, American colonial representatives",
          timelineTopic: "historical"
        },
        {
          year: 1801,
          title: "Act of Union with Ireland",
          description: "Ireland formally joins Great Britain to create the United Kingdom of Great Britain and Ireland.",
          details: "The Act of Union merges the Kingdom of Ireland with Great Britain, creating the United Kingdom of Great Britain and Ireland. The Irish Parliament is dissolved, and Ireland sends representatives to Westminster. This union follows the 1798 Irish Rebellion and is designed to strengthen British control over Ireland. The union creates the political framework that lasts until Irish independence in 1922, though it generates ongoing tensions about Irish representation and autonomy.",
          category: "Political Union",
          importance: 5,
          keyFigures: "William Pitt the Younger, Irish parliamentary leaders",
          timelineTopic: "historical"
        },
        {
          year: 1805,
          title: "Battle of Trafalgar",
          description: "Admiral Nelson's decisive naval victory establishes British naval supremacy for over a century.",
          details: "Admiral Horatio Nelson leads the British fleet to a crushing victory over the combined French and Spanish fleets at Trafalgar. Though Nelson dies in the battle, the victory establishes British naval supremacy that lasts over a century. Trafalgar ends Napoleon's invasion plans and secures Britain's control of the seas, enabling the expansion of trade and empire. The victory becomes a defining moment of British national identity and naval tradition.",
          category: "Naval",
          importance: 5,
          keyFigures: "Admiral Horatio Nelson, Napoleon Bonaparte",
          timelineTopic: "historical"
        },
        {
          year: 1815,
          title: "Battle of Waterloo",
          description: "Wellington and Blücher defeat Napoleon, ending the Napoleonic Wars and establishing Britain as Europe's dominant power.",
          details: "The Duke of Wellington, with Prussian support under Blücher, defeats Napoleon at Waterloo, ending the Napoleonic Wars and Napoleon's Hundred Days return. This victory establishes Britain as Europe's dominant power and begins the 'Pax Britannica' period. The Congress of Vienna reshapes Europe, with Britain playing a leading role. Waterloo becomes legendary in British culture and marks the beginning of Britain's century of global dominance.",
          category: "Military",
          importance: 5,
          keyFigures: "Duke of Wellington, Napoleon Bonaparte, Field Marshal Blücher",
          timelineTopic: "historical"
        },
        {
          year: 1750,
          title: "18th Century Enlightenment Peak",
          description: "The Scottish Enlightenment reaches its peak with major contributions to philosophy, economics, and science.",
          details: "The 18th century Enlightenment flourishes in Britain, particularly in Scotland with figures like David Hume, Adam Smith, and Robert Burns. This intellectual movement emphasizes reason, scientific method, and individual rights. British Enlightenment thinkers make fundamental contributions to philosophy, economics, political theory, and natural science. The movement influences the American Revolution, British political reform, and global intellectual development, establishing Britain as a center of learning and rational inquiry.",
          category: "Intellectual",
          importance: 4,
          keyFigures: "David Hume, Adam Smith, Robert Burns, Samuel Johnson",
          timelineTopic: "historical"
        },
        {
          year: 1820,
          title: "George IV Becomes King",
          description: "George IV becomes king amid personal scandals and growing demands for political reform.",
          details: "George IV becomes king after serving as Prince Regent during his father's illness. His reign is marked by personal scandals, extravagant lifestyle, and growing political tensions. The period sees increasing demands for parliamentary reform, Catholic emancipation, and social change. Despite the king's personal failings, the 1820s witness cultural flowering in the Romantic movement and continued industrial expansion that transforms British society.",
          category: "Monarchy",
          importance: 3,
          keyFigures: "George IV, Lord Liverpool, reform advocates",
          timelineTopic: "historical"
        },
        {
          year: 1830,
          title: "George IV Dies, William IV Becomes King",
          description: "William IV becomes king as political reform movement intensifies, leading toward the Great Reform Act.",
          details: "William IV becomes king as Britain faces growing demands for political reform. Unlike his brother George IV, William supports moderate reform and helps navigate the political crisis surrounding the Great Reform Act. His reign sees the beginning of fundamental changes to the British political system, including the expansion of voting rights and the reform of Parliament. The 1830s mark the beginning of the Victorian era's political and social transformations.",
          category: "Political Reform",
          importance: 4,
          keyFigures: "William IV, Earl Grey, reform movement leaders",
          timelineTopic: "historical"
        },
        {
          year: 1832,
          title: "Great Reform Act",
          description: "The Reform Act expands voting rights and redistributes parliamentary seats, beginning democratic reform.",
          details: "The Great Reform Act fundamentally changes the British electoral system by expanding voting rights to middle-class men and redistributing parliamentary seats from rotten boroughs to industrial cities. Though it only increases the electorate by about 50%, the act establishes the principle of parliamentary reform and democratic representation. This first Reform Act begins a series of democratic reforms that gradually transform Britain into a modern democracy over the following century.",
          category: "Democratic Reform",
          importance: 5,
          keyFigures: "Earl Grey, William IV, reform campaigners",
          timelineTopic: "historical"
        },
        {
          year: 1833,
          title: "Slavery Abolition Act",
          description: "Britain abolishes slavery throughout its empire, compensating owners but not enslaved people.",
          details: "The Slavery Abolition Act ends slavery throughout the British Empire, affecting over 800,000 enslaved people. The act provides £20 million compensation to slave owners but nothing to formerly enslaved people. This legislation makes Britain a leader in the global abolition movement and transforms colonial economies. The act demonstrates the growing influence of humanitarian movements and moral reform campaigns in British politics, though the compensation system reveals ongoing inequalities.",
          category: "Social Reform",
          importance: 5,
          keyFigures: "William Wilberforce, Thomas Clarkson, abolition campaigners",
          timelineTopic: "historical"
        },
        {
          year: 1837,
          title: "Victoria Becomes Queen",
          description: "18-year-old Victoria becomes queen, beginning the longest reign in British history and the Victorian era.",
          details: "Victoria becomes queen at age 18, beginning a 63-year reign that defines an era. The Victorian period sees unprecedented industrial growth, imperial expansion, and social change. Victoria's reign witnesses the railway revolution, telegraph communications, and massive urban growth. Her marriage to Prince Albert brings German influences and emphasis on moral respectability. The Victorian era establishes Britain as the world's dominant industrial and imperial power.",
          category: "Monarchy",
          importance: 5,
          keyFigures: "Queen Victoria, Prince Albert",
          timelineTopic: "historical"
        },
        {
          year: 1853,
          title: "Crimean War Begins",
          description: "Britain joins France and Ottoman Empire against Russia in the Crimean War, exposing military weaknesses.",
          details: "Britain enters the Crimean War alongside France and the Ottoman Empire against Russia. The war exposes serious deficiencies in British military organization, medical care, and logistics. Florence Nightingale's nursing work revolutionizes military medicine and establishes modern nursing. Though Britain and its allies ultimately win, the war's mismanagement leads to military reforms and changes in public attitudes toward war and government competence.",
          category: "Military",
          importance: 4,
          keyFigures: "Lord Aberdeen, Florence Nightingale, Lord Cardigan",
          timelineTopic: "historical"
        },
        {
          year: 1867,
          title: "Second Reform Act",
          description: "Disraeli's Reform Act further expands voting rights, nearly doubling the electorate.",
          details: "The Second Reform Act, passed by Disraeli's Conservative government, extends voting rights to working-class men in urban areas, nearly doubling the electorate. This unexpected Conservative initiative outflanks the Liberals and demonstrates growing acceptance of democratic principles. The act represents a major step toward universal male suffrage and forces political parties to adapt to a broader, more diverse electorate, fundamentally changing British political campaigns and representation.",
          category: "Democratic Reform",
          importance: 4,
          keyFigures: "Benjamin Disraeli, William Gladstone, reform advocates",
          timelineTopic: "historical"
        },
        {
          year: 1889,
          title: "London Dock Strike",
          description: "Successful dock workers' strike marks the rise of new unionism and organized labor power.",
          details: "The London Dock Strike sees 100,000 dock workers successfully strike for better pay and conditions, supported by public sympathy and international donations. The strike marks the emergence of 'new unionism' that organizes unskilled workers, not just skilled craftsmen. This victory demonstrates the growing power of organized labor and leads to rapid union growth. The strike influences labor relations and contributes to the formation of the Labour Party as workers seek political representation.",
          category: "Labor Movement",
          importance: 4,
          keyFigures: "Ben Tillett, John Burns, dock workers' leaders",
          timelineTopic: "historical"
        },
        {
          year: 1899,
          title: "Second Boer War Begins",
          description: "Britain fights the Boer War in South Africa, exposing military weaknesses and imperial tensions.",
          details: "The Second Boer War begins in South Africa between Britain and the Boer republics. The conflict lasts three years and costs Britain heavily in men, money, and international reputation. The war exposes British military weaknesses and leads to important army reforms. The use of concentration camps damages Britain's international image. Though Britain ultimately wins, the war demonstrates the costs of empire and contributes to growing questions about imperial policy.",
          category: "Imperial",
          importance: 4,
          keyFigures: "Lord Kitchener, General Roberts, Boer leaders",
          timelineTopic: "historical"
        },
        {
          year: 1901,
          title: "Victoria Dies, Edward VII Becomes King",
          description: "Queen Victoria's death ends the Victorian era. Edward VII begins the Edwardian period of social and political change.",
          details: "Queen Victoria dies after 63 years on the throne, ending the Victorian era. Her son Edward VII becomes king, beginning the Edwardian period characterized by social change, political reform, and international tensions. Edward's reign sees the rise of the Labour Party, women's suffrage campaigns, and constitutional crises. The period combines Belle Époque elegance with growing social tensions that ultimately lead to World War I.",
          category: "Monarchy",
          importance: 4,
          keyFigures: "Edward VII, Queen Alexandra",
          timelineTopic: "historical"
        },
        {
          year: 1910,
          title: "George V Becomes King",
          description: "George V becomes king during constitutional crisis over House of Lords powers and Irish Home Rule.",
          details: "George V becomes king amid constitutional crisis over the House of Lords' power to veto legislation. His reign begins with the Parliament Act 1911 limiting Lords' powers and continues through World War I, Irish independence, and the General Strike. George V's steady leadership during wartime and social upheaval helps maintain royal popularity. His reign witnesses fundamental changes in British society, politics, and the empire's transformation into the Commonwealth.",
          category: "Constitutional Crisis",
          importance: 4,
          keyFigures: "George V, Lloyd George, Asquith",
          timelineTopic: "historical"
        },
        {
          year: 1914,
          title: "World War I Begins",
          description: "Britain declares war on Germany, beginning four years of total war that transforms British society.",
          details: "Britain declares war on Germany following the German invasion of Belgium, beginning World War I. The war initially expected to last months extends to four years, transforming British society completely. The conflict sees unprecedented casualties, total war mobilization, and social changes including women entering the workforce en masse. The war costs Britain enormously in human and financial terms but ultimately establishes Britain as a major victor, though weakened by the effort.",
          category: "World War",
          importance: 5,
          keyFigures: "George V, H.H. Asquith, Lloyd George, military commanders",
          timelineTopic: "historical"
        },
        {
          year: 1918,
          title: "World War I Ends",
          description: "Armistice ends World War I. Britain emerges victorious but economically weakened with massive social changes.",
          details: "The Armistice ends World War I with Britain among the victors, but the country is fundamentally changed. Over 700,000 British soldiers have died, and the economy is strained by war debt. Women gain the vote, class structures shift, and the empire faces new challenges. The war's end brings relief but also economic difficulties, social tensions, and international responsibilities that shape Britain's interwar period and eventual decline as a global power.",
          category: "World War",
          importance: 5,
          keyFigures: "Lloyd George, military leaders, war veterans",
          timelineTopic: "historical"
        },
        {
          year: 1922,
          title: "Irish Independence",
          description: "The Anglo-Irish Treaty creates the Irish Free State, partitioning Ireland and beginning the modern UK.",
          details: "The Anglo-Irish Treaty establishes the Irish Free State, ending the War of Independence but partitioning Ireland. Northern Ireland remains part of the UK while the South becomes a self-governing dominion. The treaty creates the modern United Kingdom of Great Britain and Northern Ireland. This partition generates ongoing tensions and violence, particularly in Northern Ireland, while the Irish Free State eventually becomes the fully independent Republic of Ireland.",
          category: "Constitutional Change",
          importance: 5,
          keyFigures: "Lloyd George, Michael Collins, partition negotiators",
          timelineTopic: "historical"
        },
        {
          year: 1928,
          title: "Universal Suffrage Achieved",
          description: "The Equal Franchise Act grants voting rights to all women over 21, achieving universal adult suffrage.",
          details: "The Equal Franchise Act extends voting rights to all women over 21, matching men's voting age and achieving universal adult suffrage. This culminates decades of suffragette campaigns and women's contributions during World War I. The act adds over 5 million women to the electorate, fundamentally changing British politics. Universal suffrage represents the completion of democratic reform that began with the 1832 Great Reform Act, establishing Britain as a full democracy.",
          category: "Democratic Achievement",
          importance: 5,
          keyFigures: "Stanley Baldwin, women's suffrage campaigners",
          timelineTopic: "historical"
        },
        {
          year: 1936,
          title: "Edward VIII Abdication Crisis",
          description: "Edward VIII abdicates to marry Wallis Simpson, creating constitutional crisis and bringing George VI to throne.",
          details: "Edward VIII abdicates after less than a year as king to marry American divorcée Wallis Simpson, creating a constitutional crisis. His brother George VI becomes king reluctantly, with his wife Elizabeth (later Queen Mother) and daughters Elizabeth and Margaret. The abdication demonstrates the constitutional monarchy's strength and the importance of duty over personal desires. George VI's subsequent leadership during World War II restores royal prestige.",
          category: "Constitutional Crisis",
          importance: 4,
          keyFigures: "Edward VIII, George VI, Wallis Simpson, Stanley Baldwin",
          timelineTopic: "historical"
        },
        {
          year: 1939,
          title: "World War II Begins",
          description: "Britain declares war on Germany following the invasion of Poland, beginning six years of total war.",
          details: "Britain declares war on Germany after Hitler's invasion of Poland, beginning World War II. Initially fighting alone after France falls, Britain faces the threat of invasion during the Battle of Britain. The war sees unprecedented bombing of British cities, total mobilization of society, and eventual victory as part of the Allied coalition. The war effort transforms British society, accelerates decolonization, and ultimately establishes the welfare state.",
          category: "World War",
          importance: 5,
          keyFigures: "Neville Chamberlain, Winston Churchill, George VI",
          timelineTopic: "historical"
        },
        {
          year: 1940,
          title: "Churchill Becomes Prime Minister",
          description: "Winston Churchill becomes Prime Minister during Britain's darkest hour, providing inspirational wartime leadership.",
          details: "Winston Churchill becomes Prime Minister as Nazi Germany conquers Western Europe, leaving Britain standing alone. His inspirational speeches, including 'We shall never surrender' and 'Their finest hour,' rally British morale during the darkest period of World War II. Churchill's leadership during the Battle of Britain, the Blitz, and the long struggle to ultimate victory makes him Britain's greatest wartime leader and one of history's most significant figures.",
          category: "Wartime Leadership",
          importance: 5,
          keyFigures: "Winston Churchill, Clement Attlee, wartime coalition government",
          timelineTopic: "historical"
        },
        {
          year: 1940,
          title: "Battle of Britain",
          description: "RAF defeats the Luftwaffe in the Battle of Britain, preventing German invasion and saving Britain.",
          details: "The Royal Air Force defeats the German Luftwaffe in the Battle of Britain, preventing Operation Sea Lion, Hitler's planned invasion of Britain. Churchill's tribute 'Never was so much owed by so many to so few' honors the RAF pilots who saved Britain's independence. The victory marks the first major German defeat and proves that Nazi Germany can be beaten. The battle becomes legendary in British history and demonstrates the decisive importance of air power in modern warfare.",
          category: "Military Victory",
          importance: 5,
          keyFigures: "RAF pilots, Lord Beaverbrook, Hugh Dowding",
          timelineTopic: "historical"
        },
        {
          year: 1944,
          title: "D-Day Normandy Landings",
          description: "Allied forces land in Normandy, beginning the liberation of Western Europe from Nazi occupation.",
          details: "Operation Overlord sees Allied forces, with significant British participation, land in Normandy on D-Day, beginning the liberation of Western Europe. The largest seaborne invasion in history demonstrates Allied military coordination and marks the beginning of the end for Nazi Germany. British forces play crucial roles in the landings and subsequent campaigns. D-Day represents the culmination of years of British resistance and preparation for the final assault on Nazi-occupied Europe.",
          category: "Military Operation",
          importance: 5,
          keyFigures: "Montgomery, Eisenhower, Churchill, Allied commanders",
          timelineTopic: "historical"
        },
        {
          year: 1944,
          title: "Education Act (Butler Act)",
          description: "The Education Act establishes free secondary education for all children, transforming British education.",
          details: "The Education Act, known as the Butler Act, establishes the principle of free secondary education for all children in England and Wales. The act creates a tripartite system of grammar schools, technical schools, and secondary modern schools, with selection at age 11. This major social reform provides educational opportunities regardless of family income and contributes to post-war social mobility. The act represents wartime planning for a better post-war society.",
          category: "Social Reform",
          importance: 4,
          keyFigures: "R.A. Butler, wartime coalition government",
          timelineTopic: "historical"
        },
        {
          year: 1945,
          title: "Labour Landslide Victory",
          description: "Clement Attlee's Labour Party wins landslide victory, beginning the creation of the welfare state.",
          details: "Labour wins a landslide victory under Clement Attlee, defeating Winston Churchill's Conservatives despite Churchill's wartime heroism. The election demonstrates public desire for social change and post-war reconstruction. Attlee's government creates the welfare state, including the National Health Service, nationalizes key industries, and grants independence to India. This election marks a fundamental shift toward social democracy and the mixed economy that dominates post-war Britain.",
          category: "Political Revolution",
          importance: 5,
          keyFigures: "Clement Attlee, Aneurin Bevan, Ernest Bevin",
          timelineTopic: "historical"
        },
        {
          year: 1947,
          title: "Indian Independence",
          description: "Britain grants independence to India and Pakistan, beginning rapid decolonization of the British Empire.",
          details: "Britain grants independence to India and Pakistan, partitioning the subcontinent along religious lines. Lord Mountbatten oversees the transfer of power that affects over 400 million people. The partition triggers massive population movements and communal violence, while ending the 'jewel in the crown' of the British Empire. Indian independence begins rapid decolonization that transforms the British Empire into the Commonwealth and marks Britain's transition from imperial to post-imperial power.",
          category: "Decolonization",
          importance: 5,
          keyFigures: "Lord Mountbatten, Nehru, Jinnah, Gandhi",
          timelineTopic: "historical"
        },
        {
          year: 1951,
          title: "Festival of Britain",
          description: "The Festival of Britain celebrates recovery from war and showcases British design, science, and culture.",
          details: "The Festival of Britain marks the centenary of the Great Exhibition and celebrates Britain's recovery from World War II. The South Bank exhibition showcases British achievements in science, technology, design, and the arts. The Royal Festival Hall and other modernist structures demonstrate Britain's embrace of contemporary design. Though Conservative critics call it socialist propaganda, the festival successfully promotes British culture and design, boosting national morale during austerity.",
          category: "Cultural",
          importance: 3,
          keyFigures: "Herbert Morrison, festival organizers, British designers",
          timelineTopic: "historical"
        },
        {
          year: 1952,
          title: "Elizabeth II Becomes Queen",
          description: "Elizabeth II becomes queen at age 25 following her father's death, beginning the current reign.",
          details: "Princess Elizabeth becomes Queen Elizabeth II at age 25 following George VI's unexpected death. Her coronation in 1953 is the first major event televised globally, demonstrating the media's new power. Elizabeth's reign witnesses Britain's transformation from imperial power to modern European state, the rise and fall of the welfare state consensus, and major constitutional changes. Her long reign provides stability through decades of rapid social and political change.",
          category: "Monarchy",
          importance: 5,
          keyFigures: "Elizabeth II, Duke of Edinburgh, Queen Mother",
          timelineTopic: "historical"
        },
        {
          year: 1960,
          title: "Wind of Change Speech",
          description: "Macmillan's 'Wind of Change' speech signals Britain's acceptance of African decolonization.",
          details: "Prime Minister Harold Macmillan delivers his 'Wind of Change' speech to the South African Parliament, signaling Britain's acceptance that decolonization is inevitable across Africa. The speech marks a fundamental shift in British imperial policy and contributes to the rapid independence of African colonies throughout the 1960s. Macmillan's acknowledgment of African nationalism helps Britain manage decolonization relatively peacefully compared to other European powers.",
          category: "Decolonization",
          importance: 4,
          keyFigures: "Harold Macmillan, African nationalist leaders",
          timelineTopic: "historical"
        },
        {
          year: 1970,
          title: "1970s Economic Crisis",
          description: "Britain faces severe economic crisis with inflation, strikes, and the 'three-day week' during the 1970s.",
          details: "The 1970s see Britain face severe economic crisis with high inflation, industrial disputes, and economic stagnation ('stagflation'). The decade includes the three-day week, power cuts, rubbish strikes, and the 'Winter of Discontent.' Both Conservative and Labour governments struggle with union power, economic decline, and social tensions. The crisis culminates in IMF intervention in 1976 and sets the stage for Margaret Thatcher's radical economic reforms.",
          category: "Economic Crisis",
          importance: 4,
          keyFigures: "Edward Heath, Harold Wilson, James Callaghan, union leaders",
          timelineTopic: "historical"
        },
        {
          year: 1979,
          title: "Margaret Thatcher Becomes Prime Minister",
          description: "Margaret Thatcher becomes Britain's first woman Prime Minister, beginning radical economic and social transformation.",
          details: "Margaret Thatcher becomes Britain's first woman Prime Minister, promising to transform the country's declining economy and reverse social democratic consensus. Her governments pursue privatization, deregulation, reduced union power, and free-market economics. Thatcherism fundamentally changes British society, reducing the state's economic role while increasing inequality. Her strong leadership during the Falklands War and confrontation with miners establishes her as one of Britain's most influential Prime Ministers.",
          category: "Political Revolution",
          importance: 5,
          keyFigures: "Margaret Thatcher, Conservative government ministers",
          timelineTopic: "historical"
        },
        {
          year: 1982,
          title: "Falklands War",
          description: "Britain successfully retakes the Falkland Islands from Argentina, boosting national pride and Thatcher's popularity.",
          details: "Argentina invades the Falkland Islands, leading Britain to dispatch a naval task force to retake the islands. The successful military campaign, fought 8,000 miles from Britain, demonstrates British military capability and resolve. The victory boosts national pride and Margaret Thatcher's popularity, contributing to her 1983 election victory. The war marks one of the last successful British military campaigns and reinforces Britain's determination to defend its remaining overseas territories.",
          category: "Military Campaign",
          importance: 4,
          keyFigures: "Margaret Thatcher, Admiral Woodward, Falklands veterans",
          timelineTopic: "historical"
        },
        {
          year: 1990,
          title: "Margaret Thatcher Resigns",
          description: "Margaret Thatcher resigns as Prime Minister after 11 years, ending the Thatcher era of radical change.",
          details: "Margaret Thatcher resigns as Prime Minister after losing Conservative Party support over the poll tax and European policy. Her 11-year tenure transforms Britain through privatization, deregulation, and reduced union power, but also increases social divisions and inequality. John Major succeeds her, promising a gentler conservatism. Thatcher's departure ends an era of radical change and begins a period of consolidation of her reforms.",
          category: "Political Change",
          importance: 4,
          keyFigures: "Margaret Thatcher, John Major, Conservative MPs",
          timelineTopic: "historical"
        },
        {
          year: 2000,
          title: "New Millennium and Labour Reforms",
          description: "Britain enters the new millennium under Tony Blair's New Labour with constitutional reforms and economic growth.",
          details: "Britain enters the 21st century under Tony Blair's New Labour government, which combines free-market economics with social investment. The period sees major constitutional reforms including devolution to Scotland and Wales, House of Lords reform, and the Human Rights Act. The economy experiences sustained growth, and Britain plays a leading role in international affairs. The millennium celebration demonstrates Britain's confidence as a modern, multicultural society.",
          category: "Constitutional Reform",
          importance: 4,
          keyFigures: "Tony Blair, Gordon Brown, New Labour ministers",
          timelineTopic: "historical"
        },
        {
          year: 2010,
          title: "Coalition Government",
          description: "Conservative-Liberal Democrat coalition forms after hung parliament, implementing austerity policies.",
          details: "No party wins a majority in the 2010 election, leading to Britain's first coalition government since World War II. David Cameron's Conservatives form a coalition with Nick Clegg's Liberal Democrats, implementing austerity policies to reduce the budget deficit following the 2008 financial crisis. The coalition introduces significant welfare reforms, education changes, and constitutional reforms including the Fixed-term Parliaments Act and AV referendum.",
          category: "Political Coalition",
          importance: 4,
          keyFigures: "David Cameron, Nick Clegg, coalition ministers",
          timelineTopic: "historical"
        },
        {
          year: 2020,
          title: "COVID-19 Pandemic and Brexit",
          description: "Britain faces the COVID-19 pandemic while completing Brexit, creating unprecedented challenges.",
          details: "Britain faces the COVID-19 pandemic while implementing Brexit after leaving the EU in January 2020. The pandemic causes the deepest recession in 300 years, while Brexit creates new trading relationships and constitutional arrangements. The government's response includes lockdowns, furlough schemes, and rapid vaccine development. These simultaneous challenges test Britain's resilience and reshape its relationship with Europe and the world.",
          category: "National Crisis",
          importance: 5,
          keyFigures: "Boris Johnson, government scientists, healthcare workers",
          timelineTopic: "historical"
        },
        {
          year: 2022,
          title: "Platinum Jubilee and Political Turmoil",
          description: "Queen Elizabeth II's Platinum Jubilee celebrated amid political instability and economic challenges.",
          details: "Britain celebrates Queen Elizabeth II's Platinum Jubilee, marking 70 years on the throne, while facing political turmoil and economic challenges. The year sees three different Prime Ministers (Boris Johnson, Liz Truss, Rishi Sunak), economic instability, and the Queen's death in September. The transition to King Charles III marks the end of the Elizabethan era and the beginning of a new reign facing climate change, economic pressures, and constitutional questions about the monarchy's future role.",
          category: "Constitutional Transition",
          importance: 5,
          keyFigures: "Elizabeth II, Charles III, Boris Johnson, Liz Truss, Rishi Sunak",
          timelineTopic: "historical"
        }
      ];

      for (const event of historicalEvents) {
        await this.createTimelineEvent(event);
      }
    }
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  // Authentication methods
  async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
    const [refreshToken] = await db
      .insert(refreshTokens)
      .values(token)
      .returning();
    return refreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const [refreshToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return refreshToken || undefined;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
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

  async updateVideoModule(id: string, updates: Partial<InsertVideoModule>): Promise<VideoModule> {
    const [updatedVideo] = await db
      .update(videoModules)
      .set(updates)
      .where(eq(videoModules.id, id))
      .returning();
    return updatedVideo;
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
    const [newExercise] = await db
      .insert(exercises)
      .values(exercise)
      .returning();
    return newExercise;
  }

  async getUserExercises(userId: string): Promise<Exercise[]> {
    return await db.select().from(exercises).where(eq(exercises.userId, userId));
  }

  async createExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt> {
    const [exerciseAttempt] = await db
      .insert(exerciseAttempts)
      .values(attempt)
      .returning();
    return exerciseAttempt;
  }

  async getUserExerciseAttempts(userId: string): Promise<ExerciseAttempt[]> {
    return await db.select().from(exerciseAttempts).where(eq(exerciseAttempts.userId, userId));
  }

  // Learning module methods
  async getAllLearningModules(): Promise<LearningModule[]> {
    return await db.select().from(learningModules);
  }

  async getUserModuleProgress(userId: string): Promise<UserModuleProgress[]> {
    return await db.select().from(userModuleProgress).where(eq(userModuleProgress.userId, userId));
  }

  async updateModuleProgress(progress: InsertUserModuleProgress): Promise<UserModuleProgress> {
    const [existingProgress] = await db
      .select()
      .from(userModuleProgress)
      .where(
        and(
          eq(userModuleProgress.userId, progress.userId),
          eq(userModuleProgress.moduleId, progress.moduleId)
        )
      );

    if (existingProgress) {
      const [updated] = await db
        .update(userModuleProgress)
        .set({
          completedItems: progress.completedItems || 0,
          progress: progress.progress || 0
        })
        .where(eq(userModuleProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userModuleProgress)
        .values({
          ...progress,
          completedItems: progress.completedItems || 0,
          progress: progress.progress || 0
        })
        .returning();
      return newProgress;
    }
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  // Practice test methods
  async getAllPracticeTests(options?: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: number;
    status?: string;
  }): Promise<PracticeTest[]> {
    let query = db.select().from(practiceTests);
    
    // Apply filters if provided
    if (options?.category && options.category !== 'all') {
      query = query.where(eq(practiceTests.category, options.category));
    }
    
    if (options?.difficulty) {
      query = query.where(eq(practiceTests.difficulty, options.difficulty));
    }
    
    // Note: practiceTests table doesn't have isActive column, so we skip status filtering for now
    // if (options?.status && options.status !== 'all') {
    //   const isActive = options.status === 'active';
    //   query = query.where(eq(practiceTests.isActive, isActive));
    // }
    
    // Apply ordering
    query = query.orderBy(practiceTests.orderIndex);
    
    // Apply pagination if provided
    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.limit(options.limit).offset(offset);
    }
    
    return await query;
  }

  async getPracticeTest(id: string): Promise<PracticeTest | undefined> {
    const [test] = await db.select().from(practiceTests).where(eq(practiceTests.id, id));
    return test || undefined;
  }

  async createPracticeTest(test: InsertPracticeTest): Promise<PracticeTest> {
    const [newTest] = await db
      .insert(practiceTests)
      .values(test)
      .returning();
    return newTest;
  }

  async createPracticeTestAttempt(attempt: InsertPracticeTestAttempt): Promise<PracticeTestAttempt> {
    const [newAttempt] = await db
      .insert(practiceTestAttempts)
      .values(attempt)
      .returning();
    return newAttempt;
  }

  async getUserPracticeTestAttempts(userId: string): Promise<PracticeTestAttempt[]> {
    return await db.select().from(practiceTestAttempts).where(eq(practiceTestAttempts.userId, userId));
  }

  async getPracticeTestAttempts(userId: string, testId: string): Promise<PracticeTestAttempt[]> {
    return await db
      .select()
      .from(practiceTestAttempts)
      .where(
        and(
          eq(practiceTestAttempts.userId, userId),
          eq(practiceTestAttempts.testId, testId)
        )
      );
  }

  // Mock Test Methods
  async getMockTests(): Promise<MockTest[]> {
    return await db.select().from(mockTests).orderBy(mockTests.orderIndex);
  }

  async getMockTest(id: string): Promise<MockTest | undefined> {
    const [test] = await db.select().from(mockTests).where(eq(mockTests.id, id));
    return test || undefined;
  }

  async createMockTest(test: InsertMockTest): Promise<MockTest> {
    const [newTest] = await db
      .insert(mockTests)
      .values(test)
      .returning();
    return newTest;
  }

  async submitMockTest(attempt: InsertMockTestAttempt): Promise<MockTestAttempt> {
    const [newAttempt] = await db
      .insert(mockTestAttempts)
      .values(attempt)
      .returning();
    return newAttempt;
  }

  async getMockTestAttempts(mockTestId: string, userId: string): Promise<MockTestAttempt[]> {
    return await db
      .select()
      .from(mockTestAttempts)
      .where(
        and(
          eq(mockTestAttempts.mockTestId, mockTestId),
          eq(mockTestAttempts.userId, userId)
        )
      );
  }

  private async initializeMockTests() {
    const { mockTestGenerator } = await import("./services/mock-test-generator");
    await mockTestGenerator.initializeMockTests();
  }

  private async initializeTimelineEvents() {
    const timelineData = [
      // Parliament Evolution
      {
        year: 1066,
        title: "Norman Conquest",
        description: "William the Conqueror establishes Norman rule",
        details: "The Norman Conquest fundamentally changed English governance, introducing feudalism and Norman administrative practices that would influence parliamentary development.",
        category: "conquest",
        importance: 5,
        keyFigures: "William the Conqueror, King Harold II",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1594736797933-d0c1d06854d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medieval castle representing Norman architecture introduced after 1066"
      },
      {
        year: 1215,
        title: "Magna Carta",
        description: "King John signs the Magna Carta, limiting royal power",
        details: "This foundational document established that even the king was subject to law, creating principles that would later influence parliamentary sovereignty.",
        category: "constitutional",
        importance: 5,
        keyFigures: "King John, Stephen Langton, Baron rebels",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ancient manuscript representing the Magna Carta document"
      },
      {
        year: 1265,
        title: "First Parliament",
        description: "Simon de Montfort calls the first parliament including commoners",
        details: "This marked the beginning of representative government in England, with both nobles and commoners participating in governance.",
        category: "parliamentary",
        importance: 5,
        keyFigures: "Simon de Montfort, Henry III",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Houses of Parliament - Symbol of British parliamentary democracy"
      },
      {
        year: 1297,
        title: "Model Parliament",
        description: "Edward I summons representatives from all social classes",
        details: "Established the principle that taxation required parliamentary consent, laying groundwork for Parliament's financial powers.",
        category: "parliamentary",
        importance: 4,
        keyFigures: "Edward I",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medieval royal court representing Edward I's Model Parliament"
      },
      {
        year: 1642,
        title: "English Civil War Begins",
        description: "Parliament challenges King Charles I's absolute rule",
        details: "This conflict established parliamentary supremacy over royal prerogative and led to temporary abolition of monarchy.",
        category: "civil_war",
        importance: 5,
        keyFigures: "Charles I, Oliver Cromwell, John Pym",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Historic battlefield representing the English Civil War period"
      },
      {
        year: 1689,
        title: "Bill of Rights",
        description: "Parliament's supremacy over monarchy established",
        details: "Following the Glorious Revolution, this bill confirmed Parliament's control over taxation, military, and law-making.",
        category: "constitutional",
        importance: 5,
        keyFigures: "William III, Mary II",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Royal crown and scepter representing constitutional monarchy after 1689"
      },
      {
        year: 1707,
        title: "Act of Union",
        description: "English and Scottish Parliaments merge",
        details: "Created the Parliament of Great Britain, uniting the kingdoms under one legislative body.",
        category: "union",
        importance: 5,
        keyFigures: "Queen Anne",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Union Jack flag representing the union of England and Scotland"
      },
      {
        year: 1832,
        title: "Great Reform Act",
        description: "First major expansion of voting rights",
        details: "Redistributed seats and extended voting to middle-class men, beginning democratization of Parliament.",
        category: "reform",
        importance: 4,
        keyFigures: "Lord Grey, William IV",
        timelineTopic: "parliament",
        eventImage: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Voting ballot box representing democratic reform and voting rights expansion"
      },
      {
        year: 1911,
        title: "Parliament Act",
        description: "House of Lords' power limited",
        details: "Reduced the Lords' ability to block Commons legislation, establishing clear democratic hierarchy.",
        category: "reform",
        importance: 4,
        keyFigures: "H.H. Asquith, Lloyd George",
        timelineTopic: "parliament"
      },

      // Important Documents
      {
        year: 1215,
        title: "Magna Carta",
        description: "First constitutional document limiting royal power",
        details: "King John forced to sign this charter guaranteeing certain liberties and establishing rule of law principles.",
        category: "charter",
        importance: 5,
        keyFigures: "King John, Archbishop Stephen Langton",
        timelineTopic: "documents"
      },
      {
        year: 1628,
        title: "Petition of Right",
        description: "Parliament demands protection of civil liberties",
        details: "Established that the king could not tax without parliamentary consent or imprison subjects without legal cause.",
        category: "petition",
        importance: 4,
        keyFigures: "Charles I, Sir Edward Coke",
        timelineTopic: "documents"
      },
      {
        year: 1679,
        title: "Habeas Corpus Act",
        description: "Protection against unlawful imprisonment",
        details: "Established the right to challenge detention and demand legal justification for imprisonment.",
        category: "legal",
        importance: 4,
        keyFigures: "Charles II",
        timelineTopic: "documents"
      },
      {
        year: 1689,
        title: "Bill of Rights",
        description: "Constitutional settlement after Glorious Revolution",
        details: "Established parliamentary supremacy, guaranteed free elections, and protected civil liberties.",
        category: "constitutional",
        importance: 5,
        keyFigures: "William III, Mary II",
        timelineTopic: "documents"
      },
      {
        year: 1707,
        title: "Act of Union",
        description: "Treaty uniting England and Scotland",
        details: "Created the Kingdom of Great Britain with a single parliament, preserving Scottish legal system.",
        category: "treaty",
        importance: 5,
        keyFigures: "Queen Anne",
        timelineTopic: "documents"
      },
      {
        year: 1832,
        title: "Reform Act",
        description: "First major electoral reform legislation",
        details: "Redistributed parliamentary seats and extended voting rights to property-owning middle class.",
        category: "electoral",
        importance: 4,
        keyFigures: "Lord Grey",
        timelineTopic: "documents"
      },

      // Voting Rights Evolution
      {
        year: 1430,
        title: "County Franchise Established",
        description: "Voting restricted to 40-shilling freeholders",
        details: "First formal voting qualification in England, limiting electoral participation to substantial property owners.",
        category: "franchise",
        importance: 3,
        keyFigures: "Henry VI",
        timelineTopic: "voting_rights"
      },
      {
        year: 1832,
        title: "Great Reform Act",
        description: "Voting extended to middle-class men",
        details: "Added 217,000 voters, about 3% of population, and redistributed seats from 'rotten boroughs' to industrial cities.",
        category: "reform",
        importance: 5,
        keyFigures: "Lord Grey, Earl Russell",
        timelineTopic: "voting_rights"
      },
      {
        year: 1867,
        title: "Second Reform Act",
        description: "Working-class men in towns gain vote",
        details: "Extended franchise to urban working men, doubling the electorate and including skilled workers.",
        category: "reform",
        importance: 4,
        keyFigures: "Benjamin Disraeli",
        timelineTopic: "voting_rights"
      },
      {
        year: 1872,
        title: "Secret Ballot Act",
        description: "Introduction of secret voting",
        details: "Replaced public voting with private ballot, reducing bribery and intimidation in elections.",
        category: "electoral",
        importance: 4,
        keyFigures: "William Gladstone",
        timelineTopic: "voting_rights"
      },
      {
        year: 1884,
        title: "Third Reform Act",
        description: "Rural workers gain voting rights",
        details: "Extended franchise to agricultural workers, creating near-universal male suffrage.",
        category: "reform",
        importance: 4,
        keyFigures: "William Gladstone",
        timelineTopic: "voting_rights"
      },
      {
        year: 1918,
        title: "Representation of the People Act",
        description: "Women over 30 and all men over 21 gain vote",
        details: "First women's suffrage act, also removed most property qualifications for men.",
        category: "suffrage",
        importance: 5,
        keyFigures: "Emmeline Pankhurst, Millicent Fawcett",
        timelineTopic: "voting_rights"
      },
      {
        year: 1928,
        title: "Equal Franchise Act",
        description: "Equal voting rights for all adults over 21",
        details: "Gave women equal voting rights with men, achieving universal adult suffrage.",
        category: "suffrage",
        importance: 5,
        keyFigures: "Stanley Baldwin",
        timelineTopic: "voting_rights"
      },
      {
        year: 1969,
        title: "Voting Age Lowered",
        description: "Voting age reduced from 21 to 18",
        details: "Extended democratic participation to younger adults, reflecting social changes of the 1960s.",
        category: "reform",
        importance: 3,
        keyFigures: "Harold Wilson",
        timelineTopic: "voting_rights"
      },

      // Territorial Evolution
      {
        year: 1066,
        title: "Norman Conquest of England",
        description: "William conquers Anglo-Saxon England",
        details: "Established Norman control over England, bringing continental European influences to British governance.",
        category: "conquest",
        importance: 5,
        keyFigures: "William the Conqueror",
        timelineTopic: "territories"
      },
      {
        year: 1169,
        title: "Anglo-Norman Invasion of Ireland",
        description: "English begin conquest of Ireland",
        details: "Started centuries of English/British rule in Ireland, creating complex colonial relationship.",
        category: "invasion",
        importance: 4,
        keyFigures: "Richard de Clare (Strongbow)",
        timelineTopic: "territories"
      },
      {
        year: 1283,
        title: "Conquest of Wales",
        description: "Edward I completes conquest of Wales",
        details: "Wales incorporated into English kingdom, ending independent Welsh principalities.",
        category: "conquest",
        importance: 4,
        keyFigures: "Edward I, Llywelyn ap Gruffudd",
        timelineTopic: "territories"
      },
      {
        year: 1707,
        title: "Act of Union with Scotland",
        description: "England and Scotland unite as Great Britain",
        details: "Created unified kingdom while preserving distinct Scottish institutions like legal system.",
        category: "union",
        importance: 5,
        keyFigures: "Queen Anne",
        timelineTopic: "territories"
      },
      {
        year: 1801,
        title: "Act of Union with Ireland",
        description: "Ireland incorporated into United Kingdom",
        details: "Created United Kingdom of Great Britain and Ireland, dissolving Irish Parliament.",
        category: "union",
        importance: 4,
        keyFigures: "George III, William Pitt",
        timelineTopic: "territories"
      },
      {
        year: 1922,
        title: "Irish Partition",
        description: "Ireland divided, southern part becomes independent",
        details: "Irish Free State created, Northern Ireland remains in UK, establishing current boundaries.",
        category: "partition",
        importance: 5,
        keyFigures: "Michael Collins, David Lloyd George",
        timelineTopic: "territories"
      },

      // Trade Evolution
      {
        year: 1600,
        title: "East India Company Founded",
        description: "First major English trading corporation established",
        details: "Launched British commercial expansion into Asia, eventually leading to colonial empire.",
        category: "commerce",
        importance: 4,
        keyFigures: "Elizabeth I",
        timelineTopic: "trades"
      },
      {
        year: 1651,
        title: "Navigation Acts",
        description: "Laws requiring colonial trade through England",
        details: "Established mercantilist system controlling colonial commerce and protecting English shipping.",
        category: "regulation",
        importance: 3,
        keyFigures: "Oliver Cromwell",
        timelineTopic: "trades"
      },
      {
        year: 1750,
        title: "Industrial Revolution Begins",
        description: "Manufacturing transforms British economy",
        details: "Steam power and mechanization revolutionize production, making Britain 'workshop of the world'.",
        category: "industrial",
        importance: 5,
        keyFigures: "James Watt, Abraham Darby",
        timelineTopic: "trades"
      },
      {
        year: 1846,
        title: "Corn Laws Repealed",
        description: "Move toward free trade begins",
        details: "Abolished protective tariffs on grain, marking shift from protectionism to free trade.",
        category: "policy",
        importance: 4,
        keyFigures: "Robert Peel, Richard Cobden",
        timelineTopic: "trades"
      },
      {
        year: 1860,
        title: "Cobden-Chevalier Treaty",
        description: "Free trade agreement with France",
        details: "First major bilateral free trade agreement, launching era of international trade liberalization.",
        category: "treaty",
        importance: 3,
        keyFigures: "Richard Cobden, Michel Chevalier",
        timelineTopic: "trades"
      },
      {
        year: 1973,
        title: "UK Joins European Economic Community",
        description: "Britain enters European common market",
        details: "Joined EEC to access European markets, marking shift toward European economic integration.",
        category: "integration",
        importance: 4,
        keyFigures: "Edward Heath",
        timelineTopic: "trades"
      },
      {
        year: 2020,
        title: "Brexit Completed",
        description: "UK leaves European Union",
        details: "After 47 years in EU/EEC, Britain pursues independent trade policy and global partnerships.",
        category: "separation",
        importance: 5,
        keyFigures: "Boris Johnson",
        timelineTopic: "trades"
      },

      // Inventions & Discoveries - British Scientific and Technological Achievements
      {
        year: 1476,
        title: "William Caxton's Printing Press",
        description: "First printing press established in England",
        details: "William Caxton brought printing technology to England, setting up the first press at Westminster. This revolutionized the spread of literacy and knowledge, making books accessible to the English-speaking public.",
        category: "technology",
        importance: 4,
        keyFigures: "William Caxton",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ancient printing press representing Caxton's revolutionary technology"
      },
      {
        year: 1687,
        title: "Newton's Principia Mathematica",
        description: "Isaac Newton publishes laws of motion and gravity",
        details: "Sir Isaac Newton's Mathematical Principles of Natural Philosophy laid the foundation for classical mechanics and our understanding of gravity. His three laws of motion and universal law of gravitation revolutionized physics and mathematics.",
        category: "science",
        importance: 5,
        keyFigures: "Isaac Newton",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Scientific instruments representing Newton's mathematical and physical discoveries"
      },
      {
        year: 1776,
        title: "Adam Smith's Wealth of Nations",
        description: "Foundation of modern economic theory published",
        details: "Adam Smith's 'An Inquiry into the Nature and Causes of the Wealth of Nations' established the principles of free market economics and the concept of the 'invisible hand' that guides economic activity.",
        category: "economics",
        importance: 5,
        keyFigures: "Adam Smith",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Economic charts and documents representing Smith's economic theories"
      },
      {
        year: 1776,
        title: "James Watt's Steam Engine",
        description: "Improved steam engine powers Industrial Revolution",
        details: "James Watt's separate condenser greatly improved the efficiency of steam engines, making them practical for widespread industrial use. This innovation was crucial to the Industrial Revolution and modern manufacturing.",
        category: "engineering",
        importance: 5,
        keyFigures: "James Watt",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Industrial machinery representing Watt's revolutionary steam engine"
      },
      {
        year: 1776,
        title: "David Hume's Philosophy",
        description: "Major contributions to empiricism and skepticism",
        details: "David Hume's philosophical works, including 'An Enquiry Concerning Human Understanding,' profoundly influenced Western philosophy. His empiricist approach and skeptical arguments about causation and induction shaped modern philosophical thought.",
        category: "philosophy",
        importance: 4,
        keyFigures: "David Hume",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Books and manuscripts representing Hume's philosophical writings"
      },
      {
        year: 1769,
        title: "Richard Arkwright's Water Frame",
        description: "Water-powered spinning machine revolutionizes textile production",
        details: "Richard Arkwright's water frame was the first successful water-powered spinning machine, producing stronger cotton thread than previous methods. This innovation helped establish the factory system and mass production.",
        category: "manufacturing",
        importance: 4,
        keyFigures: "Richard Arkwright",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Textile machinery representing Arkwright's water frame innovation"
      },
      {
        year: 1814,
        title: "George Stephenson's Steam Locomotive",
        description: "First practical steam locomotive for railways",
        details: "George Stephenson built the first practical steam locomotive 'Blücher' and later 'The Rocket.' His innovations in railway engineering made steam trains viable for both passenger and freight transport, revolutionizing transportation.",
        category: "transportation",
        importance: 5,
        keyFigures: "George Stephenson",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Historic steam locomotive representing Stephenson's railway innovations"
      },
      {
        year: 1825,
        title: "Robert Stephenson's Railway Engineering",
        description: "Advanced locomotive design and railway infrastructure",
        details: "Robert Stephenson, son of George, designed the 'Rocket' locomotive and pioneered railway engineering. He built major railway lines and bridges, including the High Level Bridge in Newcastle, advancing railway technology.",
        category: "engineering",
        importance: 4,
        keyFigures: "Robert Stephenson",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Railway bridge and engineering representing Robert Stephenson's innovations"
      },
      {
        year: 1926,
        title: "John Logie Baird's Television",
        description: "First successful television transmission",
        details: "John Logie Baird demonstrated the first working television system, transmitting moving images with his mechanical television. His work laid the foundation for modern television broadcasting and visual communications.",
        category: "communication",
        importance: 5,
        keyFigures: "John Logie Baird",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Early television equipment representing Baird's broadcasting innovation"
      },
      {
        year: 1922,
        title: "John Macleod's Insulin Discovery",
        description: "Co-discovery of insulin treatment for diabetes",
        details: "John James Rickard Macleod, working with Frederick Banting, co-discovered insulin as a treatment for diabetes. This breakthrough saved millions of lives and earned them the Nobel Prize in Physiology or Medicine.",
        category: "medicine",
        importance: 5,
        keyFigures: "John Macleod, Frederick Banting",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medical laboratory equipment representing insulin discovery"
      },
      {
        year: 1928,
        title: "Alexander Fleming's Penicillin",
        description: "Discovery of first widely-used antibiotic",
        details: "Alexander Fleming discovered penicillin when he noticed that a mold had killed bacteria in a petri dish. This accidental discovery led to the development of antibiotics, revolutionizing medicine and saving countless lives.",
        category: "medicine",
        importance: 5,
        keyFigures: "Alexander Fleming",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Laboratory petri dishes representing Fleming's penicillin discovery"
      },
      {
        year: 1935,
        title: "Robert Watson-Watt's Radar",
        description: "Development of radar detection system",
        details: "Robert Watson-Watt developed the first practical radar system, which became crucial during World War II for detecting enemy aircraft. His work on radio detection and ranging technology revolutionized military defense and air traffic control.",
        category: "technology",
        importance: 5,
        keyFigures: "Robert Watson-Watt",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Radar equipment and radio towers representing Watson-Watt's detection system"
      },
      {
        year: 1936,
        title: "John Maynard Keynes' Economic Theory",
        description: "Revolutionary macroeconomic theory published",
        details: "John Maynard Keynes published 'The General Theory of Employment, Interest and Money,' introducing Keynesian economics. His theories about government intervention during economic downturns influenced economic policy worldwide.",
        category: "economics",
        importance: 5,
        keyFigures: "John Maynard Keynes",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Economic graphs and government buildings representing Keynesian economic theory"
      },
      {
        year: 1937,
        title: "Frank Whittle's Jet Engine",
        description: "First turbojet engine revolutionizes aviation",
        details: "Frank Whittle invented and tested the first turbojet engine, fundamentally changing aviation. His Power Jets WU became the basis for modern jet propulsion, making high-speed flight and commercial aviation possible.",
        category: "aviation",
        importance: 5,
        keyFigures: "Frank Whittle",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Jet aircraft and engine representing Whittle's aviation innovation"
      },
      {
        year: 1936,
        title: "Alan Turing's Theoretical Computer",
        description: "Turing machine concept laid foundation for computing",
        details: "Alan Turing described the theoretical 'Turing machine,' establishing the mathematical foundation for computer science. His work on computation, artificial intelligence, and code-breaking during WWII shaped the modern digital age.",
        category: "computing",
        importance: 5,
        keyFigures: "Alan Turing",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Early computer equipment and mathematical symbols representing Turing's computational theories"
      },
      {
        year: 1810,
        title: "Sake Dean Mahomet's Shampooing",
        description: "Introduced Indian head massage and therapeutic bathing to Britain",
        details: "Sake Dean Mahomet, an Indian-British entrepreneur, opened the first curry house in Britain and introduced 'shampooing' (therapeutic head massage) to British society, founding the first commercial steam baths in England.",
        category: "wellness",
        importance: 3,
        keyFigures: "Sake Dean Mahomet",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Spa and wellness treatments representing Mahomet's therapeutic innovations"
      },
      {
        year: 1833,
        title: "Isambard Kingdom Brunel's Engineering Marvels",
        description: "Revolutionary railway, bridge, and ship engineering",
        details: "Isambard Kingdom Brunel designed the Great Western Railway, the Clifton Suspension Bridge, and pioneering steamships including the SS Great Britain. His innovative engineering transformed British infrastructure and maritime transport.",
        category: "engineering",
        importance: 5,
        keyFigures: "Isambard Kingdom Brunel",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Historic suspension bridge representing Brunel's engineering achievements"
      },
      {
        year: 1854,
        title: "Florence Nightingale's Modern Nursing",
        description: "Founded modern nursing practices and hospital sanitation",
        details: "Florence Nightingale revolutionized nursing during the Crimean War, introducing sanitary practices that dramatically reduced death rates. She established the first secular nursing school and created the foundation of modern healthcare.",
        category: "medicine",
        importance: 5,
        keyFigures: "Florence Nightingale",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medical care and nursing equipment representing Nightingale's healthcare reforms"
      },
      {
        year: 1953,
        title: "Francis Crick's DNA Structure Discovery",
        description: "Co-discovered the double helix structure of DNA",
        details: "Francis Crick, along with James Watson, discovered the double helix structure of DNA using X-ray crystallography data. This breakthrough revolutionized biology and genetics, earning them the Nobel Prize and launching the modern genetic age.",
        category: "biology",
        importance: 5,
        keyFigures: "Francis Crick, James Watson",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1576319155264-c7d4c609774e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "DNA helix models and genetic research representing Crick's biological discovery"
      },
      {
        year: 1955,
        title: "Chris Cockerell's Hovercraft",
        description: "Invented the air-cushion vehicle (hovercraft)",
        details: "Christopher Cockerell invented the hovercraft, a revolutionary vehicle that travels on a cushion of air. His innovation enabled transportation over various surfaces including water, ice, and swamps, transforming both military and civilian transport.",
        category: "transportation",
        importance: 4,
        keyFigures: "Chris Cockerell",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Hovercraft on water representing Cockerell's air-cushion vehicle innovation"
      },
      {
        year: 1957,
        title: "Bernard Lovell's Radio Astronomy",
        description: "Pioneer of radio astronomy and space tracking",
        details: "Sir Bernard Lovell founded the Jodrell Bank Observatory and built the world's first large steerable radio telescope. His work revolutionized astronomy, enabling the study of distant galaxies and tracking of early space missions.",
        category: "astronomy",
        importance: 4,
        keyFigures: "Bernard Lovell",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Radio telescope and space observatory representing Lovell's astronomical achievements"
      },
      {
        year: 1967,
        title: "Harrier Jump Jet Development",
        description: "First operational vertical takeoff fighter aircraft",
        details: "British engineers developed the Harrier Jump Jet, the world's first successful vertical/short takeoff and landing (V/STOL) fighter aircraft. This revolutionary design allowed operations from small aircraft carriers and forward bases.",
        category: "aviation",
        importance: 4,
        keyFigures: "British Aerospace Team",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Military jet aircraft representing the Harrier's revolutionary VTOL technology"
      },
      {
        year: 1967,
        title: "James Goodfellow's ATM PIN System",
        description: "Invented the Personal Identification Number for ATMs",
        details: "James Goodfellow invented the Personal Identification Number (PIN) system for Automated Teller Machines, revolutionizing banking security. His cryptographic principles became the foundation for secure electronic transactions worldwide.",
        category: "technology",
        importance: 4,
        keyFigures: "James Goodfellow",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "ATM machine and banking technology representing Goodfellow's PIN security system"
      },
      {
        year: 1973,
        title: "Peter Mansfield's MRI Technology",
        description: "Co-developed Magnetic Resonance Imaging",
        details: "Sir Peter Mansfield developed the mathematical foundations and practical techniques for Magnetic Resonance Imaging (MRI). His work made medical imaging safer and more detailed, earning him the Nobel Prize in Medicine.",
        category: "medicine",
        importance: 5,
        keyFigures: "Peter Mansfield",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medical imaging equipment representing Mansfield's MRI technology"
      },
      {
        year: 1978,
        title: "Robert Edwards & Patrick Steptoe's IVF",
        description: "First successful in-vitro fertilization treatment",
        details: "Robert Edwards and Patrick Steptoe developed in-vitro fertilization (IVF), leading to the birth of Louise Brown, the world's first 'test-tube baby.' Their pioneering work gave hope to millions of infertile couples worldwide.",
        category: "medicine",
        importance: 5,
        keyFigures: "Robert Edwards, Patrick Steptoe",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medical laboratory representing Edwards and Steptoe's fertility research"
      },
      {
        year: 1989,
        title: "Tim Berners-Lee's World Wide Web",
        description: "Invented the World Wide Web and HTML",
        details: "Tim Berners-Lee created the World Wide Web while working at CERN, inventing HTML, HTTP, and URLs. He chose not to patent his invention, making the web free for everyone and transforming global communication and information sharing.",
        category: "computing",
        importance: 5,
        keyFigures: "Tim Berners-Lee",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Computer networks and web connections representing Berners-Lee's internet revolution"
      },
      {
        year: 1996,
        title: "Ian Wilmut's Dolly the Sheep Cloning",
        description: "First successful cloning of an adult mammal",
        details: "Ian Wilmut and Keith Campbell successfully cloned Dolly the sheep at the Roslin Institute, the first mammal cloned from an adult somatic cell. This breakthrough opened new possibilities in genetics, medicine, and regenerative therapy.",
        category: "biology",
        importance: 5,
        keyFigures: "Ian Wilmut, Keith Campbell",
        timelineTopic: "inventions",
        eventImage: "https://images.unsplash.com/photo-1576319155264-c7d4c609774e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Genetic laboratory equipment representing Wilmut and Campbell's cloning achievement"
      },

      // British Sporting Heroes - Life in UK Test Sportsmen
      {
        year: 1954,
        title: "Roger Bannister Breaks Four-Minute Mile",
        description: "First person to run a mile in under four minutes",
        details: "Roger Bannister achieved the seemingly impossible by running a mile in 3 minutes 59.4 seconds at Oxford's Iffley Road track. This breakthrough barrier inspired athletes worldwide and demonstrated British excellence in middle-distance running.",
        category: "Athletics",
        importance: 5,
        keyFigures: "Roger Bannister",
        timelineTopic: "british_sportsmen",
        sport: "Athletics",
        accomplishment: "First person to break the four-minute mile barrier - 3:59.4",
        videoLink: null
      },
      {
        year: 2012,
        title: "Mo Farah Olympic Double Gold",
        description: "Wins 5000m and 10000m at London Olympics",
        details: "Mohamed 'Mo' Farah captured the hearts of the nation by winning both long-distance events at the 2012 London Olympics. His 'Mobot' celebration became iconic, and he repeated this double at Rio 2016.",
        category: "Athletics",
        importance: 5,
        keyFigures: "Mo Farah",
        timelineTopic: "british_sportsmen",
        sport: "Athletics",
        accomplishment: "Four-time Olympic gold medalist in 5000m and 10000m (2012, 2016)",
        videoLink: null
      },
      {
        year: 2013,
        title: "Andy Murray Wins Wimbledon",
        description: "First British man to win Wimbledon in 77 years",
        details: "Andy Murray ended Britain's 77-year wait for a men's Wimbledon champion by defeating Novak Djokovic in straight sets. This victory followed his emotional 2012 final loss and 2012 Olympic gold medal.",
        category: "Tennis",
        importance: 5,
        keyFigures: "Andy Murray",
        timelineTopic: "british_sportsmen",
        sport: "Tennis",
        accomplishment: "Three-time Grand Slam champion and two-time Olympic gold medalist",
        videoLink: null
      },
      {
        year: 2012,
        title: "Jessica Ennis-Hill Olympic Heptathlon Gold",
        description: "Wins heptathlon at London Olympics as poster girl of Games",
        details: "Jessica Ennis-Hill became the face of the London 2012 Olympics, delivering under immense pressure to win heptathlon gold. Her victory in front of a home crowd was one of the defining moments of the Games.",
        category: "Athletics",
        importance: 5,
        keyFigures: "Jessica Ennis-Hill",
        timelineTopic: "british_sportsmen",
        sport: "Athletics",
        accomplishment: "Olympic heptathlon champion and three-time world champion",
        videoLink: null
      },
      {
        year: 2008,
        title: "Chris Hoy's Triple Olympic Gold",
        description: "Wins three cycling gold medals at Beijing Olympics",
        details: "Sir Chris Hoy became the most successful British Olympian (at the time) by winning three gold medals in track cycling at Beijing 2008. His achievements helped establish Britain as a cycling powerhouse.",
        category: "Cycling",
        importance: 5,
        keyFigures: "Chris Hoy",
        timelineTopic: "british_sportsmen",
        sport: "Cycling",
        accomplishment: "Six-time Olympic cycling gold medalist, most successful British track cyclist",
        videoLink: null
      },
      {
        year: 2004,
        title: "Kelly Holmes Double Olympic Gold",
        description: "Wins 800m and 1500m at Athens Olympics",
        details: "Dame Kelly Holmes achieved her lifetime dream by winning double gold in the 800m and 1500m at Athens 2004. Her emotional victory celebrations highlighted years of injury struggles and determination.",
        category: "Athletics",
        importance: 5,
        keyFigures: "Kelly Holmes",
        timelineTopic: "british_sportsmen",
        sport: "Athletics",
        accomplishment: "Double Olympic gold medalist in 800m and 1500m at Athens 2004",
        videoLink: null
      },
      {
        year: 2000,
        title: "Steve Redgrave's Fifth Olympic Gold",
        description: "Wins unprecedented fifth consecutive Olympic rowing gold",
        details: "Sir Steve Redgrave achieved the remarkable feat of winning rowing gold at five consecutive Olympics (1984-2000). His coxless four victory at Sydney 2000 completed one of sport's greatest achievements.",
        category: "Rowing",
        importance: 5,
        keyFigures: "Steve Redgrave",
        timelineTopic: "british_sportsmen",
        sport: "Rowing",
        accomplishment: "Five consecutive Olympic rowing gold medals from 1984 to 2000",
        videoLink: null
      },
      {
        year: 1966,
        title: "England Wins World Cup",
        description: "Bobby Charlton leads England to World Cup victory",
        details: "Sir Bobby Charlton was instrumental in England's 4-2 victory over West Germany at Wembley. His goalscoring throughout the tournament and leadership helped deliver England's only World Cup triumph.",
        category: "Football",
        importance: 5,
        keyFigures: "Bobby Charlton, Geoff Hurst",
        timelineTopic: "british_sportsmen",
        sport: "Football",
        accomplishment: "1966 World Cup winner and Manchester United legend with 249 goals",
        videoLink: null
      },
      {
        year: 1966,
        title: "Geoff Hurst's World Cup Hat-trick",
        description: "Only player to score hat-trick in World Cup final",
        details: "Sir Geoff Hurst made history by scoring a hat-trick in the 1966 World Cup final against West Germany. His third goal with the famous commentary 'They think it's all over... it is now!' became legendary.",
        category: "Football",
        importance: 5,
        keyFigures: "Geoff Hurst",
        timelineTopic: "british_sportsmen",
        sport: "Football",
        accomplishment: "Only player to score hat-trick in World Cup final (1966 vs West Germany)",
        videoLink: null
      },
      {
        year: 2012,
        title: "Bradley Wiggins Wins Tour de France",
        description: "First British winner of cycling's most prestigious race",
        details: "Sir Bradley Wiggins became the first British rider to win the Tour de France, achieving a childhood dream. His victory was followed by time trial gold at the London Olympics weeks later.",
        category: "Cycling",
        importance: 5,
        keyFigures: "Bradley Wiggins",
        timelineTopic: "british_sportsmen",
        sport: "Cycling",
        accomplishment: "First Briton to win Tour de France and eight-time Olympic medalist",
        videoLink: null
      },
      {
        year: 2008,
        title: "Lewis Hamilton's First F1 Championship",
        description: "Youngest Formula 1 world champion at the time",
        details: "Lewis Hamilton won his first Formula 1 World Championship in dramatic fashion, overtaking Timo Glock on the final corner of the final lap of the season. He went on to become Britain's most successful F1 driver.",
        category: "Formula 1",
        importance: 5,
        keyFigures: "Lewis Hamilton",
        timelineTopic: "british_sportsmen",
        sport: "Formula 1",
        accomplishment: "Seven-time Formula 1 World Champion, joint-record holder",
        videoLink: null
      },
      {
        year: 1987,
        title: "Nick Faldo's First Major",
        description: "Wins first of six major golf championships",
        details: "Sir Nick Faldo won the 1987 Open Championship, beginning a dominant period in golf. He went on to win six majors including three Masters and three Open Championships, becoming Europe's greatest golfer.",
        category: "Golf",
        importance: 4,
        keyFigures: "Nick Faldo",
        timelineTopic: "british_sportsmen",
        sport: "Golf",
        accomplishment: "Six-time major golf champion including three Masters and three Open Championships",
        videoLink: null
      },
      {
        year: 2003,
        title: "Jonny Wilkinson's World Cup Drop Goal",
        description: "Wins Rugby World Cup with iconic drop goal",
        details: "Jonny Wilkinson's drop goal in extra time secured England's 20-17 victory over Australia in the 2003 Rugby World Cup final. His accuracy and mental strength under pressure became legendary.",
        category: "Rugby",
        importance: 5,
        keyFigures: "Jonny Wilkinson",
        timelineTopic: "british_sportsmen",
        sport: "Rugby",
        accomplishment: "Scored winning drop goal in 2003 Rugby World Cup final for England",
        videoLink: null
      },
      {
        year: 2016,
        title: "Sarah Storey's Paralympic Dominance",
        description: "Becomes Britain's most successful Paralympian",
        details: "Dame Sarah Storey became Britain's most successful Paralympian with her achievements in swimming and cycling. Her 17 Paralympic gold medals across two sports demonstrate remarkable versatility and longevity.",
        category: "Paralympics",
        importance: 5,
        keyFigures: "Sarah Storey",
        timelineTopic: "british_sportsmen",
        sport: "Paralympics",
        accomplishment: "Britain's most successful Paralympian with 17 gold medals in swimming and cycling",
        videoLink: null
      },
      {
        year: 1995,
        title: "AP McCoy's Champion Jockey Dominance",
        description: "Begins unprecedented run of 20 consecutive champion jockey titles",
        details: "Sir Anthony 'AP' McCoy began his extraordinary dominance of National Hunt racing, becoming champion jockey 20 consecutive times. His dedication and fearlessness redefined professional horse racing.",
        category: "Horse Racing",
        importance: 4,
        keyFigures: "AP McCoy",
        timelineTopic: "british_sportsmen",
        sport: "Horse Racing",
        accomplishment: "Champion jockey 20 consecutive times with over 4,300 career wins",
        videoLink: null
      },

      // Church Evolution Timeline
      {
        year: 43,
        title: "Roman Christianity Arrives in Britain",
        description: "Christianity first introduced to Britain during Roman occupation",
        details: "Roman soldiers and merchants brought Christianity to Britain during the Roman occupation. Early Christian communities developed in major Roman towns, particularly in England and Wales, laying the foundation for the future church.",
        category: "religion",
        importance: 4,
        keyFigures: "Roman missionaries",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ancient Roman architecture and Christian symbols representing early Christianity in Britain"
      },
      {
        year: 397,
        title: "St. Ninian's Mission to Scotland",
        description: "First recorded Christian mission to Scotland",
        details: "St. Ninian established the first Christian church in Scotland at Whithorn, bringing Christianity to the Picts and other Celtic tribes. This marked the beginning of organized Christianity in Scotland, predating St. Columba's mission.",
        category: "religion",
        importance: 4,
        keyFigures: "St. Ninian",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ancient stone church representing early Christian missions in Scotland"
      },
      {
        year: 432,
        title: "St. Patrick's Mission to Ireland",
        description: "Christianity firmly established in Ireland",
        details: "St. Patrick's mission brought organized Christianity to Ireland, establishing the Celtic Church tradition. This influenced the later Christianization of Northern Ireland and provided the foundation for Irish monasticism that would spread throughout Britain.",
        category: "religion",
        importance: 5,
        keyFigures: "St. Patrick",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Celtic cross and monastery representing St. Patrick's mission to Ireland"
      },
      {
        year: 563,
        title: "St. Columba Founds Iona Abbey",
        description: "Celtic Christianity spreads throughout Scotland",
        details: "St. Columba established Iona Abbey, which became the center of Celtic Christianity in Scotland. The monastery served as a base for converting the Picts and Scots, establishing the unique Celtic Christian tradition that differed from Roman Christianity.",
        category: "religion",
        importance: 5,
        keyFigures: "St. Columba",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medieval abbey on island representing Iona and Celtic Christianity"
      },
      {
        year: 597,
        title: "St. Augustine's Mission to England",
        description: "Roman Christianity officially established in England",
        details: "Pope Gregory I sent St. Augustine to convert the Anglo-Saxons. Augustine became the first Archbishop of Canterbury, establishing the Roman Catholic Church in England and founding Canterbury Cathedral as the mother church of English Christianity.",
        category: "religion",
        importance: 5,
        keyFigures: "St. Augustine of Canterbury",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Canterbury Cathedral representing the establishment of English Christianity"
      },
      {
        year: 664,
        title: "Synod of Whitby",
        description: "Roman Christianity becomes dominant over Celtic traditions",
        details: "The Synod of Whitby decided in favor of Roman rather than Celtic Christian practices, unifying the English church under Roman authority. This decision affected church organization across Britain, though Celtic traditions persisted longer in Scotland, Wales, and Ireland.",
        category: "religion",
        importance: 4,
        keyFigures: "King Oswiu of Northumbria",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Medieval church assembly representing the Synod of Whitby"
      },
      {
        year: 1170,
        title: "Norman Church Reforms",
        description: "Norman conquest transforms church organization across Britain",
        details: "Following the Norman Conquest, church organization was reformed with Norman bishops appointed across England and Wales. New cathedrals and abbeys were built in Norman style, centralizing church authority and connecting British churches more closely to continental Europe.",
        category: "religion",
        importance: 4,
        keyFigures: "Norman bishops",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Norman cathedral architecture representing church reforms"
      },
      {
        year: 1472,
        title: "St. Andrews Archbishopric Established",
        description: "Scotland gains ecclesiastical independence",
        details: "The Pope elevated St. Andrews to an archbishopric, giving Scotland ecclesiastical independence from English church authority. This strengthened Scottish church identity and reduced English influence over Scottish religious affairs.",
        category: "religion",
        importance: 4,
        keyFigures: "Archbishop Patrick Graham",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "St. Andrews Cathedral ruins representing Scottish ecclesiastical independence"
      },
      {
        year: 1534,
        title: "English Reformation Begins",
        description: "Henry VIII breaks from Rome, establishing Church of England",
        details: "Henry VIII's Act of Supremacy declared him Supreme Head of the Church of England, breaking from papal authority. This created the Anglican Church and began the English Reformation, fundamentally changing religion in England and Wales while initially having less impact on Scotland and Ireland.",
        category: "religion",
        importance: 5,
        keyFigures: "Henry VIII, Thomas Cranmer",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Tudor church interior representing the English Reformation"
      },
      {
        year: 1560,
        title: "Scottish Reformation",
        description: "Presbyterian Church established in Scotland",
        details: "John Knox led the Scottish Reformation, establishing Presbyterianism as Scotland's national church. The Scottish Parliament rejected papal authority and adopted a Protestant confession of faith, creating the Church of Scotland (Kirk) with its distinctive presbyterian governance structure.",
        category: "religion",
        importance: 5,
        keyFigures: "John Knox",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Scottish kirk interior representing Presbyterian reformation"
      },
      {
        year: 1536,
        title: "Dissolution of Welsh Monasteries",
        description: "Reformation extends to Wales under English rule",
        details: "The dissolution of monasteries extended to Wales as part of the English Reformation. Welsh religious houses were closed, and the Church in Wales came under the authority of the Church of England, though Welsh language and culture influenced local church practices.",
        category: "religion",
        importance: 3,
        keyFigures: "Thomas Cromwell",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ruined Welsh abbey representing monastic dissolution"
      },
      {
        year: 1588,
        title: "Welsh Bible Translation",
        description: "William Morgan translates Bible into Welsh",
        details: "William Morgan's Welsh Bible translation helped preserve Welsh language and culture within the Protestant church. This translation became central to Welsh religious and cultural identity, ensuring Welsh-language church services and strengthening Welsh Protestant traditions.",
        category: "religion",
        importance: 4,
        keyFigures: "William Morgan",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ancient Welsh Bible representing translation and cultural preservation"
      },
      {
        year: 1609,
        title: "Plantation of Ulster",
        description: "Protestant settlement reshapes Northern Ireland church landscape",
        details: "The Plantation of Ulster brought Protestant settlers from Scotland and England to Northern Ireland, establishing Presbyterian and Anglican churches alongside existing Catholic communities. This created the complex religious landscape that defines Northern Ireland today.",
        category: "religion",
        importance: 4,
        keyFigures: "Ulster Planters",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Ulster plantation church representing Protestant settlement"
      },
      {
        year: 1689,
        title: "Presbyterian Church in Ireland Organized",
        description: "Formal organization of Presbyterian Church in Ulster",
        details: "The Presbyterian Church in Ireland was formally organized following the Williamite Wars, establishing a strong Presbyterian presence in Ulster. This created a distinct Protestant denomination alongside Anglicanism, contributing to Northern Ireland's complex religious identity.",
        category: "religion",
        importance: 4,
        keyFigures: "Ulster Presbyterian ministers",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Presbyterian church in Ulster representing organized Presbyterianism"
      },
      {
        year: 1707,
        title: "Act of Union Preserves Scottish Church",
        description: "Union protects Presbyterian Church of Scotland",
        details: "The Act of Union between England and Scotland specifically protected the Presbyterian Church of Scotland, ensuring it remained the established church north of the border. This preserved Scotland's distinct religious identity within the new United Kingdom.",
        category: "religion",
        importance: 4,
        keyFigures: "Scottish negotiators",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Scottish Presbyterian church representing protected religious traditions"
      },
      {
        year: 1738,
        title: "Methodist Revival Begins",
        description: "Methodism spreads across Britain, particularly Wales",
        details: "John Wesley's Methodist revival movement spread across Britain, with particularly strong growth in Wales where it complemented Welsh nonconformist traditions. Methodism provided an alternative to established churches and became influential in working-class communities throughout the UK.",
        category: "religion",
        importance: 4,
        keyFigures: "John Wesley, George Whitefield",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Methodist chapel representing evangelical revival movement"
      },
      {
        year: 1829,
        title: "Catholic Emancipation",
        description: "Catholics gain civil rights across the UK",
        details: "The Catholic Emancipation Act removed most restrictions on Catholics throughout the UK, allowing them to participate fully in public life. This was particularly significant in Ireland and marked the beginning of the end of Protestant ascendancy, though tensions remained especially in Ulster.",
        category: "religion",
        importance: 5,
        keyFigures: "Daniel O'Connell, Duke of Wellington",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Catholic church representing religious emancipation and equality"
      },
      {
        year: 1843,
        title: "Disruption of Church of Scotland",
        description: "Free Church of Scotland formed over independence issues",
        details: "The Disruption saw about one-third of Church of Scotland ministers leave to form the Free Church of Scotland over the issue of patronage and church independence from state control. This created a major division in Scottish Presbyterianism that lasted for decades.",
        category: "religion",
        importance: 4,
        keyFigures: "Thomas Chalmers",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Free Church building representing Scottish church disruption"
      },
      {
        year: 1869,
        title: "Irish Church Disestablishment",
        description: "Church of Ireland loses established status",
        details: "The Irish Church Act disestablished the Church of Ireland, ending Protestant religious privilege in Ireland. This was part of broader reforms addressing Irish grievances and reduced the Anglican Church's formal role in Irish society, though it remained influential among the Protestant minority.",
        category: "religion",
        importance: 4,
        keyFigures: "William Gladstone",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Church of Ireland building representing disestablishment"
      },
      {
        year: 1920,
        title: "Church in Wales Disestablished",
        description: "Welsh Anglican Church gains independence",
        details: "The Church in Wales was disestablished from the Church of England, becoming an independent Anglican province. This reflected growing Welsh national consciousness and gave the Welsh church greater autonomy to address distinctly Welsh religious and cultural needs.",
        category: "religion",
        importance: 3,
        keyFigures: "Welsh church leaders",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Welsh cathedral representing church independence"
      },
      {
        year: 1929,
        title: "Church of Scotland Reunion",
        description: "United Free Church reunites with Church of Scotland",
        details: "The United Free Church of Scotland reunited with the Church of Scotland, healing much of the division caused by the 1843 Disruption. This strengthened Scottish Presbyterianism and created a more unified national church while maintaining independence from state control.",
        category: "religion",
        importance: 4,
        keyFigures: "Church leaders",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "United Scottish church representing Presbyterian reunion"
      },
      {
        year: 1969,
        title: "Northern Ireland Troubles Begin",
        description: "Religious divisions intensify during conflict period",
        details: "The Northern Ireland conflict intensified existing religious divisions, with Catholic and Protestant communities often aligned with nationalist and unionist political positions. Churches played complex roles as both sources of division and agents of peace-making throughout the Troubles.",
        category: "religion",
        importance: 4,
        keyFigures: "Religious leaders",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Peace wall and churches representing religious divisions and reconciliation"
      },
      {
        year: 1992,
        title: "Church of England Ordains Women Priests",
        description: "Anglican Church allows women's ordination despite controversy",
        details: "The Church of England voted to ordain women as priests, causing significant controversy and some departures to Rome. This reform was gradually adopted by other Anglican churches in the UK, representing major social change in church leadership and gender equality.",
        category: "religion",
        importance: 4,
        keyFigures: "Women clergy",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Female priest representing women's ordination in Anglican Church"
      },
      {
        year: 1998,
        title: "Good Friday Agreement",
        description: "Peace process recognizes religious equality in Northern Ireland",
        details: "The Good Friday Agreement established principles of religious equality and mutual respect in Northern Ireland, formally recognizing both traditions. This marked a turning point in church relations and began a new era of interfaith cooperation and shared governance.",
        category: "religion",
        importance: 5,
        keyFigures: "Church leaders, politicians",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Churches and peace symbols representing Good Friday Agreement"
      },
      {
        year: 2003,
        title: "Gene Robinson Controversy",
        description: "Anglican Communion faces divisions over sexuality",
        details: "The consecration of openly gay bishop Gene Robinson in the US caused major divisions within the worldwide Anglican Communion, affecting UK Anglican churches. This highlighted ongoing debates about sexuality, tradition, and modern church teaching across all UK denominations.",
        category: "religion",
        importance: 3,
        keyFigures: "Anglican bishops",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Anglican church interior representing contemporary church controversies"
      },
      {
        year: 2014,
        title: "Church of England Approves Women Bishops",
        description: "Final barrier to women's leadership removed in Anglican Church",
        details: "The Church of England voted to allow women to become bishops, completing the process of gender equality in church leadership begun with women's ordination. The first women bishops were consecrated in 2015, representing the culmination of decades of reform.",
        category: "religion",
        importance: 4,
        keyFigures: "Women bishops",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Female bishop in cathedral representing women's equality in church leadership"
      },
      {
        year: 2020,
        title: "COVID-19 Transforms Church Practices",
        description: "Pandemic forces digital transformation across all UK churches",
        details: "The COVID-19 pandemic forced churches across all UK regions to rapidly adopt digital technologies, livestreaming services, and virtual pastoral care. This accelerated technological adoption and changed how churches engage with communities, creating new forms of worship and outreach.",
        category: "religion",
        importance: 4,
        keyFigures: "Church leaders",
        timelineTopic: "church",
        eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        imageDescription: "Digital church service representing pandemic transformation of worship"
      }
    ];

    for (const event of timelineData) {
      await this.createTimelineEvent(event);
    }
  }

  // Stripe payment methods
  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const result = await db.update(users)
      .set({ 
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: 'active'
      })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async updateUserSubscription(userId: string, subscriptionType: string, subscriptionStatus: string): Promise<User> {
    const result = await db.update(users)
      .set({ 
        subscriptionType,
        subscriptionStatus
      })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async updateUserProfile(userId: string, profileData: { firstName?: string; email?: string; username?: string }): Promise<User> {
    // Check if email or username already exists (excluding current user)
    if (profileData.email) {
      const existingUser = await this.getUserByEmail(profileData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already exists");
      }
    }

    if (profileData.username) {
      const existingUser = await this.getUserByUsername(profileData.username);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Username already exists");
      }
    }

    const result = await db.update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  // New timeline initialization methods
  private async initializePopulationMigrationTimelineIfNeeded() {
    const existingEvents = await db.select().from(timelineEvents).where(eq(timelineEvents.timelineTopic, 'population-migration'));
    if (existingEvents.length === 0) {
      const populationEvents: InsertTimelineEvent[] = [
        {
          year: 1066,
          title: "Norman Migration to England",
          description: "Norman conquest brings French-speaking population to England. Establishment of Norman aristocracy.",
          details: "The Norman conquest resulted in significant population changes with Norman nobles, knights, and administrators settling in England. This introduced French culture and language, fundamentally changing the demographic makeup of English leadership and aristocracy.",
          category: "Migration",
          importance: 4,
          keyFigures: "Norman settlers, William the Conqueror",
          timelineTopic: "population-migration"
        },
        {
          year: 1290,
          title: "Expulsion of Jews from England",
          description: "Edward I expels all Jews from England. First major ethnic expulsion in English history.",
          details: "Edward I expelled approximately 16,000 Jews from England in 1290, making England the first European country to do so. This dramatically reduced religious and ethnic diversity and wouldn't be reversed until the 1650s under Oliver Cromwell.",
          category: "Expulsion",
          importance: 4,
          keyFigures: "Edward I, Jewish communities",
          timelineTopic: "population-migration"
        },
        {
          year: 1600,
          title: "Irish Migration to England",
          description: "Large-scale Irish migration begins due to economic opportunities and religious persecution in Ireland.",
          details: "Significant numbers of Irish people began migrating to England seeking better economic opportunities and fleeing religious discrimination. This established the foundation of large Irish communities in English cities, particularly London, Liverpool, and Manchester.",
          category: "Migration",
          importance: 3,
          keyFigures: "Irish migrants",
          timelineTopic: "population-migration"
        },
        {
          year: 1750,
          title: "Highland Clearances Migration",
          description: "Scottish Highlanders forced to migrate due to land clearances. Many move to Lowland cities or emigrate overseas.",
          details: "The Highland Clearances forced thousands of Scottish Highlanders from their ancestral lands as landlords converted to sheep farming. Many migrated to industrial cities in Scotland and England, while others emigrated to North America and Australia.",
          category: "Forced Migration",
          importance: 4,
          keyFigures: "Highland Scottish families",
          timelineTopic: "population-migration"
        },
        {
          year: 1840,
          title: "Great Famine Irish Migration",
          description: "Irish Potato Famine causes massive migration to Britain. Over 1 million Irish people flee starvation.",
          details: "The Irish Potato Famine (1845-1852) caused massive migration to Britain, with over 1 million Irish people fleeing starvation and disease. This created large Irish communities in British cities and significantly changed the demographic composition of urban areas.",
          category: "Refugee Migration",
          importance: 5,
          keyFigures: "Irish famine refugees",
          timelineTopic: "population-migration"
        },
        {
          year: 1880,
          title: "Eastern European Jewish Immigration",
          description: "Large wave of Jewish immigration from Eastern Europe fleeing pogroms and persecution.",
          details: "Between 1880-1914, approximately 150,000 Jews immigrated to Britain from Eastern Europe, particularly Russia and Poland, fleeing persecution and pogroms. They established communities in London's East End, Leeds, and Manchester, contributing to British cultural and economic life.",
          category: "Refugee Migration",
          importance: 4,
          keyFigures: "Eastern European Jewish refugees",
          timelineTopic: "population-migration"
        },
        {
          year: 1948,
          title: "Windrush Generation Arrives",
          description: "First large group of Caribbean migrants arrives on the Empire Windrush, beginning post-war Commonwealth migration.",
          details: "The Empire Windrush brought 492 Caribbean migrants to Britain, marking the beginning of large-scale post-war Commonwealth migration. These migrants filled labor shortages in transport, healthcare, and manufacturing, fundamentally changing British society and culture.",
          category: "Commonwealth Migration",
          importance: 5,
          keyFigures: "Caribbean migrants, Windrush passengers",
          timelineTopic: "population-migration"
        },
        {
          year: 1960,
          title: "South Asian Migration Peak",
          description: "Large-scale migration from India, Pakistan, and Bangladesh following decolonization.",
          details: "The 1960s saw peak migration from the Indian subcontinent as people from India, Pakistan, and Bangladesh moved to Britain for economic opportunities. This created significant South Asian communities, particularly in London, Birmingham, Bradford, and Leicester.",
          category: "Commonwealth Migration",
          importance: 4,
          keyFigures: "South Asian migrants",
          timelineTopic: "population-migration"
        },
        {
          year: 1972,
          title: "Ugandan Asian Expulsion",
          description: "40,000 Ugandan Asians expelled by Idi Amin arrive in Britain as refugees.",
          details: "Idi Amin's expulsion of Uganda's Asian population brought 40,000 refugees to Britain in 1972. Despite initial challenges, these refugees successfully integrated and made significant contributions to British business, particularly in retail and manufacturing.",
          category: "Refugee Migration",
          importance: 4,
          keyFigures: "Ugandan Asian refugees, Idi Amin",
          timelineTopic: "population-migration"
        },
        {
          year: 1990,
          title: "Eastern European Migration",
          description: "Fall of communism brings new wave of Eastern European migrants seeking opportunities in democratic Britain.",
          details: "The collapse of communist regimes in Eastern Europe led to increased migration to Britain from countries like Poland, Czech Republic, and Hungary. This migration accelerated after EU enlargement in 2004, bringing significant demographic changes.",
          category: "Economic Migration",
          importance: 3,
          keyFigures: "Eastern European migrants",
          timelineTopic: "population-migration"
        }
      ];

      for (const event of populationEvents) {
        await this.createTimelineEvent(event);
      }
    }
  }

  private async initializeSportsAthleticsTimelineIfNeeded() {
    const existingEvents = await db.select().from(timelineEvents).where(eq(timelineEvents.timelineTopic, 'sports-athletics'));
    if (existingEvents.length === 0) {
      const sportsEvents: InsertTimelineEvent[] = [
        {
          year: 1863,
          title: "Football Association Founded",
          description: "The Football Association established in London, creating standardized rules for football (soccer).",
          details: "The FA was formed at Freeman's Tavern in London, establishing the first standardized rules for football. This led to the development of modern soccer and its spread worldwide, making Britain the birthplace of the world's most popular sport.",
          category: "Football",
          importance: 5,
          keyFigures: "Ebenezer Cobb Morley, founding members",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1871,
          title: "First FA Cup Final",
          description: "First FA Cup Final held at Kennington Oval. Wanderers defeat Royal Engineers 1-0.",
          details: "The FA Cup became the world's oldest football knockout competition. The first final drew 2,000 spectators and established a tradition that continues today, with the final now held at Wembley Stadium.",
          category: "Football",
          importance: 4,
          keyFigures: "Wanderers FC, Royal Engineers FC",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1871,
          title: "First International Rugby Match",
          description: "England plays Scotland in the first international rugby match in Edinburgh.",
          details: "Rugby, invented at Rugby School, saw its first international match between England and Scotland in Edinburgh. Scotland won, establishing rugby as a major sport that would spread throughout the British Empire and beyond.",
          category: "Rugby",
          importance: 4,
          keyFigures: "Players from England and Scotland",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1877,
          title: "First Wimbledon Championship",
          description: "The first Wimbledon tennis championship held at the All England Croquet and Lawn Tennis Club.",
          details: "Wimbledon became the world's oldest tennis tournament, establishing lawn tennis as a major sport. The tournament attracted 22 men in its first year and has grown to become one of sport's most prestigious events.",
          category: "Tennis",
          importance: 4,
          keyFigures: "Spencer Gore (first champion)",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1888,
          title: "Football League Founded",
          description: "The world's first football league established with 12 founding clubs from the Midlands and North of England.",
          details: "The Football League created the first organized professional football competition, with Preston North End becoming the first champions. This model was copied worldwide and established professional football as we know it today.",
          category: "Football",
          importance: 5,
          keyFigures: "William McGregor, founding club representatives",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1900,
          title: "British Athletes Dominate Early Olympics",
          description: "British athletes achieve significant success in early modern Olympic Games in Paris.",
          details: "British athletes were highly successful in the early Olympic Games, reflecting the country's role in developing modern sports. British success in athletics, tennis, golf, and other sports demonstrated the nation's sporting prowess.",
          category: "Olympics",
          importance: 3,
          keyFigures: "British Olympic athletes",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1930,
          title: "Arsenal's Rise to Prominence",
          description: "Arsenal becomes the first southern club to win the Football League, breaking northern dominance.",
          details: "Arsenal's success marked a shift in football power from the industrial north to London, helping establish football as a truly national sport. Their innovative tactics and professional approach influenced football development.",
          category: "Football",
          importance: 3,
          keyFigures: "Herbert Chapman, Arsenal players",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1966,
          title: "England Wins FIFA World Cup",
          description: "England defeats West Germany 4-2 at Wembley to win their first and only FIFA World Cup.",
          details: "England's World Cup victory was a defining moment in British sport, with Geoff Hurst scoring a hat-trick in the final. The victory united the nation and established football as central to British cultural identity.",
          category: "Football",
          importance: 5,
          keyFigures: "Bobby Moore, Geoff Hurst, Alf Ramsey",
          timelineTopic: "sports-athletics"
        },
        {
          year: 1992,
          title: "Premier League Founded",
          description: "The FA Premier League established, revolutionizing English football with increased commercialization and global reach.",
          details: "The Premier League transformed English football through massive TV deals and global marketing. It became the world's most-watched football league, attracting international stars and investment while maintaining its position as the world's most competitive league.",
          category: "Football",
          importance: 4,
          keyFigures: "Premier League founders",
          timelineTopic: "sports-athletics"
        },
        {
          year: 2012,
          title: "London Olympics Success",
          description: "London hosts successful Olympic Games. Team GB achieves third place in medal table with 65 medals.",
          details: "The London Olympics showcased Britain's organizational capabilities and sporting excellence. Team GB's success, including multiple gold medals in cycling, rowing, and athletics, inspired a generation and left a lasting sporting legacy.",
          category: "Olympics",
          importance: 4,
          keyFigures: "Mo Farah, Bradley Wiggins, Jessica Ennis-Hill",
          timelineTopic: "sports-athletics"
        }
      ];

      for (const event of sportsEvents) {
        await this.createTimelineEvent(event);
      }
    }
  }



  private async initializeLiteratureTimelineIfNeeded() {
    const existingEvents = await db.select().from(timelineEvents).where(eq(timelineEvents.timelineTopic, 'literature'));
    if (existingEvents.length === 0) {
      const literatureEvents: InsertTimelineEvent[] = [
        {
          year: 700,
          title: "Beowulf Composed",
          description: "The epic poem Beowulf, one of the earliest major works of English literature, is composed in Old English.",
          details: "Beowulf represents the earliest major work of English literature, written in Old English (Anglo-Saxon). This epic poem tells the story of a Scandinavian hero and reflects the values and culture of early medieval England, establishing the foundation of English literary tradition.",
          category: "Epic Poetry",
          importance: 5,
          keyFigures: "Anonymous Anglo-Saxon poets",
          timelineTopic: "literature"
        },
        {
          year: 1387,
          title: "Chaucer Writes Canterbury Tales",
          description: "Geoffrey Chaucer begins writing The Canterbury Tales, establishing Middle English as a literary language.",
          details: "Geoffrey Chaucer's Canterbury Tales marked the emergence of Middle English as a sophisticated literary language. The work's realistic characters and social commentary established Chaucer as the father of English poetry and demonstrated English literature's potential.",
          category: "Medieval Literature",
          importance: 5,
          keyFigures: "Geoffrey Chaucer",
          timelineTopic: "literature"
        },
        {
          year: 1590,
          title: "Shakespeare's Career Begins",
          description: "William Shakespeare begins his theatrical career in London, eventually writing 39 plays and 154 sonnets.",
          details: "William Shakespeare's career transformed English literature and theatre. His plays and sonnets explore universal themes of love, power, jealousy, and mortality. His works remain central to English-speaking education and continue to be performed worldwide.",
          category: "Elizabethan Literature",
          importance: 5,
          keyFigures: "William Shakespeare",
          timelineTopic: "literature"
        },
        {
          year: 1667,
          title: "Paradise Lost Published",
          description: "John Milton publishes Paradise Lost, one of the greatest epic poems in English literature.",
          details: "John Milton's Paradise Lost retells the biblical story of the Fall of Man in blank verse. Despite Milton's blindness, he created this monumental work that explores themes of free will, obedience, and rebellion, establishing the epic tradition in English poetry.",
          category: "Epic Poetry",
          importance: 4,
          keyFigures: "John Milton",
          timelineTopic: "literature"
        },
        {
          year: 1719,
          title: "Robinson Crusoe Published",
          description: "Daniel Defoe publishes Robinson Crusoe, often considered the first English novel.",
          details: "Daniel Defoe's Robinson Crusoe is often cited as the first English novel, establishing the realistic narrative style and psychological depth that would characterize the novel form. The work explores themes of survival, civilization, and human nature.",
          category: "Early Novel",
          importance: 4,
          keyFigures: "Daniel Defoe",
          timelineTopic: "literature"
        },
        {
          year: 1813,
          title: "Pride and Prejudice Published",
          description: "Jane Austen publishes Pride and Prejudice, establishing the novel of manners and social commentary.",
          details: "Jane Austen's Pride and Prejudice perfected the novel of manners, combining romance with sharp social observation. Austen's wit, character development, and social commentary established her as one of English literature's greatest novelists.",
          category: "Regency Literature",
          importance: 4,
          keyFigures: "Jane Austen",
          timelineTopic: "literature"
        },
        {
          year: 1859,
          title: "Darwin's Origin of Species",
          description: "Charles Darwin publishes On the Origin of Species, revolutionizing scientific thought and literature.",
          details: "Darwin's Origin of Species transformed not only science but literature, influencing writers' understanding of human nature and society. The work's impact extended beyond science to philosophy, religion, and literary thought.",
          category: "Scientific Literature",
          importance: 5,
          keyFigures: "Charles Darwin",
          timelineTopic: "literature"
        },
        {
          year: 1887,
          title: "Sherlock Holmes Debuts",
          description: "Arthur Conan Doyle introduces Sherlock Holmes in A Study in Scarlet, creating the detective fiction genre.",
          details: "Arthur Conan Doyle's Sherlock Holmes stories created the modern detective fiction genre. Holmes became one of literature's most famous characters, inspiring countless adaptations and establishing the logical detective as a literary archetype.",
          category: "Detective Fiction",
          importance: 4,
          keyFigures: "Arthur Conan Doyle",
          timelineTopic: "literature"
        },
        {
          year: 1922,
          title: "Modernist Revolution",
          description: "T.S. Eliot publishes The Waste Land and James Joyce publishes Ulysses, revolutionizing modern literature.",
          details: "1922 marked a revolutionary year for modernist literature with T.S. Eliot's The Waste Land and James Joyce's Ulysses. These experimental works broke traditional literary forms and established new techniques that influenced literature throughout the 20th century.",
          category: "Modernist Literature",
          importance: 5,
          keyFigures: "T.S. Eliot, James Joyce",
          timelineTopic: "literature"
        },
        {
          year: 1997,
          title: "Harry Potter Published",
          description: "J.K. Rowling publishes Harry Potter and the Philosopher's Stone, creating a global literary phenomenon.",
          details: "J.K. Rowling's Harry Potter series became the best-selling book series in history, reinvigorating children's literature and reading. The series achieved unprecedented global success, spawning films, theme parks, and a lasting cultural impact.",
          category: "Contemporary Literature",
          importance: 4,
          keyFigures: "J.K. Rowling",
          timelineTopic: "literature"
        }
      ];

      for (const event of literatureEvents) {
        await this.createTimelineEvent(event);
      }
    }
  }

  private async initializeBritishHolidaysTimelineIfNeeded() {
    const existingEvents = await db.select().from(timelineEvents).where(eq(timelineEvents.timelineTopic, 'british-holidays'));
    if (existingEvents.length === 0) {
      const holidayEvents: InsertTimelineEvent[] = [
        {
          year: 1066,
          title: "Christmas Traditions Established",
          description: "Norman conquest brings Continental Christmas traditions to Britain, including Christmas feasting and gift-giving.",
          details: "The Norman conquest introduced Continental Christmas traditions that merged with existing Anglo-Saxon customs. Christmas became a major celebration combining religious observance with feasting, gift-giving, and community festivities that continue today.",
          category: "Religious Holiday",
          importance: 4,
          keyFigures: "Norman nobility, medieval clergy",
          timelineTopic: "british-holidays"
        },
        {
          year: 1605,
          title: "Guy Fawkes Night Established",
          description: "The Gunpowder Plot failure leads to the establishment of Guy Fawkes Night (Bonfire Night) on November 5th.",
          details: "After Guy Fawkes and fellow conspirators attempted to blow up Parliament, November 5th became a national celebration. Bonfire Night involves lighting bonfires, burning Guy Fawkes effigies, and fireworks, commemorating the preservation of Protestant monarchy and Parliament.",
          category: "National Holiday",
          importance: 4,
          keyFigures: "Guy Fawkes, King James I",
          timelineTopic: "british-holidays"
        },
        {
          year: 1660,
          title: "Oak Apple Day",
          description: "Charles II's escape and restoration leads to Oak Apple Day celebration on May 29th.",
          details: "Oak Apple Day commemorated Charles II's escape from Parliamentary forces by hiding in an oak tree and his eventual restoration to the throne. Though less celebrated now, it was a major holiday celebrating the monarchy's return after the Commonwealth period.",
          category: "Royal Holiday",
          importance: 3,
          keyFigures: "Charles II",
          timelineTopic: "british-holidays"
        },
        {
          year: 1707,
          title: "Union Day Celebrations",
          description: "Act of Union between England and Scotland creates celebrations of British unity.",
          details: "The political union of England and Scotland was marked by celebrations that emphasized shared British identity. Though not a permanent holiday, these celebrations established precedents for later national commemorations.",
          category: "National Holiday",
          importance: 3,
          keyFigures: "Queen Anne, Union commissioners",
          timelineTopic: "british-holidays"
        },
        {
          year: 1838,
          title: "Boxing Day Formalized",
          description: "Boxing Day becomes an official holiday, traditionally for giving gifts to servants and the poor.",
          details: "Boxing Day, December 26th, became formalized as a holiday when servants and tradespeople received Christmas boxes from their employers. The tradition evolved into a general day of gift-giving and family visits, remaining a major British holiday.",
          category: "Traditional Holiday",
          importance: 4,
          keyFigures: "Victorian employers and servants",
          timelineTopic: "british-holidays"
        },
        {
          year: 1871,
          title: "Bank Holidays Act",
          description: "Sir John Lubbock's Bank Holidays Act creates the first official public holidays in Britain.",
          details: "The Bank Holidays Act established Easter Monday, Whit Monday, the first Monday in August, and Boxing Day as official public holidays. These 'St. Lubbock's Days' gave workers guaranteed time off and established the modern British holiday system.",
          category: "Legal Holiday",
          importance: 5,
          keyFigures: "Sir John Lubbock",
          timelineTopic: "british-holidays"
        },
        {
          year: 1919,
          title: "Remembrance Day Established",
          description: "Armistice Day becomes a national day of remembrance for those who died in World War I.",
          details: "Remembrance Day, observed on November 11th, was established to honor those who died in World War I. The two-minute silence at 11am and poppy wearing traditions became central to British culture, later extended to remember all war dead.",
          category: "Commemoration",
          importance: 5,
          keyFigures: "World War I veterans, King George V",
          timelineTopic: "british-holidays"
        },
        {
          year: 1953,
          title: "Coronation Day Celebration",
          description: "Queen Elizabeth II's coronation creates nationwide celebration and establishes television's role in national events.",
          details: "Elizabeth II's coronation was the first major royal event broadcast on television, watched by 20 million people. The day became a national celebration with street parties, community events, and the beginning of television as the medium for shared national experiences.",
          category: "Royal Holiday",
          importance: 4,
          keyFigures: "Queen Elizabeth II",
          timelineTopic: "british-holidays"
        },
        {
          year: 1977,
          title: "Silver Jubilee Celebrations",
          description: "Queen Elizabeth II's Silver Jubilee creates nationwide community celebrations and street parties.",
          details: "The Silver Jubilee saw millions participate in street parties and community celebrations across Britain. The jubilee established the tradition of community-organized royal celebrations and demonstrated the monarchy's role in bringing communities together.",
          category: "Royal Holiday",
          importance: 4,
          keyFigures: "Queen Elizabeth II, local communities",
          timelineTopic: "british-holidays"
        },
        {
          year: 1995,
          title: "Spring Bank Holiday Moved",
          description: "The late May Bank Holiday is moved to accommodate special occasions like VE Day commemorations.",
          details: "The flexibility of moving bank holidays for special commemorations was demonstrated with VE Day's 50th anniversary. This established the precedent for adjusting holidays to mark significant national anniversaries and royal celebrations.",
          category: "Legal Holiday",
          importance: 3,
          keyFigures: "Government officials",
          timelineTopic: "british-holidays"
        }
      ];

      for (const event of holidayEvents) {
        await this.createTimelineEvent(event);
      }
    }
  }

  private async initializeBritishSportsTimelineIfNeeded() {
    const existingEvents = await db.select().from(timelineEvents).where(eq(timelineEvents.timelineTopic, 'british-sports'));
    if (existingEvents.length === 0) {
      const sportsEvents: InsertTimelineEvent[] = [
        {
          year: 1823,
          title: "Rugby Invented at Rugby School",
          description: "William Webb Ellis allegedly picks up the ball during a football match, inventing rugby.",
          details: "According to legend, William Webb Ellis picked up the ball and ran with it during a football match at Rugby School, creating rugby. Whether true or not, Rugby School codified the rules that became rugby football, spreading throughout the British Empire.",
          category: "Rugby",
          importance: 4,
          keyFigures: "William Webb Ellis, Rugby School",
          timelineTopic: "british-sports"
        },
        {
          year: 1860,
          title: "The Open Championship First Held",
          description: "The first Open Championship (golf) held at Prestwick Golf Club in Scotland.",
          details: "The Open Championship became golf's oldest major championship, held annually in Britain. This established golf's competitive structure and helped spread the sport globally, with British golf courses remaining among the world's most prestigious.",
          category: "Golf",
          importance: 4,
          keyFigures: "Willie Park Sr. (first winner)",
          timelineTopic: "british-sports"
        },
        {
          year: 1872,
          title: "First FA Cup Final",
          description: "The first FA Cup Final held at Kennington Oval, establishing football's premier knockout competition.",
          details: "The FA Cup became the world's oldest football knockout competition, with the first final drawing 2,000 spectators. The competition established traditions that continue today, including the final being held at Wembley Stadium.",
          category: "Football",
          importance: 5,
          keyFigures: "Wanderers FC, Royal Engineers FC",
          timelineTopic: "british-sports"
        },
        {
          year: 1877,
          title: "First Wimbledon Championships",
          description: "The first Wimbledon Lawn Tennis Championships held, establishing tennis's most prestigious tournament.",
          details: "The first Wimbledon Championships attracted 22 men competing for the title. The tournament established traditions including strawberries and cream, the all-white dress code, and grass court tennis that continue to define Wimbledon's unique character.",
          category: "Tennis",
          importance: 5,
          keyFigures: "Spencer Gore (first champion)",
          timelineTopic: "british-sports"
        },
        {
          year: 1895,
          title: "Rugby League Splits from Union",
          description: "Northern rugby clubs form rugby league, allowing professionalism and creating a new sport.",
          details: "Twenty-two rugby clubs from northern England broke away from rugby union to form rugby league, allowing players to be paid. This created two distinct sports and reflected class divisions in British society, with league popular in working-class areas.",
          category: "Rugby",
          importance: 4,
          keyFigures: "Northern rugby club representatives",
          timelineTopic: "british-sports"
        },
        {
          year: 1908,
          title: "London Olympics",
          description: "London hosts the 1908 Olympic Games, establishing Britain's role in international sport.",
          details: "The 1908 London Olympics were the first properly organized modern Olympics, establishing standards for future games. British athletes performed excellently, and the games demonstrated Britain's organizational capabilities and sporting culture.",
          category: "Olympics",
          importance: 4,
          keyFigures: "British Olympic organizers and athletes",
          timelineTopic: "british-sports"
        },
        {
          year: 1923,
          title: "First Wembley Cup Final",
          description: "The first FA Cup Final held at the new Wembley Stadium, establishing it as football's cathedral.",
          details: "The 1923 Cup Final between Bolton and West Ham was the first at new Wembley Stadium. The match, known as the 'White Horse Final' due to crowd control by police on horseback, established Wembley as the home of English football.",
          category: "Football",
          importance: 4,
          keyFigures: "Bolton Wanderers, West Ham United",
          timelineTopic: "british-sports"
        },
        {
          year: 1948,
          title: "London Olympics Post-War",
          description: "London hosts the first post-World War II Olympics, demonstrating Britain's recovery and sporting spirit.",
          details: "The 1948 London Olympics, known as the 'Austerity Olympics,' were held despite post-war rationing and economic challenges. The games demonstrated British resilience and established London's reputation for successful major sporting events.",
          category: "Olympics",
          importance: 4,
          keyFigures: "Post-war British Olympic organizers",
          timelineTopic: "british-sports"
        },
        {
          year: 1966,
          title: "England Wins World Cup",
          description: "England defeats West Germany 4-2 at Wembley to win their first and only FIFA World Cup.",
          details: "England's World Cup victory was the pinnacle of British football achievement. Geoff Hurst's hat-trick in the final and Bobby Moore lifting the trophy created lasting memories and established football as central to British national identity.",
          category: "Football",
          importance: 5,
          keyFigures: "Bobby Moore, Geoff Hurst, Alf Ramsey",
          timelineTopic: "british-sports"
        },
        {
          year: 2012,
          title: "London Olympics Success",
          description: "London successfully hosts the Olympic Games, with Team GB achieving third place in the medal table.",
          details: "The 2012 London Olympics showcased modern Britain's organizational excellence and sporting prowess. Team GB's success, including Mo Farah's double gold and Bradley Wiggins' cycling achievements, inspired a generation and left lasting sporting facilities.",
          category: "Olympics",
          importance: 5,
          keyFigures: "Mo Farah, Bradley Wiggins, Jessica Ennis-Hill",
          timelineTopic: "british-sports"
        }
      ];

      for (const event of sportsEvents) {
        await this.createTimelineEvent(event);
      }
    }
  }

  // Admin methods
  async updateUserRole(userId: string, role: string): Promise<boolean> {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    
    return !!updatedUser;
  }

  async getAllUsers(options?: { page?: number; limit?: number; role?: string }): Promise<User[]> {
    let query = db.select().from(users);
    
    // Apply role filter if provided
    if (options?.role) {
      query = query.where(eq(users.role, options.role));
    }
    
    // Apply pagination if provided
    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.limit(options.limit).offset(offset);
    }
    
    return await query;
  }

  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; adminUsers: number; }> {
    const allUsers = await db.select().from(users);
    
    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(user => 
        user.subscriptionStatus === 'active' || 
        (user.subscriptionStatus !== 'canceled' && user.overallProgress > 0)
      ).length,
      adminUsers: allUsers.filter(user => user.role === 'admin' || user.role === 'superadmin').length
    };
  }

  async updateUserSuspension(userId: string, suspended: boolean, reason?: string): Promise<boolean> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isSuspended: suspended,
        suspensionReason: reason || null
      })
      .where(eq(users.id, userId))
      .returning();
    
    return !!updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const [deletedUser] = await db
      .update(users)
      .set({ 
        isDeleted: true,
        deletedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return !!deletedUser;
  }

  async getAllUsers(options?: { page?: number; limit?: number; role?: string }): Promise<User[]> {
    let whereConditions = [eq(users.isDeleted, false)];
    
    if (options?.role) {
      whereConditions.push(eq(users.role, options.role));
    }
    
    let query = db.select().from(users).where(and(...whereConditions));
    
    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.limit(options.limit).offset(offset);
    }
    
    return await query;
  }

  async getTotalUserCount(): Promise<number> {
    const result = await db.select().from(users).where(eq(users.isDeleted, false));
    return result.length;
  }

  async getActiveUserCount(): Promise<number> {
    const allUsers = await db.select().from(users).where(eq(users.isDeleted, false));
    return allUsers.filter(user => 
      user.subscriptionStatus === 'active' || 
      (user.subscriptionStatus !== 'canceled' && user.overallProgress && user.overallProgress > 0)
    ).length;
  }

  async getSubscriptionStats(): Promise<{ premium: number; free: number; total: number }> {
    const allUsers = await db.select().from(users).where(eq(users.isDeleted, false));
    const premiumUsers = allUsers.filter(user => user.subscriptionType === 'premium').length;
    const freeUsers = allUsers.filter(user => !user.subscriptionType || user.subscriptionType === 'free').length;
    
    return {
      premium: premiumUsers,
      free: freeUsers,
      total: allUsers.length
    };
  }

  async getRecentSignups(days: number): Promise<number> {
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const allUsers = await db.select().from(users);
    // Since we don't have createdAt in our schema, we'll return 0 for now
    // In a real app, you'd filter by createdAt field
    return allUsers.length; // This would be filtered by createdAt >= cutoffDate
  }

  async createAuditLog(log: { adminId: string; action: string; targetUserId?: string; details?: any; timestamp: Date }): Promise<void> {
    await db.insert(adminAuditLogs).values({
      adminUserId: log.adminId,
      action: log.action,
      entity: 'user', // Default entity type
      entityId: log.targetUserId || 'system',
      before: null,
      after: log.details ? JSON.stringify(log.details) : null,
      ip: null
    });
  }

  async getAuditLogs(options: { page: number; limit: number }): Promise<AdminAuditLog[]> {
    const offset = (options.page - 1) * options.limit;
    
    const logs = await db.select()
      .from(adminAuditLogs)
      .limit(options.limit)
      .offset(offset);
    
    return logs;
  }

  // Video Module Methods
  async getAllVideoModules(): Promise<VideoModule[]> {
    return await db
      .select()
      .from(videoModules)
      .orderBy(videoModules.orderIndex, videoModules.title);
  }

  async getVideoModule(id: string): Promise<VideoModule | null> {
    const result = await db
      .select()
      .from(videoModules)
      .where(eq(videoModules.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createVideoModule(data: InsertVideoModule): Promise<VideoModule> {
    const result = await db
      .insert(videoModules)
      .values(data)
      .returning();
    
    return result[0];
  }

  async updateVideoModule(id: string, data: Partial<InsertVideoModule>): Promise<VideoModule | null> {
    const result = await db
      .update(videoModules)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(videoModules.id, id))
      .returning();
    
    return result[0] || null;
  }

  async deleteVideoModule(id: string): Promise<boolean> {
    const result = await db
      .delete(videoModules)
      .where(eq(videoModules.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Video Resources methods
  async getVideoResources(videoId: string): Promise<VideoResource[]> {
    return await db
      .select()
      .from(videoResources)
      .where(eq(videoResources.videoId, videoId))
      .orderBy(videoResources.createdAt);
  }

  async createVideoResource(resource: InsertVideoResource): Promise<VideoResource> {
    const result = await db
      .insert(videoResources)
      .values(resource)
      .returning();
    
    return result[0];
  }

  async updateVideoResource(id: string, updates: Partial<InsertVideoResource>): Promise<VideoResource> {
    const result = await db
      .update(videoResources)
      .set(updates)
      .where(eq(videoResources.id, id))
      .returning();
    
    return result[0];
  }

  async deleteVideoResource(id: string): Promise<boolean> {
    const result = await db
      .delete(videoResources)
      .where(eq(videoResources.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Video Audio methods
  async getVideoAudio(videoId: string): Promise<VideoAudio[]> {
    return await db
      .select()
      .from(videoAudio)
      .where(eq(videoAudio.videoId, videoId))
      .orderBy(videoAudio.createdAt);
  }

  async createVideoAudio(audio: InsertVideoAudio): Promise<VideoAudio> {
    const result = await db
      .insert(videoAudio)
      .values(audio)
      .returning();
    
    return result[0];
  }

  async updateVideoAudio(id: string, updates: Partial<InsertVideoAudio>): Promise<VideoAudio> {
    const result = await db
      .update(videoAudio)
      .set(updates)
      .where(eq(videoAudio.id, id))
      .returning();
    
    return result[0];
  }

  async deleteVideoAudio(id: string): Promise<boolean> {
    const result = await db
      .delete(videoAudio)
      .where(eq(videoAudio.id, id))
      .returning();
    
    return result.length > 0;
  }

  async getUserVideoProgress(userId: string): Promise<UserVideoProgress[]> {
    return await db
      .select()
      .from(userVideoProgress)
      .where(eq(userVideoProgress.userId, userId));
  }

  async updateVideoProgress(data: InsertUserVideoProgress): Promise<UserVideoProgress> {
    // Check if progress already exists
    const existing = await db
      .select()
      .from(userVideoProgress)
      .where(
        and(
          eq(userVideoProgress.userId, data.userId),
          eq(userVideoProgress.videoId, data.videoId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing progress
      const result = await db
        .update(userVideoProgress)
        .set({
          progress: data.progress,
          completed: data.completed,
          lastWatchedAt: data.lastWatchedAt,
        })
        .where(eq(userVideoProgress.id, existing[0].id))
        .returning();
      
      return result[0];
    } else {
      // Create new progress
      const result = await db
        .insert(userVideoProgress)
        .values(data)
        .returning();
      
      return result[0];
    }
  }

  // Delete methods for admin content management
  async deleteResource(id: string): Promise<boolean> {
    const result = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning();
    
    return result.length > 0;
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await db
      .delete(exercises)
      .where(eq(exercises.id, id))
      .returning();
    
    return result.length > 0;
  }

  async deletePracticeTest(id: string): Promise<boolean> {
    const result = await db
      .delete(practiceTests)
      .where(eq(practiceTests.id, id))
      .returning();
    
    return result.length > 0;
  }

  async deleteTimelineEvent(id: string): Promise<boolean> {
    const result = await db
      .delete(timelineEvents)
      .where(eq(timelineEvents.id, id))
      .returning();
    
    return result.length > 0;
  }

  async getAllExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  // Enhanced Test Management Methods

  // Enhanced Practice Test Methods
  async getAllPracticeTests(options?: { page?: number; limit?: number; category?: string; difficulty?: number; status?: string }): Promise<PracticeTest[]> {
    let query = db.select().from(practiceTests);
    
    if (options?.category) {
      query = query.where(eq(practiceTests.category, options.category));
    }
    
    if (options?.difficulty) {
      query = query.where(eq(practiceTests.difficulty, options.difficulty));
    }
    
    if (options?.status === 'active') {
      query = query.where(eq(practiceTests.isActive, true));
    } else if (options?.status === 'inactive') {
      query = query.where(eq(practiceTests.isActive, false));
    }
    
    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.limit(options.limit).offset(offset);
    }
    
    return await query.orderBy(practiceTests.orderIndex);
  }

  async updatePracticeTest(id: string, data: Partial<InsertPracticeTest>): Promise<PracticeTest | null> {
    const result = await db.update(practiceTests).set(data).where(eq(practiceTests.id, id)).returning();
    return result[0] || null;
  }

  async deletePracticeTest(id: string): Promise<boolean> {
    const result = await db.delete(practiceTests).where(eq(practiceTests.id, id));
    return result.rowCount > 0;
  }

  // Enhanced Mock Test Methods
  async getMockTests(options?: { page?: number; limit?: number; category?: string; difficulty?: number; status?: string }): Promise<MockTest[]> {
    let query = db.select().from(mockTests);
    
    if (options?.category) {
      query = query.where(eq(mockTests.category, options.category));
    }
    
    if (options?.difficulty) {
      query = query.where(eq(mockTests.difficulty, options.difficulty));
    }
    
    if (options?.status === 'active') {
      query = query.where(eq(mockTests.isActive, true));
    } else if (options?.status === 'inactive') {
      query = query.where(eq(mockTests.isActive, false));
    }
    
    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.limit(options.limit).offset(offset);
    }
    
    return await query.orderBy(mockTests.orderIndex);
  }

  async updateMockTest(id: string, data: Partial<InsertMockTest>): Promise<MockTest | null> {
    const result = await db.update(mockTests).set(data).where(eq(mockTests.id, id)).returning();
    return result[0] || null;
  }

  async deleteMockTest(id: string): Promise<boolean> {
    const result = await db.delete(mockTests).where(eq(mockTests.id, id));
    return result.rowCount > 0;
  }

  // Test Analytics Methods
  async getTestAnalytics(testId: string, testType: 'practice' | 'mock'): Promise<{
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    completionRate: number;
  }> {
    const attempts = testType === 'practice' 
      ? await db.select().from(practiceTestAttempts).where(eq(practiceTestAttempts.testId, testId))
      : await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.mockTestId, testId));

    if (attempts.length === 0) {
      return { totalAttempts: 0, averageScore: 0, passRate: 0, completionRate: 0 };
    }

    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / totalAttempts;
    const passedAttempts = attempts.filter(attempt => attempt.passedTest).length;
    const passRate = (passedAttempts / totalAttempts) * 100;
    const completionRate = 100; // Assuming all attempts are completed

    return {
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      completionRate
    };
  }

  async getComprehensiveTestAnalytics(options: {
    testId?: string;
    testType?: 'practice' | 'mock';
    timeRange?: string;
    category?: string;
  }): Promise<any> {
    try {
      console.log('Getting comprehensive test analytics with options:', options);
      
      // Get all tests based on type
      let tests = [];
      if (options.testType === 'practice') {
        tests = await this.getAllPracticeTests();
      } else if (options.testType === 'mock') {
        tests = await this.getMockTests();
      } else {
        const practiceTests = await this.getAllPracticeTests();
        const mockTests = await this.getMockTests();
        tests = [...practiceTests, ...mockTests];
      }
      
      console.log('Found tests:', tests.length);

      // Get test attempts from both practice and mock tests
      const [practiceAttempts, mockAttempts] = await Promise.all([
        db.select().from(practiceTestAttempts),
        db.select().from(mockTestAttempts)
      ]);
      
      console.log('Found practice attempts:', practiceAttempts.length);
      console.log('Found mock attempts:', mockAttempts.length);
      
      // Combine all attempts with proper structure
      const allAttempts = [
        ...practiceAttempts.map(attempt => ({
          ...attempt,
          testId: attempt.testId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt,
          timeSpent: 0 // Practice tests don't track time
        })),
        ...mockAttempts.map(attempt => ({
          ...attempt,
          testId: attempt.mockTestId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt,
          timeSpent: attempt.timeSpent
        }))
      ];
      
      console.log('Total attempts:', allAttempts.length);
      
      // Calculate basic metrics
      const totalTests = tests.length;
      const totalAttempts = allAttempts.length;
      
      // Calculate average score (convert raw scores to percentages)
      const scores = allAttempts.map(attempt => {
        const rawScore = attempt.score || 0;
        const totalQuestions = attempt.totalQuestions || 24;
        return (rawScore / totalQuestions) * 100;
      });
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      // Calculate pass rate (assuming 75% is passing)
      const passedAttempts = allAttempts.filter(attempt => {
        const rawScore = attempt.score || 0;
        const totalQuestions = attempt.totalQuestions || 24;
        const percentage = (rawScore / totalQuestions) * 100;
        return percentage >= 75;
      }).length;
      const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
      
      // Calculate completion rate
      const completedAttempts = allAttempts.filter(attempt => attempt.completedAt).length;
      const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;
      
      // Calculate average time spent
      const timeSpentValues = allAttempts
        .filter(attempt => attempt.timeSpent)
        .map(attempt => attempt.timeSpent || 0);
      const averageTimeSpent = timeSpentValues.length > 0 
        ? timeSpentValues.reduce((a, b) => a + b, 0) / timeSpentValues.length 
        : 0;

      // Category breakdown
      const categoryBreakdown = tests.reduce((acc: Record<string, any>, test: any) => {
        const category = test.category || 'General';
        if (!acc[category]) {
          acc[category] = { category, attempts: 0, averageScore: 0, passRate: 0 };
        }
        return acc;
      }, {} as Record<string, any>);

      // Calculate category metrics
      Object.keys(categoryBreakdown).forEach(category => {
        const categoryTests = tests.filter((test: any) => (test.category || 'General') === category);
        const categoryAttempts = allAttempts.filter(attempt => 
          categoryTests.some((test: any) => test.id === attempt.testId)
        );
        
        categoryBreakdown[category].attempts = categoryAttempts.length;
        if (categoryAttempts.length > 0) {
          const scores = categoryAttempts.map(attempt => {
            const rawScore = attempt.score || 0;
            const totalQuestions = attempt.totalQuestions || 24;
            return (rawScore / totalQuestions) * 100;
          });
          categoryBreakdown[category].averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          const passed = categoryAttempts.filter(attempt => {
            const rawScore = attempt.score || 0;
            const totalQuestions = attempt.totalQuestions || 24;
            const percentage = (rawScore / totalQuestions) * 100;
            return percentage >= 75;
          }).length;
          categoryBreakdown[category].passRate = (passed / categoryAttempts.length) * 100;
        }
      });

      // Recent attempts (last 10)
      const recentAttempts = allAttempts
        .sort((a, b) => new Date(b.completedAt || new Date()).getTime() - new Date(a.completedAt || new Date()).getTime())
        .slice(0, 10)
        .map(attempt => {
          const rawScore = attempt.score || 0;
          const totalQuestions = attempt.totalQuestions || 24;
          const percentage = (rawScore / totalQuestions) * 100;
          return {
            id: attempt.id,
            userId: attempt.userId,
            testId: attempt.testId,
            score: Math.round(percentage * 100) / 100,
            totalQuestions: totalQuestions,
            passed: percentage >= 75,
            timeSpent: attempt.timeSpent || 0,
            completedAt: attempt.completedAt?.toISOString() || ''
          };
        });

      // Top performing tests
      const testPerformance = tests.map((test: any) => {
        const testAttempts = allAttempts.filter(attempt => attempt.testId === test.id);
        const scores = testAttempts.map(attempt => {
          const rawScore = attempt.score || 0;
          const totalQuestions = attempt.totalQuestions || 24;
          return (rawScore / totalQuestions) * 100;
        });
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const passed = testAttempts.filter(attempt => {
          const rawScore = attempt.score || 0;
          const totalQuestions = attempt.totalQuestions || 24;
          const percentage = (rawScore / totalQuestions) * 100;
          return percentage >= 75;
        }).length;
        const passRate = testAttempts.length > 0 ? (passed / testAttempts.length) * 100 : 0;
        
        return {
          testId: test.id,
          title: test.title,
          attempts: testAttempts.length,
          averageScore,
          passRate
        };
      }).sort((a: any, b: any) => b.averageScore - a.averageScore).slice(0, 10);

      // Struggling areas (categories with low performance)
      const strugglingAreas = Object.values(categoryBreakdown)
        .filter((cat: any) => cat.attempts > 0)
        .map((cat: any) => ({
          category: cat.category,
          averageScore: cat.averageScore,
          attempts: cat.attempts,
          improvement: 0 // This would need historical data to calculate
        }))
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 5);

      const result = {
        totalTests,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        averageTimeSpent: Math.round(averageTimeSpent),
        categoryBreakdown: Object.values(categoryBreakdown),
        difficultyBreakdown: [], // Would need difficulty field in tests
        recentAttempts,
        topPerformingTests: testPerformance,
        strugglingAreas
      };
      
      console.log('Analytics result:', result);
      return result;
    } catch (error) {
      console.error('Error getting comprehensive test analytics:', error);
      return {
        totalTests: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        completionRate: 0,
        averageTimeSpent: 0,
        categoryBreakdown: [],
        difficultyBreakdown: [],
        recentAttempts: [],
        topPerformingTests: [],
        strugglingAreas: []
      };
    }
  }

  // Enhanced analytics methods
  async getUserGrowthAnalytics(timeRange: string = '30d'): Promise<{
    daily: Array<{ date: string; users: number }>;
    weekly: Array<{ week: string; users: number }>;
    monthly: Array<{ month: string; users: number }>;
  }> {
    try {
      // For now, return mock data since we don't have createdAt timestamps
      // In a real implementation, you'd query the database with date ranges
      const now = new Date();
      const daily = [];
      const weekly = [];
      const monthly = [];

      // Generate mock daily data for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        daily.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 10) + 1
        });
      }

      // Generate mock weekly data for the last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekly.push({
          week: `Week ${12 - i}`,
          users: Math.floor(Math.random() * 50) + 10
        });
      }

      // Generate mock monthly data for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now);
        month.setMonth(month.getMonth() - i);
        monthly.push({
          month: month.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          users: Math.floor(Math.random() * 200) + 50
        });
      }

      return { daily, weekly, monthly };
    } catch (error) {
      console.error('Error getting user growth analytics:', error);
      return { daily: [], weekly: [], monthly: [] };
    }
  }

  async getContentPerformanceAnalytics(): Promise<{
    videos: Array<{ title: string; views: number; completionRate: number }>;
    exercises: Array<{ title: string; attempts: number; successRate: number }>;
    tests: Array<{ title: string; completions: number; averageScore: number }>;
  }> {
    try {
      // Get video modules
      const videoModules = await this.getAllVideoModules();
      const videos = videoModules.map(module => ({
        title: module.title,
        views: Math.floor(Math.random() * 1000) + 100, // Mock data
        completionRate: Math.floor(Math.random() * 40) + 60 // 60-100%
      }));

      // Get practice tests
      const practiceTests = await this.getAllPracticeTests();
      const tests = practiceTests.slice(0, 10).map(test => ({
        title: test.title,
        completions: Math.floor(Math.random() * 100) + 10, // Mock data
        averageScore: Math.floor(Math.random() * 30) + 70 // 70-100%
      }));

      // Mock exercises data
      const exercises = [
        { title: 'Reading Comprehension', attempts: 150, successRate: 85 },
        { title: 'Listening Skills', attempts: 120, successRate: 78 },
        { title: 'Writing Practice', attempts: 90, successRate: 72 },
        { title: 'Speaking Exercises', attempts: 80, successRate: 68 }
      ];

      return { videos, exercises, tests };
    } catch (error) {
      console.error('Error getting content performance analytics:', error);
      return { videos: [], exercises: [], tests: [] };
    }
  }

  async getRevenueAnalytics(): Promise<{
    monthly: number;
    yearly: number;
    growth: number;
    subscriptionBreakdown: { premium: number; free: number };
  }> {
    try {
      const subscriptionStats = await this.getSubscriptionStats();
      
      // Mock revenue data - in a real app, you'd calculate from actual payments
      const monthly = subscriptionStats.premium * 29.99; // Assuming £29.99/month
      const yearly = monthly * 12;
      const growth = Math.floor(Math.random() * 20) + 5; // 5-25% growth

      return {
        monthly: Math.round(monthly * 100) / 100,
        yearly: Math.round(yearly * 100) / 100,
        growth,
        subscriptionBreakdown: {
          premium: subscriptionStats.premium,
          free: subscriptionStats.free
        }
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return {
        monthly: 0,
        yearly: 0,
        growth: 0,
        subscriptionBreakdown: { premium: 0, free: 0 }
      };
    }
  }

  async getEngagementAnalytics(): Promise<{
    averageSessionTime: number;
    pageViews: number;
    uniqueVisitors: number;
    returnVisitors: number;
  }> {
    try {
      // Mock engagement data - in a real app, you'd track this with analytics
      return {
        averageSessionTime: Math.floor(Math.random() * 20) + 15, // 15-35 minutes
        pageViews: Math.floor(Math.random() * 10000) + 5000, // 5k-15k
        uniqueVisitors: Math.floor(Math.random() * 2000) + 1000, // 1k-3k
        returnVisitors: Math.floor(Math.random() * 500) + 200 // 200-700
      };
    } catch (error) {
      console.error('Error getting engagement analytics:', error);
      return {
        averageSessionTime: 0,
        pageViews: 0,
        uniqueVisitors: 0,
        returnVisitors: 0
      };
    }
  }

  // Bulk Operations
  async bulkUpdateTests(testIds: string[], updates: any, testType: 'practice' | 'mock'): Promise<{
    successCount: number;
    errorCount: number;
    errors: string[];
  }> {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const testId of testIds) {
      try {
        if (testType === 'practice') {
          await this.updatePracticeTest(testId, updates);
        } else {
          await this.updateMockTest(testId, updates);
        }
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Failed to update test ${testId}: ${error}`);
      }
    }

    return { successCount, errorCount, errors };
  }

  async bulkDeleteTests(testIds: string[], testType: 'practice' | 'mock'): Promise<{
    successCount: number;
    errorCount: number;
    errors: string[];
  }> {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const testId of testIds) {
      try {
        if (testType === 'practice') {
          await this.deletePracticeTest(testId);
        } else {
          await this.deleteMockTest(testId);
        }
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Failed to delete test ${testId}: ${error}`);
      }
    }

    return { successCount, errorCount, errors };
  }

  // Import/Export Methods
  async exportTests(testType: string, format: string): Promise<any> {
    if (testType === 'practice') {
      return await this.getAllPracticeTests();
    } else if (testType === 'mock') {
      return await this.getMockTests();
    }
    return [];
  }

  async importTests(tests: any[], testType: string, overwrite: boolean): Promise<{
    successCount: number;
    errorCount: number;
    errors: string[];
  }> {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const test of tests) {
      try {
        if (testType === 'practice') {
          await this.createPracticeTest(test);
        } else if (testType === 'mock') {
          await this.createMockTest(test);
        }
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Failed to import test ${test.title}: ${error}`);
      }
    }

    return { successCount, errorCount, errors };
  }

  async exportTestAnalyticsToCSV(analytics: any): Promise<string> {
    // Simple CSV export implementation
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Tests', analytics.totalTests],
      ['Total Attempts', analytics.totalAttempts],
      ['Average Score', analytics.averageScore],
      ['Pass Rate', analytics.passRate]
    ];

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }
}

export const storage = new DatabaseStorage();