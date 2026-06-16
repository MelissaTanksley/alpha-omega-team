import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, ChevronDown, ChevronUp, Shield, Lock, Brain } from 'lucide-react';

const FRAMEWORKS = {
  privacy: {
    label: 'Healthcare Privacy & Security',
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
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

function FrameworkChecklist({ framework }) {
  const [checked, setChecked] = useState({});
  const [openSections, setOpenSections] = useState({});

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const allItems = framework.sections.flatMap(s => s.items);
  const checkedCount = allItems.filter((_, i) => checked[`${framework.name}-${i}`]).length;
  const pct = Math.round((checkedCount / allItems.length) * 100);

  let itemIndex = 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-base">{framework.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{checkedCount}/{allItems.length} complete</span>
          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-emerald-600">{pct}%</span>
        </div>
      </div>

      {framework.sections.map((section) => {
        const sectionKey = `${framework.name}-${section.title}`;
        const isOpen = openSections[sectionKey] !== false; // open by default
        const startIndex = itemIndex;
        itemIndex += section.items.length;

        return (
          <div key={section.title} className="mb-2 border border-slate-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(sectionKey)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <span className="text-sm font-medium text-slate-700">{section.title}</span>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>
            {isOpen && (
              <div className="px-4 py-2 space-y-1.5">
                {section.items.map((item, i) => {
                  const key = `${framework.name}-${startIndex + i}`;
                  return (
                    <label key={key} className="flex items-start gap-2.5 cursor-pointer group py-1">
                      <button onClick={() => toggle(key)} className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                        {checked[key]
                          ? <CheckSquare className="h-4 w-4 text-emerald-500" />
                          : <Square className="h-4 w-4" />}
                      </button>
                      <span className={`text-sm transition-colors ${checked[key] ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoryPanel({ categoryKey }) {
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
        <FrameworkChecklist key={framework.name} framework={framework} />
      ))}
    </div>
  );
}

export default function ComplianceChecklists() {
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    { key: 'privacy', label: 'Healthcare Privacy & Security', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-600' },
    { key: 'cyber', label: 'Cybersecurity & Risk Management', icon: Lock, color: 'text-violet-600', bg: 'bg-violet-600' },
    { key: 'ai', label: 'AI Governance & Safety', icon: Brain, color: 'text-emerald-600', bg: 'bg-emerald-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Compliance Checklists</h1>
        <p className="text-slate-500 text-sm">Interactive checklists aligned to major healthcare AI governance frameworks. Track progress per framework.</p>
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(isActive ? null : cat.key)}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all text-left ${
                isActive
                  ? `${cat.bg} text-white border-transparent shadow-md`
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      {activeCategory ? (
        <CategoryPanel key={activeCategory} categoryKey={activeCategory} />
      ) : (
        <div className="text-center py-20 text-slate-400">
          <Shield className="h-12 w-12 mx-auto mb-3 text-slate-200" />
          <p className="text-sm">Select a category above to open its checklist.</p>
        </div>
      )}
    </div>
  );
}