import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin access
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { to, name, originalMessage, reply, language = 'en' } = await req.json();

        if (!to || !reply) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send reply email using service role
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'Alpha Omega Team',
            to: to,
            subject: language === 'es' 
                ? 'Respuesta a tu mensaje'
                : 'Response to your message',
            body: `
Hi ${name || 'there'},

Thank you for contacting us. Here's our response to your message:

${reply}

---
Your Original Message:
${originalMessage}

Best regards,
Alpha Omega Team
            `
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error sending reply:', error);
        return Response.json({ 
            error: error.message || 'Failed to send reply' 
        }, { status: 500 });
    }
});