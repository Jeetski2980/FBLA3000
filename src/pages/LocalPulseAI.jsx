import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, Bot, User, Sparkles, Volume2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function LocalPulseAI() {
  const { profile } = useProfile();
  const { zip } = profile;
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey, I’m here to help you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const messagesEndRef = useRef(null);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const plainText = text.replace(/<[^>]+>/g, '');
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (input.length + transcript.length <= 300) {
        setInput(prev => (prev + ' ' + transcript).trim().slice(0, 300));
      }
    };

    recognition.start();
  };

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
        Do not use any asterisks (*) anywhere in your response.
        You may use emojis when they fit naturally.
        Make responses concise and to the point, ideally under 100 words.
        Only bold the names of businesses you recommend by wrapping them in <b> and </b> tags, and do not use any other HTML tags or formatting.
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
                  <div className={`p-4 rounded-2xl border border-white/20 relative group ${
                    msg.role === 'user' 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'bg-white/5 text-white font-medium shadow-xl'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <p
                        className="whitespace-pre-wrap leading-relaxed [&_b]:text-green-500 [&_b]:font-bold"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => speak(msg.content)}
                        className="absolute -right-10 top-2 p-2 text-white/40 hover:text-white transition-colors"
                        title="Listen to message"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
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
          <div className="flex items-center gap-2">
            <div className="relative flex items-center flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 300))}
                placeholder="Ask anything about your community..."
                maxLength={300}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-6 pr-24 text-white font-bold placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-3 rounded-xl transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isListening ? "Listening..." : "Speak message"}
                >
                  {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 bg-white text-purple-800 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <div className="text-white/50 font-normal text-[9px] whitespace-nowrap">
              {input.length}/300
            </div>
          </div>
        </form>
        <div className="max-w-4xl mx-auto mt-4 flex items-center gap-1 text-white/60 text-[8px] font-bold normal-case tracking-normal scale-75 origin-left inline-flex">
          <Sparkles size={13} />
          Powered by Gemini AI • Community Recommendations
        </div>
      </div>
    </div>
  );
}