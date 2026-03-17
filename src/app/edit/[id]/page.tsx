"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FlashcardForm from "@/components/FlashcardForm";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Flashcard } from "@/types/flashcard";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getCard, updateCard, isLoaded } = useFlashcards();
  const card = getCard(id);

  if (!isLoaded) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-xl mx-auto px-6 pt-24">
          <div className="h-8 w-48 rounded-lg shimmer-line mb-8" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl shimmer-line" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-2 mb-4">Flashcard não encontrado</p>
          <button
            onClick={() => router.push("/")}
            className="text-accent hover:underline text-sm"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: Omit<Flashcard, "id" | "createdAt">) => {
    updateCard(id, data);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">
            Editar flashcard
          </p>
          <h1 className="font-display text-3xl font-bold text-text tracking-tight">
            {card.front}
          </h1>
        </motion.div>
        <FlashcardForm initialData={card} onSubmit={handleSubmit} isEdit />
      </main>
    </div>
  );
}
