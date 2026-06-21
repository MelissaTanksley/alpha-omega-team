import React, { useState, useEffect, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowRight, ArrowLeft, Shield, Loader2, AlertTriangle, TrendingUp, Lock, Activity, Download, Mail, Send, DollarSign, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';
import RiskMappingCard from '@/components/RiskMappingCard';
import ComplianceAssetMap from '@/components/ComplianceAssetMap';
import AssetComplianceExample from '@/components/AssetComplianceExample';
import ComprehensiveRiskCard from '@/components/ComprehensiveRiskCard';
import RecentAssessments from '@/components/RecentAssessments';

class ResultsErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('Results render error:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Assessment complete, but results failed to load.</h2>
            <p className="text-slate-500 text-sm mb-6">Your assessment was saved. You can view it in the GRC Report or start a new assessment.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = '/GRCReport'} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <FileText className="h-4 w-4 mr-2" /> View Report
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Start New Assessment</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const steps = [
  { id: 1, title: 'System Info', icon: Shield },
  { id: 2, title: 'Key Assets', icon: Activity },
  { id: 3, title: 'Bias & Data', icon: Activity },
  { id: 4, title: 'Security', icon: Lock },
  { id: 5, title: 'Compliance', icon: CheckCircle },
];

const assetOptions = [
  { id: 'clinical_ai', label: 'Clinical AI Systems', desc: 'Deployed AI tools used in clinical workflows' },
  { id: 'ai_model', label: 'AI Model & Training Data', desc: 'Algorithms, weights, and datasets used to train or run the AI' },
  { id: 'ephi', label: 'Patient Data (ePHI)', desc: 'Electronic protected health information processed by the system' },
  { id: 'ehr', label: 'EHR / Core Systems', desc: 'Electronic health record platforms and core clinical infrastructure' },
  { id: 'api', label: 'APIs and Integrations', desc: 'Data exchange interfaces and third-party service connections' },
  { id: 'vendor', label: 'Third-Party Vendors', desc: 'External suppliers, cloud providers, or managed service partners' },
];

const inferredAssets = {
  diagnostic_imaging: ['clinical_ai', 'ai_model', 'ephi', 'ehr'],
  diagnostic_labs: ['clinical_ai', 'ai_model', 'ephi', 'ehr'],
  clinical_decision_support: ['clinical_ai', 'ai_model', 'ephi', 'api'],
  nlp_documentation: ['clinical_ai', 'ai_model', 'ephi', 'ehr'],
  predictive_analytics: ['ai_model', 'ephi', 'api', 'vendor'],
  patient_monitoring: ['clinical_ai', 'ai_model', 'ephi', 'api'],
  medication_management: ['clinical_ai', 'ai_model', 'ephi', 'vendor'],
  administrative: ['api', 'ehr', 'vendor'],
  conversational_ai: ['clinical_ai', 'ephi', 'api', 'vendor'],
  population_health: ['ai_model', 'ephi', 'api'],
  computer_vision: ['clinical_ai', 'ai_model', 'ephi', 'ehr'],
  third_party_api: ['api', 'vendor', 'ephi'],
  research: ['ai_model', 'ephi'],
  other: ['ai_model', 'ephi', 'api'],
};

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
      const gapText = typeof gap === 'string' ? gap : gap.gap;
      const framework = typeof gap === 'object' && gap.control_framework ? ` (${gap.control_framework})` : '';
      const asset = typeof gap === 'object' && gap.affected_asset ? ` → ${gap.affected_asset}` : '';
      const lines = doc.splitTextToSize(`• ${gapText}${asset}${framework}`, pageW - 28);
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
      const recText = typeof rec === 'string' ? rec : rec.recommendation;
      const asset = typeof rec === 'object' && rec.affected_asset ? ` [${rec.affected_asset}]` : '';
      const lines = doc.splitTextToSize(`${i + 1}. ${recText}${asset}`, pageW - 28);
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
  useEffect(() => {
    const title = 'Risk Assessment | AI Risk Navigator';
    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  }, []);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [selectedFrameworks, setSelectedFrameworks] = useState({
    hipaa: true,
    nist_csf: true,
    iso_27005: true,
    gdpr: false,
    nist_rmf: true,
  });
  const [formData, setFormData] = useState({
    system_name: '', system_type: '', vendor: '', deployment_context: '',
    key_assets: [], custom_asset: '',
    data_sources: [], population_diversity: '', bias_testing: '', data_documented: '',
    security_controls: [], encryption: '', hipaa_baa: '', pen_testing: '',
    fda_status: '', hipaa_compliance: '', governance_policy: '', clinical_validation: ''
  });

  useEffect(() => {
    loadRecentAssessments();
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      runDemoMode();
    }
  }, []);

  const loadRecentAssessments = async () => {
    try {
      const data = await base44.entities.AIRiskAssessment.list('-updated_date', 5);
      setRecentAssessments(data);
    } catch (error) {
      console.error('Failed to load recent assessments:', error);
    }
  };

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const runDemoMode = () => {
    // Instantly navigate to GRC Report with prebuilt demo data — no API calls
    window.location.href = '/GRCReport?demo=1';
  };

  const getEffectiveAssets = () => {
    const selected = formData.key_assets.length > 0 ? formData.key_assets : (inferredAssets[formData.system_type] || ['ai_model', 'ephi']);
    const labels = selected.map(id => assetOptions.find(a => a.id === id)?.label).filter(Boolean);
    if (formData.custom_asset?.trim()) labels.push(formData.custom_asset.trim());
    return labels;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    const effectiveAssets = getEffectiveAssets();

    // Compute sensitivity modifier based on assets and data sources
    const hasEPHI = effectiveAssets.some(a => a.toLowerCase().includes('ephi') || a.toLowerCase().includes('patient'));
    const hasHighSensitivity = formData.data_sources.some(s => ['Medical Imaging', 'Genomic Data', 'Lab Results'].includes(s));
    const sensitivityModifier = hasEPHI ? 1.5 : hasHighSensitivity ? 1.2 : 1.0;

    try {
      const prompt = `You are a senior healthcare AI Governance, Risk, and Compliance (GRC) analyst. Perform a structured, defensible risk assessment aligned with ISO 27005, NIST CSF 2.0, HIPAA, and healthcare AI governance best practices.

=== SYSTEM UNDER ASSESSMENT ===
System Name: ${formData.system_name}
System Type: ${formData.system_type}
Vendor: ${formData.vendor || 'Not specified'}
Deployment Context: ${formData.deployment_context}
Key Assets: ${effectiveAssets.join(', ')}${formData.key_assets.length === 0 ? ' (inferred from system type)' : ''}

=== DOMAIN 1: DATA & PRIVACY ===
- Data sources used: ${formData.data_sources.join(', ') || 'None specified'}
- ePHI or sensitive data present: ${hasEPHI ? 'YES — Sensitivity Modifier: 1.5×' : hasHighSensitivity ? 'YES (high-sensitivity data) — Sensitivity Modifier: 1.2×' : 'No — Sensitivity Modifier: 1.0×'}
- Training data documented: ${formData.data_documented}

=== DOMAIN 2: AI MODEL BEHAVIOR ===
- Population diversity in training data: ${formData.population_diversity}
- Bias testing performed: ${formData.bias_testing}
- Clinical validation studies: ${formData.clinical_validation}

=== DOMAIN 3: SECURITY & INFRASTRUCTURE ===
- Security controls in place: ${formData.security_controls.join(', ') || 'None specified'}
- Data encryption status: ${formData.encryption}
- Penetration testing: ${formData.pen_testing}
- HIPAA Business Associate Agreement: ${formData.hipaa_baa}

=== DOMAIN 4: GOVERNANCE & COMPLIANCE ===
- FDA oversight status: ${formData.fda_status}
- HIPAA compliance status: ${formData.hipaa_compliance}
- Internal AI governance policy: ${formData.governance_policy}

=== DOMAIN 5: THIRD-PARTY / VENDOR RISK ===
- Vendor: ${formData.vendor || 'Not specified'}
- BAA status: ${formData.hipaa_baa}
- External data sources: ${formData.data_sources.filter(s => ['External Datasets', 'Wearable Devices'].includes(s)).join(', ') || 'None'}

=== SCORING METHODOLOGY ===
Score each domain using: Risk Score = Likelihood (1–5) × Impact (1–5) × Sensitivity Modifier (${sensitivityModifier}), normalized to 0–100.

Likelihood scale: 1=Very Unlikely, 2=Unlikely, 3=Possible, 4=Likely, 5=Very Likely (base on missing controls, exposure level, and threat presence).
Impact scale: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe (consider patient safety risk, regulatory penalty, and operational disruption).
Sensitivity modifier applied: ${sensitivityModifier} (${hasEPHI ? 'ePHI present' : hasHighSensitivity ? 'high-sensitivity health data' : 'standard sensitivity'}).

Domain mapping:
- bias_score: derived from Domain 1 (Data & Privacy) + Domain 2 (AI Model Behavior)
- cybersecurity_score: derived from Domain 3 (Security & Infrastructure)
- compliance_score: derived from Domain 4 (Governance & Compliance)
- clinical_impact_score: derived from Domain 2 (AI Model Behavior) + patient safety risk from all domains
- overall_risk_score: weighted average — clinical_impact 30%, cybersecurity 25%, compliance 25%, bias 20%

=== OUTPUT REQUIREMENTS ===

SUMMARY: 3–4 sentences. Healthcare-specific. Reference the system name, key assets, and specific risk drivers identified. Mention sensitivity modifier if ePHI is involved.

RECOMMENDATIONS: Return 5–7 objects. Each must be actionable, specific to healthcare, and traceable to input data:
{ "recommendation": "<specific action>", "affected_asset": "<asset from list>", "domain": "<Data & Privacy | AI Model Behavior | Security & Infrastructure | Governance & Compliance | Third-Party Risk>", "priority": "<immediate | short-term | ongoing>" }

GOVERNANCE GAPS: Return 5–8 objects. Each gap must name a specific control requirement, cite the exact regulatory clause where possible, and be traceable to user inputs:
{ "gap": "<specific gap description with regulatory reference>", "affected_asset": "<asset>", "control_framework": "<HIPAA §164.xxx | NIST CSF PR.DS | ISO 27005 | NIST RMF | FDA 21 CFR>", "risk_domain": "<domain name>" }

Rules for governance_gaps:
- At least 1 HIPAA gap referencing a specific safeguard section
- At least 1 NIST CSF gap referencing a specific subcategory (e.g. PR.DS-1, DE.CM-4)
- At least 1 NIST RMF gap naming the specific RMF step (Categorize/Select/Implement/Assess/Authorize/Monitor)
- If ePHI present, include at least 1 GDPR gap referencing Article 30 or Article 35 (DPIA)
- All gaps must be traceable to the user's input (e.g. "No bias testing reported" → reference bias_testing field)

FINANCIAL EXPOSURE: FAIR-informed estimate. Reference specific regulatory penalty ranges (HIPAA: up to $1.9M per violation category per year; OCR settlements) and operational cost ranges for healthcare AI incidents.

Be specific, realistic, and clinically grounded. Avoid generic AI risk language.`;

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
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  affected_asset: { type: 'string' },
                  domain: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            governance_gaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  gap: { type: 'string' },
                  affected_asset: { type: 'string' },
                  control_framework: { type: 'string' },
                  risk_domain: { type: 'string' }
                }
              }
            },
            financial_exposure: { type: 'string' }
          }
        }
      });

      let savedId = null;
      try {
        const saved = await base44.entities.AIRiskAssessment.create({ ...formData, key_assets: getEffectiveAssets(), ...response });
        savedId = saved.id;
        loadRecentAssessments();
      } catch (saveErr) {
        console.warn('Could not save assessment to database:', saveErr);
      }
      const finalResults = { ...response, id: savedId, selectedFrameworks };
      console.log('Assessment complete. Results:', finalResults);
      setResults(finalResults);
    } catch (err) {
      console.error('Assessment failed:', err);
      setSubmitError('Analysis failed. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const dimScores = results ? [
    { label: 'Algorithmic Bias', score: results.bias_score },
    { label: 'Cybersecurity', score: results.cybersecurity_score },
    { label: 'Regulatory Compliance', score: results.compliance_score },
    { label: 'Clinical Impact', score: results.clinical_impact_score },
  ] : [];

  if (loading && !results) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-slate-700 font-semibold text-lg">Analyzing…</p>
          <p className="text-slate-400 text-sm mt-1">Running risk analysis against selected frameworks</p>
        </div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Assessment Results</h2>
          <p className="text-slate-500 text-sm mb-6">{submitError}</p>
          <Button
            onClick={() => { setSubmitError(null); setStep(1); }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (results) {
    const risk = getRiskColor(results.overall_risk_score ?? 50);
    const resultsContent = (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Assessment Complete</h1>
          <p className="text-slate-500 text-sm">{formData.system_name}</p>
        </div>

        {/* Scoring Methodology Note */}
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
          <span className="text-blue-500 text-xs mt-0.5 flex-shrink-0">ℹ️</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Scoring Methodology:</strong> Risk scores are derived from a structured methodology combining likelihood (1–5), impact (1–5), and data sensitivity factors (ePHI = 1.5×, high-sensitivity data = 1.2×, standard = 1.0×), normalized to a 0–100 scale. This approach is aligned with ISO 27005 and healthcare-specific AI risk considerations including HIPAA, NIST CSF 2.0, and FDA guidance.
          </p>
        </div>

        {/* Framework Alignment Header */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">NIST CSF 2.0 Functions</p>
            <div className="flex flex-wrap gap-2">
              {['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'].map((fn) => (
                <span key={fn} className="text-xs bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                  {fn}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Compliance Frameworks Assessed</p>
            <div className="flex flex-wrap gap-2">
              {results.selectedFrameworks?.hipaa && <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full font-medium">HIPAA</span>}
              {results.selectedFrameworks?.nist_csf && <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full font-medium">NIST CSF 2.0</span>}
              {results.selectedFrameworks?.iso_27005 && <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full font-medium">ISO/IEC 27005</span>}
              {results.selectedFrameworks?.gdpr && <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full font-medium">GDPR</span>}
              {results.selectedFrameworks?.nist_rmf && <span className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-full font-medium">NIST RMF</span>}
            </div>
          </div>
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

        {/* ═════════════════════════════════════════════════════════════════════════════ */}
        {/* NIST CSF 2.0 LIFECYCLE ALIGNMENT */}
        {/* ═════════════════════════════════════════════════════════════════════════════ */}

        {/* 1. GOVERN */}
        <Card className="mb-6 border-l-4 border-l-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-700 text-white text-xs font-bold rounded-full">1</span>
              Govern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Risk Appetite (Healthcare)</p>
              <p className="text-sm text-slate-700">Low risk tolerance — Clinical AI systems require robust governance, audit trails, and human oversight.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Governance Context</p>
              <p className="text-xs text-slate-700 mb-3 italic">
                {formData.system_name} operates under <strong>low risk tolerance</strong> in a regulated healthcare environment. AI governance policies must ensure clinical validation, audit trails, and continuous oversight.
              </p>
              <p className="text-xs font-semibold text-slate-600 mb-1">Key Requirements:</p>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Model validation & clinical validation before deployment</li>
                <li>Continuous performance monitoring and bias detection</li>
                <li>Documentation of training data, limitations, and use cases</li>
                <li>Escalation protocols for unexpected outputs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 2. IDENTIFY */}
        <Card className="mb-6 border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">2</span>
              Identify
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Key Assets Involved</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {getEffectiveAssets().map((asset, i) => (
                  <span key={i} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            {/* Asset → Compliance Mapping */}
            {getEffectiveAssets().length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Asset → Compliance Traceability</p>
                <ComplianceAssetMap
                  asset={getEffectiveAssets()[0] || 'AI Model'}
                  hipaaType="Technical"
                  hipaaDescription="Encryption at rest/transit, access controls, audit logs"
                  nistFunctions={['Protect', 'Detect', 'Respond']}
                  justification={`${getEffectiveAssets()[0] || 'This asset'} processes and stores ePHI. Technical HIPAA safeguards require encrypted data transmission, authenticated access, and comprehensive audit trails. NIST CSF Protect ensures availability; Detect enables breach detection; Respond orchestrates containment.`}
                  compact={true}
                />
                {getEffectiveAssets()[1] && (
                  <ComplianceAssetMap
                    asset={getEffectiveAssets()[1]}
                    hipaaType="Administrative"
                    hipaaDescription="Workforce security, authorization, workforce training"
                    nistFunctions={['Govern', 'Identify']}
                    justification={`${getEffectiveAssets()[1]} involves staff interaction. Administrative safeguards mandate role-based access policies and workforce training. NIST Govern ensures organizational context; Identify maintains asset inventory.`}
                    compact={true}
                  />
                )}
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Risk Profile</p>
              <p className="text-sm text-slate-700">
                <strong>{risk.label}</strong> — {formData.system_name} has identified risks across {Object.keys(dimScores).length} dimensions. See dimension breakdown below for specific risk areas.
              </p>
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

        {/* Comprehensive Risk Assessment (Complete Chain + Compliance) */}
        {results.recommendations?.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-indigo-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full">✓</span>
                Complete Risk Assessment (Asset → Threat → Risk → Control → Compliance)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ComprehensiveRiskCard
                asset={getEffectiveAssets()[0] + ' + ePHI' || 'AI Model + ePHI'}
                threat="Model hallucination or incorrect clinical output"
                risk="Patient safety impact and violation of data integrity requirements"
                control={results.recommendations[0] || 'Implement human-in-the-loop validation and output monitoring'}
                nistFunctions={['Identify', 'Protect', 'Detect']}
                hipaaType="Technical Safeguards"
                riskLevel={results.risk_level || 'medium'}
                compact={false}
              />
            </CardContent>
          </Card>
        )}

        {/* 3. PROTECT */}
        <Card className="mb-6 border-l-4 border-l-emerald-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full">3</span>
              Protect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Current Controls</p>
              {formData.security_controls?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {formData.security_controls.map((ctl, i) => (
                    <span key={i} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">
                      {ctl}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">No controls selected.</p>
              )}
              <p className="text-xs text-emerald-600 mt-2">ℹ️ Enhance with recommendations below.</p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Dimension Breakdown (Under Identify/Protect) */}
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

        {/* 4. DETECT + 5. RESPOND */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="border-l-4 border-l-orange-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full">4</span>
                Detect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 rounded-lg p-3 space-y-2 text-xs">
                <p className="font-semibold text-slate-600">Monitoring Recommendations:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>AI output anomaly detection</li>
                  <li>Audit logs for all AI decisions</li>
                  <li>Performance monitoring vs. baseline</li>
                  <li>User feedback/complaint tracking</li>
                  <li>Security event monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">5</span>
                Respond
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 rounded-lg p-3 space-y-2 text-xs">
                <p className="font-semibold text-slate-600">Response Actions:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Disable AI output if anomalies detected</li>
                  <li>Escalate to clinician immediately</li>
                  <li>Document incident and root cause</li>
                  <li>Notify relevant stakeholders</li>
                  <li>Initiate investigation procedure</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 6. RECOVER */}
        <Card className="mb-6 border-l-4 border-l-purple-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full">6</span>
              Recover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 rounded-lg p-3 space-y-2 text-xs">
              <p className="font-semibold text-slate-600">Recovery Considerations:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Restore system integrity after incident</li>
                <li>Validate AI outputs before re-enabling</li>
                <li>Verify data consistency and completeness</li>
                <li>Retrain or recalibrate model if needed</li>
                <li>Document lessons learned & improvements</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* HHS HICP Healthcare Guidance */}
        <Card className="mb-6 border-l-4 border-l-teal-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-600 text-white text-xs font-bold rounded-full">+</span>
              Healthcare Security Practices (HICP)
              <span className="text-xs font-normal text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">HHS Supporting Guidance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-3">The HHS Health Industry Cybersecurity Practices (HICP) publication provides threat-based, real-world guidance for healthcare organizations. The following HICP threat categories are relevant to this assessment.</p>
            <div className="space-y-2 text-xs">
              {[
                { threat: 'Phishing Attacks', desc: 'Staff with access to the AI system and ePHI are targets for credential phishing. Implement phishing-resistant MFA and security awareness training.' },
                { threat: 'Ransomware', desc: 'AI infrastructure and clinical data stores are high-value ransomware targets. Maintain offline backups, network segmentation, and incident response playbooks.' },
                { threat: 'Data Loss & Exposure', desc: 'AI systems processing ePHI risk unauthorized data exposure. Enforce data loss prevention (DLP), encryption at rest/transit, and access logging.' },
              ].map((item, i) => (
                <div key={i} className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                  <p className="font-semibold text-teal-800 mb-1">▸ {item.threat}</p>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {results.recommendations?.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actionable Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {results.recommendations.map((r, i) => {
                const recText = (typeof r === 'string' ? r : r?.recommendation) || '';
                const asset = typeof r === 'object' && r?.affected_asset ? r.affected_asset : null;
                if (!recText) return null;

                // Determine NIST CSF 2.0 function based on recommendation text
                let nistFn = 'Protect';
                let tagBg = 'bg-emerald-100';
                let tagText = 'text-emerald-700';
                
                const lowerRec = recText.toLowerCase();
                if (lowerRec.includes('monitor') || lowerRec.includes('audit') || lowerRec.includes('log') || lowerRec.includes('detect')) {
                  nistFn = 'Detect';
                  tagBg = 'bg-orange-100';
                  tagText = 'text-orange-700';
                } else if (lowerRec.includes('policy') || lowerRec.includes('governance') || lowerRec.includes('procedure') || lowerRec.includes('govern')) {
                  nistFn = 'Govern';
                  tagBg = 'bg-slate-200';
                  tagText = 'text-slate-700';
                } else if (lowerRec.includes('respond') || lowerRec.includes('escalate') || lowerRec.includes('incident') || lowerRec.includes('disable')) {
                  nistFn = 'Respond';
                  tagBg = 'bg-red-100';
                  tagText = 'text-red-700';
                } else if (lowerRec.includes('recover') || lowerRec.includes('restore') || lowerRec.includes('validate') || lowerRec.includes('retrain')) {
                  nistFn = 'Recover';
                  tagBg = 'bg-purple-100';
                  tagText = 'text-purple-700';
                }

                const priority = typeof r === 'object' && r.priority ? r.priority : null;
                const domain = typeof r === 'object' && r.domain ? r.domain : null;
                const priorityColors = { immediate: 'bg-red-100 text-red-700', 'short-term': 'bg-amber-100 text-amber-700', ongoing: 'bg-slate-100 text-slate-600' };

                return (
                  <div key={i} className="flex gap-2 items-start text-sm border border-slate-100 rounded-lg p-2.5 bg-white">
                    <span className={`${tagBg} ${tagText} text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 mt-0.5`}>
                      {nistFn}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-700">{recText}</div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {asset && <span className="text-xs text-blue-600">📍 {asset}</span>}
                        {domain && <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{domain}</span>}
                        {priority && <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${priorityColors[priority] || 'bg-slate-100 text-slate-600'}`}>{priority}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Example: ePHI in AI-Generated Notes */}
        <AssetComplianceExample />

        {/* Governance Gaps */}
        {results.governance_gaps?.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Governance Gaps Identified
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.governance_gaps.map((g, i) => {
                const gapText = (typeof g === 'string' ? g : g?.gap) || '';
                const asset = typeof g === 'object' && g?.affected_asset ? g.affected_asset : null;
                const framework = typeof g === 'object' && g?.control_framework ? g.control_framework : null;
                if (!gapText) return null;

                // Tag governance gaps with NIST function and response action
                const lowerGap = gapText.toLowerCase();
                let nistFn = 'Govern';
                let responseAction = '';
                
                if (lowerGap.includes('monitor') || lowerGap.includes('audit') || lowerGap.includes('log')) {
                  nistFn = 'Detect';
                  responseAction = 'Implement continuous monitoring and audit logging.';
                } else if (lowerGap.includes('control') || lowerGap.includes('security')) {
                  nistFn = 'Protect';
                  responseAction = 'Deploy technical and administrative controls to protect system.';
                } else if (lowerGap.includes('incident') || lowerGap.includes('response') || lowerGap.includes('escalat')) {
                  nistFn = 'Respond';
                  responseAction = 'Establish incident response procedures and escalation protocols.';
                } else if (lowerGap.includes('recover') || lowerGap.includes('restore') || lowerGap.includes('backup')) {
                  nistFn = 'Recover';
                  responseAction = 'Develop recovery procedures and backup/restore capabilities.';
                } else {
                  responseAction = 'Establish governance policies and procedures.';
                }

                const riskDomain = typeof g === 'object' && g.risk_domain ? g.risk_domain : null;

                return (
                  <div key={i} className="border border-orange-100 rounded-lg p-3 bg-orange-50">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs font-bold bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">
                        ⚠ {nistFn} Gap
                      </span>
                      <div className="flex-1">
                        <div className="text-slate-800 font-medium text-sm">{gapText}</div>
                      </div>
                    </div>
                    <div className="text-xs text-orange-700 bg-orange-100 rounded p-2 mb-2">
                      <strong>Response:</strong> {responseAction}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {asset && <span className="inline-flex items-center gap-1"><span className="w-1 h-1 bg-orange-400 rounded-full"></span> <strong>Asset:</strong> {asset}</span>}
                      {framework && <span className="inline-flex items-center gap-1"><span className="w-1 h-1 bg-orange-400 rounded-full"></span> <strong>Framework:</strong> {framework}</span>}
                      {riskDomain && <span className="inline-flex items-center gap-1 bg-white border border-orange-200 px-1.5 py-0.5 rounded text-orange-700">{riskDomain}</span>}
                    </div>
                  </div>
                );
              })}
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
           <Button onClick={() => {
               const fw = results.selectedFrameworks || {};
               const params = new URLSearchParams({ id: results.id || '', ...(fw.gdpr ? { gdpr: '1' } : {}), ...(fw.nist_rmf === false ? { no_rmf: '1' } : {}), ...(fw.hipaa === false ? { no_hipaa: '1' } : {}), ...(fw.nist_csf === false ? { no_csf: '1' } : {}), ...(fw.iso_27005 === false ? { no_iso: '1' } : {}) });
               window.location.href = `/GRCReport?${params.toString()}`;
             }} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
             <FileText className="h-4 w-4 mr-2" /> Export GRC Report
           </Button>
          <Button onClick={() => navigate('/RiskRegister')} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
            <TrendingUp className="h-4 w-4 mr-2" /> View Risk Register
          </Button>
          <Button variant="outline" onClick={() => { setResults(null); setStep(1); setEmailInput(''); setEmailSent(false); setFormData({ system_name: '', system_type: '', vendor: '', deployment_context: '', key_assets: [], custom_asset: '', data_sources: [], population_diversity: '', bias_testing: '', data_documented: '', security_controls: [], encryption: '', hipaa_baa: '', pen_testing: '', fda_status: '', hipaa_compliance: '', governance_policy: '', clinical_validation: '' }); }}>
            New Assessment
          </Button>
        </div>
      </div>
    );
    return <ResultsErrorBoundary>{resultsContent}</ResultsErrorBoundary>;
  }


  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div>
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">New Assessment</h1>
          <p className="text-slate-500 text-sm">Complete all five sections to generate your AI risk score and recommendations.</p>
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
            <CardTitle className="text-lg">{
              step === 1 ? 'AI System Information' :
              step === 2 ? 'Key Assets Involved' :
              step === 3 ? 'Bias & Data Factors' :
              step === 4 ? 'Security Controls' :
              'Compliance & Governance'
            }</CardTitle>
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
                      <SelectItem value="diagnostic_imaging">Diagnostic Imaging (Radiology, Pathology AI)</SelectItem>
                      <SelectItem value="diagnostic_labs">Diagnostic Labs / Clinical Data Interpretation (Lab Analysis, Abnormal Value Detection)</SelectItem>
                      <SelectItem value="clinical_decision_support">Clinical Decision Support (CDS)</SelectItem>
                      <SelectItem value="nlp_documentation">AI Clinical Documentation / Ambient Scribe</SelectItem>
                      <SelectItem value="predictive_analytics">Predictive Analytics (Risk Scoring, Readmission, Sepsis)</SelectItem>
                      <SelectItem value="patient_monitoring">Patient Monitoring / Remote Monitoring</SelectItem>
                      <SelectItem value="medication_management">Medication Management / Prescribing AI</SelectItem>
                      <SelectItem value="administrative">Administrative / Operational AI (Scheduling, Billing)</SelectItem>
                      <SelectItem value="conversational_ai">Conversational AI / Chatbots (Patient Interaction)</SelectItem>
                      <SelectItem value="population_health">Population Health / Public Health Analytics</SelectItem>
                      <SelectItem value="computer_vision">Computer Vision (Imaging, Surgical Assistance)</SelectItem>
                      <SelectItem value="third_party_api">Third-Party AI Service / API Integration</SelectItem>
                      <SelectItem value="research">Research / Model Development Systems</SelectItem>
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

            {/* Step 2 — Key Assets */}
            {step === 2 && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-700 font-medium">Select <strong>3–5 key assets</strong> involved in this AI system. These will be referenced throughout the risk analysis, threat scenarios, and compliance mapping.</p>
                  <p className="text-xs text-blue-500 mt-1">If none are selected, assets will be inferred automatically from your system type.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">Key Assets Involved</Label>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      formData.key_assets.length === 0 ? 'bg-slate-100 text-slate-400' :
                      formData.key_assets.length < 3 ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {formData.key_assets.length} / 5 selected
                    </span>
                  </div>
                  <div className="space-y-2">
                    {assetOptions.map(asset => {
                      const checked = formData.key_assets.includes(asset.id);
                      const atLimit = formData.key_assets.length >= 5 && !checked;
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => !atLimit && toggleArray('key_assets', asset.id)}
                          disabled={atLimit}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                            checked ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                          } ${atLimit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                            {checked && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{asset.label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{asset.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Other Asset <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <input
                    type="text"
                    value={formData.custom_asset}
                    onChange={e => update('custom_asset', e.target.value)}
                    placeholder="e.g. PACS imaging archive, lab instrument interface..."
                    disabled={formData.key_assets.length >= 5}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-slate-400 disabled:opacity-40"
                  />
                </div>

                {formData.key_assets.length === 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Auto-inferred assets for this system type:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(inferredAssets[formData.system_type] || ['ai_model', 'ephi', 'api']).map(id => (
                        <span key={id} className="text-xs bg-white text-slate-600 border border-slate-300 rounded-full px-2.5 py-0.5">
                          {assetOptions.find(a => a.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3 — Bias & Data */}
            {step === 3 && (
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

            {/* Step 4 — Security */}
            {step === 4 && (
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

            {/* Step 5 — Compliance */}
            {step === 5 && (
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

                {/* Framework Selection */}
                <div className="border-t border-slate-100 pt-5">
                  <Label className="text-sm font-semibold text-slate-800 mb-1 block">Select Compliance Frameworks</Label>
                  <p className="text-xs text-slate-500 mb-4">Choose which frameworks to include in your report output. Core risk analysis runs regardless of selection.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'hipaa', label: 'HIPAA', desc: 'Health Insurance Portability & Accountability Act', checkedCard: 'border-indigo-300 bg-indigo-50', checkedBox: 'bg-indigo-600 border-indigo-600' },
                      { key: 'nist_csf', label: 'NIST CSF 2.0', desc: 'Cybersecurity Framework — Govern, Identify, Protect, Detect, Respond, Recover', checkedCard: 'border-blue-300 bg-blue-50', checkedBox: 'bg-blue-600 border-blue-600' },
                      { key: 'iso_27005', label: 'ISO/IEC 27005', desc: 'Information Security Risk Management standard', checkedCard: 'border-slate-400 bg-slate-100', checkedBox: 'bg-slate-600 border-slate-600' },
                      { key: 'gdpr', label: 'GDPR', desc: 'EU General Data Protection Regulation — applies when personal data is processed', checkedCard: 'border-green-300 bg-green-50', checkedBox: 'bg-green-600 border-green-600' },
                      { key: 'nist_rmf', label: 'NIST RMF', desc: 'Risk Management Framework — Categorize, Select, Implement, Assess, Authorize, Monitor', checkedCard: 'border-purple-300 bg-purple-50', checkedBox: 'bg-purple-600 border-purple-600' },
                    ].map(({ key, label, desc, checkedCard, checkedBox }) => {
                      const checked = selectedFrameworks[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedFrameworks(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                            checked ? checkedCard : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            checked ? checkedBox : 'border-slate-300'
                          }`}>
                            {checked && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{label}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
          {step < 5 ? (
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

      {/* RECENT ASSESSMENTS SECTION */}
      <RecentAssessments assessments={recentAssessments} />
    </div>
  );
}