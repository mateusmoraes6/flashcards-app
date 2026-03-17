"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Flashcard, LANGUAGE_FLAGS, MASTERY_LABELS, MASTERY_COLORS } from "@/types/flashcard";

type ReviewMode = "all" | "weak" | "shuffle" | "new";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(cards: Flashcard[], mode: ReviewMode): Flashcard[] {
  switch (mode) {
    case "weak":
      return [...cards]
        .filter((c) => (c.timesReviewed ?? 0) > 0)
        .sort((a, b) => {
          const accA = (a.timesCorrect ?? 0) / Math.max(a.timesReviewed ?? 1, 1);
          const accB = (b.timesCorrect ?? 0) / Math.max(b.timesReviewed ?? 1, 1);
          return accA - accB;
        })
        .slice(0, 20);
    case "new":
      return cards.filter((c) => (c.timesReviewed ?? 0) === 0);
    case "shuffle":
      return shuffleArray(cards);
    default:
      return [...cards];
  }
}

const MODE_CONFIG: Record<ReviewMode, { label: string; icon: string; description: string; color: string }> = {
  all:     { label: "Todos",     icon: "🃏", description: "Revise todos os cards em ordem",         color: "#6366F1" },
  shuffle: { label: "Aleatório", icon: "🔀", description: "Ordem embaralhada aleatoriamente",        color: "#818CF8" },
  weak:    { label: "Difíceis",  icon: "💪", description: "Foco nos cards com menor taxa de acerto", color: "#F59E0B" },
  new:     { label: "Novos",     icon: "✨", description: "Apenas cards ainda não revisados",        color: "#22D3EE" },
};

