import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowRight, ArrowLeft, Shield, Loader2, AlertTriangle, TrendingUp, Lock, Activity, Download, Mail, Send, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';

const steps = [
  { id: 1, title: 'System Info', icon: Shield },
  { id: 2, title: 'Bias & Data', icon: Activity },
  { id: 3, title: 'Security', icon: Lock },
  { id: 4, title: 'Compliance', icon: CheckCircle },
];

const dataSourceOptions = ['EHR / EMR', 'Claims Data', 'Medical Imaging', 'Genomic Data', 'Wearable Devices', 'External Datasets', 'Lab Results', 'Patient-Reported Outcomes'];
const securityControlOptions = ['Multi-Factor Authentication (MFA)', 'Single Sign-On (SSO)', 'Role-Based Access Control', 'Audit Logging', 'Intrusion Detection System', 'Data Loss Prevention (DLP)', 'API Gateway Controls', 'VPN / Network Segmentation'];

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'
        }`}
      >
        {checked && <CheckCircle className="h-3 w-3 text-white" />}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function getRiskColor(score) {
  if (score < 26) return { text: 'text-emerald-600', bg: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Low Risk' };
  if (score < 51) return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium Risk' };
  if (score < 76) return { text: 'text-orange-600', bg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High Risk' };
  return { text: 'text-red-600', bg: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200', label: 'Critical Risk' };
}

function exportToPDF(formData, results) {
  const doc = new jsPDF();
  const risk = getRiskColor(results.overall_risk_score);
  const riskLabel = risk.label;
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Risk Navigator for Healthcare', pageW / 2, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Risk Assessment Report', pageW / 2, 25, { align: 'center' });
  doc.setTextColor(203, 213, 225);
  doc.text(formData.system_name, pageW / 2, 33, { align: 'center' });

  // Score banner
  const scoreColors = { 'Low Risk': [16, 185, 129], 'Medium Risk': [245, 158, 11], 'High Risk': [249, 115, 22], 'Critical Risk': [239, 68, 68] };
  const [r, g, b] = scoreColors[riskLabel] || [100, 116, 139];
  doc.setFillColor(r, g, b);
  doc.rect(0, 38, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(String(results.overall_risk_score), 20, 57);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('/100', 43, 57);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(riskLabel, pageW - 20, 57, { align: 'right' });

  let y = 82;
  doc.setTextColor(30, 41, 59);

  // Summary
  if (results.summary) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('EXECUTIVE SUMMARY', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(results.summary, pageW - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 10;
  }

  // Dimension scores
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('RISK DIMENSION SCORES', 14, y);
  y += 7;
  const dims = [
    ['Algorithmic Bias', results.bias_score],
    ['Cybersecurity', results.cybersecurity_score],
    ['Regulatory Compliance', results.compliance_score],
    ['Clinical Impact', results.clinical_impact_score],
  ];
  dims.forEach(([label, score]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.text(label, 14, y);
    const sc = score ?? 0;
    const sc2 = sc < 26 ? [16,185,129] : sc < 51 ? [245,158,11] : sc < 76 ? [249,115,22] : [239,68,68];
    doc.setTextColor(...sc2);
    doc.setFont('helvetica', 'bold');
    doc.text(String(sc), pageW - 14, y, { align: 'right' });
    y += 7;
  });
  y += 5;

  // Financial Exposure
  if (results.financial_exposure) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(10);
    doc.text('FINANCIAL EXPOSURE ESTIMATE (FAIR-INFORMED)', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const fLines = doc.splitTextToSize(results.financial_exposure, pageW - 28);
    doc.text(fLines, 14, y);
    y += fLines.length * 5 + 10;
  }

  // Governance gaps
  if (results.governance_gaps?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(194, 65, 12);
    doc.setFontSize(10);
    doc.text('GOVERNANCE GAPS', 14, y);
    y += 6;
    results.governance_gaps.forEach(gap => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(`• ${gap}`, pageW - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
    });
    y += 5;
  }

  // Recommendations
  if (results.recommendations?.length) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(10);
    doc.text('RECOMMENDATIONS', 14, y);
    y += 6;
    results.recommendations.forEach((rec, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageW - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated ${new Date().toLocaleDateString()} · AI Risk Navigator for Healthcare`, pageW / 2, 290, { align: 'center' });

  doc.save(`AI-Risk-Report-${formData.system_name.replace(/\s+/g, '-')}.pdf`);
}

