CREATE TABLE "diagram_components" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diagram_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"background_color" text,
	"border_color" text,
	"text_color" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diagrams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"section" text NOT NULL,
	"content" jsonb NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"icon" text,
	"color" text,
	"tags" jsonb,
	"key_points" jsonb,
	"related_topics" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "map_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"type" text NOT NULL,
	"coordinates" jsonb NOT NULL,
	"description" text NOT NULL,
	"details" text,
	"notable_people" jsonb,
	"life_in_uk_info" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "true_false_questions" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "matching_pairs" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "triple_matches" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "flip_cards" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "ai_topics" jsonb;--> statement-breakpoint
ALTER TABLE "diagram_components" ADD CONSTRAINT "diagram_components_diagram_id_diagrams_id_fk" FOREIGN KEY ("diagram_id") REFERENCES "public"."diagrams"("id") ON DELETE cascade ON UPDATE no action;