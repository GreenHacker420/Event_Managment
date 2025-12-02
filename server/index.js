import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authHandler, initAuthConfig } from '@hono/auth-js'
import Google from '@auth/core/providers/google'
import GitHub from '@auth/core/providers/github'
import Credentials from '@auth/core/providers/credentials'
import { getDb, schema } from './src/db/index.js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { Server } from 'socket.io'
import { setupSocketHandlers } from './src/socket/handlers.js'

import events from './src/routes/events.js'
import usersRoute from './src/routes/users.js'
import emailRoute from './src/routes/email.js'

const app = new Hono()
const db = await getDb()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Middleware
app.use('*', logger())

const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5000'];
if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

app.use('*', cors({
    origin: allowedOrigins,
    credentials: true,
}))

// Auth Configuration - JWT only (no database adapter to avoid schema issues)
app.use('*', initAuthConfig(() => ({
    secret: process.env.AUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                try {
                    const users = await db.select().from(schema.users).where(eq(schema.users.email, credentials.email))
                    if (users.length === 0 || !users[0].password) return null
                    const valid = await bcrypt.compare(credentials.password, users[0].password)
                    if (!valid) return null
                    return { id: users[0].id, email: users[0].email, name: users[0].name, image: users[0].image }
                } catch (e) {
                    console.error('Auth error:', e)
                    return null
                }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: FRONTEND_URL,
        error: FRONTEND_URL,
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth, create/update user in our database
            if (account?.provider === 'google' || account?.provider === 'github') {
                try {
                    const email = user.email
                    if (!email) return false

                    const existingUsers = await db.select().from(schema.users).where(eq(schema.users.email, email))

                    if (existingUsers.length === 0) {
                        // Create new user
                        await db.insert(schema.users).values({
                            id: crypto.randomUUID(),
                            email: email,
                            name: user.name || email.split('@')[0],
                            image: user.image || null,
                        })
                    } else {
                        // Update existing user with OAuth info
                        await db.update(schema.users)
                            .set({
                                name: user.name || existingUsers[0].name,
                                image: user.image || existingUsers[0].image,
                            })
                            .where(eq(schema.users.email, email))
                    }
                } catch (e) {
                    console.error('Error syncing OAuth user:', e)
                }
            }
            return true
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            // For OAuth, fetch user ID from database
            if (account?.provider === 'google' || account?.provider === 'github') {
                try {
                    const users = await db.select().from(schema.users).where(eq(schema.users.email, token.email))
                    if (users.length > 0) {
                        token.id = users[0].id
                    }
                } catch (e) {
                    console.error('Error fetching user ID:', e)
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id
                session.user.email = token.email
                session.user.name = token.name
                session.user.image = token.picture
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // Always redirect to frontend
            if (url.startsWith(FRONTEND_URL)) return url
            if (url.startsWith('/')) return `${FRONTEND_URL}${url}`
            return FRONTEND_URL
        }
    }
})))

app.use('/api/auth/*', authHandler())

// Routes
app.route('/api/events', events)
app.route('/api/users', usersRoute)
app.route('/api/email', emailRoute)

app.get('/', (c) => c.text('EventFlow API'))

// Start Server
const server = serve({ fetch: app.fetch, port: PORT })

// WebSocket
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },
})
setupSocketHandlers(io)

console.log(`Server running on port ${PORT}`)
