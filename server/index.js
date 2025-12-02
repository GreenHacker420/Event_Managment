import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import Google from '@auth/core/providers/google'
import GitHub from '@auth/core/providers/github'
import Credentials from '@auth/core/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb, schema } from './src/db/index.js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import events from './src/routes/events.js'
import usersRoute from './src/routes/users.js'

const app = new Hono()

// Initialize DB
const db = await getDb()

app.use('*', logger())
app.use('*', cors({
    origin: ['http://localhost:5000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
}))

// Auth.js Configuration
app.use('*', initAuthConfig((c) => ({
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
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await db.select().from(schema.users).where(eq(schema.users.email, credentials.email));
                    
                    if (user.length === 0 || !user[0].password) {
                        return null;
                    }

                    const isValidPassword = await bcrypt.compare(credentials.password, user[0].password);
                    
                    if (!isValidPassword) {
                        return null;
                    }

                    return {
                        id: user[0].id,
                        email: user[0].email,
                        name: user[0].name,
                        image: user[0].image,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    adapter: DrizzleAdapter(db),
    session: {
        strategy: 'jwt', // Use JWT for credentials provider
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    }
})))

app.use('/api/auth/*', authHandler())

// Mount Routes
app.route('/api/events', events)
app.route('/api/users', usersRoute)

// Health check
app.get('/', (c) => {
    return c.text('Hello Hono with Drizzle (MySQL)!')
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
