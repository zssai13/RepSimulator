'use client';

import { Message } from '@/types';
import { useEffect, useRef } from 'react';

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">
            No conversation yet
          </h3>
          <p className="text-sm text-slate-500">
            Configure your simulation settings above and click "Start Simulation"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-enter flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : message.role === 'initial'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
            }`}
          >
            {message.role === 'initial' && (
              <div className="text-xs font-medium text-purple-100 mb-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Initial Outreach
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            <div
              className={`text-xs mt-2 ${
                message.role === 'user' || message.role === 'initial'
                  ? 'text-white/70'
                  : 'text-slate-400'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-slate-500">Agent is typing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

