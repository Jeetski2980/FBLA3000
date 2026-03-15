import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function LocalPulseAI() {
  const { profile } = useProfile();
  const { zip } = profile;
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey, I’m here to help you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (zip) {
      fetch(`/api/businesses?zip=${zip}`)
        .then(res => res.json())
        .then(data => setBusinesses(data))
        .catch(err => console.error('Failed to fetch businesses for AI context:', err));
    }
  }, [zip]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const model = "gemini-3-flash-preview";
      const businessContext = businesses.map(b => 
        `Name: ${b.name}, Category: ${b.category}, Description: ${b.description}, Rating: ${b.avgRating}`
      ).join('\n');

      const prompt = `
        You are LocalPulse AI, a helpful community assistant for the ZIP code ${zip}.
        Your goal is to help users discover local businesses and answer questions about their community.
        
        Here is a list of businesses in the area:
        ${businessContext}
        
        User asked: ${userMessage}
        
        Provide a friendly, helpful response in a chatbot style. 
        If you recommend businesses, mention why they fit the user's request based on their description or rating.
        Keep the tone bold and community-focused.
      `;

      const response = await genAI.models.generateContent({
        model: model,
        contents: prompt,
      });

      const aiResponse = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-purple-800">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 text-white">
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl border border-white/20 ${
                    msg.role === 'user' 
                      ? 'bg-white/10 text-white font-bold' 
                      : 'bg-white/5 text-white font-bold shadow-xl'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center bg-white/10 p-4 rounded-2xl text-white font-bold border border-white/20">
                <Loader2 size={16} className="animate-spin" />
                <span>LocalPulse AI is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:p-8 bg-purple-900/50 border-t border-white/10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your community..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-6 pr-16 text-white font-bold placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white text-purple-800 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="max-w-4xl mx-auto mt-4 flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
          <Sparkles size={12} />
          Powered by Gemini AI • Community Recommendations
        </div>
      </div>
    </div>
  );
}
