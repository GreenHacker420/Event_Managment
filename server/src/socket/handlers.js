import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

export const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
        });

        socket.on('send-message', async (data) => {
            const { eventId, channelId, content, user } = data;
            
            try {
                const db = await getDb();
                
                // First, find user by email (most reliable)
                let userId = null;
                
                if (user.email) {
                    const existingUsers = await db.select({ id: schema.users.id })
                        .from(schema.users)
                        .where(eq(schema.users.email, user.email));
                    
                    if (existingUsers.length > 0) {
                        userId = existingUsers[0].id;
                    } else {
                        // User doesn't exist, create them
                        const newUserId = user.id || crypto.randomUUID();
                        try {
                            await db.insert(schema.users).values({
                                id: newUserId,
                                email: user.email,
                                name: user.name || user.email.split('@')[0],
                                image: user.image || null,
                            });
                            userId = newUserId;
                        } catch (insertError) {
                            // If insert fails (duplicate), try to fetch again
                            const retryUsers = await db.select({ id: schema.users.id })
                                .from(schema.users)
                                .where(eq(schema.users.email, user.email));
                            if (retryUsers.length > 0) {
                                userId = retryUsers[0].id;
                            }
                        }
                    }
                } else if (user.id) {
                    // No email, check if user.id exists
                    const existingById = await db.select({ id: schema.users.id })
                        .from(schema.users)
                        .where(eq(schema.users.id, user.id));
                    
                    if (existingById.length > 0) {
                        userId = user.id;
                    }
                }

                if (!userId) {
                    console.error('Could not find or create user:', user);
                    socket.emit('message-error', { error: 'User not found. Please log in again.' });
                    return;
                }

                const messageId = crypto.randomUUID();
                
                await db.insert(schema.messages).values({
                    id: messageId,
                    eventId,
                    channelId: channelId || null,
                    userId,
                    content,
                });

                const message = {
                    id: messageId,
                    eventId,
                    channelId,
                    content,
                    userId,
                    userName: user.name,
                    userImage: user.image,
                    createdAt: new Date(),
                };

                const roomId = channelId || eventId;
                io.to(roomId).emit('new-message', message);
            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        socket.on('typing', (data) => {
            const { roomId, user } = data;
            socket.to(roomId).emit('user-typing', { user });
        });

        socket.on('stop-typing', (data) => {
            const { roomId, user } = data;
            socket.to(roomId).emit('user-stop-typing', { user });
        });

        // Real-time task updates
        socket.on('task-update', (data) => {
            const { eventId, task } = data;
            io.to(eventId).emit('task-updated', task);
        });

        socket.on('task-create', (data) => {
            const { eventId, task } = data;
            io.to(eventId).emit('task-created', task);
        });

        // Real-time member updates
        socket.on('member-added', (data) => {
            const { eventId, member } = data;
            io.to(eventId).emit('member-joined', member);
        });

        socket.on('member-removed', (data) => {
            const { eventId, memberId } = data;
            io.to(eventId).emit('member-left', { memberId });
        });

        // Real-time expense updates
        socket.on('expense-added', (data) => {
            const { eventId, expense } = data;
            io.to(eventId).emit('expense-created', expense);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
