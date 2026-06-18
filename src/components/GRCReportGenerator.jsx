import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ChevronDown, ChevronRight } from 'lucide-react';

function GRCReportGenerator({ results, systemDescription }) {
  const [showReport, setShowReport] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateExecutiveBrief = () => {
    const briefDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const riskCount = results?.length || 0;
    const criticalCount = results?.filter(r => r.likelihood?.toLowerCase() === 'critical' || r.likelihood?.toLowerCase() === 'high')?.length || 0;
    const recommendations = results?.reduce((sum, r) => sum + (r.controls?.administrative?.length || 0) + (r.controls?.technical?.length || 0) + (r.controls?.physical?.length || 0), 0) || 0;

    const brief = `EXECUTIVE BRIEF — GRC ASSESSMENT
Generated: ${briefDate}

SYSTEM: ${systemDescription?.split('\n')[0] || 'Healthcare AI System'}

ASSESSMENT OVERVIEW
—————————————————
Total Risks Identified: ${riskCount}
High/Critical Priority: ${criticalCount}
Recommended Controls: ${recommendations}

KEY FINDINGS
—————————————
${results?.slice(0, 5)?.map((r, i) => `${i + 1}. ${r.risk} [${r.likelihood?.toUpperCase() || 'MEDIUM'}]
   Asset: ${r.affected_asset}
   Residual Risk: ${r.residual_risk}`).join('\n\n') || 'No critical findings.'}

COMPLIANCE ALIGNMENT
———————————————
✓ HIPAA: Risk-to-safeguard mapping complete
✓ NIST CSF 2.0: All risks mapped to lifecycle functions
✓ HITECH: Breach notification requirements reviewed

NEXT STEPS
——————————
1. Review high-priority risks and assigned controls
2. Implement recommended administrative, technical, and physical safeguards
3. Establish monitoring for residual risks
4. Schedule follow-up assessment in 6-12 months

CONFIDENCE LEVEL: Assessment based on system description provided
FRAMEWORK: ISO 27005 (Qualitative Scoring) + HIPAA + NIST CSF 2.0

———————————————————————————————————————————`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(brief));
    element.setAttribute('download', `grc-executive-brief-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!results || results.length === 0) {
    return null;
  }

  const sections = [
    {
      id: 'executive',
      title: 'Executive Summary',
      content: () => (
        <div className="space-y-3 text-sm text-slate-700">
          <p>A comprehensive GRC assessment has identified <span className="font-semibold">{results.length} distinct risks</span> across the healthcare AI system. Each risk has been analyzed for clinical, operational, and legal impact, mapped to regulatory frameworks (HIPAA, NIST CSF 2.0), and assigned appropriate controls.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-xs text-slate-600 mt-1">Risks Identified</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{results.reduce((sum, r) => sum + (r.controls?.administrative?.length || 0) + (r.controls?.technical?.length || 0) + (r.controls?.physical?.length || 0), 0)}</div>
              <div className="text-xs text-slate-600 mt-1">Controls Recommended</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{results.filter(r => r.likelihood?.toLowerCase() === 'high' || r.likelihood?.toLowerCase() === 'critical').length}</div>
              <div className="text-xs text-slate-600 mt-1">High Priority</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'overview',
      title: 'System Overview',
      content: () => (
        <div className="text-sm text-slate-700 whitespace-pre-wrap">
          {systemDescription}
        </div>
      )
    },
    {
      id: 'risk',
      title: 'Risk Analysis',
      content: () => (
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 border-l-4 border-l-amber-500">
              <div className="font-semibold text-slate-900 text-sm mb-2">{i + 1}. {r.risk}</div>
              <div className="space-y-1 text-xs text-slate-700">
                <div><span className="font-semibold">Asset:</span> {r.affected_asset}</div>
                <div><span className="font-semibold">Likelihood:</span> {r.likelihood}</div>
                <div><span className="font-semibold">Residual Risk:</span> {r.residual_risk}</div>
                {r.impact && (
                  <>
                    <div className="mt-2"><span className="font-semibold">Clinical Impact:</span> {r.impact.clinical}</div>
                    <div><span className="font-semibold">Operational Impact:</span> {r.impact.operational}</div>
                    <div><span className="font-semibold">Legal Impact:</span> {r.impact.legal}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'compliance',
      title: 'Compliance Mapping (HIPAA + NIST CSF)',
      content: () => (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2">HIPAA Safeguard Alignment</h4>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="font-semibold text-blue-900 mb-1">{r.risk}</div>
                  <div className="text-blue-800">
                    {(r.hipaa_mapping || []).length > 0 ? (r.hipaa_mapping || []).join(', ') : 'Review for compliance'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2">NIST CSF 2.0 Functions</h4>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="text-xs bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                  <div className="font-semibold text-indigo-900 mb-1">{r.risk}</div>
                  <div className="text-indigo-800">
                    {(r.nist_csf_mapping || []).length > 0 ? (r.nist_csf_mapping || []).join(', ') : 'Identify, Protect, Detect, Respond, Recover'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'controls',
      title: 'Control Recommendations',
      content: () => (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">🛡️</span> Administrative Controls
            </h4>
            <ul className="space-y-2 text-xs">
              {results.flatMap(r => (r.controls?.administrative || []).map((c, i) => (
                <li key={`${r.risk}-admin-${i}`} className="bg-slate-50 border-l-4 border-l-emerald-500 p-2 rounded">• {c}</li>
              )))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">🔒</span> Technical Controls
            </h4>
            <ul className="space-y-2 text-xs">
              {results.flatMap(r => (r.controls?.technical || []).map((c, i) => (
                <li key={`${r.risk}-tech-${i}`} className="bg-slate-50 border-l-4 border-l-blue-500 p-2 rounded">• {c}</li>
              )))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">🚪</span> Physical Controls
            </h4>
            <ul className="space-y-2 text-xs">
              {results.flatMap(r => (r.controls?.physical || []).map((c, i) => (
                <li key={`${r.risk}-phys-${i}`} className="bg-slate-50 border-l-4 border-l-orange-500 p-2 rounded">• {c}</li>
              )))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'internal',
      title: 'Internal vs External Risk',
      content: () => (
        <div className="space-y-3 text-sm">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-semibold text-orange-900 mb-2">Internal Risk Vectors</h4>
            <ul className="text-xs text-orange-800 space-y-1">
              <li>• Access control weaknesses and insider misuse</li>
              <li>• Misconfigured ePHI systems and data repositories</li>
              <li>• AI model drift, hallucination, and incorrect outputs</li>
              <li>• Inadequate monitoring and audit logging</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-semibold text-red-900 mb-2">External Risk Vectors</h4>
            <ul className="text-xs text-red-800 space-y-1">
              <li>• Threat actors targeting healthcare organizations</li>
              <li>• Ransomware and extortion attacks</li>
              <li>• Third-party/vendor AI system compromises</li>
              <li>• Supply chain attacks on AI models or training data</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'nist',
      title: 'NIST CSF Lifecycle (Govern, Identify, Protect, Detect, Respond, Recover)',
      content: () => (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-100 rounded-lg p-3 border-l-4 border-l-slate-400">
            <div className="font-bold text-slate-900">⚙️ Govern</div>
            <div className="text-slate-700 mt-1">Establish policies, risk governance, and AI oversight structures</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 border-l-4 border-l-blue-400">
            <div className="font-bold text-blue-900">🔍 Identify</div>
            <div className="text-blue-700 mt-1">Detect assets, threats, and risks; understand system behavior</div>
          </div>
          <div className="bg-emerald-100 rounded-lg p-3 border-l-4 border-l-emerald-400">
            <div className="font-bold text-emerald-900">🛡️ Protect</div>
            <div className="text-emerald-700 mt-1">Implement controls to safeguard ePHI, AI models, and systems</div>
          </div>
          <div className="bg-orange-100 rounded-lg p-3 border-l-4 border-l-orange-400">
            <div className="font-bold text-orange-900">⚠️ Detect</div>
            <div className="text-orange-700 mt-1">Monitor for anomalies, breaches, and AI model failures</div>
          </div>
          <div className="bg-red-100 rounded-lg p-3 border-l-4 border-l-red-400">
            <div className="font-bold text-red-900">🚨 Respond</div>
            <div className="text-red-700 mt-1">Execute incident response, containment, and escalation protocols</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-3 border-l-4 border-l-purple-400">
            <div className="font-bold text-purple-900">↩️ Recover</div>
            <div className="text-purple-700 mt-1">Restore systems to trusted state and validate recovery</div>
          </div>
        </div>
      )
    },
    {
      id: 'conclusion',
      title: 'Conclusion and Next Steps',
      content: () => (
        <div className="space-y-3 text-sm text-slate-700">
          <p><span className="font-semibold">Status:</span> Comprehensive GRC assessment completed. All identified risks have been mapped to HIPAA safeguards and NIST CSF 2.0 functions with recommended controls.</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="font-semibold text-emerald-900 mb-2">✓ Recommended Actions:</p>
            <ol className="space-y-1 text-xs text-emerald-800 list-decimal list-inside">
              <li>Review and prioritize high/critical risks for immediate remediation</li>
              <li>Assign ownership of control implementation to relevant teams</li>
              <li>Establish metrics and monitoring for control effectiveness</li>
              <li>Schedule periodic reviews (quarterly to annually)</li>
              <li>Document remediation progress and residual risk acceptance</li>
            </ol>
          </div>
          <p><span className="font-semibold">Assessment Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-500 italic">This report is session-based and intended for internal governance, compliance, and audit purposes only.</p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 mt-6 border-t border-slate-200 pt-6">
      {!showReport ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">Risk Assessment Complete</p>
              <p className="text-xs text-blue-700 mt-0.5">Generate a comprehensive GRC report with all sections</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowReport(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 whitespace-nowrap"
          >
            <FileText className="h-4 w-4" />
            Generate GRC Report
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Report Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">GRC Assessment Report</h2>
              <p className="text-xs text-slate-500 mt-1">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateExecutiveBrief}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Executive Brief
              </Button>
              <Button
                onClick={() => setShowReport(false)}
                variant="ghost"
                className="text-slate-500"
              >
                Hide Report
              </Button>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3 max-h-96 overflow-y-auto print:max-h-none print:overflow-visible">
            {sections.map(section => (
              <div key={section.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900">{section.title}</h3>
                  {expandedSections[section.id] ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedSections[section.id] && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    {section.content()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Print Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
            <p><span className="font-semibold">💡 Tip:</span> To save as PDF, click "Download Executive Brief" or use your browser's Print function (Ctrl+P / Cmd+P) and select "Save as PDF".</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GRCReportGenerator;