export default function ReviewPage() {
  const { cards, isLoaded, recordAnswer, saveSession } = useFlashcards();
  const [mode, setMode] = useState<ReviewMode | null>(null); // null = mode selector
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completed, setCompleted] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<{ id: string; correct: boolean }[]>([]);
  const [answered, setAnswered] = useState(false);
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    if (isLoaded && deck.length === 0 && mode !== null) {
      const d = buildDeck(cards, mode);
      setDeck(d);
    }
  }, [isLoaded, cards, mode, deck.length]);

  const startMode = (m: ReviewMode) => {
    const d = buildDeck(cards, m);
    setDeck(d);
    setMode(m);
    setIndex(0);
    setFlipped(false);
    setAnswered(false);
    setCompleted(false);
    setSessionAnswers([]);
    sessionStartTime.current = Date.now();
  };

  const current = deck[index];
  const total = deck.length;
  const progress = total > 0 ? (index / total) * 100 : 0;
  const sessionCorrect = sessionAnswers.filter((a) => a.correct).length;

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      const duration = Date.now() - sessionStartTime.current;
      saveSession(total, sessionAnswers.filter((a) => a.correct).length, duration, mode ?? "all");
      setCompleted(true);
      return;
    }
    setDirection(1);
    setFlipped(false);
    setAnswered(false);
    setTimeout(() => setIndex((i) => i + 1), 60);
  }, [index, total, sessionAnswers, saveSession, mode]);

  const goPrev = useCallback(() => {
    if (index <= 0) return;
    setDirection(-1);
    setFlipped(false);
    setAnswered(false);
    setTimeout(() => setIndex((i) => i - 1), 60);
  }, [index]);

  const handleAnswer = useCallback((correct: boolean) => {
    if (!current || answered) return;
    recordAnswer(current.id, correct);
    setSessionAnswers((prev) => [...prev, { id: current.id, correct }]);
    setAnswered(true);
    setTimeout(() => goNext(), 380);
  }, [current, recordAnswer, goNext, answered]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (mode === null) return;
      if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); if (!answered) setFlipped((f) => !f); }
      if (e.key === "ArrowRight" && flipped && !answered) handleAnswer(true);
      if (e.key === "ArrowLeft" && flipped && !answered) handleAnswer(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipped, answered, goNext, handleAnswer, mode]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-96 h-64 rounded-3xl shimmer-line" />
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-5xl mb-4">🃏</div>
            <h2 className="font-display text-2xl font-bold text-text mb-2">Nenhum flashcard</h2>
            <p className="text-text-2 mb-6">Crie alguns flashcards antes de revisar.</p>
            <Link href="/new" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium text-sm shadow-[0_0_16px_rgba(99,102,241,0.35)] transition-all">Criar flashcard</Link>
          </div>
        </div>
      </div>
    );
  }

  // Mode selector screen
  if (mode === null) {
    const newCount = cards.filter((c) => (c.timesReviewed ?? 0) === 0).length;
    const weakCount = Math.min(20, cards.filter((c) => (c.timesReviewed ?? 0) > 0).length);

    return (
      <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="text-center mb-8">
              <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">Modo de revisão</p>
              <h1 className="font-display text-3xl font-bold text-text">Como quer estudar?</h1>
            </div>
            <div className="space-y-3">
              {(Object.entries(MODE_CONFIG) as [ReviewMode, typeof MODE_CONFIG[ReviewMode]][]).map(([key, cfg], i) => {
                const count = key === "new" ? newCount : key === "weak" ? weakCount : cards.length;
                const disabled = count === 0;
                return (
                  <motion.button key={key} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={() => !disabled && startMode(key)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 group ${
                      disabled ? "border-border opacity-40 cursor-not-allowed" :
                      "border-border hover:border-[var(--c)] hover:bg-[var(--c)/5] cursor-pointer active:scale-[0.98]"
                    }`}
                    style={{ "--c": cfg.color } as React.CSSProperties}>
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="flex-1">
                      <p className="font-display font-bold text-text text-base">{cfg.label}</p>
                      <p className="text-xs text-text-3">{cfg.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold" style={{ color: disabled ? undefined : cfg.color }}>{count}</span>
                      <p className="text-[10px] text-text-3">cards</p>
                    </div>
                    {!disabled && <ArrowRight />}
                  </motion.button>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-text-3 hover:text-text-2 transition-colors">← Voltar ao dashboard</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (completed) {
    return <CompletedScreen total={total} correct={sessionCorrect} mode={mode} onBack={() => setMode(null)} onRetry={() => startMode(mode)} answers={sessionAnswers} deck={deck} />;
  }

  if (!current || total === 0) {
    return (
      <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-4xl mb-4">{MODE_CONFIG[mode].icon}</div>
            <h2 className="font-display text-xl font-bold text-text mb-2">Nenhum card neste modo</h2>
            <button onClick={() => setMode(null)} className="mt-4 text-accent hover:underline text-sm">← Escolher outro modo</button>
          </div>
        </div>
      </div>
    );
  }

  const flag = LANGUAGE_FLAGS[current.language] ?? "🌍";
  const mastery = current.masteryLevel ?? 0;
  const modeColor = MODE_CONFIG[mode].color;

  return (
    <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-8 pb-16 flex flex-col min-h-[calc(100vh-80px)]">
        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMode(null)} className="p-1.5 rounded-lg border border-border text-text-3 hover:text-text hover:border-border-light transition-all" title="Mudar modo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{MODE_CONFIG[mode].icon}</span>
                <span className="text-xs font-mono text-text-3">{MODE_CONFIG[mode].label}</span>
              </div>
              <p className="font-display text-base font-bold text-text leading-tight">
                {index + 1} <span className="text-text-3 font-normal">/ {total}</span>
              </p>
            </div>
          </div>
          {sessionAnswers.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium">
              <span className="text-cyan-400">✓ {sessionCorrect}</span>
              <span className="text-text-3">·</span>
              <span className="text-red-400">✗ {sessionAnswers.length - sessionCorrect}</span>
            </div>
          )}
        </motion.div>

        {/* Progress */}
        <div className="h-1 bg-surface-3 rounded-full mb-8 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(to right, ${modeColor}99, ${modeColor})` }}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>

        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: direction * 50, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -direction * 50, scale: 0.97 }}
              transition={{ duration: 0.22 }} className="w-full">
              <div className="card-scene" style={{ height: 320 }}>
                <div className={`card-inner cursor-pointer select-none ${flipped ? "flipped" : ""}`}
                  style={{ height: 320 }} onClick={() => !answered && setFlipped(!flipped)}>
                  {/* Front */}
                  <div className="card-face absolute inset-0 rounded-3xl border border-border bg-surface-2 flex flex-col items-center justify-center p-10 shadow-[0_12px_60px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-4 left-5 flex items-center gap-2">
                      <span>{flag}</span><span className="text-xs font-mono text-text-3">{current.language}</span>
                    </div>
                    <div className="absolute top-4 right-5">
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: MASTERY_COLORS[mastery], borderColor: MASTERY_COLORS[mastery] + "40", background: MASTERY_COLORS[mastery] + "10" }}>
                        {MASTERY_LABELS[mastery]}
                      </span>
                    </div>
                    <p className="font-display text-4xl font-bold text-text text-center leading-tight mb-3">{current.front}</p>
                    {current.category && <span className="text-xs text-text-3 bg-surface-3 px-2.5 py-1 rounded-full">{current.category}</span>}
                    <p className="text-xs text-text-3 mt-5">Espaço para revelar</p>
                  </div>
                  {/* Back */}
                  <div className="card-face card-face-back absolute inset-0 rounded-3xl border bg-surface-2 flex flex-col items-center justify-center p-10 shadow-[0_12px_60px_rgba(0,0,0,0.3)]"
                    style={{ borderColor: modeColor + "50" }}>
                    <div className="absolute top-4 left-5"><span className="text-xs font-mono text-text-3">tradução</span></div>
                    <p className="font-display text-3xl font-bold text-center leading-snug mb-3" style={{ color: modeColor === "#6366F1" || modeColor === "#818CF8" ? "#22D3EE" : modeColor }}>{current.back}</p>
                    {current.notes && (
                      <p className="text-xs text-text-3 italic text-center mt-1 px-4 py-2 bg-surface-3 rounded-xl max-w-xs">"{current.notes}"</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <AnimatePresence>
            {flipped && !answered ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-4 mt-8 w-full max-w-sm">
                <button onClick={() => handleAnswer(false)}
                  className="flex-1 flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all active:scale-[0.97] group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">✗</span>
                  <span className="text-xs font-medium">Errei</span>
                  <span className="text-[10px] opacity-40">← seta</span>
                </button>
                <button onClick={() => setFlipped(false)} className="px-3 py-4 rounded-2xl border border-border text-text-3 hover:text-text transition-all text-xs">Voltar</button>
                <button onClick={() => handleAnswer(true)}
                  className="flex-1 flex flex-col items-center gap-1.5 px-4 py-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all active:scale-[0.97] group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">✓</span>
                  <span className="text-xs font-medium">Acertei</span>
                  <span className="text-[10px] opacity-40">seta →</span>
                </button>
              </motion.div>
            ) : answered ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-8 text-sm text-text-2">
                <span className="animate-spin text-accent text-lg">◌</span> Próximo...
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mt-8">
                <button onClick={goPrev} disabled={index === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm text-text-2 hover:text-text hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.97]">
                  <ArrowLeft /> Anterior
                </button>
                <button onClick={() => setFlipped(true)}
                  className="px-6 py-2.5 text-white rounded-xl text-sm font-medium shadow-lg transition-all active:scale-[0.97]"
                  style={{ background: modeColor, boxShadow: `0 0 20px ${modeColor}55` }}>
                  Revelar verso
                </button>
                <button onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm text-text-2 hover:text-text hover:border-border-light transition-all active:scale-[0.97]">
                  {index >= total - 1 ? "Concluir" : "Pular"} <ArrowRight />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dot progress */}
          <div className="flex gap-1.5 mt-6 flex-wrap justify-center max-w-sm">
            {deck.map((_, i) => {
              const ans = sessionAnswers[i];
              return (
                <div key={i} className={`rounded-full transition-all duration-200 ${
                  i === index ? "w-5 h-2" :
                  ans ? (ans.correct ? "w-2 h-2 bg-cyan-400" : "w-2 h-2 bg-red-400") :
                  "w-2 h-2 bg-surface-3"
                }`} style={i === index ? { width: 20, height: 8, backgroundColor: modeColor } : {}} />
              );
            })}
          </div>

          <p className="text-[11px] text-text-3 mt-4 font-mono opacity-60">espaço · revelar &nbsp;|&nbsp; ← / → · responder</p>
        </div>
      </main>
    </div>
  );
}

