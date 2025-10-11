# Life in UK Test E-Learning Platform

## Overview
This is a full-stack web application serving as an e-learning platform for Life in UK test preparation. It offers video modules, interactive exercises, historical timeline exploration, and downloadable resources. The platform aims to provide comprehensive tools to help users prepare for the official UK citizenship test, covering areas such as UK history, culture, government, and geography. Key capabilities include customizable game variants with progression encouragement, an interactive UK map with cultural regions, and a wide array of matching games covering various topics like traditional foods, places of interest, prime ministers, rulers, acts, battles, international memberships, religion & demographics, and the justice system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **UI Components**: Shadcn/ui (with Radix UI primitives)
- **Styling**: Tailwind CSS (custom UK-themed color palette)
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Design System**: Comprehensive design system based on Shadcn/ui, consistent styling with CSS custom properties, responsive design, UK-themed color palette, dark mode support.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **AI Integration**: OpenAI GPT-4o for dynamic exercise generation (contextual fill-in-the-blank, multiple choice with explanations, difficulty scaling, topic-specific content).
- **Build Tool**: Vite for frontend bundling, esbuild for backend compilation

### System Design Choices
- **Key Components**: Database Schema (Users, Video Modules, User Video Progress, Timeline Events, Exercises, Exercise Attempts, Learning Modules, User Module Progress, Resources), AI-Powered Exercise Generation, UI Component System.
- **Data Flow**: RESTful API endpoints (Express.js), TanStack Query for client-side caching and synchronization, React useState/useReducer for local state, React Hook Form for form state, Wouter for URL state.
- **System Diagrams Feature**: Visual diagrams section for UK government, justice, and parliament systems (including executive, legislative, judicial branches; regional justice systems; and parliamentary structure).
- **Timeline Features**: Comprehensive historical timeline (Prehistoric to 21st Century), Church Evolution timeline, Inventions & Discoveries timeline, Population & Migration timeline, Sports & Athletics timeline, Music/Arts/Visual timeline, Literature timeline, British Holidays timeline, and British Sports timeline.
- **Game Mechanics**: Interactive matching games (triple-column, category filtering, immediate feedback, confetti celebrations, progression tracking), True/False challenge game.

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (serverless PostgreSQL)
- **AI Service**: OpenAI API
- **Development**: Replit (with cartographer plugin)

### Key Libraries
- **UI Framework**: React 18
- **Styling**: Tailwind CSS, PostCSS
- **Database**: Drizzle ORM, Drizzle Kit
- **Validation**: Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Integrations
- **Amazon Book Purchase Integration**: Links to official Life in UK Test book on Amazon UK and US.
- **Stripe Payment Processing**: Secure payment system with three pricing tiers in British Pounds (GBP).

## Recent Feature Updates

### Stripe Payment System Implementation (February 1, 2025)
- **Complete payment integration** with three pricing tiers accessible via blue user profile icon in dashboard header
- **Learning App Access (£60)** - One-off payment for 3 months complete platform access, ideal for intensive study preparation
- **Group Video Sessions (£80)** - Premium package with live group video calls and UK test specialist support  
- **Citizenship Application Guidance (£30)** - Dedicated support for completing UK citizenship application forms
- **Professional payment interface** with feature comparisons, secure Stripe forms, and celebration success page
- **User profile management** with subscription badges, progress tracking, and easy access to payment options
- **Database schema enhanced** to track subscription types, status, and Stripe customer information

### Customizable Game Variants with Progression Encouragement (January 31, 2025)
- Added variant selection system for all matching games: students can choose between 4, 6, 8, or 12 items
- Implemented VariantSelector component with difficulty progression: Starter (4), Standard (6), Advanced (8), Master (12)
- Created GameCompletionEncouragement component that celebrates completing all variants and guides students to next games
- Enhanced General Matching and Sports Heroes games with full variant support and completion tracking
- Added automatic progression system that encourages students to move to next matching game group after mastering all variants
- Color-coded difficulty levels: Easy (Green), Medium (Blue), Hard (Orange), Expert (Purple)
- Statistics tracking shows completion status and encourages systematic learning progression
- Confetti celebrations for both individual matches and complete variant mastery
- Comprehensive "How to Play" instructions for each difficulty level and variant selection

