import React from 'react';
import { Award, BookOpen, Lightbulb, Calendar, Quote, Sparkles } from 'lucide-react';
import { PosterData } from '../types';

interface CelebrationDetailsProps {
  poster: PosterData;
}

export default function CelebrationDetails({ poster }: CelebrationDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full" id="details-section">
      
      {/* Editorial History / Story box */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white/80 tracking-wide font-display text-xs uppercase font-mono">Significado de la Conmemoración</h4>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight mb-2 uppercase">
            ¿Por qué se celebra el {poster.celebrationTitle}?
          </h3>
          
          <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6 font-sans">
            {poster.description || "Este es un día especial consagrado para reflexionar sobre los hitos esenciales de nuestra cultura, promoviendo el conocimiento y sembrando ideas creativas para toda la posteridad mundial."}
          </p>
        </div>

        {/* Dynamic Quote Slogan */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex gap-3 italic text-xs text-white/50">
          <Quote className="w-8 h-8 text-indigo-400 opacity-60 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="leading-relaxed">"{poster.slogan}"</p>
            <span className="font-mono text-[9px] uppercase text-indigo-400 not-italic tracking-wider font-extrabold">— LEMA ARCHIVADO</span>
          </div>
        </div>
      </div>

      {/* Facts & Celebration Mode */}
      <div className="flex flex-col gap-6">
        
        {/* Historical Facts */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <Award className="w-5 h-5" />
            <h4 className="font-bold text-white/80 tracking-wide font-display text-xs uppercase font-mono">3 Datos Curiosos o Históricos</h4>
          </div>

          <ul className="space-y-3">
            {poster.historicalFacts && poster.historicalFacts.length > 0 ? (
              poster.historicalFacts.map((fact, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-white/70 items-start">
                  <span className="flex h-5 w-5 rounded-md bg-[#151515] border border-white/10 font-bold font-mono text-[11px] items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{fact}</p>
                </li>
              ))
            ) : (
              <>
                <li className="flex gap-3 text-sm text-white/70">
                  <span className="text-indigo-400">✦</span>
                  <p>Inspirado en movimientos científicos y humanitarios internacionales.</p>
                </li>
                <li className="flex gap-3 text-sm text-white/70">
                  <span className="text-indigo-400">✦</span>
                  <p>Inaugurado oficialmente el siglo pasado para generar impacto duradero.</p>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Ideas to Celebrate today */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Lightbulb className="w-5 h-5 text-purple-400 animate-pulse" />
            <h4 className="font-bold text-white/80 tracking-wide font-display text-xs uppercase font-mono">¿Cómo celebrarlo hoy?</h4>
          </div>

          <ul className="space-y-3">
            {poster.celebrationIdeas && poster.celebrationIdeas.length > 0 ? (
              poster.celebrationIdeas.map((idea, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-white/70 items-start">
                  <span className="flex h-5 w-5 bg-purple-500/10 border border-purple-500/20 rounded-md text-purple-400 font-bold font-mono text-[11px] items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <p className="leading-relaxed">{idea}</p>
                </li>
              ))
            ) : (
              <>
                <li className="flex gap-3 text-sm text-white/70">
                  <span className="text-purple-400">✔</span>
                  <p>Comparte este afiche interactivo con tus seres queridos para crear conciencia.</p>
                </li>
              </>
            )}
          </ul>
        </div>

      </div>

    </div>
  );
}
