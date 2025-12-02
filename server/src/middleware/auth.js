// Middleware to check Better-Auth session
export const requireAuth = async (c, next) => {
    const user = c.get('user');
    const session = c.get('session');

    if (!user || !session) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
};
