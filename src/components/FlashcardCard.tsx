"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Modal from "./Modal";
import FlashcardForm from "./FlashcardForm";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Flashcard, LANGUAGE_FLAGS, MASTERY_LABELS, MASTERY_COLORS } from "@/types/flashcard";

interface Props { 
  card: Flashcard; 
  index: number; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Flashcard>) => void;
}

export default function FlashcardCard({ card, index, onDelete, onUpdate }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const flag = LANGUAGE_FLAGS[card.language] ?? "🌍";
  const mastery = card.masteryLevel ?? 0;
  const masteryColor = MASTERY_COLORS[mastery];
  const reviewed = card.timesReviewed ?? 0;
  const correct = card.timesCorrect ?? 0;
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      layout
      className="group relative bg-surface border border-border hover:border-border-light rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:bg-surface-2"
    >
      {/* Mastery indicator line */}
      <div className="absolute top-0 left-5 right-5 h-0.5 rounded-full" style={{ background: masteryColor, opacity: mastery === 0 ? 0.2 : 0.6 }} />

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-3 text-xs font-medium text-text-2">
          <span>{flag}</span>{card.language}
        </span>
        {card.category && (
          <span className="px-2.5 py-1 rounded-full bg-accent-dim border border-accent/20 text-xs font-medium text-accent">{card.category}</span>
        )}
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium border" style={{ color: masteryColor, borderColor: masteryColor + "40", background: masteryColor + "10" }}>
          {MASTERY_LABELS[mastery]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="font-display text-lg font-bold text-text leading-snug mb-1">{card.front}</p>
        <p className="text-sm text-text-2 leading-relaxed line-clamp-2">{card.back}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-2">
          {reviewed > 0 ? (
            <span className="text-xs text-text-3 font-mono">
              {reviewed}× · {accuracy}% acerto
            </span>
          ) : (
            <span className="text-xs text-text-3">Não revisado</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => setIsEditOpen(true)}
            className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-accent-dim transition-all duration-150" title="Editar">
            <EditIcon />
          </button>
          <button onClick={() => setIsDeleteOpen(true)}
            className="p-1.5 rounded-lg text-text-3 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150" title="Deletar">
            <TrashIcon />
          </button>
        </div>

        {/* Modals */}
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Flashcard">
          <FlashcardForm 
            isEdit 
            initialData={card} 
            onSubmit={(data) => {
              onUpdate(card.id, data);
              setIsEditOpen(false);
            }} 
          />
        </Modal>

        <ConfirmDeleteModal 
          isOpen={isDeleteOpen} 
          onClose={() => setIsDeleteOpen(false)} 
          onConfirm={() => onDelete(card.id)}
          title={card.front}
        />
      </div>
    </motion.div>
  );
}

function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}
