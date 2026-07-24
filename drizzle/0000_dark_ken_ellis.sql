CREATE TYPE "public"."guest_session_status" AS ENUM('active', 'submitted');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'contacted', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE SEQUENCE "public"."cracker_order_bill_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1001 CACHE 1;--> statement-breakpoint
CREATE TABLE "cracker_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_bank_account" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_name" text NOT NULL,
	"account_holder_name" text NOT NULL,
	"account_number" text NOT NULL,
	"ifsc_code" text NOT NULL,
	"branch_name" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_cart_item" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_session_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"discount_label" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cracker_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cracker_guest_session" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "guest_session_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_lead" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_order" (
	"id" text PRIMARY KEY NOT NULL,
	"bill_number" text NOT NULL,
	"guest_session_id" text,
	"customer_name" text NOT NULL,
	"customer_whatsapp" text NOT NULL,
	"customer_address" text NOT NULL,
	"customer_state" text NOT NULL,
	"net_total" numeric(10, 2) NOT NULL,
	"you_save" numeric(10, 2) NOT NULL,
	"grand_total" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cracker_order_bill_number_unique" UNIQUE("bill_number")
);
--> statement-breakpoint
CREATE TABLE "cracker_order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"product_code" text NOT NULL,
	"product_name" text NOT NULL,
	"unit" text NOT NULL,
	"mrp_price" numeric(10, 2) NOT NULL,
	"discount_price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_product" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"product_code" text NOT NULL,
	"name" text NOT NULL,
	"unit" text DEFAULT 'PKT' NOT NULL,
	"image_url" text,
	"mrp_price" numeric(10, 2) NOT NULL,
	"discount_price" numeric(10, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "cracker_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cracker_site_setting" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"shop_name" text DEFAULT 'Sri''s Crackers Shop' NOT NULL,
	"shop_address" text,
	"contact_email" text,
	"announcement_text" text,
	"minimum_order_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"whatsapp_number" text,
	"contact_phone_primary" text,
	"contact_phone_secondary" text,
	"address" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_upi_account" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"upi_id" text,
	"phone_number" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cracker_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cracker_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cracker_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cracker_account" ADD CONSTRAINT "cracker_account_user_id_cracker_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cracker_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_cart_item" ADD CONSTRAINT "cracker_cart_item_guest_session_id_cracker_guest_session_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."cracker_guest_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_cart_item" ADD CONSTRAINT "cracker_cart_item_product_id_cracker_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."cracker_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_order" ADD CONSTRAINT "cracker_order_guest_session_id_cracker_guest_session_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."cracker_guest_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_order_item" ADD CONSTRAINT "cracker_order_item_order_id_cracker_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cracker_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_order_item" ADD CONSTRAINT "cracker_order_item_product_id_cracker_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."cracker_product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_product" ADD CONSTRAINT "cracker_product_category_id_cracker_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cracker_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cracker_session" ADD CONSTRAINT "cracker_session_user_id_cracker_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cracker_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_item_session_idx" ON "cracker_cart_item" USING btree ("guest_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_item_session_product_uq" ON "cracker_cart_item" USING btree ("guest_session_id","product_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "cracker_order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "cracker_product" USING btree ("category_id");