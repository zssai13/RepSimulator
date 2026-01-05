'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import KnowledgeBuckets from '@/components/KnowledgeBuckets';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import InputPanel from '@/components/InputPanel';
import PromptViewer from '@/components/PromptViewer';
import { Message } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    initialMessage: '',
    pageContext: '',
    goal: '',
    modelId: '',
  });

  // Keyboard shortcuts
  const handleClear = useCallback(() => {
    setMessages([]);
    setIsSimulationActive(false);
    setConfig({ initialMessage: '', pageContext: '', goal: '', modelId: '' });
    toast.success('Conversation cleared');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to clear
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isSimulationActive) {
          handleClear();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimulationActive, handleClear]);

  const handleStartSimulation = (newConfig: {
    initialMessage: string;
    pageContext: string;
    goal: string;
    modelId: string;
  }) => {
    setConfig(newConfig);
    setIsSimulationActive(true);

    // Add the initial AI message
    const initialMsg: Message = {
      id: crypto.randomUUID(),
      role: 'initial',
      content: newConfig.initialMessage,
      timestamp: new Date(),
    };
    setMessages([initialMsg]);
    toast.success('Simulation started');
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Show loading state
    setIsLoading(true);

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          initialMessage: config.initialMessage,
          pageContext: config.pageContext,
          goal: config.goal,
          modelId: config.modelId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Show knowledge sources used (if any)
      if (data.knowledgeSources) {
        const sources = [];
        if (data.knowledgeSources.rag) sources.push('RAG');
        if (data.knowledgeSources.salesPlaybook) sources.push('Playbook');
        if (data.knowledgeSources.supportGuide) sources.push('FAQ');
        if (sources.length > 0) {
          console.log(`Knowledge sources used: ${sources.join(', ')}`);
        }
      }

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportConversation = () => {
    if (messages.length === 0) {
      toast.error('No conversation to export');
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      config,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  };

  return (
    <main className="max-w-screen-2xl mx-auto p-6">
      <div className="flex gap-6 min-h-[calc(100vh-140px)]">
        {/* LEFT COLUMN - Knowledge Base (40%) */}
        <div className="w-2/5 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Knowledge Base
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload content to train the AI agent on your product and sales approach
            </p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <KnowledgeBuckets />
          </div>
        </div>

        {/* RIGHT COLUMN - Simulation Playground (60%) */}
        <div className="w-3/5 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Simulation Playground
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Test how the AI sales rep responds to prospect messages
            </p>
          </div>

          {/* Configuration Panel */}
          {!isSimulationActive && (
            <InputPanel onStart={handleStartSimulation} />
          )}

          {/* Prompt Viewer - Collapsible developer panel */}
          <div className="mb-4">
            <PromptViewer config={config} />
          </div>

          {/* Active Simulation Display */}
          {isSimulationActive && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Simulation Active
                  </span>
                  {config.pageContext && (
                    <span className="text-sm text-slate-500">
                      Page: <span className="font-medium text-slate-700">{config.pageContext}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={handleExportConversation}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              </div>
              {config.goal && (
                <div className="mt-2 text-xs text-slate-500">
                  <span className="font-medium">Goal:</span> {config.goal}
                </div>
              )}
            </div>
          )}

          {/* Chat Window */}
          <div className="flex-1 flex flex-col min-h-[400px]">
            <ChatWindow messages={messages} isLoading={isLoading} />
            
            {/* Message Input - only show when simulation is active */}
            {isSimulationActive && (
              <MessageInput
                onSend={handleSendMessage}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Clear Button */}
          {isSimulationActive && (
            <button
              onClick={handleClear}
              className="mt-4 w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Conversation
              <span className="text-slate-400 text-xs ml-2">(Ctrl+K)</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
