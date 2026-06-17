import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Shield, Play, Copy, RotateCcw, CheckCircle, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

const EXAMPLE_INPUT = `System: AI clinical charting assistant in a hospital

Functions:
- Converts doctor-patient conversations to medical notes
- Integrates with EHR

Environment:
- HIPAA-regulated
- Low risk tolerance

Concerns:
- Hallucinated diagnoses
- ePHI leakage
- Unauthorized access`;

const VALIDATION_PROMPT = (input) => `You are a strict input validator for a healthcare AI GRC system.

Determine if the following input describes a real system (AI or non-AI) in a healthcare or regulated environment.

A VALID input must include at least:
- Some description of a system, tool, or technology
- Some indication of context, environment, or use case

An INVALID input is one that is:
- Random text, gibberish, or lorem ipsum
- A single word with no context
- Completely unrelated to any real system (e.g. "banana", "hello", "???")
- Too vague to derive any system type or environment

Respond with ONLY valid JSON, no prose:
{"valid": true} or {"valid": false, "reason": "brief explanation of what is missing"}

Input:
${input}`;

const GRC_PROMPT = (input) => `Act as a healthcare Governance, Risk, and Compliance (GRC) system.

Perform the following steps in order:

STEP 1 — RISK ANALYSIS (ISO 27005)
- Identify risks, threats, and vulnerabilities
- Include likelihood and impact (clinical, operational, legal)

STEP 2 — COMPLIANCE MAPPING
Map each risk to:
- HIPAA (Administrative, Technical, Physical Safeguards)
- HITECH
- NIST CSF 2.0 functions/categories

STEP 3 — CONTROL DESIGN
Recommend controls:
- Administrative
- Technical
- Physical
Include AI-specific protections (human oversight, monitoring, validation)

STEP 4 — AUDIT CHECK
Validate:
- Every risk has mappings
- Every mapping has controls
- Residual risk is included
- Flag any gaps

STRICT RULES:
- Treat AI systems as high-risk
- Focus on healthcare (ePHI protection)
- No free-form text — output valid JSON only
- Use the exact structured output format below

OUTPUT FORMAT (return ONLY this JSON array, no prose, no markdown):
[
  {
    "risk": "",
    "impact": {
      "clinical": "",
      "operational": "",
      "legal": ""
    },
    "likelihood": "",
    "hipaa_mapping": [],
    "hitech_mapping": [],
    "nist_csf_mapping": [],
    "controls": {
      "administrative": [],
      "technical": [],
      "physical": []
    },
    "ai_safeguards": [],
    "residual_risk": "",
    "audit_notes": ""
  }
]

Input:
${input}`;

function RiskCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);

  const likelihoodColor = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }[item.likelihood?.toLowerCase()] || 'bg-slate-100 text-slate-700';

  const residualColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  }[item.residual_risk?.toLowerCase()] || 'text-slate-500';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{item.risk}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${likelihoodColor}`}>
              Likelihood: {item.likelihood}
            </span>
            <span className={`text-xs font-medium ${residualColor}`}>
              Residual: {item.residual_risk}
            </span>
          </div>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Impact */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Impact</p>
            <div className="grid grid-cols-3 gap-2">
              {['clinical', 'operational', 'legal'].map(k => (
                <div key={k} className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-400 capitalize mb-1">{k}</p>
                  <p className="text-xs text-slate-700">{item.impact?.[k] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mappings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'HIPAA', key: 'hipaa_mapping', color: 'blue' },
              { label: 'HITECH', key: 'hitech_mapping', color: 'purple' },
              { label: 'NIST CSF 2.0', key: 'nist_csf_mapping', color: 'indigo' },
            ].map(({ label, key, color }) => (
              <div key={key}>
                <p className={`text-xs font-semibold text-${color}-700 mb-1`}>{label}</p>
                <ul className="space-y-0.5">
                  {(item[key] || []).map((m, i) => (
                    <li key={i} className={`text-xs bg-${color}-50 text-${color}-800 rounded px-2 py-1`}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Controls</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Administrative', key: 'administrative', color: 'slate' },
                { label: 'Technical', key: 'technical', color: 'emerald' },
                { label: 'Physical', key: 'physical', color: 'amber' },
              ].map(({ label, key, color }) => (
                <div key={key}>
                  <p className={`text-xs font-semibold text-${color}-700 mb-1`}>{label}</p>
                  <ul className="space-y-0.5">
                    {(item.controls?.[key] || []).map((c, i) => (
                      <li key={i} className={`text-xs bg-${color}-50 text-${color}-800 rounded px-2 py-1`}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* AI Safeguards */}
          {item.ai_safeguards?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">AI Safeguards</p>
              <div className="flex flex-wrap gap-1">
                {item.ai_safeguards.map((s, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-800 border border-blue-100 rounded-full px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Audit Notes */}
          {item.audit_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{item.audit_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GRCWorkspace() {
  const [input, setInput] = useState(EXAMPLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [error, setError] = useState(null);
  const [rawJson, setRawJson] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setValidationError(null);
    setRawJson(null);
    try {
      // Step 0: Validate input first
      const validationRaw = await base44.integrations.Core.InvokeLLM({ prompt: VALIDATION_PROMPT(input) });
      const validationCleaned = (typeof validationRaw === 'string' ? validationRaw : JSON.stringify(validationRaw))
        .replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      const validation = JSON.parse(validationCleaned);
      if (!validation.valid) {
        setValidationError(validation.reason || 'Input does not describe a valid system.');
        setLoading(false);
        return;
      }

      const raw = await base44.integrations.Core.InvokeLLM({ prompt: GRC_PROMPT(input) });
      // Strip markdown code fences if present
      const cleaned = (typeof raw === 'string' ? raw : JSON.stringify(raw))
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();
      setRawJson(cleaned);
      const parsed = JSON.parse(cleaned);
      setResults(parsed);
    } catch (e) {
      setError('Failed to parse GRC output. Try again or check the raw output below.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="p-2.5 bg-slate-900 rounded-xl flex-shrink-0">
          <Shield className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Healthcare Risk Analyzer</h1>
          <p className="text-slate-500 text-sm mt-0.5">ISO 27005 · HIPAA · HITECH · NIST CSF 2.0 — Structured AI Risk Analysis</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {['Risk Analysis', 'Compliance Mapping', 'Control Design', 'Audit Check'].map((s, i) => (
              <span key={s} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                Step {i + 1}: {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">System Description</label>
          <button onClick={() => setInput(EXAMPLE_INPUT)} className="text-xs text-blue-600 hover:underline">Load example</button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={9}
          disabled={loading}
          placeholder="Describe your AI system, functions, environment, and concerns…"
          className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 disabled:opacity-60"
        />
        <div className="flex items-center gap-3 mt-3">
          <Button onClick={run} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Play className="h-4 w-4" />
            {loading ? 'Analyzing…' : 'Run GRC Analysis'}
          </Button>
          {(results || validationError) && (
            <Button variant="ghost" onClick={() => { setResults(null); setRawJson(null); setError(null); setValidationError(null); }} disabled={loading} className="gap-2 text-slate-500">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Input Validation Failed
          </p>
          <p className="mb-3">{validationError}</p>
          <p className="font-medium text-amber-700 mb-1">Please provide:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700 mb-3">
            <li>A description of the system or tool</li>
            <li>The environment (e.g. hospital, clinic, payer)</li>
            <li>AI functionality or use case (if applicable)</li>
          </ul>
          <p className="text-xs text-amber-600 italic">Example: "AI clinical charting assistant used in a hospital to convert conversations to medical notes"</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-700 text-sm">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Validating input, then running 4-step GRC analysis — Risk → Compliance → Controls → Audit…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
          <p className="font-semibold mb-1">Parse Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="font-semibold text-slate-800">{results.length} Risk{results.length !== 1 ? 's' : ''} Identified</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-slate-500 hover:text-slate-700 underline">
                {showRaw ? 'Hide' : 'Show'} raw JSON
              </button>
              <button onClick={handleCopy} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
          </div>

          {showRaw && (
            <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-xl overflow-auto max-h-72 font-mono border border-slate-700">
              {rawJson}
            </pre>
          )}

          <div className="space-y-3">
            {results.map((item, i) => <RiskCard key={i} item={item} index={i} />)}
          </div>
        </div>
      )}

      {/* Raw fallback when parse fails */}
      {error && rawJson && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Raw Output</p>
          <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-xl overflow-auto max-h-72 font-mono border border-slate-700">
            {rawJson}
          </pre>
        </div>
      )}
    </div>
  );
}