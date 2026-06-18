import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import ComprehensiveRiskCard from '@/components/ComprehensiveRiskCard';

export default function GRCReport() {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    executive: true,
    overview: true,
    analysis: true,
    compliance: true,
    controls: true,
    threats: true,
    lifecycle: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await base44.entities.AIRiskAssessment.list('-updated_date', 10);
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      medium: 'bg-amber-50 border-amber-200 text-amber-700',
      high: 'bg-orange-50 border-orange-200 text-orange-700',
      critical: 'bg-red-50 border-red-200 text-red-700'
    };
    return colors[level?.toLowerCase()] || colors.medium;
  };

  const nistFunctions = ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'];

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
          <p className="text-slate-600 mb-6">Create an AI system risk assessment to generate a GRC report.</p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header with Report Controls */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">GRC Report</h1>
            <p className="text-slate-600">Comprehensive Governance, Risk & Compliance Assessment</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Assessment Selector */}
        {assessments.length > 1 && (
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold text-slate-700 block mb-2">Select Assessment</label>
              <select
                value={selectedAssessment.id}
                onChange={(e) => setSelectedAssessment(assessments.find(a => a.id === e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.system_name} ({a.system_type}) - {a.risk_level?.toUpperCase()}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* EXECUTIVE SUMMARY */}
        <Card className={`border-2 ${riskColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('executive')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📋</span> Executive Summary
              </CardTitle>
              {expandedSections.executive ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.executive && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Overall Risk Level</span>
                <Badge className={`text-sm font-bold px-3 py-1 ${riskColor.replace('bg-', 'bg-').replace('border-', '').split(' ')[0]}`}>
                  {riskLevel.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Key Findings</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-slate-700 flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span>AI model presents {riskLevel} risk of hallucinated outputs affecting clinical decisions</span>
                  </li>
                  <li className="text-sm text-slate-700 flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span>ePHI exposure risk due to {assessment.security_controls?.length === 0 ? 'inadequate' : 'insufficient'} controls</span>
                  </li>
                  <li className="text-sm text-slate-700 flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span>External threats include ransomware targeting healthcare systems and vendor compromise</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Top 3 Risks</h4>
                <ol className="space-y-2 list-decimal list-inside">
                  <li className="text-sm text-slate-700">AI hallucination affecting clinical decisions</li>
                  <li className="text-sm text-slate-700">Unauthorized access to ePHI</li>
                  <li className="text-sm text-slate-700">Third-party vendor risk and supply chain compromise</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Recommendation Summary</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-slate-700 flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Implement human-in-the-loop validation for AI outputs</span>
                  </li>
                  <li className="text-sm text-slate-700 flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Strengthen access controls and implement MFA</span>
                  </li>
                  <li className="text-sm text-slate-700 flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Monitor AI outputs and implement continuous validation</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* SYSTEM OVERVIEW */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('overview')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏥</span> System Overview
              </CardTitle>
              {expandedSections.overview ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.overview && (
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">System Name</p>
                  <p className="text-sm font-semibold text-slate-900">{assessment.system_name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">System Type</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{assessment.system_type?.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Deployment Context</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{assessment.deployment_context}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Vendor</p>
                  <p className="text-sm font-semibold text-slate-900">{assessment.vendor || 'Not specified'}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Key Assets</h4>
                <div className="flex flex-wrap gap-2">
                  {assessment.key_assets?.length > 0 ? (
                    assessment.key_assets.map((asset, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700">{asset}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">AI Model, ePHI, EHR System</p>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* RISK ANALYSIS */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('analysis')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⚠️</span> Risk Analysis
              </CardTitle>
              {expandedSections.analysis ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.analysis && (
            <CardContent>
              <ComprehensiveRiskCard
                asset="AI Model + ePHI"
                threat="Model hallucination producing incorrect clinical documentation"
                risk="Incorrect clinical documentation leading to misdiagnosis"
                control="Implement human-in-the-loop validation and output monitoring"
                nistFunctions={['Identify', 'Protect', 'Detect']}
                hipaaType="Technical Safeguards"
                riskLevel={riskLevel}
                compact={false}
              />

              <div className="mt-6 pt-6 border-t border-orange-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Impact Assessment</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Clinical Impact</p>
                    <p className="text-sm text-slate-900 font-semibold">Misdiagnosis, treatment errors</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Compliance Impact</p>
                    <p className="text-sm text-slate-900 font-semibold">HIPAA integrity violation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* COMPLIANCE MAPPING */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('compliance')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📜</span> Compliance Mapping
              </CardTitle>
              {expandedSections.compliance ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.compliance && (
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-indigo-900 mb-2">HIPAA Security Rule</h4>
                <ul className="space-y-1">
                  <li className="text-sm text-indigo-800">• Technical Safeguards (Access Control, Integrity, Encryption)</li>
                  <li className="text-sm text-indigo-800">• Administrative Safeguards (Workforce Security, Authorization)</li>
                  <li className="text-sm text-indigo-800">• Physical Safeguards (Facility Access, Equipment Controls)</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-blue-900 mb-2">NIST CSF 2.0 Functions</h4>
                <div className="flex flex-wrap gap-2">
                  {['Identify', 'Protect', 'Detect'].map((fn, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-700">{fn}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-red-900 mb-2">Identified Gaps</h4>
                <ul className="space-y-1">
                  <li className="text-sm text-red-800">• No systematic validation of AI-generated outputs</li>
                  <li className="text-sm text-red-800">• Limited monitoring of model behavior and drift</li>
                  <li className="text-sm text-red-800">• Insufficient audit logging for AI decisions</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* CONTROL RECOMMENDATIONS */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('controls')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🛡️</span> Control Recommendations
              </CardTitle>
              {expandedSections.controls ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.controls && (
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-emerald-900 mb-2">Administrative Controls</h4>
                <ul className="space-y-2">
                  {[
                    'Develop AI governance policy and risk management framework',
                    'Establish oversight committee for AI system deployment',
                    'Implement workforce training on responsible AI use',
                    'Define escalation procedures for model failures'
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex gap-2">
                      <span className="font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-cyan-900 mb-2">Technical Controls</h4>
                <ul className="space-y-2">
                  {[
                    'Implement real-time output validation and monitoring',
                    'Deploy model drift detection and alerting',
                    'Establish comprehensive audit logging for all AI decisions',
                    'Encrypt ePHI both in transit and at rest',
                    'Implement role-based access control (RBAC) with MFA'
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-cyan-800 flex gap-2">
                      <span className="font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-violet-50 border border-violet-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-violet-900 mb-2">Physical Controls</h4>
                <ul className="space-y-2">
                  {[
                    'Secure infrastructure in HIPAA-compliant data centers',
                    'Implement access controls for servers housing AI models',
                    'Establish backup and disaster recovery procedures',
                    'Implement physical audit trails for equipment access'
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-violet-800 flex gap-2">
                      <span className="font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* INTERNAL & EXTERNAL RISKS */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('threats')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔴</span> Internal & External Risks
              </CardTitle>
              {expandedSections.threats ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.threats && (
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-orange-900 mb-3">Internal Threats</h4>
                <ul className="space-y-2">
                  {[
                    'Misconfiguration of access controls',
                    'Insider misuse or privilege escalation',
                    'Inadequate testing before production deployment',
                    'Lack of security awareness among staff'
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-orange-800 flex gap-2">
                      <span>▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-red-900 mb-3">External Threats</h4>
                <ul className="space-y-2">
                  {[
                    'Ransomware targeting healthcare systems',
                    'Vendor compromise and supply chain attacks',
                    'Adversarial attacks on AI model',
                    'Data breach through exploited vulnerabilities'
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-red-800 flex gap-2">
                      <span>▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* NIST CSF LIFECYCLE */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('lifecycle')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔄</span> NIST CSF Lifecycle
              </CardTitle>
              {expandedSections.lifecycle ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.lifecycle && (
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  {
                    title: 'Identify',
                    description: 'Assets, risks, and threats have been identified and documented through comprehensive risk assessment'
                  },
                  {
                    title: 'Protect',
                    description: 'Implement preventive controls including access controls, encryption, and validation mechanisms'
                  },
                  {
                    title: 'Detect',
                    description: 'Deploy monitoring, alerting, and audit logging to identify anomalies and security events'
                  },
                  {
                    title: 'Respond',
                    description: 'Establish incident response procedures and escalation workflows for security events'
                  },
                  {
                    title: 'Recover',
                    description: 'Implement data recovery and restoration procedures following a security incident'
                  }
                ].map((fn, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">{fn.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{fn.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* CONCLUSION */}
        <Card className={`border-2 ${riskColor}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">✅</span> Conclusion & Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Residual Risk</h4>
              <Badge className={`text-sm font-bold px-3 py-1 ${riskColor.replace('bg-', 'bg-').split(' ')[0]}`}>
                {riskLevel.toUpperCase()}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Recommended Next Steps</h4>
              <ol className="space-y-2 list-decimal list-inside">
                <li className="text-sm text-slate-700"><strong>Immediate (0-30 days):</strong> Implement human-in-the-loop validation and access controls</li>
                <li className="text-sm text-slate-700"><strong>Short-term (1-3 months):</strong> Deploy monitoring and audit logging infrastructure</li>
                <li className="text-sm text-slate-700"><strong>Medium-term (3-6 months):</strong> Conduct security assessment and penetration testing</li>
                <li className="text-sm text-slate-700"><strong>Ongoing:</strong> Reassess risk after mitigation measures are implemented</li>
              </ol>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-3 rounded-lg">
              <p className="text-xs text-slate-700">
                <strong>Note:</strong> This assessment reflects the current state of the AI system. Regular reassessment is recommended after implementing recommended controls to measure residual risk reduction.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Report Metadata */}
        <Card className="bg-slate-100">
          <CardContent className="pt-6">
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Report Generated:</strong> {new Date(assessment.updated_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Assessment ID:</strong> {assessment.id}</p>
              <p><strong>System:</strong> {assessment.system_name} ({assessment.system_type})</p>
              <p><strong>Overall Risk Level:</strong> <span className="font-semibold">{assessment.risk_level?.toUpperCase()}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}