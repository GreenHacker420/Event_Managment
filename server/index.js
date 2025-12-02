import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import Google from '@auth/core/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb } from './src/db/index.js'
import events from './src/routes/events.js'

const app = new Hono()

// Initialize DB
const db = await getDb()

app.use('*', logger())
app.use('*', cors())

// Auth.js Configuration
app.use('*', initAuthConfig((c) => ({
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    adapter: DrizzleAdapter(db),
})))

app.use('/api/auth/*', authHandler())

// Mount Routes
app.route('/api/events', events)

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
