"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  variant?: "header" | "page";
}

export default function NewCardMenu({ variant = "header" }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isHeader = variant === "header";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 font-medium transition-all duration-200 active:scale-95 ${isHeader
            ? "px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg shadow-[0_0_12px_rgba(99,102,241,0.35)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            : "px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
          }`}
      >
        {isHeader ? (
          <>
            <span className="hidden sm:inline">+ Novo</span>
            <span className="sm:hidden">+</span>
          </>
        ) : (
          <>
            <span>+</span> Novo
          </>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute ${isHeader ? "right-0" : "left-0"} top-full mt-2 w-52 bg-surface-2/95 backdrop-blur-xl border border-border shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden z-[100]`}
            >
              <div className="p-1.5 space-y-1">
                <Link
                  href="/new"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-2 hover:text-text hover:bg-white/5 rounded-xl transition-all"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400">✏️</span>
                  <div className="flex flex-col">
                    <span className="font-medium">Criar card</span>
                    <span className="text-[10px] opacity-50">Adicionar um por um</span>
                  </div>
                </Link>
                <Link
                  href="/bulk"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-2 hover:text-text hover:bg-white/5 rounded-xl transition-all"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400">📋</span>
                  <div className="flex flex-col">
                    <span className="font-medium">Importar em lote</span>
                    <span className="text-[10px] opacity-50">Colar texto ou JSON</span>
                  </div>
                </Link>
              </div>
            </motion.div>

          </>
        )}
      </AnimatePresence>
    </div>
  );
}
