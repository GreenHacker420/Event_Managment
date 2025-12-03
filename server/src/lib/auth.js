import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb, schema } from "../db/index.js";

const db = await getDb();

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        usePlural: false,
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verificationTokens,
        },
    }),
    basePath: "/api/auth",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || "",
            enabled: true,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || "",
            enabled: true,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
    trustedOrigins: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5000",
        "http://localhost:3000",
        // Production domains
        "https://event-managment-rho.vercel.app",
        "https://event-managment-sgg2.vercel.app",
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: true,
            httpOnly: true,
            path: "/",
        },
        useSecureCookies: true,
    },
});
