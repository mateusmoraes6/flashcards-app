"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(99,102,241,0.08)]">
        <div className="text-accent">
          <BookIcon />
        </div>
      </div>
      <h3 className="font-display text-xl font-bold text-text mb-2">
        Nenhum flashcard ainda
      </h3>
      <p className="text-text-2 text-sm max-w-xs leading-relaxed mb-6">
        Crie seu primeiro flashcard para começar a aprender vocabulário em outros idiomas.
      </p>
      <Link
        href="/new"
        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium text-sm shadow-[0_0_16px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-200 active:scale-[0.98]"
      >
        Criar flashcard
      </Link>
    </motion.div>
  );
}

function BookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
