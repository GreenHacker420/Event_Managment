import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

export const getTasks = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        
        // Get tasks with assignee details
        const tasks = await db
            .select({
                id: schema.tasks.id,
                eventId: schema.tasks.eventId,
                channelId: schema.tasks.channelId,
                assigneeId: schema.tasks.assigneeId,
                title: schema.tasks.title,
                description: schema.tasks.description,
                status: schema.tasks.status,
                priority: schema.tasks.priority,
                dueDate: schema.tasks.dueDate,
                createdAt: schema.tasks.createdAt,
                updatedAt: schema.tasks.updatedAt,
                assigneeName: schema.users.name,
                assigneeImage: schema.users.image,
            })
            .from(schema.tasks)
            .leftJoin(schema.users, eq(schema.tasks.assigneeId, schema.users.id))
            .where(eq(schema.tasks.eventId, eventId));
            
        return c.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return c.json({ error: 'Failed to fetch tasks' }, 500);
    }
};

export const createTask = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const body = await c.req.json();
        const { title, description, channelId, assigneeId, priority, dueDate, status } = body;

        if (!title) {
            return c.json({ error: 'Title is required' }, 400);
        }

        const db = await getDb();
        const newTask = {
            eventId,
            title,
            description,
            channelId: channelId || null,
            assigneeId: assigneeId || null,
            priority: priority || 'medium',
            dueDate: dueDate ? new Date(dueDate) : null,
            status: status || 'todo',
        };

        await db.insert(schema.tasks).values(newTask);

        // Log activity
        await db.insert(schema.activities).values({
            eventId,
            type: 'task_created',
            description: `Task "${title}" was created`,
        });

        return c.json({ message: 'Task created', task: newTask }, 201);
    } catch (error) {
        console.error('Error creating task:', error);
        return c.json({ error: 'Failed to create task' }, 500);
    }
};

export const updateTask = async (c) => {
    const id = c.req.param('id');
    try {
        const body = await c.req.json();
        const db = await getDb();

        // Get current task to check status change
        const currentTask = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
        
        const updateData = { ...body, updatedAt: new Date() };
        if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
        
        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.eventId;
        delete updateData.createdAt;

        await db.update(schema.tasks).set(updateData).where(eq(schema.tasks.id, id));

        // Log activity if status changed to done
        if (currentTask.length > 0 && body.status === 'done' && currentTask[0].status !== 'done') {
            await db.insert(schema.activities).values({
                eventId: currentTask[0].eventId,
                type: 'task_completed',
                description: `Task "${currentTask[0].title}" was completed`,
            });
        }

        return c.json({ message: 'Task updated' });
    } catch (error) {
        console.error('Error updating task:', error);
        return c.json({ error: 'Failed to update task' }, 500);
    }
};

export const deleteTask = async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
        return c.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return c.json({ error: 'Failed to delete task' }, 500);
    }
};
