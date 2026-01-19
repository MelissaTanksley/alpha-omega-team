import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin access
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { email, role = 'admin' } = await req.json();

        if (!email) {
            return Response.json({ error: 'Email is required' }, { status: 400 });
        }

        await base44.users.inviteUser(email, role);

        return Response.json({ success: true, message: `Invited ${email} as ${role}` });
    } catch (error) {
        console.error('Error inviting user:', error);
        return Response.json({ 
            error: error.message || 'Failed to invite user' 
        }, { status: 500 });
    }
});