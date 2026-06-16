/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Compass, Sparkles, Wand2, Info, RefreshCw, Layers } from 'lucide-react';
import { PosterData, ChatMessage } from './types';
import PosterCanvas from './components/PosterCanvas';
import InteractiveChat from './components/InteractiveChat';
import CelebrationDetails from './components/CelebrationDetails';

// Beautiful initial state for loading
const initialPosterState: PosterData = {
  dateString: "15 de Junio, 2026",
  celebrationTitle: "Día Mundial de los Creadores",
  subtitle: "Celebrando el ingenio que transforma las ideas en mundos reales",
  description: "Hoy es un día dedicado a enaltecer las mentes creativas, programadores, artistas y visionarios que se atreven a fabricar nuevas realidades tecnológicas e ilustrativas.",
  slogan: "Crea con pasión, diseña con audacia, inspira sin límites",
  primaryColor: "#4f46e5",
  accentColor: "#f59e0b",
  textColor: "light",
  bgPreset: "gradient-indigo",
  iconName: "Sparkles",
  stickers: [
    { emoji: "✨", label: "Destello", x: 15, y: 18, size: "text-5xl" },
    { emoji: "🎨", label: "Paleta", x: 80, y: 35, size: "text-6xl" },
    { emoji: "🚀", label: "Cohete", x: 75, y: 70, size: "text-5xl" }
  ],
  historicalFacts: [
    "Inaugurado para conmemorar el desarrollo de la primera imprenta digital.",
    "Se celebra de forma simultánea en más de 80 países con ferias de arte y hackathons.",
    "El lema global impulsa la accesibilidad de motores de inteligencia artificial para creadores."
  ],
  celebrationIdeas: [
    "Diseña un afiche interactivo con nuestro asistente IA hoy mismo.",
    "Envía un agradecimiento sincero a tu desarrollador o diseñador favorito.",
    "Inicia ese borrador de proyecto que has estado postergando por semanas."
  ],
  imagePrompt: "A minimal floating cybernetic paintbrush in front of digital stars"
};

