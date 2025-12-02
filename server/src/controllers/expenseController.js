import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

export const getExpenses = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const db = await getDb();
        const expenses = await db.select().from(schema.expenses).where(eq(schema.expenses.eventId, eventId));
        return c.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return c.json({ error: 'Failed to fetch expenses' }, 500);
    }
};

export const createExpense = async (c) => {
    const eventId = c.req.param('eventId');
    try {
        const body = await c.req.json();
        const { amount, description, category, channelId, date } = body;

        if (!amount || !description) {
            return c.json({ error: 'Amount and Description are required' }, 400);
        }

        const db = await getDb();
        const newExpense = {
            eventId,
            amount: String(amount),
            description,
            category: category || 'General',
            channelId: channelId || null,
            date: date ? new Date(date) : new Date(),
            status: 'pending',
        };

        await db.insert(schema.expenses).values(newExpense);

        // Log activity
        await db.insert(schema.activities).values({
            eventId,
            type: 'expense_added',
            description: `Expense "${description}" ($${amount}) was added`,
            metadata: JSON.stringify({ amount, category }),
        });

        return c.json({ message: 'Expense created', expense: newExpense }, 201);
    } catch (error) {
        console.error('Error creating expense:', error);
        return c.json({ error: 'Failed to create expense' }, 500);
    }
};

export const updateExpense = async (c) => {
    const id = c.req.param('id');
    try {
        const body = await c.req.json();
        const { amount, description, category, channelId, status, date } = body;

        const db = await getDb();
        
        // Get current expense for activity logging
        const currentExpense = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id));
        
        const updateData = {};
        if (amount !== undefined) updateData.amount = String(amount);
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (channelId !== undefined) updateData.channelId = channelId;
        if (status) updateData.status = status;
        if (date) updateData.date = new Date(date);

        await db.update(schema.expenses).set(updateData).where(eq(schema.expenses.id, id));

        // Log activity if status changed to approved
        if (currentExpense.length > 0 && status === 'approved' && currentExpense[0].status !== 'approved') {
            await db.insert(schema.activities).values({
                eventId: currentExpense[0].eventId,
                type: 'expense_approved',
                description: `Expense "${currentExpense[0].description}" was approved`,
            });
        }

        return c.json({ message: 'Expense updated' });
    } catch (error) {
        console.error('Error updating expense:', error);
        return c.json({ error: 'Failed to update expense' }, 500);
    }
};

export const deleteExpense = async (c) => {
    const id = c.req.param('id');
    try {
        const db = await getDb();
        await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
        return c.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return c.json({ error: 'Failed to delete expense' }, 500);
    }
};
