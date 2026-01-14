import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { aiChatService } from '../services/geminiService';
import { useAIContext } from '../contexts/AIContext';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export const AIChatWidget: React.FC = () => {
  const { contextData, contextId } = useAIContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'ai', text: 'Hello! I am your CreditSentinel Copilot. I can help analyze the data currently on your screen.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Reset/Notify chat if contextId changes
  useEffect(() => {
      if (contextId && isOpen) {
          setMessages(prev => [
              ...prev, 
              { id: Date.now().toString(), role: 'ai', text: 'I have updated my context with the new page data. How can I assist?' }
          ]);
      }
  }, [contextId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await aiChatService.sendMessage(input, contextData, contextId);
    
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: response };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center gap-2 hover:scale-105 active:scale-95 chat-widget"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-fade-in-up chat-widget">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
                <Sparkles size={18} className="text-blue-300" />
            </div>
            <div>
                <h3 className="font-semibold text-sm">CreditSentinel Copilot</h3>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Gemini 3 Flash
                </p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <ChevronDown size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                }`}>
                    {msg.text.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                </div>
            </div>
        ))}
        {loading && (
             <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                </div>
            </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 items-end">
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Ask about risks, draft emails, or summarize..."
                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none max-h-32 bg-slate-50 focus:bg-white transition-colors"
                rows={1}
                style={{ minHeight: '44px' }}
            />
            <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 h-[44px] w-[44px] flex items-center justify-center"
            >
                <Send size={18} />
            </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">
            AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};