### Enhanced Timeline Content Implementation (February 6, 2025)
- **Population & Migration Timeline** - Complete migration history from Norman Conquest to modern Eastern European migration, including Windrush Generation, Irish Famine migration, and Jewish immigration waves
- **Sports & Athletics Timeline** - Development of British sports from Football Association founding (1863) to 2012 London Olympics success
- **Music/Arts/Visual Timeline** - Cultural evolution from Elizabethan theatre to Britpop movement, including Beatles emergence, Swinging London, and contemporary electronic music innovation  
- **Literature Timeline** - Literary development from Beowulf through Shakespeare to contemporary Harry Potter phenomenon
- **British Holidays Timeline** - Evolution of British celebrations from Guy Fawkes Night to modern bank holidays and royal commemorations
- **British Sports Timeline** - Sporting heritage from rugby invention at Rugby School to England's 1966 World Cup victory and Olympic achievements
- **AI Exercise Optimization** - Limited AI-generated exercises to maximum 12 questions (reduced from 15-25) for improved attention management and user experience

### Video Upload System Enhancement (February 6, 2025)
- **Complete Video Integration** - Uploaded videos now properly display in their assigned categories and are fully watchable by students
- **Dual Video Support** - System handles both uploaded MP4 files (via HTML5 video player) and external YouTube/embedded videos (via iframe)
- **Category Organization** - Videos automatically group by category (Government, History, Geography, Culture) with proper visual indicators
- **Student Accessibility** - All uploaded videos are immediately available to students with full controls (play, pause, volume, fullscreen)
- **Fallback Thumbnails** - Videos without custom thumbnails display professional placeholder with play icon
- **Seamless Playback** - Uploaded videos use native HTML5 player while external videos use iframe embedding for optimal compatibility

### AI-Powered Study Assistant Chatbot (February 6, 2025)
- **Floating Chatbot Widget** - Fixed position chatbot in bottom-right corner that follows users as they scroll through any page
- **Comprehensive Knowledge Base** - Complete Life in UK handbook information including detailed British history, government structure, cultural traditions, and geography
- **Authentic Content** - Accurate dates, names, and facts from official test materials covering Stone Age to modern Britain, all political systems, and cultural practices
- **Smart Error Handling** - Robust fallback responses ensure students always receive helpful information even during API rate limits
- **Enhanced Formatting** - Well-structured responses with bullet points and clear sections for optimal readability in chat interface
- **Interactive Features** - Real-time conversation with typing indicators, contextual follow-up suggestions, and expandable/minimizable interface
- **Educational Focus** - Designed specifically for citizenship test preparation with comprehensive coverage of all test topics and structured learning guidance

### AI Exercises Game Integration (February 6, 2025)
- **Dedicated AI Exercises Section** - Moved AI-generated exercises from dashboard to games page as separate category
- **Enhanced AI Exercise Interface** - Comprehensive topic selection with 7 categories including Government, History, Culture, Values, Geography, Sports, and Legal System
- **Difficulty Level Selection** - Three difficulty levels (Beginner, Intermediate, Advanced) with 8-12 questions per exercise
- **Topic-Based Generation** - Students can choose specific topics with detailed descriptions and visual icons
- **Improved User Experience** - Better exercise display with progress tracking, explanations, and score feedback
- **Games Page Integration** - AI Exercises now prominently featured as first tab in games section with purple branding
- **Student Progress Statistics** - Comprehensive category-based progress tracking showing performance across 6 Life in UK test areas

### Authentic Life in UK Content Integration (August 14, 2025)
- **Official Study Guide Integration** - Updated AI service to use only verified facts from lifeintheuktests.co.uk official study guide
- **Interactive Text Passages** - AI exercises now generate complete readable paragraphs with clickable highlighted words for multiple choice selection
- **Authentic Historical Content** - All generated text uses real dates (1066, AD 43, AD 410), genuine historical figures (William the Conqueror, Boudicca, Julius Caesar), and verified landmarks (Stonehenge, Hadrian's Wall, Skara Brae)
- **Fill-in-the-Blank Format** - Students click on dashed underlined words to select from 4 authentic answer options within flowing text passages
- **Verified Population Data** - Uses official population statistics and growth figures from the handbook
- **Real Government Structure** - Incorporates authentic UK values (Democracy, Rule of law, Individual liberty) and constitutional information
- **Plagiarism-Free Educational Content** - All generated passages are educationally sound while being completely original and based on verified official sources