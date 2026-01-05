'use client';

import { useState } from 'react';
import { debugGetFullPrompt, getAgentConfig } from '@/lib/llm';

interface PromptViewerProps {
  config: {
    initialMessage: string;
    pageContext: string;
    goal: string;
  };
}

export default function PromptViewer({ config }: PromptViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'config'>('system');

  const { systemPrompt, agentConfig } = debugGetFullPrompt({
    ...config,
    knowledgeContext: '(Knowledge will be loaded from RAG and playbooks when available)',
  });

  const agentSettings = getAgentConfig();

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span className="text-sm font-medium text-slate-300">
            Prompt Configuration
          </span>
          <span className="text-xs text-slate-500 ml-2">
            (Developer View)
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-slate-700">
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'system'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              System Prompt
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'config'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Agent Config
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
            {activeTab === 'system' && (
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {systemPrompt}
              </pre>
            )}

            {activeTab === 'config' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-sm text-slate-400">Model</span>
                  <code className="text-sm text-emerald-400 font-mono">
                    {agentSettings.model}
                  </code>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-sm text-slate-400">Max Tokens</span>
                  <code className="text-sm text-emerald-400 font-mono">
                    {agentSettings.maxTokens}
                  </code>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-sm text-slate-400">Temperature</span>
                  <code className="text-sm text-emerald-400 font-mono">
                    {agentSettings.temperature}
                  </code>
                </div>
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-500">
                    💡 Edit <code className="text-blue-400">config/agent-config.ts</code> to change these settings.
                    <br />
                    Edit <code className="text-blue-400">config/prompts.ts</code> to modify the system prompt.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

