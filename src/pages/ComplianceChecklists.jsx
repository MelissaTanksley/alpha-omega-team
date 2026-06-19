import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Brain, CheckCircle } from 'lucide-react';
import FrameworkChecklist from '@/components/FrameworkChecklist';

const FRAMEWORKS = {
  privacy: {
    label: 'Healthcare Privacy & Security',
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    barColor: 'bg-blue-500',
    activeBg: 'bg-blue-600',
    ringColor: 'ring-blue-300',
    items: [
      {
        name: 'HIPAA',
        sections: [
          { title: 'Administrative Safeguards', items: ['Conduct annual risk analysis','Implement risk management plan','Designate Security Officer','Maintain workforce security procedures','Provide HIPAA security training','Establish incident response procedures','Review access rights regularly'] },
          { title: 'Physical Safeguards', items: ['Control facility access','Secure workstations and devices','Implement device/media disposal policies'] },
          { title: 'Technical Safeguards', items: ['Unique user identification','Multi-factor authentication','Audit logging enabled','Encryption at rest','Encryption in transit','Automatic logoff','Integrity controls implemented'] },
          { title: 'Business Associates', items: ['Business Associate Agreements signed','Third-party HIPAA risk assessments completed','Vendor monitoring process established'] },
        ]
      },
      {
        name: 'HITECH',
        sections: [
          { title: 'Breach Notification', items: ['Breach detection process established','Breach response team assigned','Notification procedures documented','Timelines comply with HITECH requirements'] },
          { title: 'Electronic Health Records', items: ['EHR access logs maintained','Patient access requests supported','Audit trails preserved'] },
          { title: 'Enforcement', items: ['Annual compliance review completed','Documentation retained','Corrective actions tracked'] },
        ]
      },
      {
        name: 'GDPR',
        sections: [
          { title: 'Data Protection & Governance', items: ['Data Protection Officer (DPO) designated','Records of processing activities maintained (Article 30)','Lawful basis for processing identified for all data activities','Data Protection Impact Assessments (DPIA) conducted for high-risk processing','Privacy by design and by default principles applied'] },
          { title: 'Security & Integrity', items: ['Technical measures implemented to ensure data security','Encryption applied to personal data at rest and in transit','Access controls restrict personal data to authorized personnel','Pseudonymization used where applicable','Data breach detection and response procedures established'] },
          { title: 'Accuracy & Accountability', items: ['Processes in place to keep personal data accurate and up to date','Data minimization principle applied — only necessary data collected','Retention schedules defined and enforced','Data processing activities documented and auditable','Staff training on GDPR obligations completed'] },
          { title: 'User Rights', items: ['Right of access requests handled within 30 days','Right to rectification process established','Right to erasure (right to be forgotten) process implemented','Right to data portability supported','Right to object to automated decision-making addressed'] },
          { title: 'Monitoring & Review', items: ['GDPR compliance reviewed annually','Third-party processors assessed for GDPR compliance','Data transfer mechanisms in place for cross-border transfers','Supervisory authority contact information documented','Incident reporting process meets 72-hour notification requirement'] },
        ]
      }
    ]
  },
  cyber: {
    label: 'Cybersecurity & Risk Management',
    icon: Lock,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    barColor: 'bg-violet-500',
    activeBg: 'bg-violet-600',
    ringColor: 'ring-violet-300',
    items: [
      {
        name: 'NIST CSF 2.0',
        sections: [
          { title: 'GOVERN', items: ['Cybersecurity governance established','Roles and responsibilities defined','Risk appetite documented','Third-party risks managed'] },
          { title: 'IDENTIFY', items: ['Asset inventory maintained','Data classification established','Critical services identified','Risk assessments performed'] },
          { title: 'PROTECT', items: ['IAM policies enforced','MFA enabled','Encryption implemented','Security awareness training conducted'] },
          { title: 'DETECT', items: ['Continuous monitoring enabled','Log management centralized','Threat detection configured'] },
          { title: 'RESPOND', items: ['Incident response plan approved','Communication procedures defined','Incident exercises conducted'] },
          { title: 'RECOVER', items: ['Backup procedures tested','Disaster recovery plan maintained','Recovery objectives documented'] },
        ]
      },
      {
        name: 'ISO/IEC 27005:2022',
        sections: [
          { title: 'Risk Context', items: ['Scope defined','Stakeholders identified','Risk criteria established'] },
          { title: 'Risk Identification', items: ['Assets cataloged','Threats identified','Vulnerabilities documented','Existing controls reviewed'] },
          { title: 'Risk Analysis', items: ['Likelihood assessed','Impact assessed','Risk levels calculated'] },
          { title: 'Risk Evaluation', items: ['Risks prioritized','Acceptance criteria applied'] },
          { title: 'Risk Treatment', items: ['Mitigation plans documented','Risk owners assigned','Residual risk evaluated'] },
          { title: 'Monitoring', items: ['Risks reviewed periodically','KPIs/KRIs monitored','Lessons learned incorporated'] },
        ]
      },
      {
        name: 'ISO/IEC 27001',
        sections: [
          { title: 'Information Security Management System (ISMS)', items: ['ISMS scope defined','Information security policy approved','Leadership commitment documented','Internal audits conducted','Management reviews performed'] },
          { title: 'Annex A Controls', items: ['Access controls implemented','Cryptography policies defined','Supplier security managed','Secure development lifecycle adopted','Logging and monitoring enabled'] },
        ]
      },
      {
        name: 'NIST RMF',
        sections: [
          { title: 'Categorize', items: ['Identify system assets, data types, and operational environment','Determine impact level of AI system (low, moderate, or high) per FIPS 199','Document system description and mission/business functions','Classify ePHI and sensitive data processed by the system','Register system in organizational inventory'] },
          { title: 'Select', items: ['Select appropriate security and privacy controls based on impact level','Tailor controls from NIST SP 800-53 to system context','Align controls with organizational policies and regulatory requirements','Document control selection rationale in System Security Plan (SSP)','Identify and document common controls inherited from the organization'] },
          { title: 'Implement', items: ['Deploy technical controls (encryption, access controls, audit logging)','Implement administrative controls (policies, procedures, training)','Integrate controls into AI system workflows and CI/CD pipelines','Document how each control is implemented in the SSP','Ensure human-in-the-loop validation is in place for AI outputs'] },
          { title: 'Assess', items: ['Evaluate effectiveness of implemented controls against objectives','Conduct penetration testing and vulnerability assessments','Validate AI system outputs and model behavior under stress','Document assessment findings and identify control deficiencies','Prepare Security Assessment Report (SAR)'] },
          { title: 'Authorize', items: ['Review residual risk and determine if system operation is acceptable','Prepare Plan of Action & Milestones (POA&M) for identified gaps','Senior official reviews SSP, SAR, and POA&M','Authorization to Operate (ATO) issued or denied','Formal approval decision documented with rationale'] },
          { title: 'Monitor', items: ['Continuously monitor system performance and risk posture','Detect anomalies, model drift, and emerging threats','Track and remediate POA&M items on schedule','Report security status to authorizing official regularly','Update SSP and controls when significant system changes occur','Conduct periodic reassessments to validate control effectiveness'] },
        ]
      }
    ]
  },
  ai: {
    label: 'AI Governance & Safety',
    icon: Brain,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    barColor: 'bg-emerald-500',
    activeBg: 'bg-emerald-600',
    ringColor: 'ring-emerald-300',
    items: [
      {
        name: 'NIST AI RMF',
        sections: [
          { title: 'GOVERN', items: ['AI governance framework established','AI accountability assigned','AI policies approved'] },
          { title: 'MAP', items: ['AI use cases documented','Stakeholders identified','Intended use defined','Potential harms assessed'] },
          { title: 'MEASURE', items: ['Bias testing performed','Robustness evaluated','Privacy risks assessed','Security testing completed','Explainability evaluated'] },
          { title: 'MANAGE', items: ['Risks prioritized','Mitigations implemented','Human oversight established','Monitoring processes defined'] },
        ]
      },
      {
        name: 'ISO/IEC 42001',
        sections: [
          { title: 'Governance', items: ['AI policy established','Roles and responsibilities defined','AI inventory maintained'] },
          { title: 'Risk Management', items: ['AI risk assessments performed','Bias risks identified','Safety risks assessed','Security risks evaluated'] },
          { title: 'Lifecycle Management', items: ['Data quality controls implemented','Model validation completed','Change management documented','Continuous monitoring enabled'] },
        ]
      },
      {
        name: 'FDA AI/ML SaMD',
        sections: [
          { title: 'Clinical Safety', items: ['Intended use documented','Clinical risks identified','Failure modes analyzed','Human factors evaluated'] },
          { title: 'Validation', items: ['Analytical validation completed','Clinical validation completed','Performance metrics documented'] },
          { title: 'Post-Market Monitoring', items: ['Real-world performance monitored','Adverse event reporting established','Model updates controlled'] },
        ]
      },
      {
        name: 'EU AI Act',
        sections: [
          { title: 'Risk Classification', items: ['AI system risk category identified','High-risk determination documented'] },
          { title: 'Data Governance', items: ['Training data quality assessed','Bias mitigation implemented'] },
          { title: 'Transparency', items: ['AI use disclosed to users','Human oversight documented'] },
          { title: 'Monitoring', items: ['Performance monitored continuously','Incident reporting process established'] },
        ]
      }
    ]
  }
};

