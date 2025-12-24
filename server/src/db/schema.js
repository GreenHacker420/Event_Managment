import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

/* =======================
   ENUMS
======================= */

export const eventStatusEnum = pgEnum("event_status", [
  "active",
  "archived",
  "draft",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "review",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "approved",
  "rejected",
]);

export const eventMemberRoleEnum = pgEnum("event_member_role", [
  "organizer",
  "team_lead",
  "member",
  "viewer",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "task_created",
  "task_completed",
  "task_updated",
  "expense_added",
  "expense_approved",
  "member_added",
  "channel_created",
  "event_updated",
]);

/* =======================
   USERS
======================= */

export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: boolean("emailVerified").default(false),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  location: varchar("location", { length: 255 }),
  bio: text("bio"),
  role: varchar("role", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/* =======================
   ACCOUNTS
======================= */

export const accounts = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  providerId: varchar("providerId", { length: 255 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: varchar("scope", { length: 255 }),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/* =======================
   SESSIONS
======================= */

export const sessions = pgTable("session", {
  id: uuid("id").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: varchar("ipAddress", { length: 255 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/* =======================
   VERIFICATION TOKENS
======================= */

export const verificationTokens = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/* =======================
   EVENTS
======================= */

export const events = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 255 }),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 50 }),
  type: varchar("type", { length: 50 }),
  status: eventStatusEnum("status").default("active"),
  guestCount: integer("guestCount"),
  organizerId: uuid("organizerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/* =======================
   CHANNELS
======================= */

export const channels = pgTable("channel", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

/* =======================
   SUBGROUPS
======================= */

export const subgroups = pgTable("subgroup", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channelId")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  members: integer("members").default(1),
  createdAt: timestamp("createdAt").defaultNow(),
});

/* =======================
   TASKS
======================= */

export const tasks = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  channelId: uuid("channelId").references(() => channels.id, {
    onDelete: "set null",
  }),
  assigneeId: uuid("assigneeId").references(() => users.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo"),
  priority: taskPriorityEnum("priority").default("medium"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/* =======================
   EXPENSES
======================= */

export const expenses = pgTable("expense", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  channelId: uuid("channelId").references(() => channels.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  status: expenseStatusEnum("status").default("pending"),
  date: timestamp("date"),
  createdAt: timestamp("createdAt").defaultNow(),
});

/* =======================
   EVENT MEMBERS
======================= */

export const eventMembers = pgTable("event_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: eventMemberRoleEnum("role").default("member"),
  channelId: uuid("channelId").references(() => channels.id, {
    onDelete: "set null",
  }),
  joinedAt: timestamp("joinedAt").defaultNow(),
});

/* =======================
   ACTIVITIES
======================= */

export const activities = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("userId").references(() => users.id, {
    onDelete: "set null",
  }),
  type: activityTypeEnum("type").notNull(),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow(),
});

/* =======================
   MESSAGES
======================= */

export const messages = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("eventId")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  channelId: uuid("channelId").references(() => channels.id, {
    onDelete: "cascade",
  }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

/* ======================= */