import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'AI Risk Navigator',
      to: 'missy.tanksley@gmail.com',
      subject: `New Demo Request from ${email}`,
      body: `A new demo request was submitted.\n\nRequester email: ${email}\n\nReply directly to: ${email}`
    });

    // Confirm to requester
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'AI Risk Navigator',
      to: email,
      subject: 'We received your demo request',
      body: `Hi,\n\nThank you for your interest in AI Risk Navigator for Healthcare!\n\nWe received your demo request and will be in touch shortly.\n\n— The AI Risk Navigator Team`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});