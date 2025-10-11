CREATE TABLE "book_chunks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" varchar NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"page_number" integer,
	"chapter_title" text,
	"section_title" text,
	"embedding" text,
	"token_count" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"isbn" text,
	"description" text,
	"file_path" text,
	"total_pages" integer,
	"total_chunks" integer DEFAULT 0,
	"is_processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"game_type" text NOT NULL,
	"difficulty" text DEFAULT 'intermediate' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"game_data" jsonb,
	"instructions" text,
	"estimated_time" integer,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_tests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" varchar NOT NULL,
	"topic_id" varchar,
	"title" text NOT NULL,
	"description" text,
	"test_type" text NOT NULL,
	"questions" jsonb NOT NULL,
	"difficulty" text DEFAULT 'intermediate',
	"time_limit" integer,
	"passing_score" integer DEFAULT 70,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_topics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"chapter_number" integer,
	"order_index" integer NOT NULL,
	"difficulty" text DEFAULT 'intermediate',
	"prerequisites" text,
	"key_points" jsonb,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_test_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"test_id" varchar NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer,
	"is_passed" boolean,
	"time_spent" integer,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "video_audio" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"duration" text,
	"quality" text,
	"uploaded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"size" text,
	"uploaded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "book_chunks" ADD CONSTRAINT "book_chunks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_tests" ADD CONSTRAINT "generated_tests_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_tests" ADD CONSTRAINT "generated_tests_topic_id_generated_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."generated_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_topics" ADD CONSTRAINT "generated_topics_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_test_attempts" ADD CONSTRAINT "user_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_test_attempts" ADD CONSTRAINT "user_test_attempts_test_id_generated_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."generated_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_audio" ADD CONSTRAINT "video_audio_video_id_video_modules_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_resources" ADD CONSTRAINT "video_resources_video_id_video_modules_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video_modules"("id") ON DELETE no action ON UPDATE no action;