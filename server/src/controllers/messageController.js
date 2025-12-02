import { getDb, schema } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';

export const getMessages = async (c) => {
    const eventId = c.req.param('eventId');
    const channelId = c.req.param('channelId');
    
    try {
        const db = await getDb();
        
        // Get messages with user details
        const messages = await db
            .select({
                id: schema.messages.id,
                eventId: schema.messages.eventId,
                channelId: schema.messages.channelId,
                userId: schema.messages.userId,
                content: schema.messages.content,
                createdAt: schema.messages.createdAt,
                userName: schema.users.name,
                userImage: schema.users.image,
            })
            .from(schema.messages)
            .leftJoin(schema.users, eq(schema.messages.userId, schema.users.id))
            .where(and(
                eq(schema.messages.eventId, eventId),
                eq(schema.messages.channelId, channelId)
            ))
            .orderBy(desc(schema.messages.createdAt))
            .limit(100);

        // Return in chronological order (oldest first)
        return c.json(messages.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        return c.json({ error: 'Failed to fetch messages' }, 500);
    }
};

export const createMessage = async (c) => {
    const eventId = c.req.param('eventId');
    const channelId = c.req.param('channelId');
    
    try {
        const body = await c.req.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return c.json({ error: 'Message content is required' }, 400);
        }

        // Get user from auth
        let userId = null;
        const auth = c.get('authUser');
        if (auth?.session?.user?.email) {
            const db = await getDb();
            const user = await db.select().from(schema.users).where(eq(schema.users.email, auth.session.user.email));
            if (user.length > 0) {
                userId = user[0].id;
            }
        }

        if (!userId) {
            return c.json({ error: 'User not authenticated' }, 401);
        }

        const db = await getDb();
        const newMessage = {
            eventId,
            channelId,
            userId,
            content: content.trim(),
        };

        await db.insert(schema.messages).values(newMessage);

        // Get user details for response
        const user = await db.select().from(schema.users).where(eq(schema.users.id, userId));

        return c.json({ 
            message: 'Message sent', 
            data: {
                ...newMessage,
                userName: user[0]?.name,
                userImage: user[0]?.image,
                createdAt: new Date(),
            }
        }, 201);
    } catch (error) {
        console.error('Error creating message:', error);
        return c.json({ error: 'Failed to send message' }, 500);
    }
};
