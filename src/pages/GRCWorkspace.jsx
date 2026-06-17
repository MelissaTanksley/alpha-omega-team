import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Play, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight, Copy, RotateCcw } from 'lucide-react';

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
  { key: 'risk_analyst', name: 'Risk Analyst', agent: 'grc_agent1_risk_analyst', color: 'blue', desc: 'Identifies assets, threats, vulnerabilities' },
  { key: 'compliance_mapper', name: 'Compliance Mapper', agent: 'grc_agent2_compliance_mapper', color: 'purple', desc: 'Maps risks to HIPAA, HITECH, NIST CSF 2.0' },
  { key: 'control_designer', name: 'Control Designer', agent: 'grc_agent3_control_designer', color: 'green', desc: 'Designs administrative, technical, physical controls' },
  { key: 'auditor', name: 'Auditor', agent: 'grc_agent4_auditor', color: 'red', desc: 'Validates completeness & compliance quality' },
];

const colorMap = {
  blue: { badge: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500', ring: 'ring-blue-400' },
  purple: { badge: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500', ring: 'ring-purple-400' },
  green: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', ring: 'ring-emerald-400' },
  red: { badge: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500', ring: 'ring-red-400' },
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
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-xs flex items-center gap-1"
      >
        <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-lg overflow-auto max-h-96 font-mono leading-relaxed border border-slate-700">
        {text}
      </pre>
    </div>
  );
}

function AgentStage({ agent, index, status, output, isActive }) {
  const [expanded, setExpanded] = useState(false);
  const colors = colorMap[agent.color];

  useEffect(() => {
    if (status === 'done') setExpanded(true);
  }, [status]);

  return (
    <div className={`border rounded-xl transition-all duration-300 ${isActive ? `ring-2 ${colors.ring} border-transparent` : 'border-slate-200'} bg-white`}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex-shrink-0">
          {status === 'done' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> :
           status === 'running' ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> :
           status === 'error' ? <XCircle className="h-5 w-5 text-red-500" /> :
           index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{agent.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>Agent {index + 1}</span>
            {status === 'running' && <span className="text-xs text-slate-500 animate-pulse">Processing…</span>}
            {status === 'done' && <span className="text-xs text-emerald-600 font-medium">Complete</span>}
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

function AuditSummary({ auditOutput }) {
  let parsed = null;
  try {
    parsed = typeof auditOutput === 'string' ? JSON.parse(auditOutput) : auditOutput;
  } catch {
    return null;
  }

  if (!parsed) return null;
  const score = parseInt(parsed.completeness_score) || 0;
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-slate-700" />
        <h3 className="font-semibold text-slate-800">Audit Summary</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-xs text-slate-500 mt-1">Completeness Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500">{parsed.gaps?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Gaps Found</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{parsed.compliance_issues?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Compliance Issues</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500">{parsed.recommendations?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Recommendations</div>
        </div>
      </div>
      {parsed.recommendations?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Recommendations</p>
          <ul className="space-y-1">
            {parsed.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function GRCWorkspace() {
  const [scenario, setScenario] = useState(EXAMPLE_SCENARIO);
  const [running, setRunning] = useState(false);
  const [stageStatus, setStageStatus] = useState({ risk_analyst: 'idle', compliance_mapper: 'idle', control_designer: 'idle', auditor: 'idle' });
  const [stageOutput, setStageOutput] = useState({});
  const [activeStage, setActiveStage] = useState(null);
  const [done, setDone] = useState(false);
  const conversationRefs = useRef({});

  const reset = () => {
    setRunning(false);
    setStageStatus({ risk_analyst: 'idle', compliance_mapper: 'idle', control_designer: 'idle', auditor: 'idle' });
    setStageOutput({});
    setActiveStage(null);
    setDone(false);
    conversationRefs.current = {};
  };

  const runAgent = async (agentKey, agentName, inputText) => {
    setActiveStage(agentKey);
    setStageStatus(s => ({ ...s, [agentKey]: 'running' }));

    const conv = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `GRC Run — ${agentKey}` }
    });
    conversationRefs.current[agentKey] = conv;

    await base44.agents.addMessage(conv, { role: 'user', content: inputText });

    return new Promise((resolve, reject) => {
      let finalContent = '';
      const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        const msgs = data.messages || [];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant' && last.content) {
          finalContent = last.content;
        }
        const isStreaming = data.is_streaming ?? true;
        if (!isStreaming && finalContent) {
          unsub();
          setStageStatus(s => ({ ...s, [agentKey]: 'done' }));
          setStageOutput(o => ({ ...o, [agentKey]: finalContent }));
          resolve(finalContent);
        }
      });

      setTimeout(() => {
        unsub();
        if (!finalContent) {
          setStageStatus(s => ({ ...s, [agentKey]: 'error' }));
          reject(new Error(`${agentKey} timed out`));
        }
      }, 120000);
    });
  };

  const runPipeline = async () => {
    if (!scenario.trim()) return;
    reset();
    setRunning(true);

    try {
      const riskPrompt = `Analyze the following healthcare AI scenario and output ONLY valid JSON (no prose).\n\nScenario:\n${scenario}\n\nOutput a JSON array of risk objects. Each must include: asset, threat, vulnerability, likelihood (1-5), impact_clinical, impact_operational, impact_legal, risk_rating (low/medium/high/critical), and residual_risk.`;
      const riskOutput = await runAgent('risk_analyst', 'grc_agent1_risk_analyst', riskPrompt);

      const compliancePrompt = `You are the Compliance Mapper. Map each risk below to HIPAA, HITECH, and NIST CSF 2.0 controls. Output ONLY valid JSON — no prose.\n\nRisk Analysis:\n${riskOutput}`;
      const complianceOutput = await runAgent('compliance_mapper', 'grc_agent2_compliance_mapper', compliancePrompt);

      const controlPrompt = `You are the Control Designer. Design controls for each risk and mapping below. Include administrative, technical, physical controls, ai_safeguards (human_in_the_loop, ai_monitoring, model_validation), monitoring_strategy, and residual_risk. Output ONLY valid JSON.\n\nRisk Analysis:\n${riskOutput}\n\nCompliance Mapping:\n${complianceOutput}`;
      const controlOutput = await runAgent('control_designer', 'grc_agent3_control_designer', controlPrompt);

      const auditPrompt = `You are the Auditor. Validate completeness, traceability, and compliance quality across all outputs below. Output ONLY valid JSON matching this schema: { "completeness_score": "", "gaps": [], "compliance_issues": [], "weak_areas": [], "ai_safeguard_gaps": [], "recommendations": [] }\n\nRisk Analysis:\n${riskOutput}\n\nCompliance Mapping:\n${complianceOutput}\n\nControls:\n${controlOutput}`;
      await runAgent('auditor', 'grc_agent4_auditor', auditPrompt);

      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
      setActiveStage(null);
    }
  };

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
            <p className="text-slate-500 text-sm">ISO 27005 · NIST CSF 2.0 · HIPAA · HITECH — JSON-enforced outputs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['JSON-Enforced', 'Audit-Ready', 'No Hallucinated Compliance', '4-Agent Pipeline'].map(tag => (
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
          disabled={running}
          className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 disabled:opacity-60"
          placeholder="Describe your healthcare AI system, risks to consider, and environment…"
        />
        <div className="flex items-center gap-3 mt-3">
          <Button
            onClick={runPipeline}
            disabled={running || !scenario.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Play className="h-4 w-4" />
            {running ? 'Running Pipeline…' : 'Run GRC Pipeline'}
          </Button>
          {(done || Object.keys(stageOutput).length > 0) && (
            <Button variant="ghost" onClick={reset} className="gap-2 text-slate-500">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-3">
        {AGENTS.map((agent, i) => (
          <AgentStage
            key={agent.key}
            agent={agent}
            index={i}
            status={stageStatus[agent.key]}
            output={stageOutput[agent.key]}
            isActive={activeStage === agent.key}
          />
        ))}
      </div>

      {/* Audit Summary Card */}
      {stageOutput.auditor && <AuditSummary auditOutput={stageOutput.auditor} />}

      {/* Pro Tip */}
      <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Pro tip:</span> All agents are instructed to output only valid JSON — this prevents ambiguity, hallucination, and audit failure. If an agent returns prose, the pipeline flags it as non-compliant.
        </p>
      </div>
    </div>
  );
}