import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import NISTExampleCard from '@/components/NISTExampleCard';
import AssetComplianceExample from '@/components/AssetComplianceExample';

export default function ExampleWorkflow() {
  useEffect(() => { document.title = 'Example Workflow | AI Risk Navigator'; }, []);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Badge className="mb-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full">
            Example AI Risk Workflow
          </Badge>
          <h1 className="text-4xl font-bold mb-3">Understand How the System Works</h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            A step-by-step walkthrough of how AI risks are assessed through structured questions, risk scoring, and mapping to HIPAA and NIST standards — from asset identification through recovery.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link to="/RiskAssessment">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Run Your Own Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <span className="text-slate-500 text-sm">or</span>
            <Link to="/GRCReport?demo=1">
              <Button variant="outline" className="border-slate-600 text-blue-400 hover:bg-slate-800 hover:text-blue-300">
                <Zap className="mr-2 h-4 w-4" />
                Skip to Demo Report
              </Button>
            </Link>
          </div>
          <p className="text-slate-500 text-xs mt-3">Demo = see results instantly · Workflow = understand the methodology</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* NIST CSF Workflow */}
        <section>
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full">
              NIST CSF 2.0
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">NIST CSF Lifecycle Mapping</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A complete risk from identification through recovery, mapped across all six NIST CSF 2.0 functions — Govern, Identify, Protect, Detect, Respond, and Recover.
            </p>
          </div>
          <NISTExampleCard />
        </section>

        {/* Asset Compliance Traceability */}
        <section>
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-purple-50 text-purple-700 border border-purple-200 text-xs px-3 py-1 rounded-full">
              Asset → Compliance Traceability
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Asset Compliance Mapping</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              See how protected assets (like ePHI in AI-generated clinical notes) are traced to HIPAA safeguard types and NIST CSF functions, with detailed justifications and control recommendations.
            </p>
          </div>
          <AssetComplianceExample />
        </section>

        {/* CTA */}
        <section className="bg-slate-900 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Assess Your AI Systems?</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Run a full assessment in minutes and get a structured GRC report aligned with HIPAA, NIST, and ISO frameworks.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/RiskAssessment">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold">
                Start Risk Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/GRCReport?demo=1">
              <Button size="lg" variant="outline" className="border-slate-600 text-blue-400 hover:bg-slate-800 hover:text-blue-300 px-8 h-12 text-base">
                <Zap className="mr-2 h-5 w-5" />
                View Demo Report
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}