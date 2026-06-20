import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, BarChart3, CheckCircle, ArrowRight, Brain, Activity, Target, Zap, AlertTriangle, Building2, Users, FileText, Mail, Download } from 'lucide-react';
import NISTExampleCard from '@/components/NISTExampleCard';
import AssetComplianceExample from '@/components/AssetComplianceExample';
import InstallPrompt from '@/components/InstallPrompt';

const mockScores = [
  { label: 'Algorithmic Bias', score: 68, color: 'bg-amber-500' },
  { label: 'Cybersecurity', score: 45, color: 'bg-red-500' },
  { label: 'Regulatory Compliance', score: 33, color: 'bg-emerald-500' },
  { label: 'Clinical Impact', score: 77, color: 'bg-blue-500' }
];

const useCases = [
  {
    icon: Building2,
    title: 'Healthcare Organizations',
    desc: 'Hospitals, health systems, and clinics deploying AI tools who need structured risk governance and regulatory alignment.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    icon: Users,
    title: 'Cybersecurity Consultants',
    desc: 'GRC and security professionals delivering AI risk assessments to healthcare clients using NIST CSF 2.0 and ISO 27005.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100'
  },
  {
    icon: FileText,
    title: 'Compliance Programs',
    desc: 'Compliance and privacy teams that need repeatable, documented AI risk outputs for audits, reporting, and board-level governance.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  }
];

export default function Home() {
  useEffect(() => { document.title = 'AI Risk Navigator | Healthcare AI Risk & Compliance'; }, []);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');

  const handleDemoRequest = async (e) => {
    e.preventDefault();
    if (!demoEmail.trim()) return;
    try {
      await base44.functions.invoke('sendDemoRequest', { email: demoEmail });
    } catch (_) {}
    setDemoSubmitted(true);
  };

  return (
    <div>
      <InstallPrompt />

      {/* ── HERO ── */}
      <section className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <Badge className="mb-6 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full">
                Healthcare AI Governance Platform
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5 tracking-tight">
                AI Risk Navigator
                <span className="block text-blue-400">for Healthcare</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
                Identify, measure, and manage AI risks using leading healthcare and,<br/>cybersecurity frameworks, including governance standards such as,<br/><span className="text-white font-semibold">HIPAA</span>, <span className="text-white font-semibold">NIST CSF 2.0</span>, <span className="text-white font-semibold">NIST RMF</span>, <span className="text-white font-semibold">ISO 27005</span>, <span className="text-white font-semibold">ISO/IEC 42001</span>, and <span className="text-white font-semibold">GDPR</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/RiskAssessment">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold">
                    Start Risk Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/RiskAssessment?demo=1">
                  <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white px-8 h-12 text-base font-semibold">
                    <Zap className="mr-2 h-5 w-5" />
                    Try Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                <span className="font-semibold text-slate-300">Privacy Note:</span> Designed with data privacy in mind. Analysis is<br/>session-based and not used to train models or shared between users.
              </p>


            </div>

            {/* Mock risk score card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="border-b border-slate-700 px-7 py-4">
                <p className="text-slate-300 text-xs mb-2.5">Uses a hybrid risk modeling approach:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1">Qualitative scoring (ISO 27005)</span>
                  <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full px-3 py-1">Numeric risk scoring (0–100)</span>
                  <span className="text-xs bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-full px-3 py-1">FAIR-informed prioritization methods</span>
                </div>
              </div>
              <div className="p-7">
                <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">Aligned with ISO 27005, NIST CSF 2.0, and HIPAA</div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Sample Risk Analysis</div>
                    <div className="text-white font-semibold text-sm">Clinical Decision Support AI</div>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">High Risk</Badge>
                </div>
                <div className="mb-5">
                  <div className="text-slate-400 text-xs mb-1">Overall Risk Score</div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-amber-400">72</span>
                    <span className="text-slate-400 text-sm mb-1">/ 100</span>
                  </div>
                </div>
                <div className="space-y-3.5">
                  {mockScores.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-slate-400 text-xs">{item.label}</span>
                        <span className="text-white font-semibold text-xs">{item.score}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-slate-700 text-xs text-slate-400">
                  ⚠ 3 governance gaps identified · 5 recommendations generated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1 rounded-full">The Problem</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">AI Systems in Healthcare Introduce Risks Not Covered by Traditional Cybersecurity Tools</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Standard security frameworks were designed for IT infrastructure — not for AI systems making clinical recommendations and processing protected health information.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'Hallucinated Clinical Outputs', desc: 'AI models can generate confident but incorrect diagnoses, drug recommendations, or clinical notes — with no traditional security control to catch them.', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
              { icon: Shield, title: 'ePHI Exposure', desc: 'AI systems trained on or processing electronic protected health information create unique vectors for data leakage that HIPAA rules were not designed to address.', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: AlertTriangle, title: 'No Structured Compliance Mapping', desc: 'Most organizations lack a repeatable process to map AI risks to HIPAA, NIST CSF, or ISO standards — leaving regulatory gaps undocumented and unmitigated.', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
            ].map((item, i) => (
              <div key={i} className={`border ${item.border} rounded-2xl p-6`}>
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full">The Solution</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">A Structured, Framework-Aligned AI Risk Platform</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">This tool provides everything needed to assess, document,<br />and act on AI risks in healthcare environments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-600/20', title: 'AI Risk Scoring', sub: 'ISO 27005', desc: 'Quantified risk scores across bias, cybersecurity, compliance, and clinical impact dimensions — producing a single unified 0–100 risk score per system.', footnote: 'Based on ISO/IEC 27005 likelihood and impact modeling' },
              { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-600/20', title: 'Compliance Mapping', sub: 'HIPAA · NIST CSF 2.0', desc: 'Auto-maps every identified risk to HIPAA safeguards and NIST CSF 2.0 functions, highlighting regulatory gaps and producing audit-ready documentation.', footnote: 'Aligned with HIPAA safeguards and NIST CSF 2.0 functions' },
              { icon: Activity, color: 'text-orange-400', bg: 'bg-orange-600/20', title: 'Internal & External Risk Identification', sub: 'Risk Measurement & Monitoring', desc: 'Analyzes both internal vectors (access control, insider misuse, model drift) and external threats (ransomware, MITRE ATT&CK, vendor risks) in a single workflow.', footnote: 'Informed by STRIDE and MITRE ATT&CK threat models' },
              { icon: Target, color: 'text-violet-400', bg: 'bg-violet-600/20', title: 'Structured Governance Outputs', sub: 'Reporting & Handoff', desc: 'Generates downloadable reports, recommendations, and governance gap summaries suitable for board presentations, audits, and integration into existing GRC programs.', footnote: 'Informed by FAIR-aligned risk prioritization methods' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-start gap-4">
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${item.color}`}>{item.sub}</p>
                  <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                  <p className={`text-xs mt-3 font-medium ${item.color} opacity-80`}>↳ {item.footnote}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/GRCWorkspace">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold">
                <Zap className="mr-2 h-5 w-5" />
                Run a Full Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXAMPLE WORKFLOWS ── */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* NIST Example */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full">Example Workflow</Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">See NIST CSF 2.0 in Action</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">A complete risk from identification through recovery, mapped to all six NIST functions.</p>
            </div>
            <NISTExampleCard />
          </div>

          {/* Asset Compliance Example */}
          <div>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-50 text-purple-700 border border-purple-200 text-xs px-3 py-1 rounded-full">Real-World Example</Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Asset → Compliance Traceability</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Map protected assets to HIPAA safeguard types and NIST CSF functions with detailed justifications.</p>
            </div>
            <AssetComplianceExample />
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-200 text-slate-700 border border-slate-300 text-xs px-3 py-1 rounded-full">Who This Is For</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Healthcare AI Risk Stakeholders</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Whether you're delivering assessments to clients, managing internal AI governance, or building compliance programs — this tool is ready to use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((item, i) => (
              <div key={i} className={`bg-white border ${item.border} rounded-2xl p-6 hover:shadow-md transition-shadow`}>
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING + DEMO CTA ── */}
      <section id="request-demo" className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-white/20 text-white border border-white/30 text-xs px-3 py-1 rounded-full">Available Now</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">A Functional AI Risk Assessment Platform</h2>
            <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed">
              This is a working, healthcare-focused AI risk and compliance platform designed to demonstrate structured risk analysis, compliance mapping, and reporting capabilities aligned with HIPAA, NIST CSF 2.0, and ISO/IEC 27005.<br /><br />The platform showcases a complete workflow, including assessment, risk analysis, executive reporting, and risk register integration.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-8 max-w-xl mx-auto">
            {demoSubmitted ? (
              <div className="text-center py-4">
                <CheckCircle className="h-10 w-10 text-white mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">Request received!</p>
                <p className="text-blue-100 text-sm mt-1">We'll be in touch at <span className="font-medium">{demoEmail}</span>.</p>
              </div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-1 text-center">Request a Demo</h3>
                <p className="text-blue-100 text-sm text-center mb-5">Explore the assessment workflow, compliance outputs, and reporting features.</p>
                <form onSubmit={handleDemoRequest} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={demoEmail}
                    onChange={e => setDemoEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm text-slate-900 bg-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-slate-400"
                  />
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 h-10 font-semibold flex-shrink-0">
                    <Mail className="h-4 w-4 mr-2" />
                    Request Demo
                  </Button>
                </form>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/RiskAssessment">
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 px-8 h-12 text-base">
                Or Start Assessing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}