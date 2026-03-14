export interface Flashcard {
  id: string;
  front: string;
  back: string;
  language: string;
  category?: string;
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

export const CATEGORIES = [
  "Verbos","Substantivos","Adjetivos","Cotidiano","Viagem",
  "Negócios","Comida","Família","Números","Cores","Outro",
];

export const LANGUAGE_FLAGS: Record<string, string> = {
  Inglês:"🇺🇸", Espanhol:"🇪🇸", Francês:"🇫🇷", Alemão:"🇩🇪",
  Italiano:"🇮🇹", Japonês:"🇯🇵", Mandarim:"🇨🇳", Coreano:"🇰🇷",
  Russo:"🇷🇺", Árabe:"🇸🇦", Outro:"🌍",
};
