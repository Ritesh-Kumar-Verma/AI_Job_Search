import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../services/api';

function ChatBot({ onFiltersSuggested, onJobsMatched, currentFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hi! I\'m your AI job hunting assistant powered by LangChain & LangGraph. I can help you:\n\n🔍 **Search jobs**: "Show me React developer jobs"\n🎯 **Match resume**: "How well do I match these jobs?"\n🔧 **Control filters**: "Show only remote positions"\n❓ **Help**: Ask me anything about the app!\n\n💡 Try: "Show me remote Python jobs with high match scores"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFilterAction, setLastFilterAction] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (content) => {
    if (!content) return '';
    return content.split('\n').map((line, i) => {
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(
        messages.map(m => ({ role: m.role, content: m.content })).concat(userMessage)
      );

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: res.data.message,
        intent: res.data.intent,
        matchScores: res.data.matchScores,
        filters: res.data.filters,
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (res.data.filters && onFiltersSuggested) {
        onFiltersSuggested(res.data.filters);
        setLastFilterAction(res.data.filters);

        navigate('/jobs');

        setTimeout(() => setLastFilterAction(null), 3000);
      }

      if (res.data.matchScores && res.data.matchScores.length > 0 && onJobsMatched) {
        onJobsMatched(res.data.matchScores);
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '🎯 Match Resume', action: 'How well do I match the available jobs?' },
    { label: '🌍 Remote Jobs', action: 'Show only remote jobs' },
    { label: '⭐ High Match', action: 'Filter by high match scores only' },
    { label: '🔄 Clear Filters', action: 'Clear all filters' },
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 w-15 h-15 rounded-full bg-blue-600 text-white border-none cursor-pointer text-2xl shadow-lg z-[999] transition-transform ${isOpen ? 'scale-110' : 'scale-100'}`}
        title="Chat with AI"
      >
        🤖
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-8 w-[400px] max-w-[90vw] h-[500px] bg-white rounded-xl shadow-xl flex flex-col z-[1000]">
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 className="m-0">🤖 Job Hunt Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-none border-none text-white text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          {lastFilterAction && (
            <div className="bg-emerald-100 text-emerald-800 px-4 py-2 text-xs flex items-center gap-2">
              ✅ Filters updated! Check the Job Feed.
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded bg-${msg.role === 'user' ? 'blue-600 text-white' : 'gray-100 text-gray-800'} break-words text-sm leading-6 whitespace-pre-wrap`}
                >
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 text-gray-400 text-sm">
                  🤖 AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 p-2.5 border-t border-gray-200 flex-wrap">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(qa.action)}
                className="px-2 py-1 text-xs bg-gray-200 border-none rounded-full cursor-pointer"
              >
                {qa.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="flex gap-2.5 p-4 border-t border-gray-200"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 p-2 border border-gray-200 rounded text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBot;