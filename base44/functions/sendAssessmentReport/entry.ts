import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { assessmentId, recipientEmail, recipientName } = await req.json();
    if (!assessmentId || !recipientEmail) {
      return Response.json({ error: 'Missing assessmentId or recipientEmail' }, { status: 400 });
    }

    const assessment = await base44.asServiceRole.entities.AIRiskAssessment.get(assessmentId);
    if (!assessment) return Response.json({ error: 'Assessment not found' }, { status: 404 });

    const riskLabel = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk', critical: 'Critical Risk' }[assessment.risk_level] || 'Unknown';
    const riskColor = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }[assessment.risk_level] || '#64748b';

    const scoreRow = (label, score) => {
      const color = score < 26 ? '#10b981' : score < 51 ? '#f59e0b' : score < 76 ? '#f97316' : '#ef4444';
      return `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">${label}</td><td style="padding:6px 0;font-weight:bold;color:${color};font-size:14px;text-align:right;">${score ?? '—'}</td></tr>`;
    };

    const listItems = (items) => items?.length
      ? items.map(i => `<li style="margin-bottom:6px;color:#475569;font-size:14px;">${i}</li>`).join('')
      : '<li style="color:#94a3b8;font-size:14px;">None identified</li>';

    const body = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="background:#0f172a;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <div style="color:#60a5fa;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">AI Risk Navigator for Healthcare</div>
      <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;">Risk Assessment Report</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">${assessment.system_name}</p>
    </div>

    <!-- Risk Score Banner -->
    <div style="background:${riskColor};padding:24px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Overall Risk Score</div>
        <div style="color:#ffffff;font-size:48px;font-weight:bold;line-height:1;">${assessment.overall_risk_score}</div>
        <div style="color:rgba(255,255,255,0.9);font-size:13px;">/100 · ${riskLabel}</div>
      </div>
      ${assessment.vendor ? `<div style="text-align:right;"><div style="color:rgba(255,255,255,0.7);font-size:11px;">Vendor</div><div style="color:#ffffff;font-size:14px;font-weight:bold;">${assessment.vendor}</div></div>` : ''}
    </div>

    <!-- Body -->
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px;">

      <!-- Summary -->
      ${assessment.summary ? `
      <div style="margin-bottom:28px;">
        <h2 style="font-size:14px;font-weight:bold;color:#1e293b;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Executive Summary</h2>
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0;padding:16px;background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;">${assessment.summary}</p>
      </div>` : ''}

      <!-- Dimension Scores -->
      <div style="margin-bottom:28px;">
        <h2 style="font-size:14px;font-weight:bold;color:#1e293b;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Risk Dimension Scores</h2>
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
          <tbody style="padding:0 16px;">
            <tr><td colspan="2" style="height:8px;"></td></tr>
            ${scoreRow('Algorithmic Bias', assessment.bias_score)}
            ${scoreRow('Cybersecurity', assessment.cybersecurity_score)}
            ${scoreRow('Regulatory Compliance', assessment.compliance_score)}
            ${scoreRow('Clinical Impact', assessment.clinical_impact_score)}
            <tr><td colspan="2" style="height:8px;"></td></tr>
          </tbody>
        </table>
      </div>

      <!-- Governance Gaps -->
      ${assessment.governance_gaps?.length ? `
      <div style="margin-bottom:28px;">
        <h2 style="font-size:14px;font-weight:bold;color:#c2410c;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">⚠ Governance Gaps</h2>
        <ul style="margin:0;padding-left:20px;">${listItems(assessment.governance_gaps)}</ul>
      </div>` : ''}

      <!-- Recommendations -->
      ${assessment.recommendations?.length ? `
      <div style="margin-bottom:28px;">
        <h2 style="font-size:14px;font-weight:bold;color:#1d4ed8;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Actionable Recommendations</h2>
        <ol style="margin:0;padding-left:20px;">${listItems(assessment.recommendations)}</ol>
      </div>` : ''}

      <!-- Footer -->
      <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">Generated by AI Risk Navigator for Healthcare · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `AI Risk Report: ${assessment.system_name} — ${riskLabel} (Score: ${assessment.overall_risk_score})`,
      body,
      from_name: 'AI Risk Navigator'
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});