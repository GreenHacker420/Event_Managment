import { getDb, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';

export const getMembers = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        
        // Get members with user details
        const members = await db
            .select({
                id: schema.eventMembers.id,
                eventId: schema.eventMembers.eventId,
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

        return c.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        return c.json({ error: 'Failed to fetch members' }, 500);
    }
};

export const addMember = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const body = await c.req.json();
        const { userId, email, role, channelId } = body;

        const db = await getDb();

        // Find user by email if userId not provided
        let targetUserId = userId;
        if (!targetUserId && email) {
            const user = await db.select().from(schema.users).where(eq(schema.users.email, email));
            if (user.length === 0) {
                return c.json({ error: 'User not found with this email' }, 404);
            }
            targetUserId = user[0].id;
        }

        if (!targetUserId) {
            return c.json({ error: 'userId or email is required' }, 400);
        }

        // Check if member already exists
        const existing = await db.select()
            .from(schema.eventMembers)
            .where(and(
                eq(schema.eventMembers.eventId, eventId),
                eq(schema.eventMembers.userId, targetUserId)
            ));

        if (existing.length > 0) {
            return c.json({ error: 'User is already a member of this event' }, 400);
        }

        const newMember = {
            eventId,
            userId: targetUserId,
            role: role || 'member',
            channelId: channelId || null,
        };

        await db.insert(schema.eventMembers).values(newMember);

        // Log activity
        await db.insert(schema.activities).values({
            eventId,
            userId: targetUserId,
            type: 'member_added',
            description: `New member added to the event`,
        });

        // Get the user details for response
        const user = await db.select().from(schema.users).where(eq(schema.users.id, targetUserId));

        return c.json({ 
            message: 'Member added successfully', 
            member: { 
                ...newMember, 
                userName: user[0]?.name,
                userEmail: user[0]?.email,
                userImage: user[0]?.image,
            } 
        }, 201);
    } catch (error) {
        console.error('Error adding member:', error);
        return c.json({ error: 'Failed to add member' }, 500);
    }
};

export const updateMember = async (c) => {
    const id = c.req.param('id');
    try {
        const body = await c.req.json();
        const { role, channelId } = body;

        const db = await getDb();

        const updateData = {};
        if (role) updateData.role = role;
        if (channelId !== undefined) updateData.channelId = channelId;

        await db.update(schema.eventMembers).set(updateData).where(eq(schema.eventMembers.id, id));

        return c.json({ message: 'Member updated successfully' });
    } catch (error) {
        console.error('Error updating member:', error);
        return c.json({ error: 'Failed to update member' }, 500);
    }
};

export const removeMember = async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        await db.delete(schema.eventMembers).where(eq(schema.eventMembers.id, id));
        return c.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing member:', error);
        return c.json({ error: 'Failed to remove member' }, 500);
    }
};
