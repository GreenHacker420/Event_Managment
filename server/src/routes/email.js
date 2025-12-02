import { Hono } from 'hono';
import { requireAuth } from "../middleware/auth.js";
import emailService from '../services/emailService.js';

const email = new Hono();

email.post('/invite', requireAuth, async (c) => {
    try {
        const auth = c.get('authUser');
        const { to, eventName, eventDate, inviteLink } = await c.req.json();
        
        if (!to || !eventName) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        const inviterName = auth?.session?.user?.name || 'Someone';
        await emailService.sendEventInvite(to, inviterName, eventName, eventDate, inviteLink);
        
        return c.json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        return c.json({ error: 'Failed to send email' }, 500);
    }
});

email.post('/task-assignment', requireAuth, async (c) => {
    try {
        const auth = c.get('authUser');
        const { to, taskTitle, eventName, dueDate } = await c.req.json();
        
        if (!to || !taskTitle) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        const assignerName = auth?.session?.user?.name || 'Someone';
        await emailService.sendTaskAssignment(to, assignerName, taskTitle, eventName, dueDate);
        
        return c.json({ message: 'Task notification sent' });
    } catch (error) {
        console.error('Email error:', error);
        return c.json({ error: 'Failed to send email' }, 500);
    }
});

email.post('/reminder', requireAuth, async (c) => {
    try {
        const { to, eventName, eventDate, eventLocation } = await c.req.json();
        
        if (!to || !eventName) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        await emailService.sendEventReminder(to, eventName, eventDate, eventLocation);
        
        return c.json({ message: 'Reminder sent' });
    } catch (error) {
        console.error('Email error:', error);
        return c.json({ error: 'Failed to send email' }, 500);
    }
});

export default email;
