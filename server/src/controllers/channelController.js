import { getDb, schema } from '../db/index.js';
import { eq, and, sql } from 'drizzle-orm';

export const getChannels = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        // fetch channels
        const channels = await db.select().from(schema.channels).where(eq(schema.channels.eventId, eventId));

        // fetch subgroups for these channels
        const channelsWithSubgroups = await Promise.all(channels.map(async (channel) => {
            const subgroups = await db.select().from(schema.subgroups).where(eq(schema.subgroups.channelId, channel.id));
            
            // get task counts for this channel
            const taskStats = await db
                .select({
                    total: sql`COUNT(*)`,
                    completed: sql`SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)`,
                })
                .from(schema.tasks)
                .where(eq(schema.tasks.channelId, channel.id));

            return { 
                ...channel, 
                subgroups,
                taskCount: Number(taskStats[0]?.total) || 0,
                completedTasks: Number(taskStats[0]?.completed) || 0,
            };
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
        const channelId = crypto.randomUUID();
        const newChannel = {
            id: channelId,
            eventId,
            name,
            description: description || '',
            icon: icon || 'Users',
            color: color || 'bg-[#ffcc00]',
        };

        await db.insert(schema.channels).values(newChannel);

        try {
            await db.insert(schema.activities).values({
                eventId,
                type: 'channel_created',
                description: `Channel "${name}" was created`,
            });
        } catch (e) {
            console.log(e);
        }

        return c.json({ message: 'Channel created', channel: { ...newChannel, subgroups: [] } }, 201);
    } catch (error) {
        console.error('Error creating channel:', error);
        return c.json({ error: 'Failed to create channel' }, 500);
    }
};

export const updateChannel = async (c) => {
    const id = c.req.param('id');
    try {
        const body = await c.req.json();
        const { name, description, icon, color } = body;

        const db = await getDb();
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (icon) updateData.icon = icon;
        if (color) updateData.color = color;

        await db.update(schema.channels).set(updateData).where(eq(schema.channels.id, id));
        return c.json({ message: 'Channel updated' });
    } catch (error) {
        console.error('Error updating channel:', error);
        return c.json({ error: 'Failed to update channel' }, 500);
    }
};

export const deleteChannel = async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        await db.delete(schema.channels).where(eq(schema.channels.id, id));
        return c.json({ message: 'Channel deleted' });
    } catch (error) {
        console.error('Error deleting channel:', error);
        return c.json({ error: 'Failed to delete channel' }, 500);
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
        const subgroupId = crypto.randomUUID();
        const newSubgroup = {
            id: subgroupId,
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

export const deleteSubgroup = async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        await db.delete(schema.subgroups).where(eq(schema.subgroups.id, id));
        return c.json({ message: 'Subgroup deleted' });
    } catch (error) {
        console.error('Error deleting subgroup:', error);
        return c.json({ error: 'Failed to delete subgroup' }, 500);
    }
};
