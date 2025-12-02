import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authHandler, initAuthConfig } from '@hono/auth-js'
import Google from '@auth/core/providers/google'
import GitHub from '@auth/core/providers/github'
import Credentials from '@auth/core/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000'

// Middleware
app.use('*', logger())
app.use('*', cors({
    origin: [FRONTEND_URL, 'http://localhost:5000'],
    credentials: true,
}))

// Auth Configuration
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
                    const user = await db.select().from(schema.users).where(eq(schema.users.email, credentials.email))
                    if (user.length === 0 || !user[0].password) return null
                    const valid = await bcrypt.compare(credentials.password, user[0].password)
                    if (!valid) return null
                    return { id: user[0].id, email: user[0].email, name: user[0].name, image: user[0].image }
                } catch (e) {
                    console.error('Auth error:', e)
                    return null
                }
            },
        }),
    ],
    adapter: DrizzleAdapter(db),
    session: { strategy: 'jwt' },
    callbacks: {
        jwt: ({ token, user }) => { if (user) token.id = user.id; return token },
        session: ({ session, token }) => { if (session.user && token) session.user.id = token.id; return session },
        redirect: ({ url, baseUrl }) => {
            if (url.startsWith('/')) return `${baseUrl}${url}`
            try { if (new URL(url).origin === baseUrl) return url } catch {}
            return baseUrl
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
    cors: { origin: [FRONTEND_URL, 'http://localhost:5000'], credentials: true },
})
setupSocketHandlers(io)

console.log(`Server running on port ${PORT}`)
