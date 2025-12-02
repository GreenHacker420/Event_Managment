import { getDb, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';

export const getChannels = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        // Fetch channels
        const channels = await db.select().from(schema.channels).where(eq(schema.channels.eventId, eventId));

        // Fetch subgroups for these channels
        // Note: In a real app, we might want to do a join or a separate query per channel if the list is small, 
        // or a single query with 'inArray' if Drizzle supports it easily for this dialect.
        // For now, let's just fetch all subgroups for these channels.

        const channelsWithSubgroups = await Promise.all(channels.map(async (channel) => {
            const subgroups = await db.select().from(schema.subgroups).where(eq(schema.subgroups.channelId, channel.id));
            return { ...channel, subgroups };
        }));

        return c.json(channelsWithSubgroups);
    } catch (error) {
        console.error('Error fetching channels:', error);
        return c.json({ error: 'Failed to fetch channels' }, 500);
    }
};

export const createChannel = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const body = await c.req.json();
        const { name, description, icon, color } = body;

        if (!name) {
            return c.json({ error: 'Name is required' }, 400);
        }

        const db = await getDb();
        const newChannel = {
            eventId,
            name,
            description,
            icon,
            color,
        };

        await db.insert(schema.channels).values(newChannel);
        return c.json({ message: 'Channel created', channel: newChannel }, 201);
    } catch (error) {
        console.error('Error creating channel:', error);
        return c.json({ error: 'Failed to create channel' }, 500);
    }
};

export const createSubgroup = async (c) => {
    const channelId = c.req.param('channelId');
    try {
        const body = await c.req.json();
        const { name, members } = body;

        if (!name) {
            return c.json({ error: 'Name is required' }, 400);
        }

        const db = await getDb();
        const newSubgroup = {
            channelId,
            name,
            members: members || 1,
        };

        await db.insert(schema.subgroups).values(newSubgroup);
        return c.json({ message: 'Subgroup created', subgroup: newSubgroup }, 201);
    } catch (error) {
        console.error('Error creating subgroup:', error);
        return c.json({ error: 'Failed to create subgroup' }, 500);
    }
};
