CREATE TABLE "admin_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" varchar NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"ip" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"exercise_id" varchar NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content" jsonb NOT NULL,
	"topic" text NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order_index" integer NOT NULL,
	"total_items" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_test_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mock_test_id" varchar NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer DEFAULT 24 NOT NULL,
	"passed_test" boolean NOT NULL,
	"time_spent" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mock_tests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"questions" jsonb NOT NULL,
	"order_index" integer NOT NULL,
	"difficulty" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_test_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"test_id" varchar NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer DEFAULT 24 NOT NULL,
	"passed_test" boolean NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_tests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"questions" jsonb NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_size" text NOT NULL,
	"file_type" text NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"details" text,
	"category" text NOT NULL,
	"importance" integer DEFAULT 1 NOT NULL,
	"key_figures" text,
	"timeline_topic" text NOT NULL,
	"event_image" text,
	"image_description" text
);
--> statement-breakpoint
CREATE TABLE "user_module_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"completed_items" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_video_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"video_id" varchar NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"watch_time" integer DEFAULT 0 NOT NULL,
	"last_watched" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"overall_progress" integer DEFAULT 0 NOT NULL,
	"total_study_time" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_type" text,
	"subscription_status" text,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"suspension_reason" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "video_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"video_url" text NOT NULL,
	"duration" integer NOT NULL,
	"thumbnail" text,
	"category" text NOT NULL,
	"order_index" integer NOT NULL,
	"detailed_content" text,
	"key_images" jsonb,
	"audio_script" text,
	"video_type" text DEFAULT 'uploaded' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"difficulty" text DEFAULT 'intermediate',
	"tags" jsonb,
	"additional_content" text,
	"instructor_notes" text,
	"student_notes" text,
	"key_points" text,
	"prerequisites" text,
	"follow_up_actions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_test_attempts" ADD CONSTRAINT "mock_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_test_attempts" ADD CONSTRAINT "mock_test_attempts_mock_test_id_mock_tests_id_fk" FOREIGN KEY ("mock_test_id") REFERENCES "public"."mock_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_test_attempts" ADD CONSTRAINT "practice_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_test_attempts" ADD CONSTRAINT "practice_test_attempts_test_id_practice_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."practice_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_video_progress" ADD CONSTRAINT "user_video_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_video_progress" ADD CONSTRAINT "user_video_progress_video_id_video_modules_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video_modules"("id") ON DELETE no action ON UPDATE no action;