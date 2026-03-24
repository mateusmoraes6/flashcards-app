"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Flashcard, ReviewSession, Category, DEFAULT_CATEGORIES, UserLanguage, LANGUAGES, LANGUAGE_FLAGS } from "@/types/flashcard";
import { createClient } from "@/utils/supabase/client";

const STORAGE_KEY = "lexiflash_cards";
const SESSIONS_KEY = "lexiflash_sessions";

const DEFAULT_LANGUAGES: UserLanguage[] = [
  { id: "1", name: "Inglês", flag: "🇺🇸" },
  { id: "2", name: "Espanhol", flag: "🇪🇸" },
];

function computeMastery(timesReviewed: number, timesCorrect: number): 0 | 1 | 2 | 3 {
  const ratio = timesReviewed > 0 ? timesCorrect / timesReviewed : 0;
  if (timesReviewed >= 3 && ratio >= 0.85) return 3;
  if (timesReviewed >= 2 && ratio >= 0.6) return 2;
  if (timesReviewed >= 1) return 1;
  return 0;
}

// Mappers to bridge DB (snake_case) and App (camelCase)
const mapCardFromDB = (card: any): Flashcard => ({
  id: card.id,
  front: card.front,
  back: card.back,
  language: card.language,
  category: card.category || undefined,
  notes: card.notes || undefined,
  createdAt: card.created_at,
  timesReviewed: card.times_reviewed || 0,
  timesCorrect: card.times_correct || 0,
  lastReviewedAt: card.last_reviewed_at || undefined,
  masteryLevel: (card.mastery_level || 0) as 0 | 1 | 2 | 3,
});

const mapSessionFromDB = (s: any): ReviewSession => ({
  id: s.id,
  date: s.date,
  total: s.total,
  correct: s.correct,
  durationMs: s.duration_ms,
  mode: s.mode as ReviewSession["mode"],
});

const mapCategoryFromDB = (c: any): Category => ({
  id: c.id,
  name: c.name,
  color: c.color || undefined,
  icon: c.icon || undefined,
});

const mapLanguageFromDB = (l: any): UserLanguage => ({
  id: l.id,
  name: l.name,
  flag: l.flag || "🌍",
});

