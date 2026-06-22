import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, AlertTriangle, Shield, TrendingUp } from 'lucide-react';

export default function ExecutiveReportView() {
   useEffect(() => { document.title = 'Executive Report | AI Risk Navigator for Healthcare'; }, []);
   const [assessments, setAssessments] = useState([]);
   const [selectedAssessment, setSelectedAssessment] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
     loadAssessments();
   }, []);

   // Scroll to top when assessment is loaded
   useEffect(() => {
     if (!isLoading && selectedAssessment) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
     }
   }, [isLoading, selectedAssessment]);

  const loadAssessments = async () => {
    try {
      const data = await base44.entities.AIRiskAssessment.list('-updated_date', 1);
      setAssessments(data);
      if (data.length > 0) {
        setSelectedAssessment(data[0]);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
      medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
      critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    };
    return colors[level?.toLowerCase()] || colors.medium;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedAssessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Assessments Yet</h2>
          <p className="text-slate-600 mb-6">Create an AI system risk assessment to view the executive report.</p>
          <Button onClick={() => window.location.href = '/RiskAssessment'} className="bg-blue-600 hover:bg-blue-700">
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  const assessment = selectedAssessment;
  const riskLevel = assessment.risk_level || 'medium';
  const riskColor = getRiskColor(riskLevel);

  const topRisks = assessment.governance_gaps?.slice(0, 3) || [
    'AI-generated errors impacting clinical decision-making',
    'Unauthorized access to ePHI',
    'External threats from vendor dependencies'
  ];

  const keyAssets = assessment.key_assets || ['AI Model', 'ePHI', 'EHR System'];

  const clinicalImpact = assessment.clinical_impact_score || 0;
  const complianceImpact = assessment.compliance_score || 0;
  const operationalImpact = 50; // Default value

  const downloadBrief = () => {
    const briefContent = `EXECUTIVE BRIEF - AI RISK NAVIGATOR
=====================================

System: ${assessment.system_name}
Type: ${assessment.system_type?.replace(/_/g, ' ') || 'Not specified'}
Date: ${new Date().toLocaleDateString()}

OVERALL RISK LEVEL: ${riskLevel.toUpperCase()}
Risk Score: ${assessment.overall_risk_score || 0}/100

---

TOP RISKS:
${topRisks.map((r, i) => `${i + 1}. ${typeof r === 'string' ? r : r.gap || r}`).join('\n')}

---

KEY ASSETS:
${keyAssets.map((a, i) => `• ${a}`).join('\n')}

---

IMPACT SUMMARY:
• Clinical Impact: ${clinicalImpact}/100
• Compliance Impact: ${complianceImpact}/100
• Operational Impact: ${operationalImpact}/100

---

CONTROL PRIORITIES:
1. Implement human-in-the-loop validation for AI outputs
2. Deploy role-based access controls and MFA
3. Establish comprehensive audit logging and monitoring
4. Conduct security assessment and penetration testing

---

COMPLIANCE ALIGNMENT:
• HIPAA Security Rule (Technical, Administrative, Physical Safeguards)
• HITECH Act Requirements
• NIST CSF 2.0 (Identify, Protect, Detect, Respond, Recover)

---

RECOMMENDATION:
Immediate action required to reduce risk to acceptable levels.

Generated: ${new Date().toLocaleString()}`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(briefContent));
    element.setAttribute('download', `${assessment.system_name}-Executive-Brief.txt`);
    element.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{assessment.system_name}</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="text-sm mt-1">
              {assessment.system_type?.replace(/_/g, ' ') || 'AI System'} • {assessment.deployment_context || 'Unknown'} Deployment
            </p>
          </div>
          <Button onClick={downloadBrief} variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Download className="h-4 w-4" />
            Download Brief
          </Button>
        </div>

        <hr className="mb-8" />

        {/* OVERALL RISK LEVEL */}
        <div className={`mb-8 p-6 rounded-lg border-2 ${riskColor.bg} ${riskColor.border}`}>
          <p className="text-xs font-semibold text-white uppercase tracking-wide mb-2">Overall Risk Level</p>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-white">{assessment.overall_risk_score || 0}<span className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>/100</span></div>
            <Badge className={`text-lg px-4 py-2 font-bold ${riskColor.bg} ${riskColor.text} border-0`}>
              {riskLevel.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* TOP RISKS */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Top Risks
          </h2>
          <div className="space-y-2 ml-7">
            {topRisks.map((risk, i) => {
              const riskText = typeof risk === 'string' ? risk : risk.gap || risk;
              return (
                <p key={i} className="text-sm text-slate-700">
                  <span className="font-semibold">{i + 1}.</span> {riskText}
                </p>
              );
            })}
          </div>
        </div>

        {/* KEY ASSETS */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Key Assets
          </h2>
          <div className="flex flex-wrap gap-2 ml-7">
            {keyAssets.map((asset, i) => (
              <Badge key={i} className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
                {asset}
              </Badge>
            ))}
          </div>
        </div>

        {/* RISK IMPACT SUMMARY */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Risk Impact Summary</h2>
          <div className="grid grid-cols-3 gap-4 ml-7">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-red-700 uppercase mb-2">Clinical Impact</p>
              <p className="text-2xl font-bold text-red-900">{clinicalImpact}</p>
              <p className="text-xs text-red-600 mt-1">/ 100</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-orange-700 uppercase mb-2">Compliance Impact</p>
              <p className="text-2xl font-bold text-orange-900">{complianceImpact}</p>
              <p className="text-xs text-orange-600 mt-1">/ 100</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Operational Impact</p>
              <p className="text-2xl font-bold text-amber-900">{operationalImpact}</p>
              <p className="text-xs text-amber-600 mt-1">/ 100</p>
            </div>
          </div>
        </div>

        {/* CONTROL PRIORITIES */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Control Priorities</h2>
          <div className="space-y-3 ml-7">
            <div className="flex gap-3 items-start">
              <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full flex-shrink-0">1</span>
              <p className="text-sm text-slate-700">Implement human-in-the-loop validation for all AI outputs</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full flex-shrink-0">2</span>
              <p className="text-sm text-slate-700">Deploy role-based access controls and multi-factor authentication</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full flex-shrink-0">3</span>
              <p className="text-sm text-slate-700">Establish comprehensive audit logging and anomaly detection</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full flex-shrink-0">4</span>
              <p className="text-sm text-slate-700">Conduct independent security assessment and penetration testing</p>
            </div>
          </div>
        </div>

        {/* COMPLIANCE ALIGNMENT */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Compliance Alignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">HIPAA Security Rule</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Technical Safeguards</li>
                <li>• Administrative Safeguards</li>
                <li>• Physical Safeguards</li>
              </ul>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-indigo-900 mb-2">NIST CSF 2.0</p>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li>• Identify, Protect, Detect</li>
                <li>• Respond, Recover</li>
                <li>• Govern</li>
              </ul>
            </div>
          </div>
        </div>

        {/* INTERNAL VS EXTERNAL RISKS */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Risk Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-900 mb-2">Internal Risks</p>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• Access control misconfiguration</li>
                <li>• Insider misuse or privilege escalation</li>
                <li>• Inadequate testing before deployment</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">External Risks</p>
              <ul className="text-xs text-red-800 space-y-1">
                <li>• Ransomware targeting healthcare</li>
                <li>• Vendor compromise and supply chain attacks</li>
                <li>• Adversarial attacks on AI model</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="mb-8" />

        {/* FOOTER */}
        <div className="text-xs text-slate-600 space-y-1">
          <p><strong>Report Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Framework Alignment:</strong> HIPAA Security Rule, HITECH Act, NIST CSF 2.0, ISO 27005</p>
          <p><strong>Recommendation Level:</strong> {riskLevel === 'critical' ? 'Immediate Action Required' : riskLevel === 'high' ? 'Urgent Remediation' : 'Baseline Controls Needed'}</p>
        </div>
      </div>
    </div>
  );
}