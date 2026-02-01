import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { name, email, message, language = 'en' } = await req.json();

        if (!name || !email || !message) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Store contact submission in database
        await base44.asServiceRole.entities.ContactSubmission.create({
            name,
            email,
            message,
            language,
            status: 'new'
        });

        // Send email notification using Base44's built-in email
        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: 'Alpha Omega Contact Form',
                to: 'melissa.alphaomega@gmail.com',
                subject: language === 'es' 
                    ? `Nuevo mensaje de contacto de ${name}`
                    : `New Contact Form Message from ${name}`,
                body: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nReply to this person at: ${email}`
            });
        } catch (emailError) {
            console.error('Failed to send email:', emailError.message);
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error saving contact submission:', error);
        return Response.json({ 
            error: error.message || 'Failed to send message' 
        }, { status: 500 });
    }
});