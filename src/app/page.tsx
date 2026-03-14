"use client";
import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FlashcardCard from "@/components/FlashcardCard";
import EmptyState from "@/components/EmptyState";
import { useFlashcards } from "@/hooks/useFlashcards";
import { LANGUAGE_FLAGS } from "@/types/flashcard";

type SortKey = "createdAt" | "front" | "mastery" | "accuracy";

export default function HomePage() {
  const { cards, isLoaded, deleteCard, importCards } = useFlashcards();
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [filterMastery, setFilterMastery] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = cards.filter((c) => {
      const matchSearch = !search || c.front.toLowerCase().includes(search.toLowerCase()) || c.back.toLowerCase().includes(search.toLowerCase());
      const matchLang = filterLang === "all" || c.language === filterLang;
      const matchMastery = filterMastery === "all" || String(c.masteryLevel ?? 0) === filterMastery;
      return matchSearch && matchLang && matchMastery;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "front") return a.front.localeCompare(b.front);
      if (sortBy === "mastery") return (b.masteryLevel ?? 0) - (a.masteryLevel ?? 0);
      if (sortBy === "accuracy") {
        const accA = (a.timesReviewed ?? 0) > 0 ? (a.timesCorrect ?? 0) / (a.timesReviewed ?? 1) : -1;
        const accB = (b.timesReviewed ?? 0) > 0 ? (b.timesCorrect ?? 0) / (b.timesReviewed ?? 1) : -1;
        return accA - accB; // worst first
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [cards, search, filterLang, filterMastery, sortBy]);

  const uniqueLanguages = useMemo(() => Array.from(new Set(cards.map((c) => c.language))), [cards]);

  const stats = useMemo(() => {
    const mastered = cards.filter((c) => c.masteryLevel === 3).length;
    const totalReviewed = cards.filter((c) => (c.timesReviewed ?? 0) > 0).length;
    const newCards = cards.filter((c) => (c.timesReviewed ?? 0) === 0).length;
    const byLang = cards.reduce((acc, c) => { acc[c.language] = (acc[c.language] ?? 0) + 1; return acc; }, {} as Record<string, number>);
    const topLang = Object.entries(byLang).sort((a, b) => b[1] - a[1])[0];
    return { total: cards.length, mastered, totalReviewed, newCards, topLang };
  }, [cards]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lexiflash-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const arr = Array.isArray(parsed) ? parsed : [];
        const valid = arr.filter((c: unknown) => {
          if (typeof c !== "object" || c === null) return false;
          const card = c as Record<string, unknown>;
          return typeof card.front === "string" && typeof card.back === "string" && typeof card.language === "string";
        });
        importCards(valid.map((c: Record<string, unknown>) => ({ front: c.front as string, back: c.back as string, language: c.language as string, category: c.category as string | undefined, notes: c.notes as string | undefined })));
        alert(`${valid.length} cards importados com sucesso!`);
      } catch { alert("Arquivo inválido."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const masteryFilters = [
    { val: "all", label: "Todos", color: "#9AA5C4" },
    { val: "0",   label: "Novos",      color: "#5C6A8A" },
    { val: "1",   label: "Aprendendo", color: "#F59E0B" },
    { val: "2",   label: "Familiar",   color: "#818CF8" },
    { val: "3",   label: "Dominados",  color: "#22D3EE" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl font-bold text-text tracking-tight mb-1">Meus Flashcards</h1>
            <p className="text-text-2 text-sm">
              {isLoaded ? `${stats.total} card${stats.total !== 1 ? "s" : ""}` : "Carregando..."}
              {stats.topLang && <span className="ml-2">· {LANGUAGE_FLAGS[stats.topLang[0]]} {stats.topLang[0]} em destaque</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={cards.length === 0}
              title="Exportar como JSON"
              className="px-3 py-1.5 border border-border text-text-3 hover:text-text hover:border-border-light rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5">
              <span>↓</span> Exportar
            </button>
            <button onClick={() => fileRef.current?.click()} title="Importar JSON"
              className="px-3 py-1.5 border border-border text-text-3 hover:text-text hover:border-border-light rounded-lg text-xs font-medium transition-all flex items-center gap-1.5">
              <span>↑</span> Importar
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </motion.div>

        {/* Stats */}
        {isLoaded && cards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard value={stats.total} label="Total" icon="🃏" />
            <StatCard value={stats.newCards} label="Novos" icon="✨" color="#22D3EE" />
            <StatCard value={stats.totalReviewed} label="Revisados" icon="👁️" />
            <StatCard value={stats.mastered} label="Dominados" icon="⭐" color="#F59E0B" />
          </motion.div>
        )}

        {/* Mastery filter chips */}
        {isLoaded && cards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="flex items-center gap-2 mb-4 flex-wrap">
            {masteryFilters.map(({ val, label, color }) => {
              const count = val === "all" ? cards.length : cards.filter((c) => String(c.masteryLevel ?? 0) === val).length;
              return (
                <button key={val} onClick={() => setFilterMastery(val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filterMastery === val ? "border-current bg-current/10" : "border-transparent bg-surface hover:bg-surface-2 text-text-3"}`}
                  style={filterMastery === val ? { color, borderColor: color + "60" } : {}}>
                  {label}{val !== "all" && <span className="ml-1 opacity-60">{count}</span>}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-text-3">Ordenar:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-text focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                <option value="createdAt">Mais recentes</option>
                <option value="front">Alfabética</option>
                <option value="mastery">Domínio</option>
                <option value="accuracy">Mais difíceis</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Search + lang */}
        {isLoaded && cards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Buscar flashcards..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text placeholder-text-3 focus:outline-none focus:border-accent transition-colors" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text transition-colors">✕</button>
              )}
            </div>
            <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}
              className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
              <option value="all">Todos os idiomas</option>
              {uniqueLanguages.map((l) => <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {l}</option>)}
            </select>
          </motion.div>
        )}

        {/* Results count */}
        {isLoaded && cards.length > 0 && filtered.length !== cards.length && (
          <p className="text-xs text-text-3 mb-4">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        )}

        {/* Grid */}
        {!isLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer-line" />)}
          </div>
        ) : cards.length === 0 ? <EmptyState /> :
          filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="text-text-2 mb-3">Nenhum resultado encontrado</p>
              <button onClick={() => { setSearch(""); setFilterLang("all"); setFilterMastery("all"); }}
                className="text-xs text-accent hover:underline">Limpar filtros</button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((card, i) => <FlashcardCard key={card.id} card={card} index={i} onDelete={deleteCard} />)}
              </div>
            </AnimatePresence>
          )
        }

        {/* CTA */}
        {isLoaded && cards.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 p-6 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display text-base font-bold text-text mb-0.5">Pronto para revisar?</p>
              <p className="text-sm text-text-2">{stats.newCards} novos · {stats.total - stats.mastered} ainda não dominados</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/stats" className="px-4 py-2 border border-border text-text-2 hover:text-text rounded-xl text-sm font-medium transition-all">Ver stats</Link>
              <Link href="/review" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium text-sm shadow-[0_0_16px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98]">
                Iniciar revisão →
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ value, label, icon, color }: { value: number; label: string; icon: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-display text-2xl font-bold leading-none mb-0.5" style={{ color: color ?? "var(--text)" }}>{value}</p>
        <p className="text-xs text-text-2">{label}</p>
      </div>
    </div>
  );
}
