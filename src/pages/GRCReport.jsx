import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Printer, ChevronDown, ChevronUp, File, AlertCircle, Plus, Zap, LayoutList, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import ComprehensiveRiskCard from '@/components/ComprehensiveRiskCard';
import RiskRegisterTable from '@/components/RiskRegisterTable';
import RiskSummaryDashboard from '@/components/RiskSummaryDashboard';
import { parseAssessmentToRiskRegister } from '@/utils/riskUtils';
import { isDemoMode, DEMO_ASSESSMENT } from '@/utils/demoData';

export default function GRCReport() {
  useEffect(() => { document.title = 'GRC Report | AI Risk Navigator'; }, []);

  // Scroll to top when assessment is selected or loaded
  useEffect(() => {
    if (selectedAssessment) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedAssessment]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    executive: true,
    overview: false,
    analysis: false,
    compliance: false,
    controls: false,
    threats: false,
    lifecycle: false,
    rmf: false,
    rmf_controls: false,
    iso42001: false,
    hicp: false,
    threatmodel: false,
    register: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [demoError, setDemoError] = useState(false);
  const [viewMode, setViewMode] = useState('executive'); // 'executive' | 'full'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      // Demo mode: load instantly from static data, no API calls
      try {
        if (!DEMO_ASSESSMENT || !DEMO_ASSESSMENT.system_name) throw new Error('Invalid demo data');
        setAssessments([DEMO_ASSESSMENT]);
        setSelectedAssessment(DEMO_ASSESSMENT);
      } catch (e) {
        setDemoError(true);
      }
      setIsLoading(false);
    } else {
      loadAssessments();
    }
  }, []);

  const loadAssessments = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        setAssessments([]);
        setSelectedAssessment(null);
      } else {
        const user = await base44.auth.me();
        const data = await base44.entities.AIRiskAssessment.list('-updated_date', 10);
        // Filter to only show assessments created by current user
        const userAssessments = data.filter(a => a.created_by_id === user.id);
        setAssessments(userAssessments);
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
    const params = new URLSearchParams(window.location.search);
    const isDemo = params.get('demo') === '1';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm">{isDemo ? 'Loading Example Report...' : 'Loading...'}</p>
      </div>
    );
  }

  if (demoError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-bold text-slate-900">Unable to load demo</h2>
        <p className="text-slate-500 text-sm">Please try again.</p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (!selectedAssessment) {
    const isSignedIn = assessments !== null;
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

        {/* Sign in to access saved reports */}
        {assessments.length === 0 && (
          <div className="mt-10 max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-slate-700 mb-1">Access your saved assessments</p>
            <p className="text-xs text-slate-500 mb-4">Sign in to view, manage, and revisit your previous AI risk reports.</p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Sign In to View Reports
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Check if this is a demo assessment
  const isDemo = selectedAssessment.id === 'demo-001';

  const assessment = selectedAssessment;

  // Read framework selections from URL params (passed from RiskAssessment results page)
  const urlParams = new URLSearchParams(window.location.search);
  const fw = {
    hipaa: urlParams.get('no_hipaa') !== '1',
    nist_csf: urlParams.get('no_csf') !== '1',
    iso_27005: urlParams.get('no_iso') !== '1',
    gdpr: urlParams.get('gdpr') === '1',
    nist_rmf: urlParams.get('no_rmf') !== '1',
  };

  // Detect if personal/identifiable data is involved
  const involvesPersonalData = (() => {
    const assets = assessment.key_assets || [];
    const keywords = ['ephi', 'patient', 'personal', 'ehr', 'health', 'identifiable', 'phi', 'record'];
    const assetStr = assets.join(' ').toLowerCase();
    const sourceStr = (assessment.data_sources || []).join(' ').toLowerCase();
    return keywords.some(k => assetStr.includes(k) || sourceStr.includes(k)) ||
      assessment.deployment_context === 'clinical' || assessment.deployment_context === 'hybrid';
  })();

  // GDPR shows if explicitly selected OR (demo mode AND personal data involved)
  const showGdpr = fw.gdpr || (isDemo && involvesPersonalData);

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
          <div className="flex flex-wrap gap-2 print:hidden">
            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('executive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'executive'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                Executive
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'full'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Full Report
              </button>
            </div>
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
            <Button variant="outline" size="sm" onClick={() => { try { window.print(); } catch(e) { alert('Use Print (Ctrl+P / Cmd+P) to save this report as PDF'); } }} className="gap-2 print:hidden">
              <Download className="h-4 w-4" />
              Export / Print PDF
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

        {/* RISK SUMMARY DASHBOARD */}
        <RiskSummaryDashboard assessment={assessment} />

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
                  {fw.hipaa && <Badge className="bg-indigo-100 text-indigo-700">HIPAA</Badge>}
                  {fw.nist_csf && <Badge className="bg-blue-100 text-blue-700">NIST CSF 2.0</Badge>}
                  {fw.iso_27005 && <Badge className="bg-slate-100 text-slate-700">ISO/IEC 27005</Badge>}
                  {showGdpr && <Badge className="bg-green-100 text-green-700">GDPR</Badge>}
                  {fw.nist_rmf && <Badge className="bg-purple-100 text-purple-700">NIST RMF</Badge>}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Executive View info banner */}
        {viewMode === 'executive' && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Executive View</span> — Showing key findings only.
            </p>
            <button
              onClick={() => setViewMode('full')}
              className="text-sm font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
            >
              View Full Report →
            </button>
          </div>
        )}

        {/* FULL REPORT ONLY SECTIONS */}
        {viewMode === 'full' && (<>

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
                asset="AI Model & Patient Data (ePHI)"
                threat="NLP model hallucination generating inaccurate clinical documentation that enters the EHR without clinician validation"
                risk="Inaccurate AI-generated clinical notes may cause misdiagnosis, inappropriate treatment decisions, or delayed care — and introduce ePHI integrity violations under HIPAA §164.312(c)(1)"
                control="Implement mandatory human-in-the-loop (HITL) validation before any AI-generated output enters clinical workflows. Deploy real-time output monitoring and model drift alerting."
                nistFunctions={['Govern', 'Identify', 'Protect', 'Detect']}
                hipaaType="Technical Safeguards"
                riskLevel={riskLevel}
                compact={false}
              />

              <div className="mt-6 pt-6 border-t border-orange-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Impact Assessment</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Clinical Impact</p>
                    <p className="text-sm text-slate-900 font-semibold">Misdiagnosis, delayed care, adverse patient outcomes</p>
                    <p className="text-xs text-slate-500 mt-1">AI outputs entering the EHR unvalidated create direct patient safety risk</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Compliance Impact</p>
                    <p className="text-sm text-slate-900 font-semibold">HIPAA §164.312(c)(1) — Integrity; NIST CSF DE.CM-4</p>
                    <p className="text-xs text-slate-500 mt-1">Lack of output validation violates HIPAA integrity requirements and NIST Detect controls</p>
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
                {fw.hipaa && <Badge className="bg-indigo-100 text-indigo-700">HIPAA</Badge>}
                {fw.nist_csf && <Badge className="bg-blue-100 text-blue-700">NIST CSF 2.0</Badge>}
                {fw.iso_27005 && <Badge className="bg-slate-100 text-slate-700">ISO/IEC 27005</Badge>}
                {showGdpr && <Badge className="bg-green-100 text-green-700">GDPR</Badge>}
                {fw.nist_rmf && <Badge className="bg-purple-100 text-purple-700">NIST RMF</Badge>}
              </div>

              {fw.hipaa && (
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-indigo-900 mb-2">HIPAA Security Rule</h4>
                  <ul className="space-y-1">
                    <li className="text-sm text-indigo-800">• Technical Safeguards (Access Control, Integrity, Encryption)</li>
                    <li className="text-sm text-indigo-800">• Administrative Safeguards (Workforce Security, Authorization)</li>
                    <li className="text-sm text-indigo-800">• Physical Safeguards (Facility Access, Equipment Controls)</li>
                  </ul>
                </div>
              )}

              {fw.nist_csf && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">NIST CSF 2.0 Functions</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'].map((fn, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700">{fn}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {fw.iso_27005 && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">ISO/IEC 27005 — Risk Management</h4>
                  <ul className="space-y-1">
                    <li className="text-sm text-slate-700">• Context establishment and risk identification</li>
                    <li className="text-sm text-slate-700">• Risk analysis and evaluation against acceptance criteria</li>
                    <li className="text-sm text-slate-700">• Risk treatment selection and residual risk monitoring</li>
                  </ul>
                </div>
              )}

              {showGdpr && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-green-900">GDPR — Article Mapping</h4>
                    <Badge className="bg-green-100 text-green-700 text-xs">Selected</Badge>
                  </div>
                  {[
                    { article: 'Article 5', title: 'Principles of Processing', risk: 'AI systems processing ePHI may violate lawfulness, accuracy, or data minimization principles if not properly governed.', control: 'Enforce data minimization, define lawful basis, and validate AI outputs for accuracy.' },
                    { article: 'Article 25', title: 'Data Protection by Design & by Default', risk: 'AI systems not architected with privacy controls expose personal data by default.', control: 'Embed access controls, pseudonymization, and least-privilege principles at design time.' },
                    { article: 'Article 32', title: 'Security of Processing', risk: 'Insufficient encryption, access logging, or integrity controls create risk of unauthorized disclosure.', control: 'Implement encryption at rest/in transit, MFA, audit logging, and regular security testing.' },
                    { article: 'Article 35', title: 'Data Protection Impact Assessment (DPIA)', risk: 'High-risk AI processing of health data requires a formal DPIA before deployment.', control: 'Conduct a DPIA, document findings, consult the DPO, and mitigate identified risks prior to go-live.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{item.article}</span>
                        <span className="text-sm font-semibold text-green-900">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1"><span className="font-semibold text-slate-700">Risk:</span> {item.risk}</p>
                      <p className="text-xs text-slate-600"><span className="font-semibold text-slate-700">Control:</span> {item.control}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-red-900 mb-2">Identified Gaps</h4>
                <ul className="space-y-1">
                  <li className="text-sm text-red-800">• No systematic validation of AI-generated outputs</li>
                  <li className="text-sm text-red-800">• Limited monitoring of model behavior and drift</li>
                  <li className="text-sm text-red-800">• Insufficient audit logging for AI decisions</li>
                  {showGdpr && <li className="text-sm text-red-800">• Data processing activities not fully documented per GDPR Article 30</li>}
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

        {/* THREAT MODELING */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('threatmodel')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎯</span> Threat Modeling Approach
                <Badge className="bg-slate-100 text-slate-600 text-xs ml-1">Supporting Technical Analysis</Badge>
              </CardTitle>
              {expandedSections.threatmodel ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.threatmodel && (
            <CardContent className="space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                This platform incorporates structured threat modeling techniques, including <strong className="text-slate-700">STRIDE</strong> and <strong className="text-slate-700">MITRE ATT&CK</strong>, to identify and categorize potential risks affecting AI systems. STRIDE supports identification of system-level threats (e.g., spoofing, tampering), while MITRE ATT&CK provides insight into adversary tactics and techniques. These methods are used as supporting technical analysis tools — not compliance frameworks.
              </p>

              {/* STRIDE */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">STRIDE</span>
                  <p className="text-xs text-slate-500">System-level threat categorization applied to {assessment.system_name}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { letter: 'S', label: 'Spoofing', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', desc: 'Attackers impersonate authorized users or systems to access the AI model or ePHI.', mitigation: 'MFA, strong authentication, certificate-based identity' },
                    { letter: 'T', label: 'Tampering', color: 'bg-red-50 border-red-200 text-red-800', desc: 'Unauthorized modification of training data, model weights, or AI outputs.', mitigation: 'Data integrity checks, audit logging, immutable model artifacts' },
                    { letter: 'R', label: 'Repudiation', color: 'bg-orange-50 border-orange-200 text-orange-800', desc: 'AI-generated decisions cannot be attributed or audited after the fact.', mitigation: 'Comprehensive audit trails, non-repudiation logging' },
                    { letter: 'I', label: 'Information Disclosure', color: 'bg-amber-50 border-amber-200 text-amber-800', desc: 'ePHI or proprietary model data exposed through insecure APIs or outputs.', mitigation: 'Encryption, DLP controls, output sanitization' },
                    { letter: 'D', label: 'Denial of Service', color: 'bg-rose-50 border-rose-200 text-rose-800', desc: 'AI system overwhelmed or disabled, disrupting clinical workflows.', mitigation: 'Rate limiting, redundancy, incident response planning' },
                    { letter: 'E', label: 'Elevation of Privilege', color: 'bg-purple-50 border-purple-200 text-purple-800', desc: 'Attacker gains elevated access to AI system or clinical data stores.', mitigation: 'Least privilege, RBAC, privileged access management (PAM)' },
                  ].map((item) => (
                    <div key={item.letter} className={`border rounded-lg p-3 ${item.color}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-xs font-black flex-shrink-0">{item.letter}</span>
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      <p className="text-xs opacity-80 mb-1.5 leading-relaxed">{item.desc}</p>
                      <p className="text-xs font-semibold opacity-70">↳ {item.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MITRE ATT&CK */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold bg-slate-800 text-white px-2.5 py-1 rounded-full">MITRE ATT&CK</span>
                  <p className="text-xs text-slate-500">Adversary tactics relevant to healthcare AI environments</p>
                </div>
                <div className="space-y-2">
                  {[
                    { tactic: 'Initial Access', id: 'TA0001', desc: 'Phishing emails targeting clinical staff to gain entry into the AI system environment.', technique: 'Spearphishing Attachment (T1566.001)' },
                    { tactic: 'Credential Access', id: 'TA0006', desc: 'Credential dumping or brute-force against accounts with access to ePHI or model infrastructure.', technique: 'Brute Force (T1110), OS Credential Dumping (T1003)' },
                    { tactic: 'Exfiltration', id: 'TA0010', desc: 'Sensitive patient data or AI model artifacts exfiltrated via API or network channels.', technique: 'Exfiltration Over C2 Channel (T1041)' },
                    { tactic: 'Impact', id: 'TA0040', desc: 'Ransomware encrypts AI system data, disrupting clinical operations and patient care.', technique: 'Data Encrypted for Impact (T1486)' },
                  ].map((item) => (
                    <div key={item.tactic} className="flex gap-3 items-start bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded">{item.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-slate-800">{item.tactic}</span>
                          <span className="text-xs text-slate-400 font-mono">{item.technique}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 italic mt-2">MITRE ATT&CK® is a registered trademark of The MITRE Corporation. Technique references are for informational threat analysis purposes only.</p>
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
                    description: 'Assets and threats assessed through structured questions and risk scoring, documented for remediation planning'
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
        {fw.nist_rmf && (
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
                    { step: '1', title: 'Categorize', color: 'bg-slate-100 border-slate-300 text-slate-700', badge: 'bg-slate-200 text-slate-800', description: `Classify ${assessment.system_name} based on the potential impact of a security breach. Given clinical deployment and ePHI involvement, this system likely falls under HIGH impact categorization per FIPS 199.` },
                    { step: '2', title: 'Select', color: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'bg-blue-100 text-blue-800', description: "Select and tailor security controls from NIST SP 800-53 appropriate for the system's impact level. Priority controls include AC (Access Control), AU (Audit), SI (System Integrity), and SC (System Communications)." },
                    { step: '3', title: 'Implement', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', description: 'Deploy selected controls including encryption, access management, audit logging, and AI-specific human-in-the-loop validation. Document implementation details for authorization review.' },
                    { step: '4', title: 'Assess', color: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100 text-amber-800', description: 'Evaluate control effectiveness through testing, review, and independent assessment. Identify deficiencies in current controls and prioritize remediation before authorization.' },
                    { step: '5', title: 'Authorize', color: 'bg-purple-50 border-purple-200 text-purple-700', badge: 'bg-purple-100 text-purple-800', description: 'Senior official reviews the system security plan, assessment results, and residual risks to issue an Authorization to Operate (ATO) or deny authorization pending remediation.' },
                    { step: '6', title: 'Monitor', color: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100 text-orange-800', description: 'Continuously monitor security controls, system changes, and the threat environment. Report security status to authorizing official and update the authorization when significant changes occur.' }
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
        )}

        {/* NIST RMF SP 800-53 CONTROL FAMILIES */}
        {fw.nist_rmf && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('rmf_controls')}>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🗂️</span> NIST SP 800-53 Control Families
                </CardTitle>
                {expandedSections.rmf_controls ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            {expandedSections.rmf_controls && (
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 mb-2">The following NIST SP 800-53 control families are directly applicable to identified risks in {assessment.system_name}.</p>
                {[
                  { family: 'AC', name: 'Access Control', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800', risk: 'Unauthorized personnel may access ePHI or AI model parameters, increasing the risk of data disclosure and model manipulation.', controls: ['Enforce least-privilege access and role-based permissions (AC-2, AC-3)', 'Require multi-factor authentication for all system access (AC-17)', 'Implement session management and automatic logoff (AC-11, AC-12)'] },
                  { family: 'SI', name: 'System & Information Integrity', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', risk: 'AI-generated outputs may contain errors or be corrupted, leading to incorrect clinical decisions and patient harm.', controls: ['Deploy output validation and human-in-the-loop review for AI decisions (SI-3, SI-10)', 'Monitor for model drift and behavioral anomalies in production (SI-4)', 'Maintain integrity of training data and model artifacts (SI-7)'] },
                  { family: 'RA', name: 'Risk Assessment', color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-800', risk: 'Without ongoing risk assessment, newly emerging threats to AI systems may go undetected.', controls: ['Conduct regular AI-specific risk assessments including bias and adversarial risk (RA-3)', 'Maintain a documented vulnerability disclosure process (RA-5)', 'Assess supply chain and vendor risks associated with AI components (RA-9)'] },
                  { family: 'SC', name: 'System & Communications Protection', color: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-800', risk: 'Data transmitted between clinical systems and the AI model may be intercepted or manipulated in transit.', controls: ['Encrypt all data in transit using TLS 1.2 or higher (SC-8)', 'Segment AI system network from general clinical networks (SC-7)', 'Protect cryptographic keys and certificates used by AI infrastructure (SC-12)'] },
                  { family: 'CA', name: 'Assessment, Authorization & Monitoring', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800', risk: 'Without continuous monitoring, security degradation and control failures in the AI system may persist undetected.', controls: ['Implement continuous monitoring of security controls and system performance (CA-7)', 'Conduct periodic control assessments and document findings (CA-2)', 'Maintain an up-to-date System Security Plan (SSP) and authorization package (CA-5, CA-6)'] },
                ].map((item, i) => (
                  <div key={i} className={`border rounded-lg p-4 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badge}`}>{item.family}</span>
                      <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Risk:</span> {item.risk}</p>
                    <ul className="space-y-1">
                      {item.controls.map((c, ci) => (
                        <li key={ci} className="text-xs text-slate-700 flex gap-2">
                          <span className="font-bold text-slate-400 flex-shrink-0">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* ISO/IEC 42001 ALIGNMENT */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('iso42001')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🤖</span> ISO/IEC 42001 Alignment
                <Badge className="bg-emerald-100 text-emerald-700 text-xs ml-1">AI Management System</Badge>
              </CardTitle>
              {expandedSections.iso42001 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.iso42001 && (
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">ISO/IEC 42001 is the international standard for AI Management Systems (AIMS). The following domains align with the identified risks and governance needs of {assessment.system_name}.</p>
              {[
                { domain: 'AI Governance', icon: '🏛️', color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-800', description: 'Establish clear accountability and oversight structures for AI deployment.', items: ['Define AI governance policy, objectives, and accountability assignments', 'Establish an AI oversight committee with clinical, legal, and technical representation', 'Document organizational roles and responsibilities for AI risk management'] },
                { domain: 'Risk Management', icon: '⚖️', color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-800', description: 'Identify and treat AI-specific risks including bias, safety, and reliability.', items: ['Conduct AI impact assessments covering bias, safety, and clinical efficacy', 'Establish risk treatment plans with documented owners and timelines', 'Evaluate third-party AI components and vendor risk throughout the supply chain'] },
                { domain: 'Transparency & Explainability', icon: '🔍', color: 'bg-sky-50 border-sky-200', badge: 'bg-sky-100 text-sky-800', description: 'Ensure AI decisions can be understood, audited, and communicated to stakeholders.', items: ['Document AI system intended use, limitations, and decision-making logic', 'Provide clinicians with sufficient context to interpret and validate AI outputs', 'Disclose AI use to patients and maintain records of AI-assisted decisions'] },
                { domain: 'Monitoring & Continuous Improvement', icon: '📈', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', description: 'Sustain AI system performance and compliance through ongoing evaluation.', items: ['Monitor AI system performance, accuracy, and fairness metrics in production', 'Detect and respond to model drift, degradation, or unexpected behavior', 'Conduct periodic internal audits and management reviews of the AIMS', 'Update risk treatments and controls as the AI system and threat landscape evolve'] },
              ].map((item, i) => (
                <div key={i} className={`border rounded-lg p-4 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{item.icon}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badge}`}>{item.domain}</span>
                  </div>
                  <p className="text-xs text-slate-600 italic mb-2">{item.description}</p>
                  <ul className="space-y-1">
                    {item.items.map((c, ci) => (
                      <li key={ci} className="text-xs text-slate-700 flex gap-2">
                        <span className="font-bold text-slate-400 flex-shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* HHS HICP HEALTHCARE GUIDANCE */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('hicp')}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏥</span> Healthcare Security Practices (HICP)
                <Badge className="bg-teal-100 text-teal-700 text-xs ml-1">HHS Supporting Guidance</Badge>
              </CardTitle>
              {expandedSections.hicp ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.hicp && (
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                The HHS Health Industry Cybersecurity Practices (HICP) publication provides threat-based, real-world cybersecurity guidance specifically designed for healthcare organizations. HICP complements formal governance frameworks by aligning controls to the most prevalent healthcare threat scenarios.
              </p>
              {[
                {
                  threat: 'Phishing & Social Engineering',
                  color: 'bg-amber-50 border-amber-200',
                  badge: 'bg-amber-100 text-amber-800',
                  description: 'Healthcare staff with access to AI systems and ePHI are prime targets for credential phishing and social engineering.',
                  controls: [
                    'Deploy phishing-resistant MFA for all users accessing the AI system',
                    'Conduct regular security awareness training with phishing simulations',
                    'Implement email filtering and anti-spoofing controls (SPF, DKIM, DMARC)',
                  ]
                },
                {
                  threat: 'Ransomware',
                  color: 'bg-red-50 border-red-200',
                  badge: 'bg-red-100 text-red-800',
                  description: 'AI infrastructure, model repositories, and clinical data stores are high-value targets for ransomware attacks that can disrupt patient care.',
                  controls: [
                    'Maintain offline, tested backups of AI models, training data, and ePHI',
                    'Segment the AI system network from general clinical and administrative networks',
                    'Develop and rehearse a ransomware-specific incident response playbook',
                  ]
                },
                {
                  threat: 'Data Loss & ePHI Exposure',
                  color: 'bg-orange-50 border-orange-200',
                  badge: 'bg-orange-100 text-orange-800',
                  description: 'AI systems that process or generate outputs containing ePHI risk unauthorized data exposure through misconfigured access, insecure APIs, or inadequate logging.',
                  controls: [
                    'Enforce data loss prevention (DLP) controls on AI system outputs and exports',
                    'Encrypt ePHI at rest and in transit across all AI system components',
                    'Implement comprehensive audit logging for access to ePHI processed by AI',
                  ]
                },
              ].map((item, i) => (
                <div key={i} className={`border rounded-lg p-4 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badge}`}>HICP Threat</span>
                    <h4 className="text-sm font-bold text-slate-800">{item.threat}</h4>
                  </div>
                  <p className="text-xs text-slate-600 italic mb-2">{item.description}</p>
                  <ul className="space-y-1">
                    {item.controls.map((c, ci) => (
                      <li key={ci} className="text-xs text-slate-700 flex gap-2">
                        <span className="font-bold text-slate-400 flex-shrink-0">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-slate-400 italic pt-1">
                HICP is published by the U.S. Department of Health and Human Services (HHS) as voluntary, threat-based guidance. It is not a regulatory requirement but is recognized as a safe harbor consideration under HIPAA enforcement.
              </p>
            </CardContent>
          )}
        </Card>

        {/* END FULL REPORT ONLY */}
        </>)}

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
              {viewMode === 'executive' ? (
                <>
                  <p className="text-sm text-slate-600 mb-4">Highest-priority risks identified from this assessment. Expand each item for full traceability, impact analysis, and recommended controls.</p>
                  <RiskRegisterTable risks={getRisks().slice(0, 5)} compact={true} />
                  {getRisks().length > 5 && (
                    <button onClick={() => setViewMode('full')} className="mt-3 text-sm text-blue-600 hover:underline font-medium">
                      + {getRisks().length - 5} more risks in Full Report →
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    The following risks were identified through structured assessment of system inputs, governance conditions, and control gaps. Each entry includes traceability to input conditions, likelihood and impact scores (1–5), a recommended control, and framework alignment. This register is designed to serve as an audit-ready record aligned with HIPAA, NIST CSF 2.0, and ISO/IEC 27005.
                  </p>
                  <RiskRegisterTable risks={getRisks()} compact={true} />
                </>
              )}
            </CardContent>
          )}
        </Card>

        {viewMode === 'full' && (<>
        {/* SCORING METHODOLOGY */}
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📊</span> Scoring Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              Risk scores are generated using a structured model that combines qualitative assessment aligned with <strong>ISO/IEC 27005</strong> and quantitative scoring (0–100 scale) based on likelihood and impact.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Domain-specific scores (Algorithmic Bias, Cybersecurity, Regulatory Compliance, Clinical Impact) are derived from identified threats, asset sensitivity, and control gaps. Where ePHI is present, a sensitivity modifier of 1.5× is applied. Scores produce an overall risk profile aligned with <strong>NIST CSF 2.0</strong>, <strong>HIPAA</strong>, and healthcare AI governance considerations.
            </p>
            <div className="bg-white border border-slate-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-slate-600">
                <strong>Score Interpretation:</strong> 0–25 (Low Risk) · 26–50 (Medium Risk) · 51–75 (High Risk) · 76–100 (Critical Risk)
              </p>
            </div>
          </CardContent>
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
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                This assessment reflects a structured AI governance approach — risks assessed through structured questions, risk scoring, and mapping to applicable regulatory frameworks.
              </p>
            </div>
          </CardContent>
        </Card>

        </>)}

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