export function useFlashcards() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [languages, setLanguages] = useState<UserLanguage[]>(DEFAULT_LANGUAGES);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncInProgress = useRef(false);

  const fetchData = useCallback(async (userId: string) => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;

    try {
      // 1. Categories Migration & Fetch
      let { data: catData } = await supabase.from('categories').select('*').eq('user_id', userId).order('created_at');
      if (!catData || catData.length === 0) {
        const toInsert = DEFAULT_CATEGORIES.map(c => ({ user_id: userId, name: c.name, color: c.color, icon: c.icon }));
        await supabase.from('categories').insert(toInsert);
        const { data: refreshed } = await supabase.from('categories').select('*').eq('user_id', userId).order('created_at');
        catData = refreshed;
      }
      if (catData) setCategories(catData.map(mapCategoryFromDB));

      // 2. Languages Migration & Fetch
      let { data: langData } = await supabase.from('user_languages').select('*').eq('user_id', userId).order('created_at');
      if (!langData || langData.length === 0) {
        const toInsert = DEFAULT_LANGUAGES.map(l => ({ user_id: userId, name: l.name, flag: l.flag }));
        await supabase.from('user_languages').insert(toInsert);
        const { data: refreshed } = await supabase.from('user_languages').select('*').eq('user_id', userId).order('created_at');
        langData = refreshed;
      }
      if (langData) setLanguages(langData.map(mapLanguageFromDB));

      // 3. Cards Migration & Fetch
      let { data: cardData } = await supabase.from('flashcards').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const localCardsRaw = localStorage.getItem(STORAGE_KEY);
      if (localCardsRaw && (!cardData || cardData.length === 0)) {
        const localCards = JSON.parse(localCardsRaw);
        if (localCards.length > 0) {
          const toInsert = localCards.map((c: any) => ({
            user_id: userId, front: c.front, back: c.back, language: c.language, category: c.category,
            notes: c.notes, times_reviewed: c.timesReviewed || 0, times_correct: c.timesCorrect || 0,
            mastery_level: c.masteryLevel || 0, created_at: c.createdAt
          }));
          await supabase.from('flashcards').insert(toInsert);
          const { data: refreshed } = await supabase.from('flashcards').select('*').eq('user_id', userId).order('created_at', { ascending: false });
          cardData = refreshed;
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      if (cardData) setCards(cardData.map(mapCardFromDB));

      // 4. Sessions Migration & Fetch
      let { data: sessionData } = await supabase.from('review_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(50);
      const localSessionsRaw = localStorage.getItem(SESSIONS_KEY);
      if (localSessionsRaw && (!sessionData || sessionData.length === 0)) {
        const localSessions = JSON.parse(localSessionsRaw);
        if (localSessions.length > 0) {
          const toInsert = localSessions.map((s: any) => ({
            user_id: userId, total: s.total, correct: s.correct, duration_ms: s.durationMs,
            mode: s.mode, date: s.date
          }));
          await supabase.from('review_sessions').insert(toInsert);
          const { data: refreshed } = await supabase.from('review_sessions').select('*').eq('user_id', userId).order('date', { ascending: false });
          sessionData = refreshed;
          localStorage.removeItem(SESSIONS_KEY);
        }
      }
      if (sessionData) setSessions(sessionData.map(mapSessionFromDB));

    } catch (err) {
      console.error("Supabase sync error:", err);
    } finally {
      setIsLoaded(true);
      syncInProgress.current = false;
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else setIsLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else {
        setCards([]);
        setSessions([]);
        setCategories(DEFAULT_CATEGORIES);
        setLanguages(DEFAULT_LANGUAGES);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, fetchData]);

  const addCard = useCallback(async (data: Omit<Flashcard, "id" | "createdAt">) => {
    if (!user) return null;
    const { data: newCard, error } = await supabase.from('flashcards').insert({
      user_id: user.id, front: data.front, back: data.back, language: data.language, category: data.category, notes: data.notes
    }).select().single();
    if (!error && newCard) {
      const mapped = mapCardFromDB(newCard);
      setCards(prev => [mapped, ...prev]);
      return mapped;
    }
    return null;
  }, [user, supabase]);

  const updateCard = useCallback(async (id: string, data: Partial<Omit<Flashcard, "id" | "createdAt">>) => {
    if (!user) return;
    const updateData: any = {};
    if (data.front !== undefined) updateData.front = data.front;
    if (data.back !== undefined) updateData.back = data.back;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.masteryLevel !== undefined) updateData.mastery_level = data.masteryLevel;
    if (data.timesReviewed !== undefined) updateData.times_reviewed = data.timesReviewed;
    if (data.timesCorrect !== undefined) updateData.times_correct = data.timesCorrect;
    if (data.lastReviewedAt !== undefined) updateData.last_reviewed_at = data.lastReviewedAt;

    const { error } = await supabase.from('flashcards').update(updateData).eq('id', id).eq('user_id', user.id);
    if (!error) setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, [user, supabase]);

  const deleteCard = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('flashcards').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setCards(prev => prev.filter(c => c.id !== id));
  }, [user, supabase]);

  const recordAnswer = useCallback(async (id: string, correct: boolean) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    const timesReviewed = (card.timesReviewed ?? 0) + 1;
    const timesCorrect = (card.timesCorrect ?? 0) + (correct ? 1 : 0);
    const masteryLevel = computeMastery(timesReviewed, timesCorrect);
    await updateCard(id, { timesReviewed, timesCorrect, masteryLevel, lastReviewedAt: new Date().toISOString() });
  }, [cards, updateCard]);

  const saveSession = useCallback(async (total: number, correct: number, durationMs: number, mode?: ReviewSession["mode"]) => {
    if (!user) return;
    const { data: s, error } = await supabase.from('review_sessions').insert({
      user_id: user.id, total, correct, duration_ms: durationMs, mode
    }).select().single();
    if (!error && s) setSessions(prev => [mapSessionFromDB(s), ...prev].slice(0, 50));
  }, [user, supabase]);

  const addCategory = useCallback(async (name: string, color?: string, icon?: string) => {
    if (!user) return null;
    const { data: cat, error } = await supabase.from('categories').insert({ user_id: user.id, name, color, icon }).select().single();
    if (!error && cat) {
      const mapped = mapCategoryFromDB(cat);
      setCategories(prev => [...prev, mapped]);
      return mapped;
    }
    return null;
  }, [user, supabase]);

  const updateCategory = useCallback(async (id: string, data: Partial<Omit<Category, "id">>) => {
    if (!user) return;
    const oldCat = categories.find(c => c.id === id);
    if (!oldCat) return;
    const { error } = await supabase.from('categories').update({ name: data.name, color: data.color, icon: data.icon }).eq('id', id);
    if (!error) {
      if (data.name && data.name !== oldCat.name) {
        await supabase.from('flashcards').update({ category: data.name }).eq('user_id', user.id).eq('category', oldCat.name);
        setCards(prev => prev.map(c => c.category === oldCat.name ? { ...c, category: data.name } : c));
      }
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    }
  }, [user, categories, supabase]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;
    const category = categories.find(c => c.id === id);
    if (!category) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      await supabase.from('flashcards').update({ category: null }).eq('user_id', user.id).eq('category', category.name);
      setCards(prev => prev.map(c => c.category === category.name ? { ...c, category: undefined } : c));
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  }, [user, categories, supabase]);

  const addLanguage = useCallback(async (name: string, flag?: string) => {
    if (!user) return null;
    const { data: l, error } = await supabase.from('user_languages').insert({ user_id: user.id, name, flag: flag || "🌍" }).select().single();
    if (!error && l) {
      const mapped = mapLanguageFromDB(l);
      setLanguages(prev => [...prev, mapped]);
      return mapped;
    }
    return null;
  }, [user, supabase]);

  const deleteLanguage = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_languages').delete().eq('id', id);
    if (!error) setLanguages(prev => prev.filter(l => l.id !== id));
  }, [user, supabase]);

  const weakCards = useCallback(() => {
    return [...cards].filter((c) => (c.timesReviewed ?? 0) > 0).sort((a, b) => {
      const accA = (a.timesCorrect ?? 0) / (a.timesReviewed ?? 1);
      const accB = (b.timesCorrect ?? 0) / (b.timesReviewed ?? 1);
      return accA - accB;
    });
  }, [cards]);

  const importCards = useCallback(async (imported: Omit<Flashcard, "id" | "createdAt">[]) => {
    if (!user) return;
    const toInsert = imported.map(d => ({ user_id: user.id, front: d.front, back: d.back, language: d.language, category: d.category, notes: d.notes }));
    const { data: news, error } = await supabase.from('flashcards').insert(toInsert).select();
    if (!error && news) setCards(prev => [...news.map(mapCardFromDB), ...prev]);
  }, [user, supabase]);

  return { 
    cards, sessions, categories, languages, isLoaded, 
    addCard, updateCard, deleteCard, recordAnswer, 
    saveSession, weakCards, addCategory, updateCategory, deleteCategory,
    addLanguage, deleteLanguage, importCards
  };
}

