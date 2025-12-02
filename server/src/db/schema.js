import {
    int,
    timestamp,
    mysqlTable,
    primaryKey,
    varchar,
    text,
    boolean,
    datetime,
    decimal,
    mysqlEnum
} from "drizzle-orm/mysql-core"

export const users = mysqlTable("user", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).unique(),
    emailVerified: timestamp("emailVerified", {
        mode: "date",
        fsp: 3,
    }),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
})

export const accounts = mysqlTable(
    "account",
    {
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: varchar("type", { length: 255 }).notNull(),
        provider: varchar("provider", { length: 255 }).notNull(),
        providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: int("expires_at"),
        token_type: varchar("token_type", { length: 255 }),
        scope: varchar("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const sessions = mysqlTable("session", {
    sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = mysqlTable(
    "verificationToken",
    {
        identifier: varchar("identifier", { length: 255 }).notNull(),
        token: varchar("token", { length: 255 }).notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
)

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
    date: datetime("date"), // Removed defaultNow() as it's not supported on datetime in this version/dialect
    createdAt: timestamp("createdAt").defaultNow(),
})
