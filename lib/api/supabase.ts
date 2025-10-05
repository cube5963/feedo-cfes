import {createAnonClient as createBrowserClient} from '@/utils/supabase/anonClient';
import {createClient as createServerClient} from '@/utils/supabase/server';
import type {
    Answer,
    AnswerSession,
    ApiResponse,
    CreateAnswerInput,
    CreateQuestionInput,
    CreateSurveyInput,
    PaginatedResponse,
    Question,
    Survey,
    SurveyStats,
    UpdateQuestionInput,
    UpdateSurveyInput
} from './types';

// キャッシュ管理
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

class SupabaseAPI {
    // Survey CRUD 操作
    async getSurveys(page = 1, limit = 20, isServer = false): Promise<ApiResponse<PaginatedResponse<Survey>>> {
        try {
            const cacheKey = `surveys-${page}-${limit}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return {success: true, data: cached};
            }

            const supabase = this.getClient(isServer);
            const offset = (page - 1) * limit;

            const {data, error, count} = await supabase
                .from('surveys')
                .select('*', {count: 'exact'})
                .order('created_at', {ascending: false})
                .range(offset, offset + limit - 1);

            if (error) throw error;

            const result = {
                data: data || [], total: count || 0, page, limit, hasMore: (count || 0) > offset + limit
            };

            this.setCache(cacheKey, result);
            return {success: true, data: result};
        } catch (error) {
            return {
                success: false,
                data: {data: [], total: 0, page, limit, hasMore: false},
                error: error instanceof Error ? error.message : '不明なエラーが発生しました'
            };
        }
    }

    async getSurvey(id: string, isServer = false): Promise<ApiResponse<Survey | null>> {
        try {
            const cacheKey = `survey-${id}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return {success: true, data: cached};
            }

            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('surveys')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            this.setCache(cacheKey, data);
            return {success: true, data};
        } catch (error) {
            return {
                success: false, data: null, error: error instanceof Error ? error.message : 'アンケートが見つかりません'
            };
        }
    }

    async createSurvey(input: CreateSurveyInput, isServer = false): Promise<ApiResponse<Survey>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('surveys')
                .insert({
                    ...input,
                    is_published: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            this.clearCache('surveys');
            return {success: true, data};
        } catch (error) {
            return {
                success: false, data: {} as Survey, error: error instanceof Error ? error.message : 'アンケートの作成に失敗しました'
            };
        }
    }

    async updateSurvey(input: UpdateSurveyInput, isServer = false): Promise<ApiResponse<Survey>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('surveys')
                .update({
                    ...input, updated_at: new Date().toISOString()
                })
                .eq('id', input.id)
                .select()
                .single();

            if (error) throw error;

            this.clearCache('surveys');
            this.clearCache(`survey-${input.id}`);
            return {success: true, data};
        } catch (error) {
            return {
                success: false, data: {} as Survey, error: error instanceof Error ? error.message : 'アンケートの更新に失敗しました'
            };
        }
    }

    async deleteSurvey(id: string, isServer = false): Promise<ApiResponse<boolean>> {
        try {
            const supabase = this.getClient(isServer);

            // 関連する質問と回答も削除
            await supabase.from('answers').delete().eq('survey_id', id);
            await supabase.from('questions').delete().eq('survey_id', id);
            await supabase.from('answer_sessions').delete().eq('survey_id', id);

            const {error} = await supabase
                .from('surveys')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.clearCache('surveys');
            this.clearCache(`survey-${id}`);
            return {success: true, data: true};
        } catch (error) {
            return {
                success: false, data: false, error: error instanceof Error ? error.message : 'アンケートの削除に失敗しました'
            };
        }
    }

    // Question CRUD 操作
    async getQuestions(surveyId: string, isServer = false): Promise<ApiResponse<Question[]>> {
        try {
            const cacheKey = `questions-${surveyId}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return {success: true, data: cached};
            }

            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('questions')
                .select('*')
                .eq('survey_id', surveyId)
                .order('order_index', {ascending: true});

            if (error) throw error;

            this.setCache(cacheKey, data || []);
            return {success: true, data: data || []};
        } catch (error) {
            return {
                success: false, data: [], error: error instanceof Error ? error.message : '質問の取得に失敗しました'
            };
        }
    }

    async createQuestion(input: CreateQuestionInput, isServer = false): Promise<ApiResponse<Question>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('questions')
                .insert({
                    ...input, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            this.clearCache(`questions-${input.survey_id}`);
            return {success: true, data};
        } catch (error) {
            return {
                success: false, data: {} as Question, error: error instanceof Error ? error.message : '質問の作成に失敗しました'
            };
        }
    }

    async updateQuestion(input: UpdateQuestionInput, isServer = false): Promise<ApiResponse<Question>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('questions')
                .update({
                    ...input, updated_at: new Date().toISOString()
                })
                .eq('id', input.id)
                .select()
                .single();

            if (error) throw error;

            // 関連するキャッシュをクリア
            this.clearCache('questions');
            return {success: true, data};
        } catch (error) {
            return {
                success: false, data: {} as Question, error: error instanceof Error ? error.message : '質問の更新に失敗しました'
            };
        }
    }

    async deleteQuestion(id: string, isServer = false): Promise<ApiResponse<boolean>> {
        try {
            const supabase = this.getClient(isServer);

            // 関連する回答も削除
            await supabase.from('answers').delete().eq('question_id', id);

            const {error} = await supabase
                .from('questions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.clearCache('questions');
            return {success: true, data: true};
        } catch (error) {
            return {
                success: false, data: false, error: error instanceof Error ? error.message : '質問の削除に失敗しました'
            };
        }
    }

    // Answer Session 管理
    async createAnswerSession(surveyId: string, userAgent?: string, isServer = false): Promise<ApiResponse<AnswerSession>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('answer_sessions')
                .insert({
                    survey_id: surveyId, started_at: new Date().toISOString(), user_agent: userAgent
                })
                .select()
                .single();

            if (error) throw error;

            return {success: true, data};
        } catch (error) {
            return {
                success: false,
                data: {} as AnswerSession,
                error: error instanceof Error ? error.message : '回答セッションの作成に失敗しました'
            };
        }
    }

    async completeAnswerSession(sessionId: string, isServer = false): Promise<ApiResponse<AnswerSession>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('answer_sessions')
                .update({ completed_at: new Date().toISOString() })
                .eq('id', sessionId)
                .select()
                .single();

            if (error) {
                return {
                    success: false,
                    data: {} as AnswerSession,
                    error: error.message
                };
            }
            return {success: true, data};
        } catch (error) {
            return {
                success: false,
                data: {} as AnswerSession,
                error: error instanceof Error ? error.message : '回答セッションの完了に失敗しました'
            };
        }
    }

    // Answer CRUD 操作
    async saveAnswer(input: CreateAnswerInput, isServer = false): Promise<ApiResponse<Answer>> {
        try {
            const supabase = this.getClient(isServer);
            const {data, error} = await supabase
                .from('answers')
                .upsert({
                    ...input, created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            return {success: true, data};
        } catch (error) {
            return {
                success: false, data: {} as Answer, error: error instanceof Error ? error.message : '回答の保存に失敗しました'
            };
        }
    }

    async saveAnswers(inputs: CreateAnswerInput[], isServer = false): Promise<ApiResponse<Answer[]>> {
        try {
            const supabase = this.getClient(isServer);
            const timestamp = new Date().toISOString();

            const {data, error} = await supabase
                .from('answers')
                .upsert(inputs.map(input => ({
                    ...input, created_at: timestamp
                })))
                .select();

            if (error) throw error;

            return {success: true, data: data || []};
        } catch (error) {
            return {
                success: false, data: [], error: error instanceof Error ? error.message : '回答の一括保存に失敗しました'
            };
        }
    }

    async getAnswers(surveyId: string, sessionId?: string, isServer = false): Promise<ApiResponse<Answer[]>> {
        try {
            const supabase = this.getClient(isServer);
            let query = supabase
                .from('answers')
                .select('*')
                .eq('survey_id', surveyId);

            if (sessionId) {
                query = query.eq('session_id', sessionId);
            }

            const {data, error} = await query.order('created_at', {ascending: true});

            if (error) throw error;

            return {success: true, data: data || []};
        } catch (error) {
            return {
                success: false, data: [], error: error instanceof Error ? error.message : '回答の取得に失敗しました'
            };
        }
    }

    // 統計データ取得
    async getSurveyStats(surveyId: string, isServer = false): Promise<ApiResponse<SurveyStats>> {
        try {
            const cacheKey = `stats-${surveyId}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return {success: true, data: cached};
            }

            const supabase = this.getClient(isServer);

            // 基本統計の取得
            const {data: sessions, error: sessionsError} = await supabase
                .from('answer_sessions')
                .select('*')
                .eq('survey_id', surveyId);

            if (sessionsError) throw sessionsError;

            const totalResponses = sessions?.length || 0;
            const completedSessions = sessions?.filter(s => s.completed_at) || [];
            const completionRate = totalResponses > 0 ? (completedSessions.length / totalResponses) * 100 : 0;

            // 平均完了時間の計算
            const averageCompletionTime = completedSessions.reduce((sum, session) => {
                if (session.completed_at && session.started_at) {
                    const duration = new Date(session.completed_at).getTime() - new Date(session.started_at).getTime();
                    return sum + duration;
                }
                return sum;
            }, 0) / (completedSessions.length || 1);

            // 質問別統計は簡略化（実際の実装ではより詳細な集計が必要）
            const questionStats: any[] = [];

            const stats: SurveyStats = {
                totalResponses, completionRate, averageCompletionTime: averageCompletionTime / 1000, // 秒単位
                questionStats
            };

            this.setCache(cacheKey, stats, 10 * 60 * 1000); // 10分キャッシュ
            return {success: true, data: stats};
        } catch (error) {
            return {
                success: false,
                data: {} as SurveyStats,
                error: error instanceof Error ? error.message : '統計データの取得に失敗しました'
            };
        }
    }

    // ユーティリティメソッド
    async publishSurvey(id: string, isServer = false): Promise<ApiResponse<Survey>> {
        return this.updateSurvey({id, is_published: true}, isServer);
    }

    async unpublishSurvey(id: string, isServer = false): Promise<ApiResponse<Survey>> {
        return this.updateSurvey({id, is_published: false}, isServer);
    }

    private getClient(isServer = false) {
        return isServer ? createServerClient() : createBrowserClient();
    }

    // キャッシュヘルパー
    private setCache(key: string, data: any, ttl = CACHE_TTL) {
        cache.set(key, {
            data, expiry: Date.now() + ttl
        });
    }

    private getCache(key: string) {
        const cached = cache.get(key);
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }
        cache.delete(key);
        return null;
    }

    private clearCache(pattern?: string) {
        if (pattern) {
            for (const key of cache.keys()) {
                if (key.includes(pattern)) {
                    cache.delete(key);
                }
            }
        } else {
            cache.clear();
        }
    }
}

// シングルトンインスタンス
export const supabaseAPI = new SupabaseAPI();