function CompletedScreen({ total, correct, mode, onBack, onRetry, answers, deck }: {
  total: number; correct: number; mode: ReviewMode; onBack: () => void; onRetry: () => void;
  answers: { id: string; correct: boolean }[]; deck: Flashcard[];
}) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrongCards = answers.filter((a) => !a.correct).map((a) => deck.find((c) => c.id === a.id)).filter(Boolean) as Flashcard[];

  useEffect(() => {
    if (accuracy >= 80) {
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#6366F1", "#22D3EE", "#818CF8", "#ffffff"] });
      });
    }
  }, [accuracy]);

  return (
    <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }} className="text-6xl mb-6 text-center">
            {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}
          </motion.div>
          <div className="text-center mb-6">
            <h2 className="font-display text-3xl font-bold text-text mb-1">Sessão concluída!</h2>
            <p className="text-text-2">{total} cards · modo <span className="text-text font-medium">{MODE_CONFIG[mode].label}</span></p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 mb-5">
            <div className="flex justify-around text-center mb-5">
              <div><p className="font-display text-4xl font-bold text-cyan-400">{correct}</p><p className="text-xs text-text-3 mt-0.5">Acertos</p></div>
              <div className="w-px bg-border" />
              <div><p className="font-display text-4xl font-bold text-text">{accuracy}%</p><p className="text-xs text-text-3 mt-0.5">Precisão</p></div>
              <div className="w-px bg-border" />
              <div><p className="font-display text-4xl font-bold text-red-400">{total - correct}</p><p className="text-xs text-text-3 mt-0.5">Erros</p></div>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent to-cyan-400 rounded-full" />
            </div>
          </div>

          {wrongCards.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 mb-5">
              <p className="text-xs font-mono text-text-3 uppercase tracking-widest mb-3">Para revisar depois</p>
              <div className="flex flex-wrap gap-2">
                {wrongCards.map((c) => (
                  <span key={c.id} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium">{c.front}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button onClick={onBack} className="px-3 py-3 border border-border text-text-2 hover:text-text hover:border-border-light rounded-xl text-xs font-medium transition-all">← Modos</button>
            <button onClick={onRetry} className="px-3 py-3 border border-border text-text-2 hover:text-text hover:border-border-light rounded-xl text-xs font-medium transition-all">Repetir</button>
            <Link href="/stats" className="px-3 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-medium text-center shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all">Ver stats</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ArrowLeft() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function ArrowRight() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
