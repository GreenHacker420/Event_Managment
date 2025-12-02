import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const baseStyles = `
    font-family: 'Georgia', serif;
    background-color: #fffef5;
    color: #1a1a1a;
`;

const buttonStyle = `
    display: inline-block;
    padding: 16px 32px;
    background-color: #1a1a1a;
    color: #fffef5;
    text-decoration: none;
    border-radius: 50px;
    font-weight: bold;
    font-size: 16px;
`;

const cardStyle = `
    background-color: #ffffff;
    border: 2px solid #1a1a1a;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 8px 8px 0px rgba(0,0,0,0.05);
`;

export const sendWelcomeEmail = async (to, name) => {
    const html = `
    <div style="${baseStyles} padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="${cardStyle}">
                <h1 style="font-size: 32px; margin-bottom: 16px;">Welcome to EventFlow! 🎉</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #1a1a1a;">
                    Hey ${name},
                </p>
                <p style="font-size: 18px; line-height: 1.6; color: #666;">
                    We're thrilled to have you on board! EventFlow helps you organize amazing events 
                    with your team, manage budgets, and keep everything running smoothly.
                </p>
                <div style="margin: 32px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="${buttonStyle}">
                        Get Started
                    </a>
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 32px;">
                    Happy organizing!<br/>
                    The EventFlow Team
                </p>
            </div>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"EventFlow" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Welcome to EventFlow! 🎉',
        html,
    });
};

export const sendEventInvite = async (to, inviterName, eventName, eventDate, inviteLink) => {
    const html = `
    <div style="${baseStyles} padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="${cardStyle}">
                <h1 style="font-size: 28px; margin-bottom: 16px;">You're Invited! 📬</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #1a1a1a;">
                    <strong>${inviterName}</strong> has invited you to join their event team.
                </p>
                <div style="background: #f5f5dc; padding: 24px; border-radius: 12px; margin: 24px 0;">
                    <h2 style="margin: 0 0 8px 0; font-size: 24px;">${eventName}</h2>
                    <p style="margin: 0; color: #666; font-size: 16px;">📅 ${eventDate}</p>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${inviteLink}" style="${buttonStyle}">
                        Accept Invitation
                    </a>
                </div>
                <p style="font-size: 14px; color: #999;">
                    If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"EventFlow" <${process.env.SMTP_USER}>`,
        to,
        subject: `You're invited to ${eventName}!`,
        html,
    });
};

export const sendTaskAssignment = async (to, assignerName, taskTitle, eventName, dueDate) => {
    const html = `
    <div style="${baseStyles} padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="${cardStyle}">
                <h1 style="font-size: 28px; margin-bottom: 16px;">New Task Assigned ✅</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #1a1a1a;">
                    <strong>${assignerName}</strong> assigned you a new task.
                </p>
                <div style="background: #fff8dc; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #1a1a1a;">
                    <h2 style="margin: 0 0 8px 0; font-size: 20px;">${taskTitle}</h2>
                    <p style="margin: 0; color: #666; font-size: 14px;">Event: ${eventName}</p>
                    ${dueDate ? `<p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">📅 Due: ${dueDate}</p>` : ''}
                </div>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks" style="${buttonStyle}">
                        View Task
                    </a>
                </div>
            </div>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"EventFlow" <${process.env.SMTP_USER}>`,
        to,
        subject: `New task: ${taskTitle}`,
        html,
    });
};

export const sendExpenseApproval = async (to, expenseDesc, amount, status, eventName) => {
    const statusColor = status === 'approved' ? '#22c55e' : '#ef4444';
    const statusText = status === 'approved' ? 'Approved ✓' : 'Rejected ✗';
    
    const html = `
    <div style="${baseStyles} padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="${cardStyle}">
                <h1 style="font-size: 28px; margin-bottom: 16px;">Expense ${statusText}</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #1a1a1a;">
                    Your expense request has been reviewed.
                </p>
                <div style="background: #f9f9f9; padding: 24px; border-radius: 12px; margin: 24px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 18px;"><strong>${expenseDesc}</strong></p>
                    <p style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">$${amount}</p>
                    <p style="margin: 0; color: #666; font-size: 14px;">Event: ${eventName}</p>
                    <p style="margin: 16px 0 0 0;">
                        <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                            ${statusText}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"EventFlow" <${process.env.SMTP_USER}>`,
        to,
        subject: `Expense ${status}: ${expenseDesc}`,
        html,
    });
};

export const sendEventReminder = async (to, eventName, eventDate, eventLocation) => {
    const html = `
    <div style="${baseStyles} padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="${cardStyle}">
                <h1 style="font-size: 28px; margin-bottom: 16px;">Event Reminder 🔔</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #1a1a1a;">
                    Don't forget! Your event is coming up soon.
                </p>
                <div style="background: linear-gradient(135deg, #f5f5dc 0%, #fffef5 100%); padding: 32px; border-radius: 16px; margin: 24px 0; border: 2px solid #1a1a1a;">
                    <h2 style="margin: 0 0 16px 0; font-size: 28px;">${eventName}</h2>
                    <p style="margin: 0 0 8px 0; font-size: 18px;">📅 ${eventDate}</p>
                    ${eventLocation ? `<p style="margin: 0; font-size: 18px;">📍 ${eventLocation}</p>` : ''}
                </div>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="${buttonStyle}">
                        View Event
                    </a>
                </div>
            </div>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"EventFlow" <${process.env.SMTP_USER}>`,
        to,
        subject: `Reminder: ${eventName} is coming up!`,
        html,
    });
};

export default {
    sendWelcomeEmail,
    sendEventInvite,
    sendTaskAssignment,
    sendExpenseApproval,
    sendEventReminder,
};
