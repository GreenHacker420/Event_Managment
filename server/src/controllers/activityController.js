import { getDb, schema } from '../db/index.js';
import { eq, desc } from 'drizzle-orm';

export const getActivities = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        
        // Get activities with user details
        const activities = await db
            .select({
                id: schema.activities.id,
                eventId: schema.activities.eventId,
                userId: schema.activities.userId,
                type: schema.activities.type,
                description: schema.activities.description,
                metadata: schema.activities.metadata,
                createdAt: schema.activities.createdAt,
                userName: schema.users.name,
                userImage: schema.users.image,
            })
            .from(schema.activities)
            .leftJoin(schema.users, eq(schema.activities.userId, schema.users.id))
            .where(eq(schema.activities.eventId, eventId))
            .orderBy(desc(schema.activities.createdAt))
            .limit(50);

        return c.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return c.json({ error: 'Failed to fetch activities' }, 500);
    }
};

// Helper function to create activity (used by other controllers)
export const createActivity = async (db, { eventId, userId, type, description, metadata }) => {
    try {
        await db.insert(schema.activities).values({
            eventId,
            userId,
            type,
            description,
            metadata: metadata ? JSON.stringify(metadata) : null,
        });
    } catch (error) {
        console.error('Error creating activity:', error);
    }
};
