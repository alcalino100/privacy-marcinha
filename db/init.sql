-- privacy-marcinha · schema inicial
-- Execute este script no SQL editor do seu banco (Neon/Postgres da Vercel).

-- Better Auth
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

-- Pedidos PIX
CREATE TABLE IF NOT EXISTS "pix_orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "externalId" text,
  "plan" text NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "customerName" text,
  "customerEmail" text,
  "customerCpf" text,
  "customerPhone" text,
  "status" text NOT NULL DEFAULT 'pending',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "paidAt" timestamp
);

-- Visitas
CREATE TABLE IF NOT EXISTS "page_visits" (
  "id" serial PRIMARY KEY NOT NULL,
  "path" text,
  "referrer" text,
  "userAgent" text,
  "ip" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

-- Configurações do perfil (linha única id=1)
CREATE TABLE IF NOT EXISTS "profile_settings" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "name" text NOT NULL DEFAULT 'Marcinha Amorin',
  "handle" text NOT NULL DEFAULT '@marcinhaamorin',
  "bio" text NOT NULL DEFAULT '',
  "avatarUrl" text NOT NULL DEFAULT '/perfil.jpg',
  "coverUrl" text NOT NULL DEFAULT '/capa.jpg',
  "lockedUrl" text NOT NULL DEFAULT '/desfocada.jpg',
  "price1m" numeric(10,2) NOT NULL DEFAULT '24.90',
  "price3m" numeric(10,2) NOT NULL DEFAULT '59.90',
  "price6m" numeric(10,2) NOT NULL DEFAULT '99.90',
  "photos" text NOT NULL DEFAULT '670',
  "videos" text NOT NULL DEFAULT '453',
  "locked" text NOT NULL DEFAULT '75',
  "likes" text NOT NULL DEFAULT '319.5K',
  "posts" text NOT NULL DEFAULT '646',
  "media" text NOT NULL DEFAULT '1.123',
  "accent" text NOT NULL DEFAULT '#f07040',
  "accentDark" text NOT NULL DEFAULT '#f5956a',
  "bg" text NOT NULL DEFAULT '#f0ebe4',
  "subsLabel" text NOT NULL DEFAULT 'Assinaturas',
  "promoLabel" text NOT NULL DEFAULT 'Promoções',
  "label1m" text NOT NULL DEFAULT '1 mês',
  "label3m" text NOT NULL DEFAULT '3 meses (20% off)',
  "label6m" text NOT NULL DEFAULT '6 meses (30% off)',
  "postsLabel" text NOT NULL DEFAULT 'Postagens',
  "mediaLabel" text NOT NULL DEFAULT 'Mídias',
  "readMore" text NOT NULL DEFAULT 'Ler mais',
  "instagram" text,
  "x" text,
  "tiktok" text,
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

INSERT INTO profile_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Posts/cards
CREATE TABLE IF NOT EXISTS "posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "imageUrl" text NOT NULL,
  "caption" text NOT NULL DEFAULT '',
  "locked" boolean NOT NULL DEFAULT true,
  "photos" text NOT NULL DEFAULT '',
  "videos" text NOT NULL DEFAULT '',
  "likes" text NOT NULL DEFAULT '',
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