export default function App() {
  const [poster, setPoster] = useState<PosterData>(initialPosterState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeDate, setActiveDate] = useState("");
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Set the default date input to today
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setActiveDate(formatted);
    loadCelebrationForDate(formatted);
  }, []);

  // Fetch initial celebration
  const loadCelebrationForDate = async (dateStr: string) => {
    setIsLoadingInitial(true);
    try {
      const response = await fetch("/api/celebration-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr })
      });
      if (response.ok) {
        const data = await response.json();
        setPoster(data);

        // Bootstrap initial welcome message in Spanish
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `¡Hola con mucho gusto! He investigado científicamente qué se celebra en la fecha elegida y creé este hermoso afiche para: **${data.celebrationTitle}**.\n\n_¿Qué te gustaría hacer ahora con el afiche?_\n- **Pídeme agregar un día especial** (ej. "Agrega el día de mi mami Yolanda el 10 de Mayo" o "Crea el día de los videojuegos").\n- **Pídeme cambiar el diseño** (ej. "Cambia el fondo a color rojo y pon stickers de gatos").\n- **Escribe tus propios textos** haciendo clic arriba o en este chat. ¡Hagámoslo juntos!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  // Handle manual/inline Date picker selections
  const handleDateChange = (dateStr: string) => {
    if (!dateStr) return;
    setActiveDate(dateStr);
    loadCelebrationForDate(dateStr);
  };

  // Send message to back-end chat route (handles both QA, custom day additions, and style adjustments)
  const handleSendMessage = async (text: string) => {
    setIsSendingChat(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentPoster: poster,
          targetDate: activeDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update poster structural state dynamically
        if (result.updatedPoster) {
          setPoster(result.updatedPoster);
        }

        // Add assistant reply message
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("Respuesta del servidor fallida");
      }
    } catch (err: any) {
      console.error("Error in chat process:", err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Disculpa, tuve un micro-retraso al comunicarme con mi motor de diseño. Por favor, reintenta tu instrucción de nuevo.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Select quick suggestion chips
  const handleSelectSuggestedDay = (labelText: string) => {
    handleSendMessage(labelText);
  };

  // Generate Image background using Gemini 2.5 Flash Image API proxy
  const handleGenerateAIImage = async () => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePrompt: poster.imagePrompt || `flat vector illustration representing ${poster.celebrationTitle}`,
          ratio: "3:4"
        })
      });

      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setPoster(prev => ({
          ...prev,
          aiGeneratedImageUrl: data.imageUrl
        }));
        
        // Append small success message info in the chat
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `🎨 ¡Espectacular! He generado una ilustración artística única para el fondo del cartel representando: "${poster.imagePrompt}".`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        // Fallback gracefully to picsum/pics with user prompt
        setPoster(prev => ({
          ...prev,
          aiGeneratedImageUrl: data.fallbackUrl || `https://picsum.photos/seed/${encodeURIComponent(poster.celebrationTitle)}/600/800`
        }));
      }
    } catch (err) {
      console.error("Error generating AI image Background:", err);
      setPoster(prev => ({
        ...prev,
        aiGeneratedImageUrl: `https://picsum.photos/seed/${encodeURIComponent(poster.celebrationTitle || "poster")}/600/800`
      }));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white pb-10">
      
      {/* Decorative colored background glow spots from AetherDaily */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Main header block / Elegant Dark Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-6 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-mono tracking-widest font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                DAILY POSTER GENERATOR
              </span>
              <span className="text-xs text-white/40 font-mono">AETHER ARCHIVE</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white font-display">
              AetherDaily <span className="text-white/30">/ Afiches con IA</span>
            </h1>
          </div>
        </div>

        <div className="text-xs bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-full text-white/70 flex items-center gap-2 font-mono">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Sintonizando efemérides culturales con modelos Gemini</span>
        </div>
      </header>

      {/* Primary body workspace */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Poster Canvas (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-6">
          {isLoadingInitial ? (
            <div className="w-full aspect-[3/4] max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-pulse">
              <RefreshCw className="w-12 h-12 text-indigo-500/60 animate-spin mb-4" />
              <h3 className="text-lg font-bold font-display uppercase tracking-widest text-indigo-400">Sintonizando Efemérides...</h3>
              <p className="text-xs text-white/40 max-w-sm mt-1">Investigando las celebraciones universales en el firmamento histórico.</p>
            </div>
          ) : (
            <PosterCanvas
              poster={poster}
              onChange={setPoster}
              onGenerateImage={handleGenerateAIImage}
              isGeneratingImage={isGeneratingImage}
            />
          )}
        </div>

        {/* Right Column: Chat Dialog Box (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Main Info Banner */}
          <div className="bg-[#0f0f0f]/80 p-4 border border-white/10 rounded-2xl text-xs leading-relaxed text-white/70 flex gap-3 shadow-lg">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1 uppercase tracking-wider text-[10px]">💡 Diseñador de Afiches Inteligente</p>
              Modifica o crea cualquier efeméride directamente desde el chat. Puedes decirle <span className="text-indigo-300">"Pon stickers de unicornio"</span>, cambiar colores, o añadir nuevos días de celebración.
            </div>
          </div>

          <InteractiveChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSendingChat}
            onSelectSuggestedDay={handleSelectSuggestedDay}
            onDateChange={handleDateChange}
          />
        </div>

      </main>

      {/* Sub-section: Complete Celebration Details (Full Width below visual elements) */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="border-t border-white/10 pt-8">
          <CelebrationDetails poster={poster} />
        </div>
      </section>

      {/* Humble Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-16 pt-6 text-center text-xs text-white/30 font-mono">
        <p>© 2026 AetherDaily Generator. Diseñado con IA de última generación.</p>
      </footer>
    </div>
  );
}