// compute all item keys for a category
function getCategoryKeys(catKey) {
  return FRAMEWORKS[catKey].items.flatMap(fw =>
    fw.sections.flatMap((sec, si) => {
      let base = fw.sections.slice(0, si).reduce((a, s) => a + s.items.length, 0);
      return sec.items.map((_, i) => `${fw.name}-${base + i}`);
    })
  );
}

function getCategoryStats(catKey, checked) {
  const keys = getCategoryKeys(catKey);
  const done = keys.filter(k => checked[k]).length;
  return { done, total: keys.length, pct: keys.length ? Math.round((done / keys.length) * 100) : 0 };
}



function CategoryPanel({ categoryKey, checked, onToggle, notes, onNoteChange }) {
  const cat = FRAMEWORKS[categoryKey];
  const Icon = cat.icon;
  return (
    <div className={`rounded-2xl border ${cat.border} p-6`}>
      <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${cat.border}`}>
        <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${cat.color}`} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg">{cat.label}</h2>
          <div className="flex gap-2 mt-1 flex-wrap">
            {cat.items.map(f => (
              <Badge key={f.name} className={`${cat.badge} text-xs px-2 py-0.5`}>{f.name}</Badge>
            ))}
          </div>
        </div>
      </div>
      {cat.items.map(framework => (
        <FrameworkChecklist key={framework.name} framework={framework} checked={checked} onToggle={onToggle} notes={notes} onNoteChange={onNoteChange} />
      ))}
    </div>
  );
}

