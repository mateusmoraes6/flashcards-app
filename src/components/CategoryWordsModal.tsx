"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard, Category, LANGUAGE_FLAGS } from "@/types/flashcard";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  cards: Flashcard[];
}

export default function CategoryWordsModal({ isOpen, onClose, category, cards }: Props) {
  const [sortBy, setSortBy] = useState<"recent" | "alpha">("recent");

  const filteredCards = useMemo(() => {
    const filtered = cards.filter((c) => c.category === category.name);
    
    if (sortBy === "alpha") {
      return [...filtered].sort((a, b) => a.front.localeCompare(b.front));
    }
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cards, category.name, sortBy]);

  const speak = (text: string, lang: string) => {
    if (!window.speechSynthesis) return;
    
    // Attempt to match language
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Basic mapping for common languages
    const langMap: Record<string, string> = {
      "Inglês": "en-US",
      "Espanhol": "es-ES",
      "Francês": "fr-FR",
      "Alemão": "de-DE",
      "Japonês": "ja-JP",
      "Italiano": "it-IT",
      "Português": "pt-BR"
    };

    utterance.lang = langMap[lang] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Palavras em ${category.name}`}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Header/Stats inspired by Duo */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text">{filteredCards.length}</span>
            <span className="text-sm font-medium text-text-3 uppercase tracking-wider">palavras</span>
          </div>
          
          <button 
            onClick={() => setSortBy(sortBy === "recent" ? "alpha" : "recent")}
            className="text-[11px] font-bold text-accent uppercase tracking-widest hover:text-accent-hover transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-accent/10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>
            </svg>
            {sortBy === "recent" ? "Recentes" : "Alfabética"}
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📂
              </div>
              <p className="text-text-2 font-medium">Nenhuma palavra nesta categoria</p>
              <p className="text-text-3 text-sm mt-1">Adicione novos cards selecionando "{category.name}" para vê-los aqui.</p>
            </div>
          ) : (
            <div className="border border-border/50 rounded-2xl overflow-hidden bg-surface-2/30">
              {filteredCards.map((card, idx) => (
                <div 
                  key={card.id}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-surface-3/50 ${
                    idx !== filteredCards.length - 1 ? "border-base border-b border-border/40" : ""
                  }`}
                >
                  {/* Audio Button */}
                  <button 
                    onClick={() => speak(card.front, card.language)}
                    className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center hover:bg-accent/20 active:scale-90 transition-all shadow-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  </button>

                  {/* Word Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-text leading-tight truncate">
                      {card.front}
                    </h4>
                    <p className="text-sm text-text-3 font-medium mt-0.5 truncate italic">
                      {card.back}
                    </p>
                  </div>

                  {/* Lang Badge (Optional but useful) */}
                  <div className="text-xl opacity-60 grayscale hover:grayscale-0 transition-all cursor-default" title={card.language}>
                    {LANGUAGE_FLAGS[card.language] || "🌍"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-text-3 font-medium uppercase tracking-widest">
          <span>{category.name}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
            <span>CATEGORIA</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
