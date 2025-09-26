/**
 * Supabase API Layer for FEEDO Survey Application
 * 
 * このモジュールは、アプリケーション全体で使用するSupabaseのデータ操作を
 * 効率的に管理するためのAPIレイヤーです。
 */

// Core API
export { supabaseAPI } from './supabase';

// Statistics API
export {
  getFormStatistics,
  calculateSectionStatistics
} from './statistics';
export type {
  SectionStatistics,
  FormStatistics
} from './statistics';

// React Hooks
export {
  useSurveys,
  useSurvey,
  useQuestions,
  useAnswerSession,
  useAnswers,
  useSurveyStats,
  useCreateSurvey
} from './hooks';

// Server Actions
export {
  createSurveyAction,
  updateSurveyAction,
  deleteSurveyAction,
  publishSurveyAction,
  unpublishSurveyAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  saveAnswerAction,
  saveAnswersAction,
  completeAnswerSessionAction,
  getSurveyWithQuestionsAction,
  getSurveyStatsAction
} from './actions';

// Types
export type {
  Survey,
  Question,
  Answer,
  AnswerSession,
  QuestionType,
  QuestionSettings,
  SurveySettings,
  ApiResponse,
  PaginatedResponse,
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateAnswerInput,
  SurveyStats,
  QuestionStats,
  AnswerDistribution
} from './types';
