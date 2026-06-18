import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'AI Risk Navigator',
      to: 'missy.tanksley@gmail.com',
      subject: `New Demo Request from ${email}`,
      body: `A new demo request was submitted.\n\nRequester email: ${email}\n\nReply directly to: ${email}`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});