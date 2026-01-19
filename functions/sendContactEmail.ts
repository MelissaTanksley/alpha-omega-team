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

        // Send email notification via SendGrid
        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
        
        if (SENDGRID_API_KEY) {
            try {
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{
                            to: [{ email: 'melissa.alphaomega@gmail.com' }],
                            subject: language === 'es' 
                                ? `Nuevo mensaje de contacto de ${name}`
                                : `New Contact Form Message from ${name}`
                        }],
                        from: { 
                            email: 'noreply@alphaomega.com',
                            name: 'Alpha Omega Contact Form'
                        },
                        reply_to: { email: email },
                        content: [{
                            type: 'text/plain',
                            value: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nReply to: ${email}`
                        }]
                    })
                });

                if (!response.ok) {
                    const error = await response.text();
                    console.error('SendGrid error:', error);
                }
            } catch (emailError) {
                console.error('Failed to send email:', emailError.message);
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error saving contact submission:', error);
        return Response.json({ 
            error: error.message || 'Failed to send message' 
        }, { status: 500 });
    }
});