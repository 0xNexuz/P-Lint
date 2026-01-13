
import React, { useState } from 'react';
import { ScanResult, LintRule, Severity } from '../types';
import { PRIVACY_RULES } from '../constants';
import { GeminiService, AIExplanationResponse } from '../services/geminiService';
import { PRIVACY_KNOWLEDGE_BASE } from '../services/knowledgeBase';

interface AnalysisResultsProps {
  result: ScanResult;
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const colors = {
    [Severity.LOW]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [Severity.MEDIUM]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [Severity.HIGH]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    [Severity.CRITICAL]: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, AIExplanationResponse>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [isFallback, setIsFallback] = useState<Record<string, boolean>>({});

  const gemini = new GeminiService();

  const handleExplain = async (rule: LintRule) => {
    if (aiResponses[rule.id]) return;
    
    setLoadingAi(prev => ({ ...prev, [rule.id]: true }));
    try {
      const response = await gemini.getPrivacyExplanation(result, rule);
      
      if (response.text.includes("rate-limited") || response.text.includes("unavailable")) {
        throw new Error("AI Unavailable");
      }
      
      setAiResponses(prev => ({ ...prev, [rule.id]: response }));
      setIsFallback(prev => ({ ...prev, [rule.id]: false }));
    } catch (err) {
      console.warn("Falling back to Knowledge Base for rule:", rule.id);
      const staticInfo = PRIVACY_KNOWLEDGE_BASE[rule.id] || { text: "No static documentation available.", link: "#" };
      setAiResponses(prev => ({ 
        ...prev, 
        [rule.id]: { 
          text: staticInfo.text, 
          sources: [{ title: "Official Documentation", uri: staticInfo.link }] 
        } 
      }));
      setIsFallback(prev => ({ ...prev, [rule.id]: true }));
    } finally {
      setLoadingAi(prev => ({ ...prev, [rule.id]: false }));
    }
  };

  const detectedFindings = result.findings.filter(f => f.detected);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Critical Findings ({detectedFindings.length})
        </h3>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[9px] sm:text-[10px] text-indigo-400 font-bold tracking-widest uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap">
            Engine: Static + Heuristic
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {PRIVACY_RULES.map(rule => {
          const finding = result.findings.find(f => f.ruleId === rule.id);
          if (!finding?.detected) return null;

          const isExpanded = expandedId === rule.id;

          return (
            <div 
              key={rule.id}
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'}`}
            >
              <div 
                className="p-3 sm:p-4 cursor-pointer flex items-start sm:items-center justify-between gap-4"
                onClick={() => setExpandedId(isExpanded ? null : rule.id)}
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="text-red-500 mt-1 sm:mt-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm sm:text-base">{rule.name}</span>
                      <SeverityBadge severity={rule.severity} />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-1 max-w-[200px] sm:max-w-md">{rule.description}</p>
                  </div>
                </div>
                <div className={`transition-transform duration-200 mt-1 sm:mt-0 ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 sm:px-4 pb-4 border-t border-gray-800 pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Evidence</h4>
                      <div className="p-3 bg-black/40 rounded-lg mono text-[10px] sm:text-xs text-red-300 border border-red-500/20 break-all leading-relaxed">
                        {finding.evidence || 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Impact Analysis</h4>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{rule.impact}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-green-400 tracking-wider">Remediation</h4>
                    <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20 flex items-start gap-3">
                      <div className="text-green-400 mt-0.5 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-200">{rule.fix}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleExplain(rule); }}
                      className="text-[11px] sm:text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-3 transition-colors disabled:opacity-50"
                      disabled={loadingAi[rule.id]}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {loadingAi[rule.id] ? 'Grounding analysis...' : 'Get Context & Sources'}
                    </button>
                    {aiResponses[rule.id] && (
                      <div className="space-y-3">
                        <div className={`p-4 rounded-xl border relative ${isFallback[rule.id] ? 'bg-orange-500/5 border-orange-500/20' : 'bg-indigo-500/10 border-indigo-500/30 shadow-lg'}`}>
                          <div className={`absolute -top-2 left-4 px-2 text-[9px] font-bold border rounded ${isFallback[rule.id] ? 'bg-[#030712] text-orange-400 border-orange-500/30' : 'bg-[#030712] text-indigo-400 border-indigo-500/30'}`}>
                            {isFallback[rule.id] ? 'OFFLINE KNOWLEDGE BASE' : 'GEMINI GROUNDED AI'}
                          </div>
                          <p className="text-xs sm:text-sm italic text-indigo-100 leading-relaxed">
                            "{aiResponses[rule.id].text}"
                          </p>
                        </div>
                        {aiResponses[rule.id].sources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {aiResponses[rule.id].sources.map((src, idx) => (
                              <a 
                                key={idx} 
                                href={src.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-[10px] border border-gray-700 transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {src.title.length > 25 ? `${src.title.slice(0, 25)}...` : src.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisResults;
