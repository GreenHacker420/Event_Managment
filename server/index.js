import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './src/lib/auth.js'
import { getDb, schema } from './src/db/index.js'
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

app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
    return auth.handler(c.req.raw);
});


app.use('*', async (c, next) => {
    if (c.req.path.startsWith('/api/auth')) {
        return next();
    }
    
    try {
        const session = await auth.api.getSession({ headers: c.req.raw.headers });

        if (session) {
            c.set('user', session.user);
            c.set('session', session.session);
        } else {
            c.set('user', null);
            c.set('session', null);
        }
    } catch (error) {
        console.error('Session check error:', error);
        c.set('user', null);
        c.set('session', null);
    }
    
    return next();
});

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
