import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function WritingAssistant() {
  const [writingText, setWritingText] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [analyzingText, setAnalyzingText] = useState(false);

  const analyzeWriting = async () => {
    if (!writingText.trim()) return;
    
    setAnalyzingText(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional writing assistant like Grammarly or Harper. Analyze this text and provide:

1. Grammar and spelling corrections
2. Style improvements
3. Clarity suggestions
4. Tone assessment
5. Readability score

Text to analyze:
"""
${writingText}
"""

Return a detailed analysis with specific suggestions.`,
        response_json_schema: {
          type: "object",
          properties: {
            grammar_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                  position: { type: "string" }
                }
              }
            },
            style_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            clarity_improvements: {
              type: "array",
              items: { type: "string" }
            },
            tone: { type: "string" },
            readability_score: { type: "string" },
            overall_feedback: { type: "string" },
            improved_version: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Failed to analyze text. Please try again.');
    }
    setAnalyzingText(false);
  };

  const applyImprovedVersion = () => {
    if (suggestions?.improved_version) {
      setWritingText(suggestions.improved_version);
      setSuggestions(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">Writing Assistant</span>
        </h1>
        <p className="text-blue-400">Paste or type your text below for grammar, style, and clarity improvements.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Text Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-blue-400">Your Text</label>
            <span className="text-xs text-blue-400">{writingText.length} characters</span>
          </div>
          <Textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder="Paste or type your text here..."
            className="min-h-[500px] resize-none border-slate-300 focus:border-slate-400 focus:ring-slate-400 text-slate-800 bg-white"
          />
          <Button
            onClick={analyzeWriting}
            disabled={!writingText.trim() || analyzingText}
            className="w-full bg-slate-800 hover:bg-slate-900"
          >
            {analyzingText ? 'Analyzing...' : 'Analyze Text'}
          </Button>
        </motion.div>

        {/* Suggestions Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-slate-700">Suggestions</label>
          {suggestions ? (
            <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {/* Tone & Readability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Tone:</span>
                  <Badge variant="outline">{suggestions.tone}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Readability:</span>
                  <Badge variant="outline">{suggestions.readability_score}</Badge>
                </div>
              </div>

              {/* Overall Feedback */}
              {suggestions.overall_feedback && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Overall Feedback</h4>
                  <p className="text-sm text-slate-600">{suggestions.overall_feedback}</p>
                </div>
              )}

              {/* Grammar Issues */}
              {suggestions.grammar_issues?.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Grammar & Spelling</h4>
                  <div className="space-y-2">
                    {suggestions.grammar_issues.map((item, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-xs font-medium text-red-800">{item.issue}</p>
                        <p className="text-xs text-red-600 mt-1">→ {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Suggestions */}
              {suggestions.style_suggestions?.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Style Improvements</h4>
                  <div className="space-y-2">
                    {suggestions.style_suggestions.map((item, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs font-medium text-blue-800">{item.issue}</p>
                        <p className="text-xs text-blue-600 mt-1">→ {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clarity Improvements */}
              {suggestions.clarity_improvements?.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Clarity</h4>
                  <ul className="space-y-1">
                    {suggestions.clarity_improvements.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved Version */}
              {suggestions.improved_version && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-800">Improved Version</h4>
                    <Button
                      size="sm"
                      onClick={applyImprovedVersion}
                      className="h-7 bg-green-600 hover:bg-green-700"
                    >
                      Apply
                    </Button>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{suggestions.improved_version}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center h-[600px] flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-sm text-slate-600">Your writing analysis will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}