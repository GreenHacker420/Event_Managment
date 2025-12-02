import { Hono } from 'hono';
import { verifyAuth } from '@hono/auth-js';
import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const users = new Hono();

// Register new user with email/password
users.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const { name, email, password } = body;

        if (!email || !password) {
            return c.json({ error: 'Email and password are required' }, 400);
        }

        if (password.length < 6) {
            return c.json({ error: 'Password must be at least 6 characters' }, 400);
        }

        const db = await getDb();

        // Check if user already exists
        const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (existingUser.length > 0) {
            return c.json({ error: 'User with this email already exists' }, 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            name: name || email.split('@')[0],
            email,
            password: hashedPassword,
        };

        await db.insert(schema.users).values(newUser);

        return c.json({ message: 'User registered successfully' }, 201);
    } catch (error) {
        console.error('Registration error:', error);
        return c.json({ error: 'Failed to register user' }, 500);
    }
});

// Get current user profile
users.get('/me', verifyAuth(), async (c) => {
    try {
        const auth = c.get('authUser');
        if (!auth?.session?.user?.email) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const db = await getDb();
        const user = await db.select().from(schema.users).where(eq(schema.users.email, auth.session.user.email));
        
        if (user.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json(user[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        return c.json({ error: 'Failed to fetch user' }, 500);
    }
});

// Update current user profile
users.put('/me', verifyAuth(), async (c) => {
    try {
        const auth = c.get('authUser');
        if (!auth?.session?.user?.email) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const db = await getDb();
        const body = await c.req.json();
        const { name, image } = body;

        const updateData = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;
        updateData.updatedAt = new Date();

        await db.update(schema.users)
            .set(updateData)
            .where(eq(schema.users.email, auth.session.user.email));

        const updatedUser = await db.select().from(schema.users).where(eq(schema.users.email, auth.session.user.email));
        
        return c.json({ message: 'Profile updated', user: updatedUser[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        return c.json({ error: 'Failed to update user' }, 500);
    }
});

// Get user by ID (for team member lookup)
users.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        const user = await db.select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            image: schema.users.image,
        }).from(schema.users).where(eq(schema.users.id, id));

        if (user.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json(user[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        return c.json({ error: 'Failed to fetch user' }, 500);
    }
});

// Search users by email (for inviting team members)
users.get('/search/:email', verifyAuth(), async (c) => {
    const email = c.req.param('email');
    try {
        const db = await getDb();
        const user = await db.select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            image: schema.users.image,
        }).from(schema.users).where(eq(schema.users.email, email));

        if (user.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json(user[0]);
    } catch (error) {
        console.error('Error searching user:', error);
        return c.json({ error: 'Failed to search user' }, 500);
    }
});

export default users;
