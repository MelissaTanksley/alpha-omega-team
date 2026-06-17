import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from 'lucide-react';

export default function GRCWorkspace() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">GRC Workspace</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The multi-agent GRC analysis workspace. Use the Orchestrator agent to run full risk pipeline analyses across your healthcare AI systems.
        </p>
        <Link to="/">
          <Button variant="outline" className="border-slate-300 text-slate-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}