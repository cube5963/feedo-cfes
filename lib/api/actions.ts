'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAPI } from './supabase';
import type {
  CreateSurveyInput,
  UpdateSurveyInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateAnswerInput
} from './types';

/**
 * Server Actions for Survey operations
 * Next.js App Router用のサーバーアクション
 */

// Survey Actions
export async function createSurveyAction(input: CreateSurveyInput) {
  try {
    const response = await supabaseAPI.createSurvey(input, true);
    
    if (response.success) {
      revalidatePath('/project');
      revalidatePath('/project/create');
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'アンケートの作成に失敗しました'
    };
  }
}

export async function updateSurveyAction(input: UpdateSurveyInput) {
  try {
    const response = await supabaseAPI.updateSurvey(input, true);
    
    if (response.success) {
      revalidatePath('/project');
      revalidatePath(`/project/${input.id}`);
      revalidatePath(`/project/create`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'アンケートの更新に失敗しました'
    };
  }
}

export async function deleteSurveyAction(id: string) {
  try {
    const response = await supabaseAPI.deleteSurvey(id, true);
    
    if (response.success) {
      revalidatePath('/project');
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: false,
      error: error instanceof Error ? error.message : 'アンケートの削除に失敗しました'
    };
  }
}

export async function publishSurveyAction(id: string) {
  try {
    const response = await supabaseAPI.publishSurvey(id, true);
    
    if (response.success) {
      revalidatePath('/project');
      revalidatePath(`/project/${id}`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'アンケートの公開に失敗しました'
    };
  }
}

export async function unpublishSurveyAction(id: string) {
  try {
    const response = await supabaseAPI.unpublishSurvey(id, true);
    
    if (response.success) {
      revalidatePath('/project');
      revalidatePath(`/project/${id}`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'アンケートの非公開に失敗しました'
    };
  }
}

// Question Actions
export async function createQuestionAction(input: CreateQuestionInput) {
  try {
    const response = await supabaseAPI.createQuestion(input, true);
    
    if (response.success) {
      revalidatePath(`/project/${input.survey_id}`);
      revalidatePath(`/project/create`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '質問の作成に失敗しました'
    };
  }
}

export async function updateQuestionAction(input: UpdateQuestionInput) {
  try {
    const response = await supabaseAPI.updateQuestion(input, true);
    
    if (response.success) {
      // 関連するパスを再検証
      revalidatePath('/project/create');
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '質問の更新に失敗しました'
    };
  }
}

export async function deleteQuestionAction(id: string, surveyId?: string) {
  try {
    const response = await supabaseAPI.deleteQuestion(id, true);
    
    if (response.success && surveyId) {
      revalidatePath(`/project/${surveyId}`);
      revalidatePath(`/project/create`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: false,
      error: error instanceof Error ? error.message : '質問の削除に失敗しました'
    };
  }
}

// Answer Actions
export async function saveAnswerAction(input: CreateAnswerInput) {
  try {
    const response = await supabaseAPI.saveAnswer(input, true);
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '回答の保存に失敗しました'
    };
  }
}

export async function saveAnswersAction(inputs: CreateAnswerInput[]) {
  try {
    const response = await supabaseAPI.saveAnswers(inputs, true);
    
    if (response.success && inputs.length > 0) {
      // 統計データのキャッシュをクリアするため、統計ページを再検証
      revalidatePath(`/project/${inputs[0].survey_id}`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : '回答の一括保存に失敗しました'
    };
  }
}

export async function completeAnswerSessionAction(sessionId: string, surveyId?: string) {
  try {
    const response = await supabaseAPI.completeAnswerSession(sessionId, true);
    
    if (response.success && surveyId) {
      // 統計データの更新のため再検証
      revalidatePath(`/project/${surveyId}`);
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '回答セッションの完了に失敗しました'
    };
  }
}

// Utility Actions
export async function getSurveyWithQuestionsAction(surveyId: string) {
  try {
    const [surveyResponse, questionsResponse] = await Promise.all([
      supabaseAPI.getSurvey(surveyId, true),
      supabaseAPI.getQuestions(surveyId, true)
    ]);

    if (!surveyResponse.success) {
      return {
        success: false,
        data: null,
        error: surveyResponse.error
      };
    }

    if (!questionsResponse.success) {
      return {
        success: false,
        data: null,
        error: questionsResponse.error
      };
    }

    return {
      success: true,
      data: {
        survey: surveyResponse.data,
        questions: questionsResponse.data
      }
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'データの取得に失敗しました'
    };
  }
}

export async function getSurveyStatsAction(surveyId: string) {
  try {
    const response = await supabaseAPI.getSurveyStats(surveyId, true);
    return response;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '統計データの取得に失敗しました'
    };
  }
}
