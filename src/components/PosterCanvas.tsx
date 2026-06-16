import React, { useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { PosterData, Sticker } from '../types';

interface PosterCanvasProps {
  poster: PosterData;
  onChange: (updated: PosterData) => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

export default function PosterCanvas({ poster, onChange, onGenerateImage, isGeneratingImage }: PosterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEmojiForStamping, setSelectedEmojiForStamping] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customText, setCustomText] = useState("");

  // Dynamically load the Lucide Icon
  const getIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
    return <IconComponent className="w-12 h-12 stroke-[1.5]" />;
  };

  // Preset background styles
  const getBgStyle = (preset: string, primaryColor: string) => {
    switch (preset) {
      case 'gradient-indigo':
        return 'bg-gradient-to-br from-indigo-600 via-blue-800 to-slate-950 text-white';
      case 'gradient-rose':
        return 'bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-950 text-white';
      case 'gradient-amber':
        return 'bg-gradient-to-br from-amber-500 via-orange-600 to-stone-950 text-white';
      case 'gradient-emerald':
        return 'bg-gradient-to-br from-emerald-600 via-teal-800 to-zinc-950 text-white';
      case 'gradient-sky':
        return 'bg-gradient-to-br from-sky-500 via-cyan-700 to-slate-950 text-white';
      case 'gradient-dark':
        return 'bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white';
      case 'solid-cream':
        return 'bg-[#FAF8F5] text-stone-900 border border-stone-200';
      case 'gradient-sunset':
        return 'bg-gradient-to-br from-orange-500 via-red-500 to-indigo-950 text-white';
      case 'gradient-forest':
        return 'bg-gradient-to-br from-emerald-800 via-green-900 to-stone-950 text-white';
      default:
        return `bg-gradient-to-br from-slate-900 to-slate-950 text-white`;
    }
  };

  // Handle local text edits on the poster
  const handleTextEdit = (field: keyof PosterData, value: string) => {
    onChange({
      ...poster,
      [field]: value
    });
  };

  // Sticker dragging logic (mouse & touch)
  const handleStickerPointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingIndex(index);
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIndex === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    const updatedStickers = [...poster.stickers];
    updatedStickers[draggingIndex] = {
      ...updatedStickers[draggingIndex],
      x: Math.round(x),
      y: Math.round(y)
    };

    onChange({
      ...poster,
      stickers: updatedStickers
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingIndex !== null) {
      setDraggingIndex(null);
    }
  };

  // Stamp a sticker by clicking on the Canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // If we have an emoji selected for stamping
    if (selectedEmojiForStamping) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      const newSticker: Sticker = {
        emoji: selectedEmojiForStamping,
        label: "Usuario",
        x,
        y,
        size: "text-5xl"
      };

      onChange({
        ...poster,
        stickers: [...poster.stickers, newSticker]
      });

      setSelectedEmojiForStamping(null);
    }
  };

  // Delete a sticker
  const deleteSticker = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = poster.stickers.filter((_, i) => i !== index);
    onChange({
      ...poster,
      stickers: filtered
    });
  };

  // Download logic (or print)
  const handleDownload = () => {
    window.print();
  };

  const defaultStampingEmojis = ["✨", "🎨", "🎉", "🔥", "🚀", "🍕", "🐱", "📅", "💡", "🌟", "❤️", "🍀", "👾", "🍦"];

  return (
    <div className="flex flex-col items-center w-full" id="canvas-section">
      {/* Dynamic Action Ribbons - Elegant Dark style */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-2xl gap-3 p-3 mb-4 rounded-xl bg-[#090909] border border-white/10 shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          <span className="font-mono text-xs uppercase tracking-wider text-white/70">Diseño en tiempo real:</span>
        </div>
        <div className="flex items-center gap-2">
          {/* AI background generator option */}
          <button
            onClick={onGenerateImage}
            disabled={isGeneratingImage}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition disabled:bg-indigo-950 disabled:text-indigo-400 flex items-center gap-1.5 cursor-pointer"
            id="ai-generate-button"
          >
            {isGeneratingImage ? (
              <>
                <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                Ilustrando...
              </>
            ) : (
              <>
                <LucideIcons.Sparkles className="w-3.5 h-3.5" />
                Fondo con IA
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white/90 border border-white/10 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            id="print-button"
          >
            <LucideIcons.Printer className="w-3.5 h-3.5" />
            PDF / Imprimir
          </button>
        </div>
      </div>

      {/* Tool panel for manual stamping */}
      <div className="w-full max-w-2xl p-4 mb-6 bg-[#090909]/60 border border-white/10 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <label className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
            {selectedEmojiForStamping 
              ? "👉 ¡Haz clic dentro del afiche para estamparlo!" 
              : "✨ Haz clic en un Sticker para estamparlo:"}
          </label>
          {selectedEmojiForStamping && (
            <button 
              onClick={() => setSelectedEmojiForStamping(null)} 
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {defaultStampingEmojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => setSelectedEmojiForStamping(emoji)}
              className={`text-xl p-2.5 rounded-lg transition-transform hover:scale-125 cursor-pointer active:scale-95 ${
                selectedEmojiForStamping === emoji 
                  ? "bg-indigo-600 ring-2 ring-indigo-400 scale-110" 
                  : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Poster Canvas container with thick physical border */}
      <div className="relative w-full max-w-2xl aspect-[3/4.2] rounded-2xl shadow-2xl relative overflow-hidden select-none border-[12px] border-[#1a1a1a] bg-[#111] flex flex-col" id="poster-print-region">
        {/* Actual poster view */}
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative w-full flex-1 flex flex-col justify-between p-8 md:p-10 transition-all duration-700 overflow-hidden ${getBgStyle(poster.bgPreset, poster.primaryColor)}`}
          style={{
            cursor: selectedEmojiForStamping ? 'cell' : 'default'
          }}
        >
          {/* Subtle overlay texture or AI generated beautiful background image */}
          {poster.aiGeneratedImageUrl ? (
            <div className="absolute inset-0 z-0">
              <img 
                src={poster.aiGeneratedImageUrl} 
                alt="AI Generated Art Poster background" 
                className="w-full h-full object-cover opacity-35 mix-blend-overlay"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-0"></div>
            </div>
          ) : (
            <>
              {/* Retro SVG circles and noise background pattern */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
              <svg className="absolute -top-10 -right-10 w-72 h-72 opacity-20 text-white pointer-events-none z-0" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" />
              </svg>
              <svg className="absolute -bottom-16 -left-16 w-80 h-80 opacity-15 text-white pointer-events-none z-0" fill="currentColor" viewBox="0 0 100 100">
                <polygon points="50,15 90,85 10,85" />
              </svg>
            </>
          )}

          {/* Poster content layered on top */}
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            
            {/* Header: Date and small icon indicator */}
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${poster.accentColor}35` }}>
              <span className="font-mono text-xs uppercase tracking-widest font-bold opacity-80 bg-black/10 px-3 py-1 rounded-full border border-white/5">
                {poster.dateString || "FECHA ACTUAL"}
              </span>
              <div className="opacity-90 transition hover:scale-110" style={{ color: poster.accentColor }}>
                {getIcon(poster.iconName)}
              </div>
            </div>

            {/* Central core: Inspiring illustration frame or title showcase */}
            <div className="flex-1 flex flex-col justify-center items-center text-center my-6">
              
              {/* Main editable Title */}
              <input
                type="text"
                value={poster.celebrationTitle}
                onChange={(e) => handleTextEdit('celebrationTitle', e.target.value)}
                className="w-full bg-transparent text-center font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight focus:outline-none focus:ring-2 focus:ring-white/25 rounded px-2 cursor-edit select-text"
                style={{
                  color: poster.textColor === 'dark' ? '#1c1917' : '#ffffff',
                  textShadow: poster.textColor !== 'dark' ? '0 4px 12px rgba(0,0,0,0.5)' : 'none'
                }}
                title="Haz clic para editar el título directamente"
              />

              {/* Subtitle description */}
              <input
                type="text"
                value={poster.subtitle}
                onChange={(e) => handleTextEdit('subtitle', e.target.value)}
                className="w-full bg-transparent text-center font-serif text-lg md:text-xl italic mt-3 opacity-90 focus:outline-none focus:ring-2 focus:ring-white/25 rounded px-2 select-text"
                style={{
                  color: poster.accentColor
                }}
                title="Haz clic para editar el subtítulo"
              />

              {/* Slogan Banner */}
              <div className="w-full mt-10 md:mt-12 p-5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-lg relative max-w-lg">
                <p className="text-xs uppercase font-mono tracking-widest opacity-60 mb-2">Lema Conmemorativo</p>
                <textarea
                  value={poster.slogan}
                  onChange={(e) => handleTextEdit('slogan', e.target.value)}
                  className="w-full bg-transparent text-center font-sans font-bold text-lg md:text-xl tracking-wide uppercase leading-snug resize-none focus:outline-none focus:ring-2 focus:ring-white/25 rounded p-1 select-text h-14"
                  style={{
                    color: poster.textColor === 'dark' ? '#292524' : '#ffffff'
                  }}
                  title="Haz clic para editar el slogan"
                />
                
                {/* Decorative brackets */}
                <div className="absolute top-2 left-2 text-xl font-serif text-white/20 select-none">“</div>
                <div className="absolute bottom-2 right-2 text-xl font-serif text-white/20 select-none">”</div>
              </div>
            </div>

            {/* Bottom Footer: Dynamic Slogan/Disclaimers */}
            <div className="flex flex-col items-center gap-1 text-center pt-4 border-t" style={{ borderColor: `${poster.accentColor}35` }}>
              <p className="text-[10px] uppercase font-mono tracking-widest opacity-40">Diseñado con Inteligencia Artificial</p>
              <p className="text-xs font-serif font-semibold italic opacity-80">
                "Honremos el valor de cada gran celebración que define nuestra historia"
              </p>
            </div>
          </div>

          {/* RENDER STICKERS FLOATING / DECORATIVE */}
          {poster.stickers.map((st, i) => (
            <div
              key={i}
              onPointerDown={(e) => handleStickerPointerDown(i, e)}
              className="absolute z-20 cursor-move group select-none flex items-center justify-center"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none'
              }}
            >
              {/* Outer border highlighted on hover */}
              <div className="relative p-2 rounded-full hover:bg-white/20 hover:scale-110 active:scale-95 transition-transform">
                <span className={`${st.size || 'text-6xl'} block drop-shadow-md select-none animate-float`}>
                  {st.emoji}
                </span>

                {/* Delete button overlay on sticker hover */}
                <button
                  type="button"
                  onClick={(e) => deleteSticker(i, e)}
                  className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold shadow-md hover:bg-rose-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Aether Gallery High-Contrast bottom bar from Elegant Dark specification */}
        <div className="h-[76px] bg-white text-black px-6 py-3 flex items-center justify-between z-10 select-none border-t border-neutral-200">
          <div>
            <div className="text-[9px] font-extrabold uppercase leading-none text-neutral-500 font-mono tracking-wider">{poster.dateString || "FECHA CONMEMORATIVA"}</div>
            <div className="text-sm font-black leading-tight uppercase text-black font-display tracking-tight mt-1">Aether Archive Spec</div>
          </div>
          <div className="text-right text-[8px] font-mono leading-normal text-neutral-400">
            ENGINE: GEMINI-3.5<br/>
            BLOCK: {poster.iconName.toUpperCase()}-26
          </div>
        </div>

        {/* Loading overlay for image generation */}
        {isGeneratingImage && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-6"></div>
            <h4 className="text-lg font-bold font-display text-white mb-2">Creando Imagen Ilustrativa con IA...</h4>
            <p className="text-sm text-slate-400 max-w-sm">
              Gemini está pintando una obra artística personalizada utilizando la sugerencia de fondo única para este día.
            </p>
            <span className="text-xs text-indigo-400 mt-4 italic">"Transformando palabras en afiches memorables"</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-slate-500 font-mono">
        💡 Sugerencia: Puedes arrastrar los stickers para acomodarlos o hacer clic para editarlos directamente.
      </div>
    </div>
  );
}
