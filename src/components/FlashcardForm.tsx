"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard, LANGUAGES, CATEGORIES, LANGUAGE_FLAGS } from "@/types/flashcard";

interface Props {
  initialData?: Partial<Flashcard>;
  onSubmit: (data: Omit<Flashcard, "id" | "createdAt">) => void;
  isEdit?: boolean;
}

export default function FlashcardForm({ initialData, onSubmit, isEdit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    front: initialData?.front ?? "",
    back: initialData?.back ?? "",
    language: initialData?.language ?? "Inglês",
    category: initialData?.category ?? "",
    notes: initialData?.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNotes, setShowNotes] = useState(!!(initialData?.notes));
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.front.trim()) e.front = "A palavra é obrigatória";
    if (!form.back.trim()) e.back = "A tradução é obrigatória";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      front: form.front.trim(),
      back: form.back.trim(),
      language: form.language,
      category: form.category || undefined,
      notes: form.notes.trim() || undefined,
    });
    if (!isEdit) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setForm({ front: "", back: "", language: form.language, category: form.category, notes: "" });
        setIsFlipped(false);
      }, 1200);
    } else {
      router.push("/");
    }
  };

  const flag = LANGUAGE_FLAGS[form.language] ?? "🌍";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-xl mx-auto">
      {/* Preview card */}
      <div className="mb-8 card-scene" style={{ height: 200 }}>
        <div className={`card-inner cursor-pointer ${isFlipped ? "flipped" : ""}`} style={{ height: 200 }} onClick={() => setIsFlipped(!isFlipped)}>
          {/* Front */}
          <div className="card-face absolute inset-0 rounded-2xl border border-border bg-surface-2 flex flex-col items-center justify-center p-6 gap-2">
            <div className="text-2xl mb-1">{flag}</div>
            <p className="font-display text-2xl font-bold text-text text-center">
              {form.front || <span className="text-text-3 text-lg font-normal">palavra...</span>}
            </p>
            <span className="text-xs text-text-3 mt-1">clique para virar</span>
          </div>
          {/* Back */}
          <div className="card-face card-face-back absolute inset-0 rounded-2xl border border-accent/30 bg-surface-2 flex flex-col items-center justify-center p-6 gap-2">
            <p className="font-display text-xl font-bold text-accent-2 text-center">
              {form.back || <span className="text-text-3 text-lg font-normal">tradução...</span>}
            </p>
            {form.notes && <p className="text-xs text-text-3 text-center mt-1 italic max-w-xs">{form.notes}</p>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Language row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">Idioma</label>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
              {LANGUAGES.map((l) => <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
              <option value="">— Nenhuma —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Front */}
        <div>
          <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">
            Frente — palavra no idioma <span className="text-accent">*</span>
          </label>
          <input type="text" value={form.front}
            onChange={(e) => { setForm({ ...form, front: e.target.value }); setErrors({ ...errors, front: "" }); }}
            placeholder={`ex: ${form.language === "Inglês" ? "Serendipity" : form.language === "Espanhol" ? "Madrugada" : form.language === "Japonês" ? "木漏れ日" : "palavra..."}`}
            className={`w-full bg-surface-2 border ${errors.front ? "border-red-500/60" : "border-border"} rounded-xl px-4 py-3 text-text placeholder-text-3 text-base focus:outline-none focus:border-accent transition-colors`}
          />
          {errors.front && <p className="text-red-400 text-xs mt-1">{errors.front}</p>}
        </div>

        {/* Back */}
        <div>
          <label className="block text-xs font-medium text-text-3 uppercase tracking-wider mb-1.5">
            Verso — tradução em português <span className="text-accent">*</span>
          </label>
          <textarea value={form.back}
            onChange={(e) => { setForm({ ...form, back: e.target.value }); setErrors({ ...errors, back: "" }); }}
            placeholder="ex: Encontrar algo bom sem estar procurando"
            rows={2}
            className={`w-full bg-surface-2 border ${errors.back ? "border-red-500/60" : "border-border"} rounded-xl px-4 py-3 text-text placeholder-text-3 text-base focus:outline-none focus:border-accent transition-colors resize-none`}
          />
          {errors.back && <p className="text-red-400 text-xs mt-1">{errors.back}</p>}
        </div>

        {/* Notes toggle */}
        <div>
          <button type="button" onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors">
            <span className={`transition-transform duration-200 ${showNotes ? "rotate-90" : ""}`}>▶</span>
            {showNotes ? "Ocultar exemplo / nota" : "Adicionar exemplo de uso (opcional)"}
          </button>
          <AnimatePresence>
            {showNotes && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <input type="text" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder='ex: "She discovered the café by serendipity."'
                  className="w-full mt-2 bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-3 text-sm focus:outline-none focus:border-accent transition-colors italic"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-3 border border-border rounded-xl text-text-2 hover:text-text hover:border-border-light transition-all duration-200 text-sm font-medium">
            {isEdit ? "Cancelar" : "← Voltar"}
          </button>
          <button type="submit"
            className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 active:scale-[0.98] relative overflow-hidden ${
              saved ? "bg-green-500 shadow-[0_0_16px_rgba(34,197,94,0.4)]" : "bg-accent hover:bg-accent-hover shadow-[0_0_16px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)]"
            } text-white`}>
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                  ✓ Salvo! Criar outro?
                </motion.span>
              ) : (
                <motion.span key="default" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {isEdit ? "Salvar alterações" : "Criar flashcard"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {!isEdit && (
          <p className="text-center text-xs text-text-3">
            Ou{" "}
            <a href="/bulk" className="text-accent hover:underline">adicione vários de uma vez →</a>
          </p>
        )}
      </form>
    </motion.div>
  );
}
