export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  language: string;
  category?: string; // name or ID? usually name is easier for strings, but ID is better for relations. Let's keep name for compatibility but support ID.
  notes?: string;          // exemplo de uso / contexto
  createdAt: string;
  timesReviewed?: number;
  timesCorrect?: number;
  lastReviewedAt?: string;
  masteryLevel?: 0 | 1 | 2 | 3;
}

export interface ReviewSession {
  id: string;
  date: string;
  total: number;
  correct: number;
  durationMs: number;
  mode?: "all" | "normal" | "weak" | "shuffle" | "new";
}

export const MASTERY_LABELS: Record<number, string> = {
  0: "Novo",
  1: "Aprendendo",
  2: "Familiar",
  3: "Dominado",
};

export const MASTERY_COLORS: Record<number, string> = {
  0: "#5C6A8A",
  1: "#F59E0B",
  2: "#818CF8",
  3: "#22D3EE",
};

export const LANGUAGES = [
  "Inglês","Espanhol","Francês","Alemão","Italiano",
  "Japonês","Mandarim","Coreano","Russo","Árabe","Outro",
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Verbos", color: "#818CF8" },
  { id: "2", name: "Substantivos", color: "#F472B6" },
  { id: "3", name: "Adjetivos", color: "#34D399" },
  { id: "4", name: "Cotidiano", color: "#FBBF24" },
  { id: "5", name: "Viagem", color: "#60A5FA" },
  { id: "6", name: "Negócios", color: "#A78BFA" },
  { id: "7", name: "Comida", color: "#FB7185" },
  { id: "8", name: "Família", color: "#4ADE80" },
  { id: "9", name: "Números", color: "#2DD4BF" },
  { id: "10", name: "Cores", color: "#FACC15" },
  { id: "11", name: "Outro", color: "#94A3B8" },
];

export const LANGUAGE_FLAGS: Record<string, string> = {
  Inglês:"🇺🇸", Espanhol:"🇪🇸", Francês:"🇫🇷", Alemão:"🇩🇪",
  Italiano:"🇮🇹", Japonês:"🇯🇵", Mandarim:"🇨🇳", Coreano:"🇰🇷",
  Russo:"🇷🇺", Árabe:"🇸🇦", Outro:"🌍",
};

