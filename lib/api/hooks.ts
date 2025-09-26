"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabaseAPI } from './supabase';
import type {
  Survey,
  Question,
  Answer,
  AnswerSession,
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateAnswerInput,
  PaginatedResponse,
  SurveyStats
} from './types';

// Survey用フック
export function useSurveys(page = 1, limit = 20) {
  const [surveys, setSurveys] = useState<PaginatedResponse<Survey>>({
    data: [],
    total: 0,
    page,
    limit,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseAPI.getSurveys(currentPage, limit);
      
      if (response.success) {
        setSurveys(response.data);
      } else {
        setError(response.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const refetch = () => fetchSurveys();
  const nextPage = () => {
    if (surveys.hasMore) {
      fetchSurveys(surveys.page + 1);
    }
  };
  const prevPage = () => {
    if (surveys.page > 1) {
      fetchSurveys(surveys.page - 1);
    }
  };

  return {
    surveys: surveys.data,
    pagination: {
      page: surveys.page,
      limit: surveys.limit,
      total: surveys.total,
      hasMore: surveys.hasMore
    },
    loading,
    error,
    refetch,
    nextPage,
    prevPage
  };
}

export function useSurvey(id: string) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurvey = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseAPI.getSurvey(id);
      
      if (response.success) {
        setSurvey(response.data);
      } else {
        setError(response.error || 'アンケートが見つかりません');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  const updateSurvey = async (input: UpdateSurveyInput) => {
    const response = await supabaseAPI.updateSurvey(input);
    if (response.success) {
      setSurvey(response.data);
    }
    return response;
  };

  const deleteSurvey = async () => {
    const response = await supabaseAPI.deleteSurvey(id);
    if (response.success) {
      setSurvey(null);
    }
    return response;
  };

  const publishSurvey = async () => {
    const response = await supabaseAPI.publishSurvey(id);
    if (response.success) {
      setSurvey(response.data);
    }
    return response;
  };

  const unpublishSurvey = async () => {
    const response = await supabaseAPI.unpublishSurvey(id);
    if (response.success) {
      setSurvey(response.data);
    }
    return response;
  };

  return {
    survey,
    loading,
    error,
    refetch: fetchSurvey,
    updateSurvey,
    deleteSurvey,
    publishSurvey,
    unpublishSurvey
  };
}

// Question用フック
export function useQuestions(surveyId: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!surveyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseAPI.getQuestions(surveyId);
      
      if (response.success) {
        setQuestions(response.data);
      } else {
        setError(response.error || '質問の取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const createQuestion = async (input: Omit<CreateQuestionInput, 'survey_id'>) => {
    const response = await supabaseAPI.createQuestion({
      ...input,
      survey_id: surveyId
    });
    
    if (response.success) {
      setQuestions(prev => [...prev, response.data].sort((a, b) => a.order_index - b.order_index));
    }
    return response;
  };

  const updateQuestion = async (input: UpdateQuestionInput) => {
    const response = await supabaseAPI.updateQuestion(input);
    
    if (response.success) {
      setQuestions(prev => 
        prev.map(q => q.id === input.id ? response.data : q)
          .sort((a, b) => a.order_index - b.order_index)
      );
    }
    return response;
  };

  const deleteQuestion = async (id: string) => {
    const response = await supabaseAPI.deleteQuestion(id);
    
    if (response.success) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
    return response;
  };

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
  };
}

// Answer Session用フック
export function useAnswerSession(surveyId: string) {
  const [session, setSession] = useState<AnswerSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
      const response = await supabaseAPI.createAnswerSession(surveyId, userAgent);
      
      if (response.success) {
        setSession(response.data);
      } else {
        setError(response.error || 'セッションの作成に失敗しました');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      return { success: false, data: {} as AnswerSession, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    if (!session?.id) return { success: false, data: {} as AnswerSession, error: 'セッションが見つかりません' };
    
    try {
      setLoading(true);
      const response = await supabaseAPI.completeAnswerSession(session.id);
      
      if (response.success) {
        setSession(response.data);
      } else {
        setError(response.error || 'セッションの完了に失敗しました');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      return { success: false, data: {} as AnswerSession, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    error,
    createSession,
    completeSession
  };
}

// Answer用フック
export function useAnswers(surveyId: string, sessionId?: string) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = useCallback(async () => {
    if (!surveyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseAPI.getAnswers(surveyId, sessionId);
      
      if (response.success) {
        setAnswers(response.data);
      } else {
        setError(response.error || '回答の取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [surveyId, sessionId]);

  const saveAnswer = async (input: Omit<CreateAnswerInput, 'survey_id'>) => {
    const response = await supabaseAPI.saveAnswer({
      ...input,
      survey_id: surveyId
    });
    
    if (response.success) {
      setAnswers(prev => {
        const existing = prev.find(a => a.question_id === input.question_id && a.session_id === input.session_id);
        if (existing) {
          return prev.map(a => 
            a.question_id === input.question_id && a.session_id === input.session_id 
              ? response.data 
              : a
          );
        } else {
          return [...prev, response.data];
        }
      });
    }
    return response;
  };

  const saveAnswers = async (inputs: Omit<CreateAnswerInput, 'survey_id'>[]) => {
    const response = await supabaseAPI.saveAnswers(
      inputs.map(input => ({ ...input, survey_id: surveyId }))
    );
    
    if (response.success) {
      fetchAnswers(); // 一括保存後は再取得
    }
    return response;
  };

  return {
    answers,
    loading,
    error,
    fetchAnswers,
    saveAnswer,
    saveAnswers
  };
}

// Survey Statistics用フック
export function useSurveyStats(surveyId: string) {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!surveyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseAPI.getSurveyStats(surveyId);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || '統計データの取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Survey作成用フック
export function useCreateSurvey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSurvey = async (input: CreateSurveyInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseAPI.createSurvey(input);
      
      if (!response.success) {
        setError(response.error || 'アンケートの作成に失敗しました');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      return { 
        success: false, 
        data: {} as Survey, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSurvey,
    loading,
    error
  };
}
