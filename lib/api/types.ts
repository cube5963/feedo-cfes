// データベーステーブルの型定義
export interface Survey {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_published: boolean;
  settings?: SurveySettings;
}

export interface Question {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: QuestionType;
  order_index: number;
  options?: string[];
  settings?: QuestionSettings;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  survey_id: string;
  session_id: string;
  answer_text?: string;
  selected_options?: string[];
  rating?: number;
  created_at: string;
}

export interface AnswerSession {
  id: string;
  survey_id: string;
  started_at: string;
  completed_at?: string;
  user_agent?: string;
  ip_address?: string;
}

// アプリケーション固有の型
export type QuestionType = 'radio' | 'checkbox' | 'text' | 'star' | 'two_choice' | 'slider';

export interface QuestionSettings {
  // スライダー設定
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderLabels?: { min: string; max: string };
  
  // 評価設定
  starSteps?: number;
  
  // テキスト設定
  maxLength?: number;
  multiline?: boolean;
  
  // 必須フィールド
  required?: boolean;
}

export interface SurveySettings {
  allowAnonymous?: boolean;
  collectUserAgent?: boolean;
  showProgressBar?: boolean;
  shuffleQuestions?: boolean;
  theme?: string;
}

// API レスポンス型
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// フォーム入力型
export interface CreateSurveyInput {
  title: string;
  description?: string;
  settings?: SurveySettings;
}

export type UpdateSurveyInput = {
  id: string;
  title?: string;
  description?: string;
  updated_at?: string;
  is_published?: boolean;
};

export interface CreateQuestionInput {
  survey_id: string;
  question_text: string;
  question_type: QuestionType;
  order_index: number;
  options?: string[];
  settings?: QuestionSettings;
}

export interface UpdateQuestionInput extends Partial<Omit<CreateQuestionInput, 'survey_id'>> {
  id: string;
}

export interface CreateAnswerInput {
  question_id: string;
  survey_id: string;
  session_id: string;
  answer_text?: string;
  selected_options?: string[];
  rating?: number;
}

// 統計データ型
export interface SurveyStats {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  totalAnswers: number;
  answerDistribution: AnswerDistribution;
}

export interface AnswerDistribution {
  [key: string]: number | {
    option: string;
    count: number;
    percentage: number;
  }[];
}
