import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  numeric,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
export const pixOrders = pgTable('pix_orders', {
  id: serial('id').primaryKey(),
  externalId: text('externalId'),
  plan: text('plan').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  customerName: text('customerName'),
  customerEmail: text('customerEmail'),
  customerCpf: text('customerCpf'),
  customerPhone: text('customerPhone'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  paidAt: timestamp('paidAt'),
})

export const pageVisits = pgTable('page_visits', {
  id: serial('id').primaryKey(),
  path: text('path'),
  referrer: text('referrer'),
  userAgent: text('userAgent'),
  ip: text('ip'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Singleton row (id = 1) with the public profile configuration.
export const profileSettings = pgTable('profile_settings', {
  id: integer('id').primaryKey().default(1),
  name: text('name').notNull().default('Marcinha Amorin'),
  handle: text('handle').notNull().default('@marcinhaamorin'),
  bio: text('bio').notNull().default(''),
  avatarUrl: text('avatarUrl').notNull().default('/perfil.jpg'),
  coverUrl: text('coverUrl').notNull().default('/capa.jpg'),
  lockedUrl: text('lockedUrl').notNull().default('/desfocada.jpg'),
  price1m: numeric('price1m', { precision: 10, scale: 2 }).notNull().default('24.90'),
  price3m: numeric('price3m', { precision: 10, scale: 2 }).notNull().default('59.90'),
  price6m: numeric('price6m', { precision: 10, scale: 2 }).notNull().default('99.90'),
  photos: text('photos').notNull().default('670'),
  videos: text('videos').notNull().default('453'),
  locked: text('locked').notNull().default('75'),
  likes: text('likes').notNull().default('319.5K'),
  posts: text('posts').notNull().default('646'),
  media: text('media').notNull().default('1.123'),
  accent: text('accent').notNull().default('#f07040'),
  accentDark: text('accentDark').notNull().default('#f5956a'),
  bg: text('bg').notNull().default('#f0ebe4'),
  subsLabel: text('subsLabel').notNull().default('Assinaturas'),
  promoLabel: text('promoLabel').notNull().default('Promoções'),
  label1m: text('label1m').notNull().default('1 mês'),
  label3m: text('label3m').notNull().default('3 meses (20% off)'),
  label6m: text('label6m').notNull().default('6 meses (30% off)'),
  postsLabel: text('postsLabel').notNull().default('Postagens'),
  mediaLabel: text('mediaLabel').notNull().default('Mídias'),
  readMore: text('readMore').notNull().default('Ler mais'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  imageUrl: text('imageUrl').notNull(),
  caption: text('caption').notNull().default(''),
  locked: boolean('locked').notNull().default(true),
  photos: text('photos').notNull().default(''),
  videos: text('videos').notNull().default(''),
  likes: text('likes').notNull().default(''),
  sortOrder: integer('sortOrder').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
