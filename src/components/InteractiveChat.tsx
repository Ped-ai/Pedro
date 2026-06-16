import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Loader2, Calendar } from 'lucide-react';
import { ChatMessage } from '../types';

interface InteractiveChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
  onSelectSuggestedDay: (dayName: string) => void;
  onDateChange: (dateString: string) => void;
}

export default function InteractiveChat({
  messages,
  onSendMessage,
  isSending,
  onSelectSuggestedDay,
  onDateChange
}: InteractiveChatProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic to anchor conversation bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const currentYear = new Date().getFullYear();

  // Curated interesting prompts to jumpstart the creative visual design
  const quickChips = [
    { label: "🍕 Crear Día de la Pizza", icon: "🍕" },
    { label: "💻 Crear Día del Programador", icon: "💻" },
    { label: "🐱 Crear Día de los Gatos", icon: "🐱" },
    { label: "🎨 Cambiar fondo a gradiente rosa", icon: "🎨" },
    { label: "🚀 Añade sticker de un cohete espacial", icon: "🚀" },
    { label: "🍰 Crear el Día del Pastel de Chocolate", icon: "🍰" }
  ];

  return (
    <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl" id="chat-section">
      {/* Header of Chat */}
      <div className="bg-black/60 p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-white text-sm">Asistente de Diseño Co-Creador</h3>
            <p className="text-xs text-white/50">Pídele agregar un día especial o modificar el afiche interactivo.</p>
          </div>
        </div>

        {/* Inline Date jump selector for convenience */}
        <div className="flex items-center gap-2 bg-[#151515] px-3 py-1.5 rounded-lg border border-white/10">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-white/60 font-medium">Ver otra fecha:</span>
          <input
            type="date"
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded cursor-pointer"
            id="date-picker-inline"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/10 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md transition-all text-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#151515] border border-white/10 text-white/90 rounded-tl-none'
                }`}
              >
                {/* Role indicator header */}
                <div className={`text-[10px] uppercase font-mono tracking-wider mb-1 opacity-60 ${isUser ? 'text-indigo-200' : 'text-indigo-400'}`}>
                  {isUser ? 'Tú (Diseñador)' : 'IA Co-Creador'}
                </div>
                
                {/* Message Body */}
                <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                
                {/* Small timestamp */}
                <span className="block text-[9px] text-right mt-1 opacity-40">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[#111] border border-white/10 text-white/70 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-medium font-mono text-white/50 animate-pulse">
                El diseñador IA está plasmando el afiche conmemorativo...
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions Bubble Selection */}
      <div className="p-3 bg-black/40 border-t border-white/10">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#e5e5e5]/40 mb-2">Sugerencias Rápidas:</p>
        <div className="flex flex-wrap gap-2">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestedDay(chip.label)}
              disabled={isSending}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#151515] hover:bg-[#202020] disabled:opacity-50 text-white/80 transition-all flex items-center gap-1 cursor-pointer border border-white/10 hover:border-white/20"
            >
              <span>{chip.icon}</span>
              <span>{chip.label.replace(/^.*Crear\s+/i, '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Actions */}
      <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          placeholder="Escribe 'Crea el día de...' o pídele cambiar colores, agregar stickers..."
          className="flex-1 bg-[#151515] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          id="chat-input-field"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-400 text-white rounded-xl p-3 font-semibold transition flex items-center justify-center cursor-pointer"
          id="chat-submit-btn"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
