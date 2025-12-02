import { Hono } from 'hono';
import { verifyAuth } from '@hono/auth-js';
import { getDb, schema } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';

const messages = new Hono();

messages.get('/:eventId', async (c) => {
    const eventId = c.req.param('eventId');
    const channelId = c.req.query('channelId');
    
    try {
        const db = await getDb();
        let query = db
            .select({
                id: schema.messages.id,
                content: schema.messages.content,
                createdAt: schema.messages.createdAt,
                userId: schema.messages.userId,
                channelId: schema.messages.channelId,
                userName: schema.users.name,
                userImage: schema.users.image,
            })
            .from(schema.messages)
            .leftJoin(schema.users, eq(schema.messages.userId, schema.users.id))
            .where(eq(schema.messages.eventId, eventId))
            .orderBy(desc(schema.messages.createdAt))
            .limit(100);

        const msgs = await query;
        
        const filtered = channelId 
            ? msgs.filter(m => m.channelId === channelId)
            : msgs;

        return c.json(filtered.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        return c.json({ error: 'Failed to fetch messages' }, 500);
    }
});

messages.post('/:eventId', verifyAuth(), async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const auth = c.get('authUser');
        if (!auth?.session?.user?.email) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const db = await getDb();
        const { content, channelId } = await c.req.json();

        if (!content?.trim()) {
            return c.json({ error: 'Message content is required' }, 400);
        }

        let userId = auth.session.user.id;
        if (!userId) {
            const user = await db
                .select({ id: schema.users.id })
                .from(schema.users)
                .where(eq(schema.users.email, auth.session.user.email));
            if (user.length > 0) {
                userId = user[0].id;
            }
        }

        if (!userId) {
            return c.json({ error: 'User not found' }, 404);
        }

        const newMessage = {
            eventId,
            channelId: channelId || null,
            userId,
            content: content.trim(),
        };

        await db.insert(schema.messages).values(newMessage);

        return c.json({ 
            message: 'Message sent',
            data: {
                ...newMessage,
                userName: auth.session.user.name,
                userImage: auth.session.user.image,
                createdAt: new Date(),
            }
        }, 201);
    } catch (error) {
        console.error('Error sending message:', error);
        return c.json({ error: 'Failed to send message' }, 500);
    }
});

messages.delete('/:eventId/:messageId', verifyAuth(), async (c) => {
    const { messageId } = c.req.param();
    try {
        const db = await getDb();
        await db.delete(schema.messages).where(eq(schema.messages.id, messageId));
        return c.json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        return c.json({ error: 'Failed to delete message' }, 500);
    }
});

export default messages;
