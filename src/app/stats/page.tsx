"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useFlashcards } from "@/hooks/useFlashcards";
import { MASTERY_LABELS, MASTERY_COLORS, LANGUAGE_FLAGS } from "@/types/flashcard";

export default function StatsPage() {
  const { cards, sessions, isLoaded } = useFlashcards();

  const stats = useMemo(() => {
    const totalCards = cards.length;
    const reviewed = cards.filter((c) => (c.timesReviewed ?? 0) > 0).length;
    const mastered = cards.filter((c) => c.masteryLevel === 3).length;
    const totalCorrect = sessions.reduce((a, s) => a + s.correct, 0);
    const totalAnswered = sessions.reduce((a, s) => a + s.total, 0);
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const byMastery = [0, 1, 2, 3].map((level) => ({
      level,
      label: MASTERY_LABELS[level],
      color: MASTERY_COLORS[level],
      count: cards.filter((c) => (c.masteryLevel ?? 0) === level).length,
    }));

    const byLanguage = Array.from(
      cards.reduce((acc, c) => {
        acc.set(c.language, (acc.get(c.language) ?? 0) + 1);
        return acc;
      }, new Map<string, number>())
    )
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count);

    const last7Sessions = sessions.slice(0, 7).reverse();
    const streak = calcStreak(sessions);

    return { totalCards, reviewed, mastered, accuracy, byMastery, byLanguage, last7Sessions, streak, totalAnswered };
  }, [cards, sessions]);

  function calcStreak(sessions: { date: string }[]) {
    if (!sessions.length) return 0;
    const days = sessions.map((s) => new Date(s.date).toDateString());
    const unique = [...new Set(days)];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (unique.includes(d.toDateString())) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  const maxSession = Math.max(...stats.last7Sessions.map((s) => s.total), 1);

  return (
    <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">Estatísticas</p>
          <h1 className="font-display text-4xl font-bold text-text tracking-tight">Seu progresso</h1>
        </motion.div>

        {/* Top stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <BigStat value={stats.totalCards} label="Total de cards" emoji="🃏" />
          <BigStat value={`${stats.accuracy}%`} label="Precisão geral" emoji="🎯" />
          <BigStat value={stats.mastered} label="Dominados" emoji="⭐" />
          <BigStat value={`${stats.streak}d`} label="Sequência" emoji="🔥" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Mastery breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-text mb-4">Nível de domínio</h2>
            <div className="space-y-3">
              {stats.byMastery.map(({ level, label, color, count }) => {
                const pct = stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0;
                return (
                  <div key={level}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium" style={{ color }}>{label}</span>
                      <span className="text-text-3">{count} cards · {Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + level * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* By language */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-display text-base font-bold text-text mb-4">Por idioma</h2>
            {stats.byLanguage.length === 0 ? (
              <p className="text-text-3 text-sm">Nenhum dado ainda</p>
            ) : (
              <div className="space-y-2.5">
                {stats.byLanguage.map(({ lang, count }) => {
                  const pct = stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0;
                  return (
                    <div key={lang} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{LANGUAGE_FLAGS[lang] ?? "🌍"}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-2 font-medium">{lang}</span>
                          <span className="text-text-3">{count}</span>
                        </div>
                        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                            className="h-full rounded-full bg-accent"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Session history chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface border border-border rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-bold text-text">Histórico de sessões</h2>
            <span className="text-xs text-text-3">{sessions.length} sessões</span>
          </div>
          {stats.last7Sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-text-3 text-sm mb-3">Nenhuma sessão registrada ainda</p>
              <Link href="/review" className="text-accent text-sm hover:underline">Iniciar revisão →</Link>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-28">
              {stats.last7Sessions.map((s, i) => {
                const h = Math.max((s.total / maxSession) * 100, 8);
                const correctPct = s.total > 0 ? s.correct / s.total : 0;
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="relative w-full flex flex-col justify-end" style={{ height: 96 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
                        className="w-full rounded-t-lg relative overflow-hidden cursor-default"
                        style={{ background: `linear-gradient(to top, #6366F1, #818CF8)` }}
                      >
                        <div className="absolute inset-0 bg-white/10" style={{ height: `${correctPct * 100}%`, top: "auto" }} />
                      </motion.div>
                    </div>
                    <span className="text-[10px] text-text-3 font-mono">
                      {new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent sessions list */}
        {sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display text-base font-bold text-text">Últimas sessões</h2>
            </div>
            <div className="divide-y divide-border">
              {sessions.slice(0, 8).map((s) => {
                const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                const mins = Math.round(s.durationMs / 60000);
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-text font-medium">{s.total} cards revisados</p>
                      <p className="text-xs text-text-3">
                        {new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {mins > 0 && ` · ${mins} min`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-3">{s.correct}/{s.total} corretos</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${acc >= 80 ? "bg-cyan-500/10 text-cyan-400" : acc >= 50 ? "bg-accent/10 text-accent" : "bg-amber-500/10 text-amber-400"}`}>
                        {acc}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function BigStat({ value, label, emoji }: { value: string | number; label: string; emoji: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="font-display text-3xl font-bold text-text leading-none mb-1">{value}</p>
      <p className="text-xs text-text-2">{label}</p>
    </div>
  );
}
