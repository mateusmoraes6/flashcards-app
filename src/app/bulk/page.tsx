"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useFlashcards } from "@/hooks/useFlashcards";
import { LANGUAGES, LANGUAGE_FLAGS } from "@/types/flashcard";

interface ParsedRow { front: string; back: string; notes?: string; valid: boolean; error?: string; }

function parseText(raw: string): ParsedRow[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    // Support: "front | back" or "front | back | notes" or "front - back"
    const parts = line.includes("|") ? line.split("|").map((p) => p.trim()) : line.split(/\s+-\s+/).map((p) => p.trim());
    if (parts.length < 2) return { front: line, back: "", valid: false, error: "Precisa de separador | ou —" };
    const [front, back, notes] = parts;
    if (!front || !back) return { front, back, valid: false, error: "Frente ou verso vazio" };
    return { front, back, notes, valid: true };
  });
}

export default function BulkPage() {
  const router = useRouter();
  const { addCards, categories, languages } = useFlashcards();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(languages[0]?.name || "Inglês");
  const [category, setCategory] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "done">("input");
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleParse = () => {
    const rows = parseText(text);
    setParsed(rows);
    setSelected(new Set(rows.map((_, i) => i).filter((i) => rows[i].valid)));
    setStep("preview");
  };

  const handleImport = () => {
    const toAdd = parsed.filter((_, i) => selected.has(i) && parsed[i].valid);
    addCards(toAdd.map((r) => ({ front: r.front, back: r.back, notes: r.notes, language, category: category || undefined })));
    setStep("done");
  };

  const toggleRow = (i: number) => {
    const s = new Set(selected);
    if (s.has(i)) s.delete(i); else s.add(i);
    setSelected(s);
  };

  const validSelected = parsed.filter((_, i) => selected.has(i) && parsed[i].valid).length;

  return (
    <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">Importação em lote</p>
          <h1 className="font-display text-3xl font-bold text-text tracking-tight">Adicionar vários cards</h1>
          <p className="text-text-2 text-sm mt-1">Cole uma lista de palavras e traduções separadas por <code className="text-accent font-mono">|</code></p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
              {/* Format guide */}
              <div className="bg-surface border border-border rounded-2xl p-4 text-sm">
                <p className="text-text-2 font-medium mb-2">Formato aceito (uma por linha):</p>
                <div className="font-mono text-xs text-text-3 space-y-1 bg-surface-3 rounded-xl p-3">
                  <p><span className="text-text">Hello</span> <span className="text-accent">|</span> <span className="text-accent-2">Olá</span></p>
                  <p><span className="text-text">Goodbye</span> <span className="text-accent">|</span> <span className="text-accent-2">Tchau</span> <span className="text-accent">|</span> <span className="text-text-3">See you later</span></p>
                  <p><span className="text-text">Thank you</span> <span className="text-accent">|</span> <span className="text-accent-2">Obrigado</span></p>
                </div>
                <p className="text-text-3 text-xs mt-2">3ª coluna opcional = exemplo de uso</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">Idioma</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors appearance-none">
                    {languages.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.flag} {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors appearance-none">
                    <option value="">— Nenhuma —</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Rest of the component remains the same */}
              <div>
                <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">Lista de palavras</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={"Hello | Olá\nGoodbye | Tchau | See you later!\nThank you | Obrigado"}
                  rows={10}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text placeholder-text-3 text-sm font-mono focus:outline-none focus:border-accent transition-colors resize-none"
                />
                <p className="text-xs text-text-3 mt-1">{text.split("\n").filter((l) => l.trim()).length} linhas</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => router.back()} className="px-5 py-3 border border-border rounded-xl text-text-2 hover:text-text transition-all text-sm">← Voltar</button>
                <button onClick={handleParse} disabled={!text.trim()}
                  className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium text-sm shadow-[0_0_16px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Pré-visualizar cards →
                </button>
              </div>
            </motion.div>
          )}

          {step === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-2">{validSelected} de {parsed.length} cards selecionados</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(parsed.map((_, i) => i).filter((i) => parsed[i].valid)))}
                    className="text-xs text-accent hover:underline">Selecionar todos</button>
                  <span className="text-text-3">·</span>
                  <button onClick={() => setSelected(new Set())} className="text-xs text-text-3 hover:text-text-2 hover:underline">Nenhum</button>
                </div>
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 -mr-1">
                {parsed.map((row, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                    onClick={() => row.valid && toggleRow(i)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      !row.valid ? "border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed" :
                      selected.has(i) ? "border-accent/40 bg-accent-dim cursor-pointer" : "border-border bg-surface cursor-pointer hover:border-border-light"
                    }`}>
                    <div className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                      !row.valid ? "border-red-500/40" :
                      selected.has(i) ? "border-accent bg-accent" : "border-border-light"
                    }`}>
                      {selected.has(i) && <span className="text-white text-[10px]">✓</span>}
                      {!row.valid && <span className="text-red-400 text-[10px]">✗</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text truncate">{row.front}</span>
                        <span className="text-text-3">→</span>
                        <span className="text-sm text-text-2 truncate">{row.back}</span>
                      </div>
                      {row.notes && <p className="text-xs text-text-3 italic mt-0.5 truncate">{row.notes}</p>}
                      {row.error && <p className="text-xs text-red-400 mt-0.5">{row.error}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("input")} className="px-5 py-3 border border-border rounded-xl text-text-2 hover:text-text transition-all text-sm">← Editar</button>
                <button onClick={handleImport} disabled={validSelected === 0}
                  className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium text-sm shadow-[0_0_16px_rgba(99,102,241,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Importar {validSelected} cards
                </button>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="text-6xl mb-5">🎉</motion.div>
              <h2 className="font-display text-2xl font-bold text-text mb-2">Cards importados!</h2>
              <p className="text-text-2 mb-8">{validSelected} flashcards adicionados com sucesso.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setStep("input"); setText(""); setParsed([]); }} className="px-5 py-2.5 border border-border text-text-2 hover:text-text rounded-xl text-sm font-medium transition-all">Importar mais</button>
                <a href="/" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-medium shadow-[0_0_16px_rgba(99,102,241,0.35)] transition-all">Ver dashboard →</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

