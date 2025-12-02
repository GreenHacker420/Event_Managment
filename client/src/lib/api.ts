import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const eventsApi = {
    getAll: () => api.get('/events').then((res) => res.data),
    getOne: (id: string) => api.get(`/events/${id}`).then((res) => res.data),
    getStats: (id: string) => api.get(`/events/${id}/stats`).then((res) => res.data),
    create: (data: any) => api.post('/events', data).then((res) => res.data),
    update: (id: string, data: any) => api.put(`/events/${id}`, data).then((res) => res.data),
    delete: (id: string) => api.delete(`/events/${id}`).then((res) => res.data),
};

export const channelsApi = {
    getAll: (eventId: string) => api.get(`/events/${eventId}/channels`).then((res) => res.data),
    create: (eventId: string, data: any) => api.post(`/events/${eventId}/channels`, data).then((res) => res.data),
    update: (id: string, data: any) => api.put(`/events/channels/${id}`, data).then((res) => res.data),
    delete: (id: string) => api.delete(`/events/channels/${id}`).then((res) => res.data),
};

export const subgroupsApi = {
    create: (channelId: string, data: any) => api.post(`/events/channels/${channelId}/subgroups`, data).then((res) => res.data),
    delete: (id: string) => api.delete(`/events/subgroups/${id}`).then((res) => res.data),
};

export const tasksApi = {
    getAll: (eventId: string) => api.get(`/events/${eventId}/tasks`).then((res) => res.data),
    create: (eventId: string, data: any) => api.post(`/events/${eventId}/tasks`, data).then((res) => res.data),
    update: (id: string, data: any) => api.put(`/events/tasks/${id}`, data).then((res) => res.data),
    delete: (id: string) => api.delete(`/events/tasks/${id}`).then((res) => res.data),
};

export const expensesApi = {
    getAll: (eventId: string) => api.get(`/events/${eventId}/expenses`).then((res) => res.data),
    create: (eventId: string, data: any) => api.post(`/events/${eventId}/expenses`, data).then((res) => res.data),
    update: (id: string, data: any) => api.put(`/events/expenses/${id}`, data).then((res) => res.data),
    delete: (id: string) => api.delete(`/events/expenses/${id}`).then((res) => res.data),
};

export const activitiesApi = {
    getAll: (eventId: string) => api.get(`/events/${eventId}/activities`).then((res) => res.data),
};

export const membersApi = {
    getAll: (eventId: string) => api.get(`/events/${eventId}/members`).then((res) => res.data),
    add: (eventId: string, data: any) => api.post(`/events/${eventId}/members`, data).then((res) => res.data),
    update: (id: string, data: any) => api.put(`/events/members/${id}`, data).then((res) => res.data),
    remove: (id: string) => api.delete(`/events/members/${id}`).then((res) => res.data),
};

export const messagesApi = {
    getAll: (eventId: string, channelId: string) => api.get(`/events/${eventId}/channels/${channelId}/messages`).then((res) => res.data),
    create: (eventId: string, channelId: string, data: any) => api.post(`/events/${eventId}/channels/${channelId}/messages`, data).then((res) => res.data),
};

export const usersApi = {
    getMe: () => api.get('/users/me').then((res) => res.data),
    updateMe: (data: any) => api.put('/users/me', data).then((res) => res.data),
    register: (data: any) => api.post('/users/register', data).then((res) => res.data),
    search: (email: string) => api.get(`/users/search/${email}`).then((res) => res.data),
};

export default api;
