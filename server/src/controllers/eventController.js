import { getDb, schema } from '../db/index.js';
import { eq, sql, and } from 'drizzle-orm';

export const getEvents = async (c) => {
    try {
        const db = await getDb();
        const auth = c.get('authUser');
        // Optional: Filter by user if needed, or return all public events
        // For now, let's return all events
        const allEvents = await db.select().from(schema.events);
        return c.json(allEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        return c.json({ error: 'Failed to fetch events' }, 500);
    }
};

export const getEvent = async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        const event = await db.select().from(schema.events).where(eq(schema.events.id, id));
        if (event.length === 0) {
            return c.json({ error: 'Event not found' }, 404);
        }
        return c.json(event[0]);
    } catch (error) {
        console.error('Error fetching event:', error);
        return c.json({ error: 'Failed to fetch event' }, 500);
    }
};

export const createEvent = async (c) => {
    try {
        const db = await getDb();
        const body = await c.req.json();
        const { title, description, date, location, budget, category, guestCount } = body;

        if (!title || !date) {
            return c.json({ error: 'Title and Date are required' }, 400);
        }

        
        let organizerId = 'guest-user-id'; 
        const auth = c.get('authUser');
        if (auth?.session?.user?.email) {
            const user = await db.select().from(schema.users).where(eq(schema.users.email, auth.session.user.email));
            if (user.length > 0) {
                organizerId = user[0].id;
            }
        }

        const newEvent = {
            title,
            description,
            date: new Date(date),
            location,
            budget: budget ? String(budget) : null,
            category,
            guestCount: guestCount ? Number(guestCount) : null,
            organizerId,
        };

        await db.insert(schema.events).values(newEvent);

        return c.json({ message: 'Event created successfully', event: newEvent }, 201);
    } catch (error) {
        console.error('Error creating event:', error);
        return c.json({ error: 'Failed to create event' }, 500);
    }
};

export const updateEvent = async (c) => {
    const id = c.req.param('id');
    try {
        const auth = c.get('authUser');
        if (!auth?.session?.user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const db = await getDb();
        const body = await c.req.json();

        // Verify ownership
        const event = await db.select().from(schema.events).where(eq(schema.events.id, id));
        if (event.length === 0) {
            return c.json({ error: 'Event not found' }, 404);
        }

        // Get user id
        const userEmail = auth.session.user.email;
        const user = await db.select().from(schema.users).where(eq(schema.users.email, userEmail));
        if (user.length === 0 || user[0].id !== event[0].organizerId) {
            return c.json({ error: 'Unauthorized' }, 403);
        }

        const { title, description, date, location, budget, category, guestCount } = body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (date) updateData.date = new Date(date);
        if (location) updateData.location = location;
        if (budget) updateData.budget = String(budget);
        if (category) updateData.category = category;
        if (guestCount) updateData.guestCount = Number(guestCount);
        updateData.updatedAt = new Date();

        await db.update(schema.events).set(updateData).where(eq(schema.events.id, id));

        return c.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        return c.json({ error: 'Failed to update event' }, 500);
    }
};

export const deleteEvent = async (c) => {
    const id = c.req.param('id');
    try {
        const auth = c.get('authUser');
        if (!auth?.session?.user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const db = await getDb();

        // Verify ownership
        const event = await db.select().from(schema.events).where(eq(schema.events.id, id));
        if (event.length === 0) {
            return c.json({ error: 'Event not found' }, 404);
        }

        const userEmail = auth.session.user.email;
        const user = await db.select().from(schema.users).where(eq(schema.users.email, userEmail));
        if (user.length === 0 || user[0].id !== event[0].organizerId) {
            return c.json({ error: 'Unauthorized' }, 403);
        }

        await db.delete(schema.events).where(eq(schema.events.id, id));

        return c.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return c.json({ error: 'Failed to delete event' }, 500);
    }
};

// Get event statistics for dashboard
export const getEventStats = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();

        // Get event details
        const event = await db.select().from(schema.events).where(eq(schema.events.id, eventId));
        if (event.length === 0) {
            return c.json({ error: 'Event not found' }, 404);
        }

        // Get task statistics
        const taskStats = await db
            .select({
                total: sql`COUNT(*)`,
                completed: sql`SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)`,
                inProgress: sql`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
                todo: sql`SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END)`,
            })
            .from(schema.tasks)
            .where(eq(schema.tasks.eventId, eventId));

        // Get expense statistics
        const expenseStats = await db
            .select({
                total: sql`COALESCE(SUM(amount), 0)`,
                approved: sql`COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0)`,
                pending: sql`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)`,
            })
            .from(schema.expenses)
            .where(eq(schema.expenses.eventId, eventId));

        // Get channel count
        const channelCount = await db
            .select({ count: sql`COUNT(*)` })
            .from(schema.channels)
            .where(eq(schema.channels.eventId, eventId));

        // Get member count
        const memberCount = await db
            .select({ count: sql`COUNT(*)` })
            .from(schema.eventMembers)
            .where(eq(schema.eventMembers.eventId, eventId));

        const totalTasks = Number(taskStats[0]?.total) || 0;
        const completedTasks = Number(taskStats[0]?.completed) || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return c.json({
            event: event[0],
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: Number(taskStats[0]?.inProgress) || 0,
                todo: Number(taskStats[0]?.todo) || 0,
            },
            budget: {
                total: Number(event[0].budget) || 0,
                spent: Number(expenseStats[0]?.approved) || 0,
                pending: Number(expenseStats[0]?.pending) || 0,
            },
            channels: Number(channelCount[0]?.count) || 0,
            members: Number(memberCount[0]?.count) || 0,
            progress,
        });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        return c.json({ error: 'Failed to fetch event stats' }, 500);
    }
};
