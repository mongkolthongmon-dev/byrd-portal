CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_provider_account_unique" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oidc_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"scopes" text DEFAULT 'openid email profile' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"title" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"package_id" integer,
	"password_hash" text,
	"password_salt" text,
	"image" text,
	"login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;