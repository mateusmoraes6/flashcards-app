"use client";
import { useState, useEffect, useCallback } from "react";
import { Flashcard, ReviewSession, Category, DEFAULT_CATEGORIES, UserLanguage, LANGUAGES, LANGUAGE_FLAGS } from "@/types/flashcard";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "lexiflash_cards";
const SESSIONS_KEY = "lexiflash_sessions";
const CATEGORIES_KEY = "lexiflash_categories";
const LANGUAGES_KEY = "lexiflash_languages";

const DEFAULT_LANGUAGES: UserLanguage[] = [
  { id: "1", name: "Inglês", flag: "🇺🇸" },
  { id: "2", name: "Espanhol", flag: "🇪🇸" },
];

const SAMPLE_CARDS: Flashcard[] = [
  { id: uuidv4(), front: "Serendipity", back: "Encontrar algo bom sem estar procurando", notes: "\"It was pure serendipity that we met.\"", language: "Inglês", category: "Cotidiano", createdAt: new Date().toISOString(), masteryLevel: 0, timesReviewed: 0, timesCorrect: 0 },
  { id: uuidv4(), front: "Ephemeral", back: "Que dura pouco tempo; efêmero", notes: "\"Social media stories are ephemeral.\"", language: "Inglês", category: "Adjetivos", createdAt: new Date().toISOString(), masteryLevel: 1, timesReviewed: 3, timesCorrect: 1 },
  { id: uuidv4(), front: "Wanderlust", back: "Desejo intenso de viajar e explorar o mundo", language: "Alemão", category: "Cotidiano", createdAt: new Date().toISOString(), masteryLevel: 2, timesReviewed: 6, timesCorrect: 5 },
  { id: uuidv4(), front: "Merci beaucoup", back: "Muito obrigado(a)", notes: "Resposta: \"De rien\" (de nada)", language: "Francês", category: "Cotidiano", createdAt: new Date().toISOString(), masteryLevel: 3, timesReviewed: 8, timesCorrect: 8 },
  { id: uuidv4(), front: "木漏れ日 (komorebi)", back: "Luz do sol filtrada pelas folhas das árvores", language: "Japonês", category: "Substantivos", createdAt: new Date().toISOString(), masteryLevel: 0, timesReviewed: 0, timesCorrect: 0 },
  { id: uuidv4(), front: "Sobremesa", back: "Tempo relaxante após uma refeição conversando", language: "Espanhol", category: "Cotidiano", createdAt: new Date().toISOString(), masteryLevel: 1, timesReviewed: 2, timesCorrect: 1 },
];

