import {
    int,
    timestamp,
    mysqlTable,
    varchar,
    text,
    datetime,
    decimal,
    mysqlEnum,
    boolean
} from "drizzle-orm/mysql-core"

export const users = mysqlTable("user", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).unique(),
    emailVerified: boolean("emailVerified").default(false),
    image: varchar("image", { length: 255 }),
    password: varchar("password", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    location: varchar("location", { length: 255 }),
    bio: text("bio"),
    role: varchar("role", { length: 50 }),
    createdAt: timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow(),
})

export const accounts = mysqlTable("account", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accountId: varchar("accountId", { length: 255 }).notNull(),
    providerId: varchar("providerId", { length: 255 }).notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: "string" }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "string" }),
    scope: varchar("scope", { length: 255 }),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
})

export const sessions = mysqlTable("session", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expiresAt", { mode: "string" }).notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
})

export const verificationTokens = mysqlTable("verification", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expiresAt", { mode: "string" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
})

export const events = mysqlTable("event", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    date: datetime("date").notNull(),
    location: varchar("location", { length: 255 }),
    budget: decimal("budget", { precision: 10, scale: 2 }),
    category: varchar("category", { length: 50 }), // e.g., Wedding, Corporate
    type: varchar("type", { length: 50 }), // e.g., Workshop, Seminar
    status: mysqlEnum("status", ["active", "archived", "draft"]).default("active"),
    guestCount: int("guestCount"),
    organizerId: varchar("organizerId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
})

export const channels = mysqlTable("channel", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    eventId: varchar("eventId", { length: 255 })
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(), // e.g., Logistics, Marketing
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 50 }),
    createdAt: timestamp("createdAt").defaultNow(),
})

export const subgroups = mysqlTable("subgroup", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    channelId: varchar("channelId", { length: 255 })
        .notNull()
        .references(() => channels.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    members: int("members").default(1),
    createdAt: timestamp("createdAt").defaultNow(),
})

export const tasks = mysqlTable("task", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    eventId: varchar("eventId", { length: 255 })
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    channelId: varchar("channelId", { length: 255 })
        .references(() => channels.id, { onDelete: "set null" }),
    assigneeId: varchar("assigneeId", { length: 255 })
        .references(() => users.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["todo", "in_progress", "review", "done"]).default("todo"),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
    dueDate: datetime("dueDate"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
})

export const expenses = mysqlTable("expense", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    eventId: varchar("eventId", { length: 255 })
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    channelId: varchar("channelId", { length: 255 })
        .references(() => channels.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
    date: datetime("date"),
    createdAt: timestamp("createdAt").defaultNow(),
})

// Event Members - for team management
export const eventMembers = mysqlTable("event_member", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    eventId: varchar("eventId", { length: 255 })
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", ["organizer", "team_lead", "member", "viewer"]).default("member"),
    channelId: varchar("channelId", { length: 255 })
        .references(() => channels.id, { onDelete: "set null" }),
    joinedAt: timestamp("joinedAt").defaultNow(),
})

// Activity Log - for tracking actions
export const activities = mysqlTable("activity", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    eventId: varchar("eventId", { length: 255 })
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 255 })
        .references(() => users.id, { onDelete: "set null" }),
    type: mysqlEnum("type", ["task_created", "task_completed", "task_updated", "expense_added", "expense_approved", "member_added", "channel_created", "event_updated"]).notNull(),
    description: text("description"),
    metadata: text("metadata"), // JSON string for additional data
    createdAt: timestamp("createdAt").defaultNow(),
})

// Messages - for chat functionality
export const messages = mysqlTable("message", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    eventId: varchar("eventId", { length: 255 })
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    channelId: varchar("channelId", { length: 255 })
        .references(() => channels.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
})