export default function ComplianceChecklists() {
  useEffect(() => { document.title = 'Compliance Checklists | AI Risk Navigator'; }, []);
  const [activeCategory, setActiveCategory] = useState(null);
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const handleNoteChange = (key, value) => setNotes(prev => ({ ...prev, [key]: value }));

  const stats = useMemo(() => ({
    privacy: getCategoryStats('privacy', checked),
    cyber: getCategoryStats('cyber', checked),
    ai: getCategoryStats('ai', checked),
  }), [checked]);

  const overallDone = stats.privacy.done + stats.cyber.done + stats.ai.done;
  const overallTotal = stats.privacy.total + stats.cyber.total + stats.ai.total;
  const overallPct = overallTotal ? Math.round((overallDone / overallTotal) * 100) : 0;

  const categories = [
    { key: 'privacy', label: 'Healthcare Privacy & Security', icon: Shield, color: 'text-blue-600', activeBg: 'bg-blue-600', barColor: 'bg-blue-500', border: 'border-blue-200' },
    { key: 'cyber', label: 'Cybersecurity & Risk Management', icon: Lock, color: 'text-violet-600', activeBg: 'bg-violet-600', barColor: 'bg-violet-500', border: 'border-violet-200' },
    { key: 'ai', label: 'AI Governance & Safety', icon: Brain, color: 'text-emerald-600', activeBg: 'bg-emerald-600', barColor: 'bg-emerald-500', border: 'border-emerald-200' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Compliance Checklists</h1>
        <p className="text-slate-500 text-sm">Interactive checklists aligned to major healthcare AI governance frameworks.</p>
      </div>

      {/* Overall progress bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Completion</span>
          <span className="text-sm font-bold text-slate-900">{overallDone} / {overallTotal} items &nbsp;·&nbsp; {overallPct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        {overallPct === 100 && (
          <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> All frameworks complete!
          </div>
        )}
      </div>

      {/* Category selector cards with progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const s = stats[cat.key];
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(isActive ? null : cat.key)}
              className={`flex flex-col gap-3 px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all text-left ${
                isActive
                  ? `${cat.activeBg} text-white border-transparent shadow-md`
                  : `bg-white ${cat.border} text-slate-700 hover:shadow-sm`
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : cat.color}`} />
                <span className="leading-tight">{cat.label}</span>
              </div>
              <div className="w-full">
                <div className={`h-1.5 rounded-full overflow-hidden ${isActive ? 'bg-white/30' : 'bg-slate-100'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isActive ? 'bg-white' : cat.barColor}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <div className={`flex justify-between text-xs mt-1.5 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                  <span>{s.done}/{s.total} items</span>
                  <span className={`font-semibold ${isActive ? 'text-white' : cat.color}`}>{s.pct}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Checklist panel */}
      {activeCategory ? (
        <CategoryPanel key={activeCategory} categoryKey={activeCategory} checked={checked} onToggle={toggle} notes={notes} onNoteChange={handleNoteChange} />
      ) : (
        <div className="text-center py-20 text-slate-400">
          <Shield className="h-12 w-12 mx-auto mb-3 text-slate-200" />
          <p className="text-sm">Select a category above to open its checklist.</p>
        </div>
      )}
    </div>
  );
}