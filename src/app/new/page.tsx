"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FlashcardForm from "@/components/FlashcardForm";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Flashcard } from "@/types/flashcard";

export default function NewPage() {
  const { addCard } = useFlashcards();

  const handleSubmit = (data: Omit<Flashcard, "id" | "createdAt">) => {
    addCard(data);
  };

  return (
    <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">
            Novo flashcard
          </p>
          <h1 className="font-display text-3xl font-bold text-text tracking-tight">
            Adicionar palavra
          </h1>
          <p className="text-text-2 text-sm mt-1">
            Clique no card de prévia para ver a virada antes de salvar.
          </p>
        </motion.div>
        <FlashcardForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
