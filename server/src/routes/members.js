import { Hono } from 'hono';
import { requireAuth } from "../middleware/auth.js";
import { getDb, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import emailService from '../services/emailService.js';

const members = new Hono();

members.get('/:eventId', async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        const eventMembers = await db
            .select({
                id: schema.eventMembers.id,
                userId: schema.eventMembers.userId,
                role: schema.eventMembers.role,
                channelId: schema.eventMembers.channelId,
                joinedAt: schema.eventMembers.joinedAt,
                userName: schema.users.name,
                userEmail: schema.users.email,
                userImage: schema.users.image,
            })
            .from(schema.eventMembers)
            .leftJoin(schema.users, eq(schema.eventMembers.userId, schema.users.id))
            .where(eq(schema.eventMembers.eventId, eventId));

        return c.json(eventMembers);
    } catch (error) {
        console.error('Error fetching members:', error);
        return c.json({ error: 'Failed to fetch members' }, 500);
    }
});

members.post('/:eventId', requireAuth, async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const auth = c.get('authUser');
        const db = await getDb();
        const { email, role, channelId, sendInvite } = await c.req.json();

        if (!email) {
            return c.json({ error: 'Email is required' }, 400);
        }

        let user = await db.select().from(schema.users).where(eq(schema.users.email, email));
        let userId;

        if (user.length === 0) {
            userId = crypto.randomUUID();
            await db.insert(schema.users).values({
                id: userId,
                email,
                name: email.split('@')[0],
            });
        } else {
            userId = user[0].id;
        }

        const existing = await db
            .select()
            .from(schema.eventMembers)
            .where(and(
                eq(schema.eventMembers.eventId, eventId),
                eq(schema.eventMembers.userId, userId)
            ));

        if (existing.length > 0) {
            return c.json({ error: 'User is already a member' }, 400);
        }

        await db.insert(schema.eventMembers).values({
            eventId,
            userId,
            role: role || 'member',
            channelId: channelId || null,
        });

        if (sendInvite) {
            try {
                const event = await db.select().from(schema.events).where(eq(schema.events.id, eventId));
                if (event.length > 0) {
                    const inviterName = auth?.session?.user?.name || 'Someone';
                    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${eventId}/channels`;
                    await emailService.sendEventInvite(
                        email,
                        inviterName,
                        event[0].title,
                        new Date(event[0].date).toLocaleDateString(),
                        inviteLink
                    );
                }
            } catch (emailErr) {
                console.log('Email not sent:', emailErr.message);
            }
        }

        try {
            await db.insert(schema.activities).values({
                eventId,
                userId: auth?.session?.user?.id,
                type: 'member_added',
                description: `Added ${email} to the team`,
            });
        } catch (e) {}

        return c.json({ message: 'Member added successfully' }, 201);
    } catch (error) {
        console.error('Error adding member:', error);
        return c.json({ error: 'Failed to add member' }, 500);
    }
});

members.put('/:eventId/:memberId', requireAuth, async (c) => {
    const { eventId, memberId } = c.req.param();
    try {
        const db = await getDb();
        const { role, channelId } = await c.req.json();

        const updateData = {};
        if (role) updateData.role = role;
        if (channelId !== undefined) updateData.channelId = channelId;

        await db.update(schema.eventMembers)
            .set(updateData)
            .where(eq(schema.eventMembers.id, memberId));

        return c.json({ message: 'Member updated' });
    } catch (error) {
        console.error('Error updating member:', error);
        return c.json({ error: 'Failed to update member' }, 500);
    }
});

members.delete('/:eventId/:memberId', requireAuth, async (c) => {
    const { memberId } = c.req.param();
    try {
        const db = await getDb();
        await db.delete(schema.eventMembers).where(eq(schema.eventMembers.id, memberId));
        return c.json({ message: 'Member removed' });
    } catch (error) {
        console.error('Error removing member:', error);
        return c.json({ error: 'Failed to remove member' }, 500);
    }
});

export default members;
