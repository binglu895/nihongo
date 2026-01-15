
export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  label: string;
}

export interface QuizQuestion {
  id: string;
  sentence: string;
  translation: string;
  options: QuizOption[];
  explanationPrompt: string;
}

export interface UserStats {
  kanji: number;
  vocab: string;
  grammar: number;
  streak: number;
  completion: number;
}
