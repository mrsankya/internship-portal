import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User as UserIcon, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const DiGiBotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Hello! I am **DiGi Bot**, your AI Campus Assistant! I can help you find upcoming workshops, hackathons, cultural fests, download certificates, or answer event questions. What are you looking for today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await api.chatWithBot(query);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || "I am processing your query. Check the home page for all live events!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Sorry, I am having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
        </div>
        <span className="text-xs font-black pr-1 hidden sm:inline">Ask DiGi Bot</span>
      </button>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm h-[520px] bg-white rounded-3xl shadow-2xl border border-[#e1e2ed] flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm leading-tight flex items-center gap-1.5">
                  DiGi Bot <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </h3>
                <p className="text-[10px] text-white/80">Campus AI Assistant • Online 24/7</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#faf8ff]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#004ac6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-[#2563eb] text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-white border border-[#e1e2ed] text-[#191b23] rounded-bl-none shadow-sm whitespace-pre-line leading-relaxed'
                  }`}
                >
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 text-xs items-center text-[#737686]">
                <div className="w-7 h-7 rounded-full bg-[#004ac6] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-[#e1e2ed] rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#004ac6]" />
                  <span>DiGi Bot is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Presets */}
          <div className="p-2 bg-white border-t border-[#e1e2ed] flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => handleSendMessage('Upcoming AI & Tech Events')}
              className="px-2.5 py-1 rounded-full bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white text-[10px] font-bold shrink-0 transition-colors"
            >
              🚀 Tech Events
            </button>
            <button
              onClick={() => handleSendMessage('How to get my certificate')}
              className="px-2.5 py-1 rounded-full bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white text-[10px] font-bold shrink-0 transition-colors"
            >
              📜 Certificates
            </button>
            <button
              onClick={() => handleSendMessage('Campus Venues & Auditoriums')}
              className="px-2.5 py-1 rounded-full bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white text-[10px] font-bold shrink-0 transition-colors"
            >
              📍 Venues
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white border-t border-[#e1e2ed] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask DiGi Bot about campus events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-[#004ac6] text-white hover:bg-[#2563eb] disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
