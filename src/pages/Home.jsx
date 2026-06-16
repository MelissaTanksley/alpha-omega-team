import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, BarChart3, Heart, Lock, AlertTriangle, CheckCircle, ArrowRight, Brain, FileCheck, Activity, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Risk Assessment',
    description: 'Evaluate AI systems across bias, security, compliance, and clinical risk dimensions.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    icon: BarChart3,
    title: 'Risk Scoring Dashboard',
    description: 'Receive a single, unified AI risk score with visual breakdowns for each category.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100'
  },
  {
    icon: FileCheck,
    title: 'Compliance & Governance',
    description: 'Identify regulatory gaps and governance weaknesses aligned with healthcare standards.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  },
  {
    icon: Activity,
    title: 'Patient Safety Indicators',
    description: 'Understand how AI risks translate into real-world clinical impact.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100'
  },
  {
    icon: AlertTriangle,
    title: 'Actionable Recommendations',
    description: 'Get guidance on how to reduce risk and strengthen AI governance practices.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100'
  },
  {
    icon: Lock,
    title: 'Cybersecurity Exposure',
    description: 'Detect and quantify security vulnerabilities in AI system deployments.',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200'
  }
];

const targetUsers = [
  'Healthcare Executives',
  'GRC Analysts',
  'Chief Information Security Officers (CISOs)',
  'Clinical Informatics Teams',
  'AI Governance & Compliance Professionals'
];

const platformTypes = [
  { label: 'AI Governance Platform', icon: Shield },
  { label: 'Risk Scoring Engine', icon: BarChart3 },
  { label: 'Executive Dashboard', icon: Activity },
  { label: 'Decision-Support System', icon: Brain }
];

const mockScores = [
  { label: 'Algorithmic Bias', score: 68, color: 'bg-amber-500' },
  { label: 'Cybersecurity', score: 45, color: 'bg-red-500' },
  { label: 'Regulatory Compliance', score: 33, color: 'bg-emerald-500' },
  { label: 'Clinical Impact', score: 77, color: 'bg-blue-500' }
];

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setInstallPrompt(null);
    } else if (isIOS) {
      setShowIOSHint(true);
    } else {
      setShowIOSHint(true);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-3xl flex-1">
              <Badge className="mb-6 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full">
                Healthcare AI Governance Platform
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
                AI Risk Navigator
                <span className="block text-blue-400">for Healthcare</span>
              </h1>
              <p className="text-xl text-slate-300 mb-3 max-w-2xl font-medium">
                Transform complex AI risks into clear, actionable insights for safer healthcare decisions.
              </p>
              <p className="text-base text-slate-400 mb-10 max-w-3xl leading-relaxed">
                A decision-support platform enabling healthcare leaders, GRC analysts, and technology teams to assess risks associated with AI systems in clinical and operational environments.
              </p>
              <div className="flex flex-wrap gap-4 mb-14">
                <Link to="/RiskAssessment">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold">
                    Start Risk Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/RiskDashboard">
                  <Button size="lg" variant="outline" className="border-slate-600 text-blue-400 hover:bg-slate-800 hover:text-blue-300 px-8 h-12 text-base">
                    View Dashboard
                  </Button>
                </Link>
                {!installed && (
                  <Button size="lg" variant="outline" onClick={handleInstall} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-6 h-12 text-base">
                    <Smartphone className="mr-2 h-5 w-5" />
                    Add to Phone
                  </Button>
                )}
              </div>

              {/* iOS / install hint */}
              {showIOSHint && (
                <div className="mb-8 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 max-w-md text-sm text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white mb-1">Install on your device</p>
                  <p><span className="text-blue-400">iPhone/iPad:</span> Tap the Share icon in Safari, then "Add to Home Screen".</p>
                  <p className="mt-1"><span className="text-blue-400">Android/Desktop:</span> Open the browser menu (⋮) and tap "Install App" or "Add to Home Screen".</p>
                  <button onClick={() => setShowIOSHint(false)} className="mt-3 text-xs text-slate-500 hover:text-slate-300 underline">Dismiss</button>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {platformTypes.map((type) => (
                  <div key={type.label} className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
                    <type.icon className="h-4 w-4 text-blue-400" />
                    {type.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end text-right flex-shrink-0">
              <div className="text-blue-400 font-bold text-2xl tracking-widest mb-1">AOAI</div>
              <div className="text-slate-300 text-sm font-medium mb-1">Assessment of Artificial Intelligence</div>
              <div className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Evaluate AI risk across bias, cybersecurity, compliance, and patient safety
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive AI Risk Management</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              The platform evaluates AI systems across four critical dimensions, combining them into a unified risk model with clear, quantifiable scores and actionable insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className={`border ${feature.border} hover:shadow-lg transition-all duration-200 group`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users + Mock Dashboard */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Healthcare Professionals</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Designed for both technical and non-technical users, the system simplifies complex AI governance challenges into intuitive outputs that support strategic decision-making and patient safety.
              </p>
              <div className="space-y-3 mb-10">
                {targetUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{u}</span>
                  </div>
                ))}
              </div>
              <Link to="/RiskAssessment">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Begin Your First Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mock risk score card */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Sample Risk Analysis</div>
                  <div className="text-white font-semibold">Clinical Decision Support AI</div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">High Risk</Badge>
              </div>
              <div className="mb-6">
                <div className="text-slate-400 text-xs mb-1">Overall Risk Score</div>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold text-amber-400">72</span>
                  <span className="text-slate-400 text-sm mb-2">/ 100</span>
                </div>
              </div>
              <div className="space-y-4">
                {mockScores.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-400 text-xs">{item.label}</span>
                      <span className="text-white font-semibold text-xs">{item.score}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-500">
                ⚠ 3 governance gaps identified · 5 recommendations generated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '1', label: 'Input AI System', desc: 'Enter details about your AI system — type, vendor, deployment context, and data sources.', color: 'bg-blue-600' },
              { step: '2', label: 'Analyze Risk', desc: 'The platform evaluates bias, cybersecurity posture, compliance status, and clinical impact.', color: 'bg-violet-600' },
              { step: '3', label: 'Generate Score', desc: 'Receive a unified risk score with dimension breakdowns and identified governance gaps.', color: 'bg-amber-500' },
              { step: '4', label: 'Take Action', desc: 'Act on prioritized recommendations to reduce risk and strengthen patient safety.', color: 'bg-green-600' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {item.step}
                </div>
                <h3 className="text-slate-900 font-semibold text-base">{item.label}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AOAI is Different */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Why AOAI is Different</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-slate-900 font-semibold text-base">Built for Healthcare AI</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Purpose-built for the unique regulatory, clinical, and operational demands of healthcare AI environments.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-slate-900 font-semibold text-base">Risk Scoring (Not Just Compliance)</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Goes beyond checkbox compliance to deliver quantified risk scores across bias, cybersecurity, and governance dimensions.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-slate-900 font-semibold text-base">Patient Safety Focused</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Every assessment dimension is anchored to patient safety outcomes, ensuring AI risk decisions protect those who matter most.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Assess Your AI Systems?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Identify vulnerabilities, highlight governance gaps, and strengthen patient safety across your AI deployments.
          </p>
          <Link to="/RiskAssessment">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 h-12 text-base">
              Begin Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}