function computeMastery(timesReviewed: number, timesCorrect: number): 0 | 1 | 2 | 3 {
  const ratio = timesReviewed > 0 ? timesCorrect / timesReviewed : 0;
  if (timesReviewed >= 3 && ratio >= 0.85) return 3;
  if (timesReviewed >= 2 && ratio >= 0.6) return 2;
  if (timesReviewed >= 1) return 1;
  return 0;
}

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setCards(raw ? JSON.parse(raw) : SAMPLE_CARDS);
      if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CARDS));

      const rawS = localStorage.getItem(SESSIONS_KEY);
      setSessions(rawS ? JSON.parse(rawS) : []);

      const rawC = localStorage.getItem(CATEGORIES_KEY);
      setCategories(rawC ? JSON.parse(rawC) : DEFAULT_CATEGORIES);
      if (!rawC) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));

      const rawL = localStorage.getItem(LANGUAGES_KEY);
      setLanguages(rawL ? JSON.parse(rawL) : DEFAULT_LANGUAGES);
      if (!rawL) localStorage.setItem(LANGUAGES_KEY, JSON.stringify(DEFAULT_LANGUAGES));

    } catch { 
      setCards([]); 
      setCategories(DEFAULT_CATEGORIES);
      setLanguages(DEFAULT_LANGUAGES);
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((updated: Flashcard[]) => {
    setCards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const persistSessions = useCallback((updated: ReviewSession[]) => {
    setSessions(updated);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  }, []);

  const persistCategories = useCallback((updated: Category[]) => {
    setCategories(updated);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  }, []);

  const persistLanguages = useCallback((updated: UserLanguage[]) => {
    setLanguages(updated);
    localStorage.setItem(LANGUAGES_KEY, JSON.stringify(updated));
  }, []);

  const addCard = useCallback((data: Omit<Flashcard, "id" | "createdAt">) => {
    const card: Flashcard = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), masteryLevel: 0, timesReviewed: 0, timesCorrect: 0 };
    persist([card, ...cards]);
    return card;
  }, [cards, persist]);

  const addCards = useCallback((items: Omit<Flashcard, "id" | "createdAt">[]) => {
    const newCards = items.map((d) => ({ ...d, id: uuidv4(), createdAt: new Date().toISOString(), masteryLevel: 0 as const, timesReviewed: 0, timesCorrect: 0 }));
    persist([...newCards, ...cards]);
    return newCards;
  }, [cards, persist]);

  const updateCard = useCallback((id: string, data: Partial<Omit<Flashcard, "id" | "createdAt">>) => {
    persist(cards.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, [cards, persist]);

  const deleteCard = useCallback((id: string) => {
    persist(cards.filter((c) => c.id !== id));
  }, [cards, persist]);

  const getCard = useCallback((id: string) => cards.find((c) => c.id === id), [cards]);

  const recordAnswer = useCallback((id: string, correct: boolean) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    const timesReviewed = (card.timesReviewed ?? 0) + 1;
    const timesCorrect = (card.timesCorrect ?? 0) + (correct ? 1 : 0);
    const masteryLevel = computeMastery(timesReviewed, timesCorrect);
    persist(cards.map((c) => c.id === id ? { ...c, timesReviewed, timesCorrect, masteryLevel, lastReviewedAt: new Date().toISOString() } : c));
  }, [cards, persist]);

  const saveSession = useCallback((total: number, correct: number, durationMs: number, mode?: ReviewSession["mode"]) => {
    const session: ReviewSession = { id: uuidv4(), date: new Date().toISOString(), total, correct, durationMs, mode };
    persistSessions([session, ...sessions].slice(0, 50));
  }, [sessions, persistSessions]);

  const importCards = useCallback((imported: Omit<Flashcard, "id" | "createdAt">[]) => {
    const newCards = imported.map((d) => ({ ...d, id: uuidv4(), createdAt: new Date().toISOString(), masteryLevel: 0 as const, timesReviewed: 0, timesCorrect: 0 }));
    persist([...newCards, ...cards]);
  }, [cards, persist]);

  const clearAllData = useCallback(() => {
    persist([]);
    persistSessions([]);
    persistCategories(DEFAULT_CATEGORIES);
    persistLanguages(DEFAULT_LANGUAGES);
  }, [persist, persistSessions, persistCategories, persistLanguages]);

  // Categories CRUD
  const addCategory = useCallback((name: string, color?: string, icon?: string) => {
    const category: Category = { id: uuidv4(), name, color, icon };
    persistCategories([...categories, category]);
    return category;
  }, [categories, persistCategories]);

  const updateCategory = useCallback((id: string, data: Partial<Omit<Category, "id">>) => {
    const oldCat = categories.find((c) => c.id === id);
    if (!oldCat) return;

    // 1. Update categories list
    const newCategories = categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    persistCategories(newCategories);

    // 2. Update cards if name changed
    if (data.name && data.name !== oldCat.name) {
      const updatedCards = cards.map((c) => 
        c.category === oldCat.name ? { ...c, category: data.name } : c
      );
      persist(updatedCards);
    }
  }, [categories, cards, persist, persistCategories]);

  const deleteCategory = useCallback((id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      const updatedCards = cards.map((c) => 
        c.category === category.name ? { ...c, category: undefined } : c
      );
      persist(updatedCards);
    }
    persistCategories(categories.filter((c) => c.id !== id));
  }, [categories, cards, persist, persistCategories]);

  // Languages CRUD
  const addLanguage = useCallback((name: string, flag?: string) => {
    const language: UserLanguage = { id: uuidv4(), name, flag: flag || "🌍" };
    persistLanguages([...languages, language]);
    return language;
  }, [languages, persistLanguages]);

  const deleteLanguage = useCallback((id: string) => {
    persistLanguages(languages.filter((l) => l.id !== id));
  }, [languages, persistLanguages]);

  // Returns cards sorted by difficulty (weak cards first)
  const weakCards = useCallback(() => {
    return [...cards]
      .filter((c) => (c.timesReviewed ?? 0) > 0)
      .sort((a, b) => {
        const accA = (a.timesCorrect ?? 0) / (a.timesReviewed ?? 1);
        const accB = (b.timesCorrect ?? 0) / (b.timesReviewed ?? 1);
        return accA - accB;
      });
  }, [cards]);

  return { 
    cards, sessions, categories, languages, isLoaded, 
    addCard, addCards, updateCard, deleteCard, getCard, recordAnswer, 
    saveSession, importCards, clearAllData, weakCards,
    addCategory, updateCategory, deleteCategory,
    addLanguage, deleteLanguage
  };
}

