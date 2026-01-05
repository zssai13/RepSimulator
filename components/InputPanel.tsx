'use client';

import { useState } from 'react';

interface InputPanelProps {
  onStart: (config: {
    initialMessage: string;
    pageContext: string;
    goal: string;
  }) => void;
  disabled?: boolean;
}

const DEFAULT_GOAL =
  'Get the user back to the page they were on and complete the intended interaction.';

export default function InputPanel({ onStart, disabled = false }: InputPanelProps) {
  const [initialMessage, setInitialMessage] = useState('');
  const [pageContext, setPageContext] = useState('');
  const [goal, setGoal] = useState('');

  const handleStart = () => {
    if (initialMessage.trim()) {
      onStart({
        initialMessage: initialMessage.trim(),
        pageContext: pageContext.trim(),
        goal: goal.trim() || DEFAULT_GOAL,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Simulation Configuration
      </h3>

      <div className="space-y-4">
        {/* Initial AI Message */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Initial AI Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            placeholder="Enter the outbound message the AI originally sent to the prospect..."
            disabled={disabled}
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Page Context */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Page Context
          </label>
          <input
            type="text"
            value={pageContext}
            onChange={(e) => setPageContext(e.target.value)}
            placeholder="e.g., /pricing, Homepage, Product Demo Page"
            disabled={disabled}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed focus:border-blue-400 transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1">
            The page the visitor was on when the initial message was sent
          </p>
        </div>

        {/* Agent Goal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Agent Goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={`Default: ${DEFAULT_GOAL}`}
            disabled={disabled}
            rows={2}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed focus:border-blue-400 transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1">
            Leave blank for default behavior, or specify a custom goal
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={disabled || !initialMessage.trim()}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          Start Simulation
        </button>
      </div>
    </div>
  );
}

