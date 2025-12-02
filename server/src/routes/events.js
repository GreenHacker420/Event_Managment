import { Hono } from 'hono';
import { verifyAuth } from '@hono/auth-js';
import * as eventController from '../controllers/eventController.js';
import * as channelController from '../controllers/channelController.js';
import * as taskController from '../controllers/taskController.js';
import * as expenseController from '../controllers/expenseController.js';

const events = new Hono();


events.get('/', eventController.getEvents);
events.get('/:id', eventController.getEvent);
events.post('/', eventController.createEvent);


events.get('/:eventId/tasks', taskController.getTasks);
events.post('/:eventId/tasks', taskController.createTask);
events.put('/tasks/:id', taskController.updateTask);

events.get('/:eventId/channels', channelController.getChannels);
events.post('/:eventId/channels', channelController.createChannel);
events.post('/:channelId/subgroups', channelController.createSubgroup);


events.use('/*', verifyAuth());
events.put('/:id', eventController.updateEvent);
events.delete('/:id', eventController.deleteEvent);


events.get('/:eventId/expenses', expenseController.getExpenses);
events.post('/:eventId/expenses', expenseController.createExpense);

export default events;
