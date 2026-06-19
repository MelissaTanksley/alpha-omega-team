import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Printer, ChevronDown, ChevronUp, File, AlertCircle, Plus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import ComprehensiveRiskCard from '@/components/ComprehensiveRiskCard';
import RiskRegisterTable from '@/components/RiskRegisterTable';
import { parseAssessmentToRiskRegister } from '@/utils/riskUtils';
import { isDemoMode, DEMO_ASSESSMENT } from '@/utils/demoData';

export default function GRCReport() {
  useEffect(() => { document.title = 'GRC Report | AI Risk Navigator'; }, []);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    executive: true,
    overview: true,
    analysis: true,
    compliance: true,
    controls: true,
    threats: true,
    lifecycle: true,
    rmf: true,
    register: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      // Check for demo parameter in URL
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') {
        setAssessments([DEMO_ASSESSMENT]);
        setSelectedAssessment(DEMO_ASSESSMENT);
        setIsLoading(false);
        return;
      }

      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        setAssessments([]);
        setSelectedAssessment(null);
      } else {
        const data = await base44.entities.AIRiskAssessment.list('-updated_date', 10);
        setAssessments(data);
        // Do not auto-select - let user choose or run new assessment
        setSelectedAssessment(null);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments([]);
      setSelectedAssessment(null);
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

  const getRisks = () => {
    return parseAssessmentToRiskRegister(selectedAssessment);
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">No Assessment Selected</h2>
        <p className="text-slate-600 mb-10 max-w-md mx-auto">Run an AI risk analysis or view a demo report.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/RiskAssessment">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 text-base font-semibold gap-2">
              <Plus className="h-5 w-5" />
              Run Full Analysis
            </Button>
          </Link>
          <button
            onClick={() => setSelectedAssessment(DEMO_ASSESSMENT)}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 text-base h-11"
          >
            <Zap className="h-5 w-5" /> View Demo Report
          </button>
          {assessments.length > 0 && (
            <select
              onChange={(e) => {
                const selected = assessments.find(a => a.id === e.target.value);
                if (selected) setSelectedAssessment(selected);
              }}
              defaultValue=""
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Previous Assessment</option>
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.system_name} ({moment(a.created_date).format('MMM DD')})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  }

  // Check if this is a demo assessment
  const isDemo = selectedAssessment.id === 'demo-001';

  const assessment = selectedAssessment;

  // Detect if personal/identifiable data is involved → show GDPR
  const involvesPersonalData = (() => {
    const assets = assessment.key_assets || [];
    const keywords = ['ephi', 'patient', 'personal', 'ehr', 'health', 'identifiable', 'phi', 'record'];
    const assetStr = assets.join(' ').toLowerCase();
    const sourceStr = (assessment.data_sources || []).join(' ').toLowerCase();
    return keywords.some(k => assetStr.includes(k) || sourceStr.includes(k)) ||
      assessment.deployment_context === 'clinical' || assessment.deployment_context === 'hybrid';
  })();
  const riskLevel = assessment.risk_level || 'medium';
  const riskColor = getRiskColor(riskLevel);

  return (
    <div className="min-h-screen bg-slate-50">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800"><span className="font-semibold">Example AI Risk Report (Demo)</span> — This is sample data to demonstrate the platform. Sign in to run your own assessments.</p>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header with Report Controls */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">GRC Report</h1>
            <p className="text-slate-600">Comprehensive Governance, Risk & Compliance Assessment</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const briefContent = `EXECUTIVE BRIEF\n\n${assessment.system_name}\n\nRisk Level: ${riskLevel.toUpperCase()}\nScore: ${assessment.overall_risk_score || 0}/100\n\nTop Risks:\n1. AI-generated errors impacting clinical decision-making\n2. Unauthorized access to ePHI\n3. External threats from vendor dependencies\n\nRecommended Actions:\n- Implement human-in-the-loop validation\n- Strengthen access controls and encryption\n- Deploy monitoring for AI outputs\n\nGenerated: ${new Date().toLocaleDateString()}`;
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(briefContent));
              element.setAttribute('download', `${assessment.system_name}-Executive-Brief.txt`);
              element.click();
            }} className="gap-2">
              <File className="h-4 w-4" />
              Download Executive Brief
            </Button>
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
        {assessments.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold text-slate-700 block mb-2">Switch Assessment</label>
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
            <CardContent className="space-y-5">
              {/* Opening Context */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                  The use of AI-driven clinical documentation systems introduces significant risks to patient safety, data integrity, and regulatory compliance. In healthcare environments, these systems operate within strict HIPAA requirements and must ensure the confidentiality, integrity, and availability of electronic protected health information (ePHI).
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  This assessment identifies an overall <strong>{riskLevel.toUpperCase()} RISK</strong> level associated with {assessment.system_name}. Key concerns include the potential for AI-generated clinical inaccuracies (hallucinations), insufficient access controls over sensitive patient data, and reliance on third-party vendors without adequate oversight.
                </p>
              </div>

              {/* Overall Risk Level */}
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Risk Score & Classification</p>
                  <p className="text-sm text-slate-900 font-semibold">{assessment.overall_risk_score || 0}/100</p>
                </div>
                <Badge className={`text-sm font-bold px-4 py-2 ${riskColor.replace('bg-', 'bg-').replace('border-', '').split(' ')[0]}`}>
                  {riskLevel.toUpperCase()}
                </Badge>
              </div>

              {/* Critical Risks */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">The Most Critical Risks Include:</h4>
                <div className="space-y-2">
                  <div className="flex gap-3 items-start bg-red-50 border border-red-200 p-3 rounded-lg">
                    <span className="text-lg font-bold text-red-600 flex-shrink-0 w-6 text-center">•</span>
                    <span className="text-sm text-slate-900"><strong>AI-generated errors</strong> impacting clinical decision-making</span>
                  </div>
                  <div className="flex gap-3 items-start bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <span className="text-lg font-bold text-orange-600 flex-shrink-0 w-6 text-center">•</span>
                    <span className="text-sm text-slate-900"><strong>Unauthorized access</strong> to ePHI</span>
                  </div>
                  <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <span className="text-lg font-bold text-amber-600 flex-shrink-0 w-6 text-center">•</span>
                    <span className="text-sm text-slate-900"><strong>External threats</strong> associated with vendor and infrastructure dependencies</span>
                  </div>
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Recommended Mitigation Strategy</h4>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  To mitigate these risks, immediate actions are recommended, including:
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Implementation of human-in-the-loop validation processes for all AI outputs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Strengthening of access control mechanisms and encryption protocols</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Deployment of monitoring capabilities for AI system performance and behavioral anomalies</span>
                  </li>
                </ul>
              </div>

              {/* Compliance Alignment */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 leading-relaxed mb-2">
                  Addressing these areas will significantly reduce exposure and support alignment with applicable compliance frameworks:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-indigo-100 text-indigo-700">HIPAA</Badge>
                  <Badge className="bg-blue-100 text-blue-700">NIST CSF 2.0</Badge>
                  <Badge className="bg-slate-100 text-slate-700">ISO/IEC 27005</Badge>
                  {involvesPersonalData && <Badge className="bg-green-100 text-green-700">GDPR</Badge>}
                  <Badge className="bg-purple-100 text-purple-700">NIST RMF</Badge>
                </div>
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
              {/* Framework summary badges */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
                <Badge className="bg-indigo-100 text-indigo-700">HIPAA</Badge>
                <Badge className="bg-blue-100 text-blue-700">NIST CSF 2.0</Badge>
                <Badge className="bg-slate-100 text-slate-700">ISO/IEC 27005</Badge>
                {involvesPersonalData && <Badge className="bg-green-100 text-green-700">GDPR</Badge>}
                <Badge className="bg-purple-100 text-purple-700">NIST RMF</Badge>
              </div>

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
                  {['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'].map((fn, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-700">{fn}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-slate-900 mb-2">ISO/IEC 27005 — Risk Management</h4>
                <ul className="space-y-1">
                  <li className="text-sm text-slate-700">• Context establishment and risk identification</li>
                  <li className="text-sm text-slate-700">• Risk analysis and evaluation against acceptance criteria</li>
                  <li className="text-sm text-slate-700">• Risk treatment selection and residual risk monitoring</li>
                </ul>
              </div>

              {involvesPersonalData && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-bold text-green-900">GDPR — Data Protection Principles</h4>
                    <Badge className="bg-green-100 text-green-700 text-xs">Applicable</Badge>
                  </div>
                  <p className="text-xs text-green-700 mb-2">Personal/identifiable data detected — GDPR principles apply.</p>
                  <ul className="space-y-1">
                    <li className="text-sm text-green-800">• <strong>Data Minimization</strong> — Collect only what is necessary for the clinical purpose</li>
                    <li className="text-sm text-green-800">• <strong>Integrity & Confidentiality</strong> — Protect data against unauthorized processing and loss</li>
                    <li className="text-sm text-green-800">• <strong>Data Protection by Design</strong> — Embed privacy controls at the system architecture level</li>
                    <li className="text-sm text-green-800">• <strong>Accountability</strong> — Document processing activities and demonstrate compliance</li>
                  </ul>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-red-900 mb-2">Identified Gaps</h4>
                <ul className="space-y-1">
                  <li className="text-sm text-red-800">• No systematic validation of AI-generated outputs</li>
                  <li className="text-sm text-red-800">• Limited monitoring of model behavior and drift</li>
                  <li className="text-sm text-red-800">• Insufficient audit logging for AI decisions</li>
                  {involvesPersonalData && <li className="text-sm text-red-800">• Data processing activities not fully documented per GDPR Article 30</li>}
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

        {/* NIST RMF ALIGNMENT */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('rmf')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔐</span> NIST RMF Alignment
              </CardTitle>
              {expandedSections.rmf ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.rmf && (
            <CardContent>
              <p className="text-xs text-slate-500 mb-4">The NIST Risk Management Framework (RMF) provides a structured lifecycle for managing security and privacy risk. The following stages apply to {assessment.system_name}.</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    step: '1',
                    title: 'Categorize',
                    color: 'bg-slate-100 border-slate-300 text-slate-700',
                    badge: 'bg-slate-200 text-slate-800',
                    description: `Classify ${assessment.system_name} based on the potential impact of a security breach. Given clinical deployment and ePHI involvement, this system likely falls under HIGH impact categorization per FIPS 199.`
                  },
                  {
                    step: '2',
                    title: 'Select',
                    color: 'bg-blue-50 border-blue-200 text-blue-700',
                    badge: 'bg-blue-100 text-blue-800',
                    description: 'Select and tailor security controls from NIST SP 800-53 appropriate for the system\'s impact level. Priority controls include AC (Access Control), AU (Audit), SI (System Integrity), and SC (System Communications).'
                  },
                  {
                    step: '3',
                    title: 'Implement',
                    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    badge: 'bg-emerald-100 text-emerald-800',
                    description: 'Deploy selected controls including encryption, access management, audit logging, and AI-specific human-in-the-loop validation. Document implementation details for authorization review.'
                  },
                  {
                    step: '4',
                    title: 'Assess',
                    color: 'bg-amber-50 border-amber-200 text-amber-700',
                    badge: 'bg-amber-100 text-amber-800',
                    description: 'Evaluate control effectiveness through testing, review, and independent assessment. Identify deficiencies in current controls and prioritize remediation before authorization.'
                  },
                  {
                    step: '5',
                    title: 'Authorize',
                    color: 'bg-purple-50 border-purple-200 text-purple-700',
                    badge: 'bg-purple-100 text-purple-800',
                    description: 'Senior official reviews the system security plan, assessment results, and residual risks to issue an Authorization to Operate (ATO) or deny authorization pending remediation.'
                  },
                  {
                    step: '6',
                    title: 'Monitor',
                    color: 'bg-orange-50 border-orange-200 text-orange-700',
                    badge: 'bg-orange-100 text-orange-800',
                    description: 'Continuously monitor security controls, system changes, and the threat environment. Report security status to authorizing official and update the authorization when significant changes occur.'
                  }
                ].map((stage) => (
                  <div key={stage.step} className={`border rounded-lg p-3 ${stage.color}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>Step {stage.step}</span>
                      <h4 className="text-sm font-bold">{stage.title}</h4>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{stage.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* RISK REGISTER */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('register')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📋</span> Risk Register (Derived from Assessment Results)
              </CardTitle>
              {expandedSections.register ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.register && (
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                The following risks have been automatically identified from this assessment. This register serves as an audit-ready record aligned with healthcare GRC practices.
              </p>
              <RiskRegisterTable risks={getRisks()} compact={true} />
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