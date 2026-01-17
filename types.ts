
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
  vocab: number;
  grammar: number;
  streak: number;
  completion: number;
}

export interface GrammarPoint {
  id: string;
  level: JLPTLevel;
  title: string;
  reading: string;
  meaning: string;
  usage: string;
  category: string;
}

export interface GrammarExample {
  id: string;
  grammar_point_id: string;
  sentence: string;
  reading: string;
  translation: string;
  translation_zh: string;
  difficulty: number;
}
