import { Hono } from 'hono';
import { verifyAuth } from '@hono/auth-js';
import * as eventController from '../controllers/eventController.js';
import * as channelController from '../controllers/channelController.js';
import * as taskController from '../controllers/taskController.js';
import * as expenseController from '../controllers/expenseController.js';
import * as memberController from '../controllers/memberController.js';
import * as activityController from '../controllers/activityController.js';
import * as messageController from '../controllers/messageController.js';

const events = new Hono();

// Public routes (read-only)
events.get('/', eventController.getEvents);
events.get('/:id', eventController.getEvent);
events.get('/:eventId/stats', eventController.getEventStats);

// Tasks
events.get('/:eventId/tasks', taskController.getTasks);
events.post('/:eventId/tasks', taskController.createTask);
events.put('/tasks/:id', taskController.updateTask);
events.delete('/tasks/:id', taskController.deleteTask);

// Channels
events.get('/:eventId/channels', channelController.getChannels);
events.post('/:eventId/channels', channelController.createChannel);
events.put('/channels/:id', channelController.updateChannel);
events.delete('/channels/:id', channelController.deleteChannel);

// Subgroups - Fixed route: /api/events/channels/:channelId/subgroups
events.post('/channels/:channelId/subgroups', channelController.createSubgroup);
events.delete('/subgroups/:id', channelController.deleteSubgroup);

// Expenses
events.get('/:eventId/expenses', expenseController.getExpenses);
events.post('/:eventId/expenses', expenseController.createExpense);
events.put('/expenses/:id', expenseController.updateExpense);
events.delete('/expenses/:id', expenseController.deleteExpense);

// Activities
events.get('/:eventId/activities', activityController.getActivities);

// Messages (Chat)
events.get('/:eventId/channels/:channelId/messages', messageController.getMessages);
events.post('/:eventId/channels/:channelId/messages', messageController.createMessage);

// Team Members
events.get('/:eventId/members', memberController.getMembers);
events.post('/:eventId/members', memberController.addMember);
events.put('/members/:id', memberController.updateMember);
events.delete('/members/:id', memberController.removeMember);

// Protected routes (require auth)
events.use('/*', verifyAuth());
events.post('/', eventController.createEvent);
events.put('/:id', eventController.updateEvent);
events.delete('/:id', eventController.deleteEvent);

export default events;
