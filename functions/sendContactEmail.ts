import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { name, email, message, language = 'en' } = await req.json();

        if (!name || !email || !message) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send email using service role to bypass user restrictions
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'Alpha Omega Contact Form',
            to: 'alphaomegateam.llc@gmail.com',
            subject: language === 'es' 
                ? `Nuevo mensaje de contacto de ${name}`
                : `New Contact Form Message from ${name}`,
            body: `
Name: ${name}
Email: ${email}

Message:
${message}

---
Reply to: ${email}
            `
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error sending contact email:', error);
        return Response.json({ 
            error: error.message || 'Failed to send message' 
        }, { status: 500 });
    }
});