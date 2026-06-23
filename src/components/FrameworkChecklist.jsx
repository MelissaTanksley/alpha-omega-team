import React, { useState } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronUp, MessageSquare, MessageSquarePlus, Link2 } from 'lucide-react';
import { TRACEABILITY } from '@/utils/checklistTraceability';

export default function FrameworkChecklist({ framework, checked, onToggle, notes, onNoteChange }) {
  const [openSections, setOpenSections] = useState({});
  const [openNotes, setOpenNotes] = useState({});
  const [openTrace, setOpenTrace] = useState({});

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleNote    = (key) => setOpenNotes(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleTrace   = (key) => setOpenTrace(prev => ({ ...prev, [key]: !prev[key] }));

  let itemIndex = 0;
  const allKeys = framework.sections.flatMap((sec, si) => {
    const base = framework.sections.slice(0, si).reduce((a, s) => a + s.items.length, 0);
    return sec.items.map((_, i) => `${framework.name}-${base + i}`);
  });
  const checkedCount = allKeys.filter(k => checked[k]).length;
  const pct = Math.round((checkedCount / allKeys.length) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 text-base">{framework.name}</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">{checkedCount}/{allKeys.length}</span>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-emerald-600 w-8 text-right">{pct}%</span>
        </div>
      </div>

      {framework.sections.map((section) => {
        const sectionKey = `${framework.name}-${section.title}`;
        const isOpen = openSections[sectionKey] !== false;
        const startIndex = itemIndex;
        itemIndex += section.items.length;

        return (
          <div key={section.title} className="mb-2 border border-slate-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(sectionKey)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <span className="text-sm font-medium text-slate-800">{section.title}</span>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {isOpen && (
              <div className="px-4 py-2 space-y-1">
                {section.items.map((item, i) => {
                  const key = `${framework.name}-${startIndex + i}`;
                  const trace = TRACEABILITY[key];
                  const hasNote = notes[key] && notes[key].trim().length > 0;
                  const noteOpen = openNotes[key];
                  const traceOpen = openTrace[key];

                  return (
                    <div key={key} className={`py-1.5 rounded-md transition-colors ${checked[key] ? 'opacity-60' : ''}`}>
                      <div className="flex items-start gap-2.5 group">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggle(key)}
                          className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {checked[key]
                            ? <CheckSquare className="h-4 w-4 text-emerald-500" />
                            : <Square className="h-4 w-4" />}
                        </button>

                        {/* Item text */}
                        <span className={`text-sm flex-1 leading-snug transition-colors ${checked[key] ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-slate-950'}`}>
                          {item}
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {trace && (
                            <button
                              onClick={() => toggleTrace(key)}
                              title="Show traceability"
                              className={`transition-colors ${traceOpen ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleNote(key)}
                            title={noteOpen ? 'Hide note' : (hasNote ? 'View/edit note' : 'Add note')}
                            className={`transition-colors ${hasNote ? 'text-amber-500 hover:text-amber-600 opacity-100' : 'text-slate-300 hover:text-slate-500'}`}
                          >
                            {hasNote ? <MessageSquare className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        {/* Always show note icon if has note */}
                        {hasNote && !openTrace[key] && (
                          <button
                            onClick={() => toggleNote(key)}
                            className="flex-shrink-0 text-amber-500 hover:text-amber-600 group-hover:hidden"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Traceability panel */}
                      {traceOpen && trace && (
                        <div className="mt-1.5 ml-7 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2.5 py-0.5">
                            <span className="font-semibold">Risk:</span> {trace.risk}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs bg-violet-50 border border-violet-200 text-violet-700 rounded-full px-2.5 py-0.5">
                            <span className="font-semibold">Framework:</span> {trace.framework}
                          </span>
                        </div>
                      )}

                      {/* Note panel */}
                      {noteOpen && (
                        <div className="mt-1.5 ml-7">
                          <textarea
                            autoFocus
                            value={notes[key] || ''}
                            onChange={e => onNoteChange(key, e.target.value)}
                            placeholder="Add internal note or justification…"
                            rows={2}
                            className="w-full text-xs text-slate-700 placeholder-slate-400 border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-300"
                          />
                        </div>
                      )}
                    </div>
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