export default function RiskAssessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    system_name: '', system_type: '', vendor: '', deployment_context: '',
    data_sources: [], population_diversity: '', bias_testing: '', data_documented: '',
    security_controls: [], encryption: '', hipaa_baa: '', pen_testing: '',
    fda_status: '', hipaa_compliance: '', governance_policy: '', clinical_validation: ''
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const prompt = `You are a senior healthcare AI risk analyst. Analyze the following AI system and return a structured risk assessment with scores from 0–100 where higher = more risk.

AI System: ${formData.system_name} (${formData.system_type})
Vendor: ${formData.vendor || 'Not specified'}
Deployment: ${formData.deployment_context}

Bias & Data:
- Data sources: ${formData.data_sources.join(', ') || 'None specified'}
- Population diversity: ${formData.population_diversity}
- Bias testing: ${formData.bias_testing}
- Training data documented: ${formData.data_documented}

Security:
- Controls: ${formData.security_controls.join(', ') || 'None specified'}
- Data encryption: ${formData.encryption}
- HIPAA BAA: ${formData.hipaa_baa}
- Penetration testing: ${formData.pen_testing}

Compliance:
- FDA oversight: ${formData.fda_status}
- HIPAA compliance: ${formData.hipaa_compliance}
- Governance policy: ${formData.governance_policy}
- Clinical validation: ${formData.clinical_validation}

Return scores for each dimension, overall risk, risk level, a 2-3 sentence summary, up to 5 actionable recommendations, up to 4 governance gaps, and a FAIR-informed financial exposure estimate (e.g. "Estimated breach cost: $1.2M–$3.5M based on ePHI exposure and regulatory penalty risk"). Be specific and realistic for healthcare.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            bias_score: { type: 'number' },
            cybersecurity_score: { type: 'number' },
            compliance_score: { type: 'number' },
            clinical_impact_score: { type: 'number' },
            overall_risk_score: { type: 'number' },
            risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            summary: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
            governance_gaps: { type: 'array', items: { type: 'string' } },
            financial_exposure: { type: 'string' }
          }
        }
      });

      const saved = await base44.entities.AIRiskAssessment.create({ ...formData, ...response });
      setResults({ ...response, id: saved.id });
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const dimScores = results ? [
    { label: 'Algorithmic Bias', score: results.bias_score },
    { label: 'Cybersecurity', score: results.cybersecurity_score },
    { label: 'Regulatory Compliance', score: results.compliance_score },
    { label: 'Clinical Impact', score: results.clinical_impact_score },
  ] : [];

  if (results) {
    const risk = getRiskColor(results.overall_risk_score);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Assessment Complete</h1>
          <p className="text-slate-500 text-sm">{formData.system_name}</p>
        </div>

        {/* Overall Score */}
        <Card className="mb-6 border-2 border-slate-200">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center">
                <div className={`text-7xl font-bold ${risk.text}`}>{results.overall_risk_score}</div>
                <div className="text-slate-400 text-sm mt-1">/ 100</div>
              </div>
              <div className="flex-1">
                <Badge className={`${risk.badge} border text-sm px-3 py-1 mb-3`}>{risk.label}</Badge>
                <p className="text-slate-600 text-sm leading-relaxed">{results.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Exposure */}
        {results.financial_exposure && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">FAIR-Informed Financial Exposure Estimate</p>
                <p className="text-sm text-amber-900 font-medium">{results.financial_exposure}</p>
                <p className="text-xs text-amber-600 mt-1">Estimate based on risk scoring methodology inspired by the FAIR model. Not a certified financial assessment.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dimension Scores */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Dimension Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimScores.map((dim) => {
              const c = getRiskColor(dim.score);
              return (
                <div key={dim.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700 font-medium">{dim.label}</span>
                    <span className={`font-bold ${c.text}`}>{dim.score}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.bg} rounded-full`} style={{ width: `${dim.score}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recommendations */}
        {results.recommendations?.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actionable Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.recommendations.map((r, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                  <span className="text-slate-700">{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Governance Gaps */}
        {results.governance_gaps?.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Governance Gaps Identified
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.governance_gaps.map((g, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-orange-500 mt-0.5">⚠</span>
                  <span>{g}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* PDF Export */}
        <Card className="mb-4 border-slate-200">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-700">Export PDF Report</div>
              <div className="text-xs text-slate-400">Download a formatted report with all scores and recommendations.</div>
            </div>
            <Button onClick={() => exportToPDF(formData, results)} variant="outline" className="flex-shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50">
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </CardContent>
        </Card>

        {/* Email Report */}
        <Card className="mb-6 border-slate-200">
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><Mail className="h-4 w-4 text-blue-500" /> Email Report</div>
            <div className="text-xs text-slate-400 mb-3">Send this risk assessment report to a stakeholder via email.</div>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="recipient@hospital.org"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setEmailSent(false); }}
                className="flex-1"
              />
              <Button
                onClick={async () => {
                  if (!emailInput.trim()) return;
                  setEmailSending(true);
                  try {
                    await base44.functions.invoke('sendAssessmentReport', {
                      assessmentId: results.id,
                      recipientEmail: emailInput.trim()
                    });
                    setEmailSent(true);
                    setEmailInput('');
                  } catch (e) {
                    alert('Failed to send email. Please try again.');
                  }
                  setEmailSending(false);
                }}
                disabled={emailSending || !emailInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
              >
                {emailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {emailSent && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Report sent successfully!</p>}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/RiskDashboard')} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
            <TrendingUp className="h-4 w-4 mr-2" /> View in Dashboard
          </Button>
          <Button variant="outline" onClick={() => { setResults(null); setStep(1); setEmailInput(''); setEmailSent(false); setFormData({ system_name: '', system_type: '', vendor: '', deployment_context: '', data_sources: [], population_diversity: '', bias_testing: '', data_documented: '', security_controls: [], encryption: '', hipaa_baa: '', pen_testing: '', fda_status: '', hipaa_compliance: '', governance_policy: '', clinical_validation: '' }); }}>
            New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">AI System Risk Assessment</h1>
        <p className="text-slate-500 text-sm">Complete all four sections to generate your AI risk score and recommendations.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                step > s.id ? 'bg-blue-600 text-white' : step === s.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'
              }`}>
                {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block ${step >= s.id ? 'text-blue-600' : 'text-slate-400'}`}>{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{steps[step - 1].title === 'System Info' ? 'AI System Information' : steps[step - 1].title === 'Bias & Data' ? 'Bias & Data Factors' : steps[step - 1].title === 'Security' ? 'Security Controls' : 'Compliance & Governance'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Step 1 */}
          {step === 1 && (
            <>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">AI System Name <span className="text-red-500">*</span></Label>
                <Input value={formData.system_name} onChange={e => update('system_name', e.target.value)} placeholder="e.g. RadiologyAI Chest X-Ray Analyzer" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">System Type</Label>
                <Select value={formData.system_type} onValueChange={v => update('system_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostic_imaging">Diagnostic Imaging</SelectItem>
                    <SelectItem value="clinical_decision_support">Clinical Decision Support</SelectItem>
                    <SelectItem value="administrative">Administrative / Operational</SelectItem>
                    <SelectItem value="predictive_analytics">Predictive Analytics</SelectItem>
                    <SelectItem value="nlp_documentation">NLP / Documentation</SelectItem>
                    <SelectItem value="medication_management">Medication Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Vendor / Developer</Label>
                <Input value={formData.vendor} onChange={e => update('vendor', e.target.value)} placeholder="e.g. Acme Health Technologies" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Deployment Context</Label>
                <Select value={formData.deployment_context} onValueChange={v => update('deployment_context', v)}>
                  <SelectTrigger><SelectValue placeholder="Select context..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Clinical (Direct Patient Care)</SelectItem>
                    <SelectItem value="administrative">Administrative / Back Office</SelectItem>
                    <SelectItem value="research">Research / Analytics</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">Data Sources Used</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dataSourceOptions.map(opt => (
                    <Checkbox key={opt} label={opt} checked={formData.data_sources.includes(opt)} onChange={() => toggleArray('data_sources', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Population Diversity Considered</Label>
                <Select value={formData.population_diversity} onValueChange={v => update('population_diversity', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully_considered">Fully Considered</SelectItem>
                    <SelectItem value="partially_considered">Partially Considered</SelectItem>
                    <SelectItem value="not_considered">Not Considered</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Bias Testing Performed</Label>
                <Select value={formData.bias_testing} onValueChange={v => update('bias_testing', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes — Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Training Data Documentation</Label>
                <Select value={formData.data_documented} onValueChange={v => update('data_documented', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully_documented">Fully Documented</SelectItem>
                    <SelectItem value="partial">Partially Documented</SelectItem>
                    <SelectItem value="no">Not Documented</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">Security Controls In Place</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {securityControlOptions.map(opt => (
                    <Checkbox key={opt} label={opt} checked={formData.security_controls.includes(opt)} onChange={() => toggleArray('security_controls', opt)} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Data Encryption At Rest & In Transit</Label>
                <Select value={formData.encryption} onValueChange={v => update('encryption', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_both">Yes — Both At Rest & In Transit</SelectItem>
                    <SelectItem value="yes_transit">In Transit Only</SelectItem>
                    <SelectItem value="yes_rest">At Rest Only</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">HIPAA Business Associate Agreement (BAA)</Label>
                <Select value={formData.hipaa_baa} onValueChange={v => update('hipaa_baa', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes — In Place</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Penetration Testing Status</Label>
                <Select value={formData.pen_testing} onValueChange={v => update('pen_testing', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_recent">Yes — Within Past 12 Months</SelectItem>
                    <SelectItem value="yes_older">Yes — Over 12 Months Ago</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">FDA Oversight Status</Label>
                <Select value={formData.fda_status} onValueChange={v => update('fda_status', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="510k_cleared">510(k) Cleared</SelectItem>
                    <SelectItem value="de_novo">De Novo Authorized</SelectItem>
                    <SelectItem value="pma">PMA Approved</SelectItem>
                    <SelectItem value="exempt">Exempt</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    <SelectItem value="unknown">Unknown / Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">HIPAA Compliance Status</Label>
                <Select value={formData.hipaa_compliance} onValueChange={v => update('hipaa_compliance', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully_compliant">Fully Compliant</SelectItem>
                    <SelectItem value="partial">Partially Compliant</SelectItem>
                    <SelectItem value="not_compliant">Not Compliant</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Internal AI Governance Policy</Label>
                <Select value={formData.governance_policy} onValueChange={v => update('governance_policy', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_formal">Yes — Formal Policy Exists</SelectItem>
                    <SelectItem value="yes_informal">Yes — Informal / In Development</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Clinical Validation Studies</Label>
                <Select value={formData.clinical_validation} onValueChange={v => update('clinical_validation', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_published">Yes — Published Studies</SelectItem>
                    <SelectItem value="yes_internal">Yes — Internal Only</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && !formData.system_name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 min-w-[160px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                Generate Risk Score <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}