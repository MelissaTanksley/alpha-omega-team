import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Shield, Play, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight, Copy, RotateCcw, RefreshCw } from 'lucide-react';

const EXAMPLE_SCENARIO = `System:
AI medical scribe integrated with EHR.

Risks to consider:
- Hallucinated diagnoses
- ePHI leakage
- Unauthorized access
- Model drift

Environment:
Hospital, HIPAA-regulated, low risk tolerance`;

const AGENTS = [
  { key: 'risk_analyst',      name: 'Risk Analyst',      agent: 'grc_agent1_risk_analyst',      color: 'blue',   desc: 'Identifies assets, threats & adversarial vectors' },
  { key: 'compliance_mapper', name: 'Compliance Mapper',  agent: 'grc_agent2_compliance_mapper', color: 'purple', desc: 'Maps risks to HIPAA, HITECH, NIST CSF 2.0' },
  { key: 'control_designer',  name: 'Control Designer',   agent: 'grc_agent3_control_designer',  color: 'green',  desc: 'Designs administrative, technical & physical controls' },
  { key: 'auditor',           name: 'Auditor',            agent: 'grc_agent4_auditor',           color: 'red',    desc: 'Validates completeness & compliance quality' },
];

const colorMap = {
  blue:   { badge: 'bg-blue-100 text-blue-800 border-blue-200',     dot: 'bg-blue-500',    ring: 'ring-blue-400'   },
  purple: { badge: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500', ring: 'ring-purple-400' },
  green:  { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', ring: 'ring-emerald-400' },
  red:    { badge: 'bg-red-100 text-red-800 border-red-200',         dot: 'bg-red-500',     ring: 'ring-red-400'    },
  amber:  { badge: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500',   ring: 'ring-amber-400'  },
};

function JSONBlock({ data }) {
  const [copied, setCopied] = useState(false);
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <button onClick={handleCopy} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-lg overflow-auto max-h-72 font-mono leading-relaxed border border-slate-700">
        {text}
      </pre>
    </div>
  );
}

function AgentStage({ agent, index, status, output, isActive, iterationLabel }) {
  const [expanded, setExpanded] = useState(false);
  const colors = colorMap[agent.color];

  useEffect(() => { if (status === 'done') setExpanded(true); }, [status]);

  return (
    <div className={`border rounded-xl transition-all duration-300 ${isActive ? `ring-2 ${colors.ring} border-transparent` : 'border-slate-200'} bg-white`}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex-shrink-0">
          {status === 'done'    ? <CheckCircle className="h-5 w-5 text-emerald-500" /> :
           status === 'running' ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> :
           status === 'error'   ? <XCircle className="h-5 w-5 text-red-500" /> :
           index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{agent.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>Agent {index + 1}</span>
            {iterationLabel && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-medium">{iterationLabel}</span>}
            {status === 'running' && <span className="text-xs text-slate-500 animate-pulse">Processing…</span>}
            {status === 'done'    && <span className="text-xs text-emerald-600 font-medium">Complete</span>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{agent.desc}</p>
        </div>
        {output && (
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>
      {expanded && output && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <JSONBlock data={output} />
        </div>
      )}
    </div>
  );
}

function parseAudit(raw) {
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
}

function AuditSummary({ auditOutput, iteration, onRunRevision, revisionRunning, revisionDone }) {
  const parsed = parseAudit(auditOutput);
  if (!parsed) return null;

  const score = parseInt(parsed.completeness_score) || 0;
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const hasGaps = (parsed.gaps?.length || 0) + (parsed.compliance_issues?.length || 0) + (parsed.ai_safeguard_gaps?.length || 0) > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-700" />
          <h3 className="font-semibold text-slate-800">
            Audit Summary {iteration > 1 ? <span className="text-slate-400 text-sm font-normal">— Iteration {iteration}</span> : ''}
          </h3>
        </div>
        {hasGaps && !revisionDone && (
          <Button
            size="sm"
            onClick={onRunRevision}
            disabled={revisionRunning}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${revisionRunning ? 'animate-spin' : ''}`} />
            {revisionRunning ? 'Revising Controls…' : 'Revise Controls (Self-Improve)'}
          </Button>
        )}
        {revisionDone && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> Revision cycle complete
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-xs text-slate-500 mt-1">Completeness Score</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-500">{parsed.gaps?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Gaps</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-3xl font-bold text-red-500">{parsed.compliance_issues?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Compliance Issues</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-500">{parsed.ai_safeguard_gaps?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">AI Safeguard Gaps</div>
        </div>
      </div>

      {parsed.gaps?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">Gaps Identified</p>
          <ul className="space-y-1">
            {parsed.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-orange-50 rounded px-3 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" /> {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.ai_safeguard_gaps?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">AI Safeguard Gaps</p>
          <ul className="space-y-1">
            {parsed.ai_safeguard_gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-red-50 rounded px-3 py-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" /> {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.recommendations?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Recommendations</p>
          <ul className="space-y-1">
            {parsed.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Revision cycle stages ---
const REVISION_STAGES = [
  { key: 'control_revision', name: 'Control Designer',  agent: 'grc_agent3_control_designer', color: 'amber', desc: 'Revising controls to address auditor gaps' },
  { key: 're_audit',         name: 'Auditor (Re-audit)', agent: 'grc_agent4_auditor',          color: 'red',   desc: 'Re-validating revised controls' },
];

export default function GRCWorkspace() {
  const [scenario, setScenario]     = useState(EXAMPLE_SCENARIO);
  const [running, setRunning]       = useState(false);
  const [stageStatus, setStageStatus] = useState({ risk_analyst: 'idle', compliance_mapper: 'idle', control_designer: 'idle', auditor: 'idle' });
  const [stageOutput, setStageOutput] = useState({});
  const [activeStage, setActiveStage] = useState(null);
  const [done, setDone]             = useState(false);

  // Revision loop state
  const [revisionRunning, setRevisionRunning] = useState(false);
  const [revisionStatus, setRevisionStatus]   = useState({ control_revision: 'idle', re_audit: 'idle' });
  const [revisionOutput, setRevisionOutput]   = useState({});
  const [revisionDone, setRevisionDone]       = useState(false);

  const reset = () => {
    setRunning(false);
    setStageStatus({ risk_analyst: 'idle', compliance_mapper: 'idle', control_designer: 'idle', auditor: 'idle' });
    setStageOutput({});
    setActiveStage(null);
    setDone(false);
    setRevisionRunning(false);
    setRevisionStatus({ control_revision: 'idle', re_audit: 'idle' });
    setRevisionOutput({});
    setRevisionDone(false);
  };

  const callAgent = async (agentKey, agentName, prompt, setStatus, setOutput, setActive) => {
    if (setActive) setActive(agentKey);
    setStatus(s => ({ ...s, [agentKey]: 'running' }));

    const conv = await base44.agents.createConversation({ agent_name: agentName, metadata: { name: `GRC — ${agentKey}` } });
    await base44.agents.addMessage(conv, { role: 'user', content: prompt });

    return new Promise((resolve, reject) => {
      let finalContent = '';
      const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        const last = (data.messages || []).slice(-1)[0];
        if (last?.role === 'assistant' && last.content) finalContent = last.content;
        if (!(data.is_streaming ?? true) && finalContent) {
          unsub();
          setStatus(s => ({ ...s, [agentKey]: 'done' }));
          setOutput(o => ({ ...o, [agentKey]: finalContent }));
          resolve(finalContent);
        }
      });
      setTimeout(() => { unsub(); if (!finalContent) { setStatus(s => ({ ...s, [agentKey]: 'error' })); reject(new Error(`${agentKey} timed out`)); } }, 120000);
    });
  };

  const runPipeline = async () => {
    reset();
    setRunning(true);
    try {
      const riskOut = await callAgent('risk_analyst', 'grc_agent1_risk_analyst',
        `Analyze this healthcare AI scenario and output ONLY valid JSON (no prose).\n\nScenario:\n${scenario}\n\nOutput a JSON array of risk objects. Each must include: asset, threat, vulnerability, adversarial_vector (prompt_injection/data_poisoning/model_misuse/none), likelihood (1-5), impact_clinical, impact_operational, impact_legal, risk_rating (low/medium/high/critical), residual_risk.`,
        setStageStatus, setStageOutput, setActiveStage);

      const compOut = await callAgent('compliance_mapper', 'grc_agent2_compliance_mapper',
        `Map each risk to HIPAA, HITECH, and NIST CSF 2.0 controls. Output ONLY valid JSON — no prose.\n\nRisk Analysis:\n${riskOut}`,
        setStageStatus, setStageOutput, setActiveStage);

      const ctrlOut = await callAgent('control_designer', 'grc_agent3_control_designer',
        `Design controls for each risk. Include administrative, technical, physical controls, ai_safeguards (human_in_the_loop, ai_monitoring, model_validation), monitoring_strategy, and residual_risk. Output ONLY valid JSON.\n\nRisk Analysis:\n${riskOut}\n\nCompliance Mapping:\n${compOut}`,
        setStageStatus, setStageOutput, setActiveStage);

      await callAgent('auditor', 'grc_agent4_auditor',
        `Validate completeness, traceability, and compliance quality. Output ONLY this JSON schema: { "completeness_score": "", "gaps": [], "compliance_issues": [], "weak_areas": [], "ai_safeguard_gaps": [], "recommendations": [] }\n\nRisk Analysis:\n${riskOut}\n\nCompliance Mapping:\n${compOut}\n\nControls:\n${ctrlOut}`,
        setStageStatus, setStageOutput, setActiveStage);

      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
      setActiveStage(null);
    }
  };

  const runRevision = async () => {
    const auditRaw   = stageOutput.auditor;
    const riskOut    = stageOutput.risk_analyst;
    const compOut    = stageOutput.compliance_mapper;
    const ctrlOut    = stageOutput.control_designer;
    if (!auditRaw) return;

    setRevisionRunning(true);
    setRevisionDone(false);
    setRevisionStatus({ control_revision: 'idle', re_audit: 'idle' });
    setRevisionOutput({});

    try {
      // Step 1: Control Designer revises based on auditor feedback
      const revisedCtrl = await callAgent(
        'control_revision',
        'grc_agent3_control_designer',
        `You are revising controls based on Auditor feedback. Address EVERY gap, compliance issue, weak area, and AI safeguard gap listed below. Output ONLY valid JSON — no prose.\n\nOriginal Controls:\n${ctrlOut}\n\nAuditor Feedback:\n${auditRaw}\n\nRisk Analysis (for context):\n${riskOut}\n\nCompliance Mapping (for context):\n${compOut}`,
        setRevisionStatus, setRevisionOutput, setActiveStage
      );

      // Step 2: Auditor re-validates the revised controls
      await callAgent(
        're_audit',
        'grc_agent4_auditor',
        `Re-validate the REVISED controls below against the original risks and compliance mappings. Output ONLY this JSON schema: { "completeness_score": "", "gaps": [], "compliance_issues": [], "weak_areas": [], "ai_safeguard_gaps": [], "recommendations": [] }\n\nRisk Analysis:\n${riskOut}\n\nCompliance Mapping:\n${compOut}\n\nRevised Controls:\n${revisedCtrl}`,
        setRevisionStatus, setRevisionOutput, setActiveStage
      );

      setRevisionDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setRevisionRunning(false);
      setActiveStage(null);
    }
  };

  const finalAudit     = revisionOutput.re_audit || stageOutput.auditor;
  const auditIteration = revisionDone ? 2 : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">GRC Multi-Agent Workspace</h1>
            <p className="text-slate-500 text-sm">ISO 27005 · NIST CSF 2.0 · HIPAA · HITECH — Self-Improving Compliance Loop</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['JSON-Enforced', 'Audit-Ready', 'Adversarial Threat Model', 'Self-Improving Loop', '4-Agent Pipeline'].map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {/* Scenario Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">Scenario Input</label>
          <button onClick={() => setScenario(EXAMPLE_SCENARIO)} className="text-xs text-blue-600 hover:underline">Load example</button>
        </div>
        <textarea
          value={scenario}
          onChange={e => setScenario(e.target.value)}
          rows={8}
          disabled={running || revisionRunning}
          className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 disabled:opacity-60"
          placeholder="Describe your healthcare AI system, risks to consider, and environment…"
        />
        <div className="flex items-center gap-3 mt-3">
          <Button onClick={runPipeline} disabled={running || revisionRunning || !scenario.trim()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Play className="h-4 w-4" />
            {running ? 'Running Pipeline…' : 'Run GRC Pipeline'}
          </Button>
          {(done || Object.keys(stageOutput).length > 0) && (
            <Button variant="ghost" onClick={reset} disabled={running || revisionRunning} className="gap-2 text-slate-500">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Initial Pipeline Stages */}
      {Object.keys(stageOutput).length > 0 || running ? (
        <div className="space-y-3 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Initial Pipeline</p>
          {AGENTS.map((agent, i) => (
            <AgentStage key={agent.key} agent={agent} index={i}
              status={stageStatus[agent.key]} output={stageOutput[agent.key]}
              isActive={activeStage === agent.key} />
          ))}
        </div>
      ) : null}

      {/* Audit Summary + Revision Button */}
      {stageOutput.auditor && (
        <AuditSummary
          auditOutput={revisionOutput.re_audit || stageOutput.auditor}
          iteration={auditIteration}
          onRunRevision={runRevision}
          revisionRunning={revisionRunning}
          revisionDone={revisionDone}
        />
      )}

      {/* Revision Loop Stages */}
      {(revisionRunning || Object.keys(revisionOutput).length > 0) && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-2 px-1">
            <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Self-Improving Revision Loop</p>
          </div>
          {REVISION_STAGES.map((agent, i) => (
            <AgentStage key={agent.key} agent={agent} index={i}
              status={revisionStatus[agent.key]} output={revisionOutput[agent.key]}
              isActive={activeStage === agent.key}
              iterationLabel="Iteration 2" />
          ))}
        </div>
      )}

      {/* Pro Tip */}
      <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Self-improving loop:</span> After the Auditor flags gaps, click "Revise Controls" to feed that feedback back into the Control Designer — then re-audit. This closes compliance gaps without human intervention and prevents hallucinated compliance across iterations.
        </p>
      </div>
    </div>
  );
}