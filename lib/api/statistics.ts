import {createClient} from '@/utils/supabase/server';

/**
 * 統計計算API
 * フォームとセクションの統計データを計算する関数群
 */

export interface SectionStatistics {
  totalResponses: number;
  sectionType: string;
  responses: any[];
  choices?: Record<string, number>;
  average?: number;
  min?: number;
  max?: number;
  averageRating?: number;
  ratingDistribution?: Record<number, number>;
  averageLength?: number;
  maxLength?: number;
  minLength?: number;
}

export interface FormStatistics {
  form: {
    FormUUID: string;
    FormName: string;
  };
  sections: any[];
  statistics: Record<string, SectionStatistics>;
}

/**
 * 指定されたフォームの全統計を取得
 */
export async function getFormStatistics(projectId: string): Promise<FormStatistics> {
  const supabase = createClient();

  // フォーム情報を取得
  const { data: formData, error: formError } = await supabase
    .from('Form')
    .select('FormUUID, FormName')
    .eq('FormUUID', projectId)
    .eq('Delete', false)
    .single();

  if (formError) {
    throw new Error('フォームが見つかりません');
  }

  // セクション一覧を取得
  const { data: sections, error: sectionsError } = await supabase
    .from('Section')
    .select('*')
    .eq('FormUUID', projectId)
    .eq('Delete', false)
    .order('SectionOrder', { ascending: true });

  if (sectionsError) {
    throw new Error('セクションの取得に失敗しました');
  }

  // 各セクションの統計を計算
  const statistics: Record<string, SectionStatistics> = {};
  
  for (const section of sections || []) {
      statistics[section.SectionUUID] = await calculateSectionStatistics(projectId, section.SectionUUID);
  }

  return {
    form: formData,
    sections: sections || [],
    statistics: statistics
  };
}

/**
 * 指定されたセクションの統計を計算
 */
export async function calculateSectionStatistics(
  formUUID: string, 
  sectionUUID: string
): Promise<SectionStatistics> {
  const supabase = createClient();
  
  const { data: answers, error } = await supabase
    .from('Answer')
    .select('Answer')
    .eq('FormUUID', formUUID)
    .eq('SectionUUID', sectionUUID);

  if (error) {
    throw error;
  }

  // セクション情報も取得
  const { data: section, error: sectionError } = await supabase
    .from('Section')
    .select('SectionType, SectionOptions')
    .eq('SectionUUID', sectionUUID)
    .single();

  if (sectionError) {
    throw sectionError;
  }

  // 回答データの集計処理
  const responses = answers.map(a => {
    try {
      return JSON.parse(a.Answer);
    } catch {
      return a.Answer;
    }
  });

  let statistics: SectionStatistics = {
    totalResponses: answers.length,
    sectionType: section.SectionType,
    responses: responses,
  };

  // セクションタイプに応じた統計計算
  switch (section.SectionType) {
    case 'radio':
    case 'check':
      // 選択肢の集計
      const choices: Record<string, number> = {};
      responses.forEach(response => {
        if (Array.isArray(response)) {
          // チェックボックスの場合
          response.forEach(choice => {
            choices[choice] = (choices[choice] || 0) + 1;
          });
        } else if (typeof response === 'string') {
          // ラジオボタンの場合
          choices[response] = (choices[response] || 0) + 1;
        }
      });
      statistics.choices = choices;
      break;

    case 'slider':
      // スライダーの統計
      const values = responses.filter(r => typeof r === 'number');
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        statistics.average = sum / values.length;
        statistics.min = Math.min(...values);
        statistics.max = Math.max(...values);
      }
      break;

    case 'star':
      // 星評価の統計
      const ratings = responses.filter(r => typeof r === 'number');
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        statistics.averageRating = sum / ratings.length;
        const ratingCounts: Record<number, number> = {};
        ratings.forEach(rating => {
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });
        statistics.ratingDistribution = ratingCounts;
      }
      break;

    case 'text':
      // テキストの統計（文字数など）
      const textResponses = responses.filter(r => typeof r === 'string');
      if (textResponses.length > 0) {
        const lengths = textResponses.map(text => text.length);
        const totalLength = lengths.reduce((acc, len) => acc + len, 0);
        statistics.averageLength = totalLength / lengths.length;
        statistics.maxLength = Math.max(...lengths);
        statistics.minLength = Math.min(...lengths);
      }
      break;

    default:
      // その他のタイプ
      break;
  }

  return statistics;
}
