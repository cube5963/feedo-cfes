"use client"

import React, {useState, useEffect, useCallback} from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Divider,
    Chip,
    IconButton,
    Button,
    Tooltip
} from '@mui/material';
import {PieChart} from '@mui/x-charts/PieChart';
import {BarChart} from '@mui/x-charts/BarChart';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import {createClient} from '@/utils/supabase/client';
import {Section} from '@/app/_components/forms/types';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

interface StatisticsData {
    totalResponses: number;
    totalQuestions: number;
    responseRate: number;
    questionStats: QuestionStatistics[];
}

interface QuestionStatistics {
    section: Section;
    responseCount: number;
    responses: any[];
    statistics: any;
}

interface StatisticsTabProps {
    projectId: string;
}

export default function StatisticsTab({projectId}: StatisticsTabProps) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sectionRefreshing, setSectionRefreshing] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [starViewModes, setStarViewModes] = useState<Record<string, 'average' | 'chart'>>({});
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [sectionLastUpdated, setSectionLastUpdated] = useState<Record<string, Date>>({});
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const [realtimeError, setRealtimeError] = useState(false);

    // Supabase Realtimeを使用したリアルタイム統計更新
    useEffect(() => {
        const supabase = createClient();
        let channel: any = null;

        const setupRealtimeSubscription = () => {
            try {
                // Answerテーブルの変更を監視
                channel = supabase
                    .channel('statistics-updates')
                    .on(
                        'postgres_changes',
                        {
                            event: '*', // INSERT, UPDATE, DELETE すべてのイベントを監視
                            schema: 'public',
                            table: 'Answer',
                            filter: `FormUUID=eq.${projectId}` // 該当プロジェクトのみ
                        },
                        (payload) => {
                            handleAnswerChange(payload);
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            setRealtimeConnected(true);
                            setRealtimeError(false);
                        } else if (status === 'CHANNEL_ERROR') {
                            setRealtimeConnected(false);
                            setRealtimeError(true);
                        }
                    });

            } catch (error) {
                setRealtimeError(true);
            }
        };

        // 初期接続
        setupRealtimeSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [projectId]);

    // 回答データの変更を処理する関数（リアルタイム即座更新）
    const handleAnswerChange = useCallback(async (payload: any) => {

        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT' && newRecord) {
            // 即座にローカル統計を更新
            await updateStatisticsInstantly(newRecord.SectionUUID, 'INSERT', newRecord);
        } else if (eventType === 'UPDATE' && newRecord) {
            await updateStatisticsInstantly(newRecord.SectionUUID, 'UPDATE', newRecord);
        } else if (eventType === 'DELETE' && oldRecord) {
            await updateStatisticsInstantly(oldRecord.SectionUUID, 'DELETE', oldRecord);
        }
    }, []);

    // 統計を即座に更新する関数
    const updateStatisticsInstantly = useCallback(async (sectionUUID: string, eventType: string, record: any) => {

        try {
            const supabase = createClient();

            // 最新の回答データを取得（効率的にセクション単位で取得）
            const { data: responses, error } = await supabase
                .from('Answer')
                .select('*')
                .eq('FormUUID', projectId)
                .eq('SectionUUID', sectionUUID);

            if (error) {
                console.error('❌ 回答データ取得エラー:', error);
                return;
            }

            // AnswerUUIDでグループ化して重複を除去
            const uniqueResponsesByAnswerUUID = (responses || []).reduce((acc: any, response: any) => {
                acc[response.AnswerUUID] = response; // 同じAnswerUUIDの場合は上書き
                return acc;
            }, {});

            const uniqueResponses = Object.values(uniqueResponsesByAnswerUUID);

            // ローカル状態を即座に更新
            setStatistics(prev => {
                if (!prev) return prev;

                const updatedQuestionStats = prev.questionStats.map(qs => {
                    if (qs.section.SectionUUID === sectionUUID) {
                        const newStatistics = calculateQuestionStatistics(qs.section, uniqueResponses);

                        return {
                            ...qs,
                            responseCount: uniqueResponses.length,
                            responses: uniqueResponses,
                            statistics: newStatistics
                        };
                    }
                    return qs;
                });

                // 全体統計も即座に更新
                const totalUniqueResponders = new Set<string>();
                updatedQuestionStats.forEach(qs => {
                    qs.responses.forEach(response => {
                        totalUniqueResponders.add(response.AnswerUUID || 'anonymous');
                    });
                });

                const updatedStats = {
                    ...prev,
                    totalResponses: totalUniqueResponders.size,
                    responseRate: prev.totalQuestions > 0 ?
                        (updatedQuestionStats.reduce((sum, q) => sum + q.responseCount, 0) / prev.totalQuestions) : 0,
                    questionStats: updatedQuestionStats
                };

                return updatedStats;
            });

            // セクション個別の最終更新時刻を記録
            setSectionLastUpdated(prev => ({
                ...prev,
                [sectionUUID]: new Date()
            }));

        } catch (error) {
            // エラー時はフォールバックとして従来の方法を使用
            refreshSectionStatistics(sectionUUID);
        }
    }, [projectId]);

    // SSEから受信した統計データでセクションを更新する関数（既存のSSE用、互換性のため残す）
    const updateSectionStatistics = useCallback((sectionUUID: string, newStatistics: any) => {

        setStatistics(prev => {
            if (!prev) return prev;

            const updatedQuestionStats = prev.questionStats.map(qs => {
                if (qs.section.SectionUUID === sectionUUID) {
                    return {
                        ...qs,
                        responseCount: newStatistics.totalResponses,
                        responses: newStatistics.responses.map((response: any, index: number) => ({
                            Answer: JSON.stringify(response),
                            AnswerUUID: `sse-${index}`, // 仮のUUID
                        })),
                        statistics: transformSSEStatistics(newStatistics, qs.section)
                    };
                }
                return qs;
            });

            // 全体の統計も更新
            const totalResponses = Math.max(
                prev.totalResponses,
                newStatistics.totalResponses
            );

            return {
                ...prev,
                totalResponses,
                questionStats: updatedQuestionStats
            };
        });

        // セクション個別の最終更新時刻を記録
        setSectionLastUpdated(prev => ({
            ...prev,
            [sectionUUID]: new Date()
        }));
    }, []);

    // SSEから受信した統計データを既存の形式に変換
    const transformSSEStatistics = (sseStats: any, section: Section) => {
        switch (section.SectionType) {
            case 'radio':
            case 'checkbox':
                return {
                    type: 'choice',
                    counts: sseStats.choices || {},
                    total: sseStats.totalResponses,
                    options: Object.keys(sseStats.choices || {})
                };
            case 'star':
                return {
                    type: 'star',
                    counts: sseStats.ratingDistribution || {},
                    average: sseStats.averageRating || 0,
                    total: sseStats.totalResponses,
                    maxStars: 5 // デフォルト値
                };
            case 'slider':
                return {
                    type: 'slider',
                    average: sseStats.average || 0,
                    min: sseStats.min || 0,
                    max: sseStats.max || 0,
                    total: sseStats.totalResponses,
                    settings: {min: 0, max: 10, divisions: 5, labels: {min: '最小', max: '最大'}}
                };
            case 'text':
                return {
                    type: 'text',
                    total: sseStats.totalResponses,
                    responses: sseStats.responses || []
                };
            default:
                return {
                    type: 'unknown',
                    total: sseStats.totalResponses
                };
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [projectId]);

    // 特定のセクションの統計データを再取得する関数
    const refreshSectionStatistics = useCallback(async (sectionUUID: string) => {
        setSectionRefreshing(prev => ({...prev, [sectionUUID]: true}));

        try {
            const supabase = createClient();

            // 現在の統計から該当セクションの情報を取得
            let section: Section | undefined;

            // 現在の統計状態から該当セクションを取得
            setStatistics(prev => {
                if (prev) {
                    section = prev.questionStats.find(qs => qs.section.SectionUUID === sectionUUID)?.section;
                }
                return prev;
            });

            // セクションが見つからない場合は全体を更新
            if (!section) {
                await handleRefreshData();
                return;
            }

            const { data: responses, error: responsesError } = await supabase
                .from('Answer')
                .select('*')
                .eq('FormUUID', projectId)
                .eq('SectionUUID', sectionUUID);

            if (responsesError) {
                return;
            }

            const responseData = responses || [];

            // AnswerUUIDでグループ化して重複を除去
            const uniqueResponsesByAnswerUUID = responseData.reduce((acc: any, response: any) => {
                acc[response.AnswerUUID] = response; // 同じAnswerUUIDの場合は上書き
                return acc;
            }, {});

            const uniqueResponses = Object.values(uniqueResponsesByAnswerUUID);

            // 統計を再計算
            const newStatistics = calculateQuestionStatistics(section, uniqueResponses);

            // 該当セクションの統計のみを更新
            setStatistics(prev => {
                if (!prev) return prev;

                const updatedQuestionStats = prev.questionStats.map(qs => {
                    if (qs.section.SectionUUID === sectionUUID) {
                        return {
                            ...qs,
                            responseCount: uniqueResponses.length,
                            responses: uniqueResponses,
                            statistics: newStatistics
                        };
                    }
                    return qs;
                });

                // 全体の統計も更新
                const totalUniqueResponders = new Set<string>();
                updatedQuestionStats.forEach(qs => {
                    qs.responses.forEach(response => {
                        totalUniqueResponders.add(response.AnswerUUID || 'anonymous');
                    });
                });

                const updatedStats = {
                    ...prev,
                    totalResponses: totalUniqueResponders.size,
                    responseRate: prev.totalQuestions > 0 ?
                        (updatedQuestionStats.reduce((sum, q) => sum + q.responseCount, 0) / prev.totalQuestions) : 0,
                    questionStats: updatedQuestionStats
                };

                return updatedStats;
            });

            // セクション個別の最終更新時刻を記録
            setSectionLastUpdated(prev => ({
                ...prev,
                [sectionUUID]: new Date()
            }));


        } catch (error) {
            console.error('❌ セクション統計更新エラー:', error);
        } finally {
            setSectionRefreshing(prev => ({...prev, [sectionUUID]: false}));
        }
    }, [projectId]); // statisticsを依存配列から削除

    // 統計データを再取得する関数
    const handleRefreshData = useCallback(async () => {
        setRefreshing(true);
        await fetchStatistics();
        setRefreshing(false);
    }, [projectId]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const supabase = createClient();

            // セクション一覧を取得
            const {data: sections, error: sectionsError} = await supabase
                .from('Section')
                .select('*')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .order('SectionOrder', {ascending: true});

            if (sectionsError) {
                setError('質問データの取得に失敗しました');
                return;
            }

            if (!sections || sections.length === 0) {
                setStatistics({
                    totalResponses: 0,
                    totalQuestions: 0,
                    responseRate: 0,
                    questionStats: []
                });
                return;
            }

            // 各質問の回答データを取得
            /*
            const questionStats: QuestionStatistics[] = [];
            let totalUniqueResponders = new Set<string>();

            for (const section of sections) {
                const {data: responses, error: responsesError} = await supabase
                    .from('Answer')
                    .select('*')
                    .eq('FormUUID', projectId)
                    .eq('SectionUUID', section.SectionUUID);

                if (responsesError) {
                    console.error('回答データ取得エラー:', responsesError);
                    continue;
                }

                const responseData = responses || [];

                // 回答者のユニークIDを追加
                responseData.forEach(response => {
                    totalUniqueResponders.add(response.AnswerUUID || 'anonymous');
                });

                // 質問タイプに応じた統計を計算
                const statistics = calculateQuestionStatistics(section, responseData);

                questionStats.push({
                    section,
                    responseCount: responseData.length,
                    responses: responseData,
                    statistics
                });
            }
            */

            // 全ての回答を一度に取得
            const {data: allResponses, error: responsesError} = await supabase
                .from('Answer')
                .select('*')
                .eq('FormUUID', projectId);

            if (responsesError) {
                setError('回答データの取得に失敗しました');
                return;
            }

            // AnswerUUIDごとにグループ化
            const responsesByAnswerUUID = (allResponses || []).reduce((acc: any, response: any) => {
                if (!acc[response.AnswerUUID]) {
                    acc[response.AnswerUUID] = {};
                }
                acc[response.AnswerUUID][response.SectionUUID] = response;
                return acc;
            }, {});

            // ユニークな回答者数を計算
            const totalUniqueResponders = Object.keys(responsesByAnswerUUID).length;

            // 各質問の統計を計算
            const questionStats: QuestionStatistics[] = sections.map(section => {
                const sectionResponses = Object.values(responsesByAnswerUUID)
                    .map((answers: any) => answers[section.SectionUUID])
                    .filter(response => response !== undefined);

                const statistics = calculateQuestionStatistics(section, sectionResponses);

                return {
                    section,
                    responseCount: sectionResponses.length,
                    responses: sectionResponses,
                    statistics
                };
            });

            /*
            const statisticsData: StatisticsData = {
                totalResponses: totalUniqueResponders.size,
                totalQuestions: sections.length,
                responseRate: sections.length > 0 ? (questionStats.reduce((sum, q) => sum + q.responseCount, 0) / sections.length) : 0,
                questionStats
            };
             */

            const statisticsData: StatisticsData = {
                totalResponses: totalUniqueResponders,
                totalQuestions: sections.length,
                responseRate: sections.length > 0 ? (questionStats.reduce((sum, q) => sum + q.responseCount, 0) / sections.length) : 0,
                questionStats
            };

            setStatistics(statisticsData);
            setLastUpdated(new Date());

        } catch (error) {
            console.error('統計データ取得エラー:', error);
            setError('統計データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const calculateQuestionStatistics = (section: Section, responses: any[]) => {
        if (responses.length === 0) return null;

        try {
            // 安全なJSON解析関数
            const parseJsonSafely = (jsonString: string, defaultValue: any = {}) => {
                try {
                    if (!jsonString || jsonString.trim() === '' || jsonString.trim() === '{}') {
                        return defaultValue;
                    }
                    return JSON.parse(jsonString);
                } catch (error) {
                    console.warn('JSON解析エラー:', error, 'データ:', jsonString);
                    return defaultValue;
                }
            };

            const sectionDesc = parseJsonSafely(section.SectionDesc, {});
            /*
            const answers = responses.map(r => {
                try {
                    return JSON.parse(r.Answer);
                } catch {
                    return r.Answer;
                }
            });
             */
            const answers = responses.map(r => {
                try {
                    const parsed = JSON.parse(r.Answer);
                    // text以外のタイプは text プロパティだけを使う
                    if (section.SectionType !== 'text' && typeof parsed === 'object' && parsed !== null && 'text' in parsed) {
                        return parsed.text;
                    }
                    return parsed;
                } catch {
                    // text以外のタイプは r.Answer.text を使う
                    if (section.SectionType !== 'text' && typeof r.Answer === 'object' && r.Answer !== null && 'text' in r.Answer) {
                        return r.Answer.text;
                    }
                    return r.Answer;
                }
            });

            switch (section.SectionType) {
                case 'radio':
                case 'checkbox':
                    return calculateChoiceStatistics(answers, sectionDesc.options || ['選択肢1', '選択肢2']);
                case 'star':
                    return calculateStarStatistics(answers, sectionDesc.maxStars || 5);
                case 'slider':
                    return calculateSliderStatistics(answers, sectionDesc);
                case 'text':
                    return calculateTextStatistics(answers);
                case 'two_choice':
                    return calculateTwoChoiceStatistics(answers);
                default:
                    return null;
            }
        } catch (error) {
            console.error('統計計算エラー:', error);
            return null;
        }
    };

    const calculateChoiceStatistics = (answers: any[], options: string[]) => {
        const counts: Record<string, number> = {};
        options.forEach(option => counts[option] = 0);

        answers.forEach(answer => {
            if (Array.isArray(answer)) {
                // checkbox の場合
                answer.forEach(choice => {
                    if (counts.hasOwnProperty(choice)) {
                        counts[choice]++;
                    }
                });
            } else {
                // radio の場合
                if (counts.hasOwnProperty(answer)) {
                    counts[answer]++;
                }
            }
        });

        return {
            type: 'choice',
            counts,
            total: answers.length,
            options
        };
    };

    const calculateStarStatistics = (answers: number[], maxStars: number) => {
        const counts: Record<number, number> = {};
        for (let i = 1; i <= maxStars; i++) {
            counts[i] = 0;
        }

        answers.forEach(answer => {
            if (answer >= 1 && answer <= maxStars) {
                counts[answer]++;
            }
        });

        const average = answers.length > 0 ?
            //answers.reduce((sum, answer) => sum + (typeof answer === 'number' ? answer : 0), 0) / answers.length : 0;
            answers.reduce((sum, answer) => sum + answer, 0) / answers.length : 0;

        return {
            type: 'star',
            counts,
            average: Math.round(average * 100) / 100,
            total: answers.length,
            maxStars
        };
    };

    const calculateSliderStatistics = (answers: number[], settings: any) => {
        //const validAnswers = answers.filter(answer => typeof answer === 'number');
        const validAnswers = answers;
        const average = validAnswers.length > 0 ?
            validAnswers.reduce((sum, answer) => sum + answer, 0) / validAnswers.length : 0;
        const min = validAnswers.length > 0 ? Math.min(...validAnswers) : 0;
        const max = validAnswers.length > 0 ? Math.max(...validAnswers) : 0;

        // デフォルトのスライダー設定
        const defaultSettings = {
            min: 0,
            max: 10,
            divisions: 5,
            labels: {min: '最小', max: '最大'}
        };

        return {
            type: 'slider',
            average: Math.round(average * 100) / 100,
            min,
            max,
            total: validAnswers.length,
            settings: settings || defaultSettings
        };
    };

    const calculateTextStatistics = (answers: string[]) => {

        const validAnswers = answers
            .map((answer: any) => {
                if (typeof answer === 'object' && answer !== null && 'text' in answer) {
                    return String(answer.text);
                }
                if (typeof answer === 'string')
                    return answer;
                return null;
            })
            .filter(text => text !== null && text.trim() !== '')
            .map(text => text!.trim());

        return {
            type: 'text',
            total: validAnswers.length,
            responses: validAnswers
        }
    };

    const calculateTwoChoiceStatistics = (answers: any[]) => {
        const counts = {true: 0, false: 0};
        answers.forEach(answer => {
            if (answer === true || answer === 'はい') counts.true++;
            else if (answer === false || answer === 'いいえ') counts.false++;
        });

        return {
            type: 'two_choice',
            counts,
            total: answers.length
        };
    };

    const renderQuestionStatistics = (questionStat: QuestionStatistics) => {
        const {section, responseCount, statistics} = questionStat;
        const sectionId = section.SectionUUID || '';
        const currentStarViewMode = starViewModes[sectionId] || 'average';

        const toggleStarViewMode = () => {
            setStarViewModes(prev => ({
                ...prev,
                [sectionId]: prev[sectionId] === 'average' ? 'chart' : 'average'
            }));
        };

        if (!statistics) {
            return (
                <Card key={section.SectionUUID} sx={{mb: 3}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2}}>
                            {section.SectionName}
                        </Typography>
                        <Typography color="text.secondary">
                            回答数: {responseCount}件
                        </Typography>
                        <Typography color="text.secondary" sx={{mt: 1}}>
                            統計データを処理できませんでした
                        </Typography>
                    </CardContent>
                </Card>
            );
        }

        // PieChart用のデータを準備
        const preparePieData = () => {
            if (statistics.type === 'choice') {
                return statistics.options.map((option: string, index: number) => ({
                    id: index,
                    value: statistics.counts[option] || 0,
                    label: option,
                }));
            } else if (statistics.type === 'star') {
                return Object.entries(statistics.counts).map(([star, count], index) => ({
                    id: index,
                    value: Number(count),
                    label: `★${star}`,
                }));
            } else if (statistics.type === 'two_choice') {
                return [
                    {id: 0, value: statistics.counts.true, label: 'はい'},
                    {id: 1, value: statistics.counts.false, label: 'いいえ'},
                ];
            }
            return [];
        };

        // BarChart用のデータを準備（スター用）
        const prepareBarData = () => {
            if (statistics.type === 'star') {
                const data = [];
                const labels = [];
                for (let i = 1; i <= statistics.maxStars; i++) {
                    data.push(statistics.counts[i] || 0);
                    labels.push(`★${i}`);
                }
                return {data, labels};
            }
            return {data: [], labels: []};
        };

        // スター評価の星表示を生成
        const renderStarRating = (average: number, maxStars: number) => {
            const stars = [];
            for (let i = 1; i <= maxStars; i++) {
                if (i <= Math.floor(average)) {
                    stars.push(<StarIcon key={i} sx={{color: '#ffc107', fontSize: 32}}/>);
                } else if (i === Math.ceil(average) && average % 1 !== 0) {
                    // 半星の表現（簡易版）
                    stars.push(<StarIcon key={i} sx={{color: '#ffc107', fontSize: 32, opacity: 0.5}}/>);
                } else {
                    stars.push(<StarBorderIcon key={i} sx={{color: '#ffc107', fontSize: 32}}/>);
                }
            }
            return stars;
        };

        const pieData = preparePieData();
        const barData = prepareBarData();

        return (
            <Card
                key={section.SectionUUID}
                sx={{
                    mb: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                    },
                    ...(refreshing && {
                        opacity: 0.7,
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            animation: 'shimmer 1.5s infinite',
                        }
                    })
                }}
            >
                <CardContent sx={{position: 'relative'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2}}>
                        <Typography variant="h6" sx={{flex: 1}}>
                            {section.SectionName}
                        </Typography>
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                            <Chip
                                key={`chip-${sectionId}-${responseCount}`} // リアルタイム更新のキー
                                label={`${responseCount}件の回答`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    transition: 'all 0.4s ease-in-out',
                                    // リアルタイム更新時のバウンス効果
                                    '@keyframes bounce': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.1)' },
                                        '100%': { transform: 'scale(1)' }
                                    },
                                    animation: sectionLastUpdated[sectionId] &&
                                    (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                        'bounce 0.6s ease-in-out' : 'none',
                                    // 新しい回答時の背景色変化
                                    backgroundColor: sectionLastUpdated[sectionId] &&
                                    (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                        'primary.light' : 'transparent',
                                    color: sectionLastUpdated[sectionId] &&
                                    (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                        'primary.contrastText' : 'primary.main'
                                }}
                            />
                            {sectionLastUpdated[sectionId] && (
                                <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.7rem'}}>
                                    {sectionLastUpdated[sectionId].toLocaleTimeString('ja-JP', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </Typography>
                            )}
                            <Tooltip title="この質問の統計を更新">
                                <IconButton
                                    size="small"
                                    onClick={() => refreshSectionStatistics(sectionId)}
                                    disabled={sectionRefreshing[sectionId] || false}
                                    sx={{
                                        color: 'primary.main',
                                        '&:hover': {backgroundColor: 'primary.light', color: 'white'},
                                        ...(sectionRefreshing[sectionId] && {
                                            animation: 'spin 1s linear infinite',
                                        })
                                    }}
                                >
                                    {sectionRefreshing[sectionId] ? (
                                        <CircularProgress size={16} color="inherit"/>
                                    ) : (
                                        <RefreshIcon fontSize="small"/>
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* カードの左半分：グラフ、右半分：将来の機能用スペース */}
                    <Box sx={{display: 'flex', gap: 2, minHeight: 250}}>
                        {/* 左半分：グラフエリア */}
                        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            {/* 選択式・二択質問 */}
                            {(statistics.type === 'choice' || statistics.type === 'two_choice') && pieData.length > 0 && (
                                <Box
                                    key={`pie-${sectionId}-${responseCount}`} // リアルタイム更新のキー
                                    sx={{
                                        transition: 'all 0.5s ease-in-out',
                                        transform: sectionRefreshing[sectionId] ? 'scale(0.98)' : 'scale(1)',
                                        opacity: sectionRefreshing[sectionId] ? 0.8 : 1,
                                        '& .MuiChartsLegend-series': {
                                            transition: 'all 0.3s ease'
                                        },
                                        // リアルタイム更新時の光る効果
                                        '@keyframes pulse': {
                                            '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)' },
                                            '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                                            '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                                        },
                                        animation: sectionLastUpdated[sectionId] &&
                                        (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                            'pulse 1s ease-out' : 'none'
                                    }}
                                >
                                    <PieChart
                                        series={[
                                            {
                                                data: pieData,
                                                highlightScope: {fade: 'global', highlight: 'item'},
                                                faded: {innerRadius: 30, additionalRadius: -30, color: 'gray'},
                                            },
                                        ]}
                                        height={200}
                                    />
                                </Box>
                            )}

                            {/* スター評価のカルーセル */}
                            {statistics.type === 'star' && (
                                <Box sx={{position: 'relative'}}>
                                    {currentStarViewMode === 'average' ? (
                                        <Box
                                            key={`star-avg-${sectionId}-${responseCount}`} // リアルタイム更新のキー
                                            sx={{
                                                textAlign: 'center',
                                                py: 2,
                                                transition: 'all 0.5s ease-in-out',
                                                // リアルタイム更新時の星の輝き効果
                                                '@keyframes starGlow': {
                                                    '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
                                                    '50%': { transform: 'scale(1.05)', filter: 'brightness(1.2)' },
                                                    '100%': { transform: 'scale(1)', filter: 'brightness(1)' }
                                                },
                                                animation: sectionLastUpdated[sectionId] &&
                                                (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                                    'starGlow 1.2s ease-in-out' : 'none'
                                            }}
                                        >
                                            <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                                                {renderStarRating(statistics.average, statistics.maxStars)}
                                            </Box>
                                            <Typography
                                                variant="h4"
                                                color="primary.main"
                                                sx={{
                                                    mb: 1,
                                                    transition: 'all 0.3s ease',
                                                    fontWeight: sectionLastUpdated[sectionId] &&
                                                    (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                                        'bold' : 'normal'
                                                }}
                                            >
                                                {statistics.average}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                / {statistics.maxStars}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box
                                            key={`bar-${sectionId}-${responseCount}`} // リアルタイム更新のキー
                                            sx={{
                                                transition: 'all 0.5s ease-in-out',
                                                transform: sectionRefreshing[sectionId] ? 'scale(0.98)' : 'scale(1)',
                                                opacity: sectionRefreshing[sectionId] ? 0.8 : 1,
                                                // リアルタイム更新時のハイライト効果
                                                '@keyframes glow': {
                                                    '0%': { filter: 'brightness(1)' },
                                                    '50%': { filter: 'brightness(1.1)' },
                                                    '100%': { filter: 'brightness(1)' }
                                                },
                                                animation: sectionLastUpdated[sectionId] &&
                                                (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                                    'glow 1.5s ease-in-out' : 'none'
                                            }}
                                        >
                                            <BarChart
                                                xAxis={[{scaleType: 'band', data: barData.labels}]}
                                                series={[{data: barData.data, color: '#ffc107'}]}
                                                height={150}
                                            />
                                        </Box>
                                    )}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <IconButton
                                            onClick={toggleStarViewMode}
                                            sx={{opacity: 0.7}}
                                        >
                                            <ChevronLeftIcon/>
                                        </IconButton>
                                        <Typography variant="body2" color="text.secondary">
                                            {currentStarViewMode === 'average' ? '平均評価' : '分布'}
                                        </Typography>
                                        <IconButton
                                            onClick={toggleStarViewMode}
                                            sx={{opacity: 0.7}}
                                        >
                                            <ChevronRightIcon/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            )}

                            {/* スライダー */}
                            {statistics.type === 'slider' && (
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <Typography variant="h3" color="primary.main" sx={{mb: 1}}>
                                        {statistics.average}
                                    </Typography>
                                    <Typography variant="body1" sx={{mb: 1}}>
                                        平均値
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        最小値: {statistics.min} / 最大値: {statistics.max}
                                    </Typography>
                                </Box>
                            )}

                            {/* テキスト回答のスクロール表示 */}
                            {statistics.type === 'text' && (
                                <Box
                                    sx={{
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        py: 2,
                                        pr: 1, // スクロールバー用のパディング
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: '#f1f1f1',
                                            borderRadius: '3px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: '#c1c1c1',
                                            borderRadius: '3px',
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                            backgroundColor: '#a8a8a8',
                                        },
                                    }}
                                >
                                    {statistics.responses.map((response: string, index: number) => (
                                        <Typography
                                            key={index}
                                            variant="body2"
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: 1,
                                                fontStyle: 'italic',
                                                fontSize: '0.9rem',
                                                lineHeight: 1.4,
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {response}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* 右半分：将来の機能用スペース */}
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: statistics.type === 'text' ? 'transparent' : '#f8f9fa',
                            borderRadius: 1,
                            border: statistics.type === 'text' ? 'none' : '1px dashed #ddd'
                        }}>
                            {statistics.type === 'text' ? (
                                <Box sx={{ width: '100%', textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        感情分析
                                    </Typography>
                                    {(() => {
                                        // predictの値を集計
                                        const predictCounts: { 0: number; 1: number; 2: number } = { 0: 0, 1: 0, 2: 0 };
                                        statistics.responses.forEach((response: string, index: number) => {
                                            // 対応する回答データからpredictを取得
                                            const answerData = questionStat.responses[index];
                                            if (answerData && answerData.Answer) {
                                                try {
                                                    const parsed = JSON.parse(answerData.Answer);
                                                    if (typeof parsed.predict === 'number' && (parsed.predict === 0 || parsed.predict === 1 || parsed.predict === 2)) {
                                                        predictCounts[parsed.predict as 0 | 1 | 2]++;
                                                    }
                                                } catch (error) {
                                                    console.warn('予測データ解析エラー:', error);
                                                }
                                            }
                                        });

                                        const predictData = [
                                            { id: 0, value: predictCounts[0], label: 'ネガティブ' },
                                            { id: 1, value: predictCounts[1], label: 'ニュートラル' },
                                            { id: 2, value: predictCounts[2], label: 'ポジティブ' }
                                        ].sort((a, b) => b.value - a.value);;

                                        //const totalPredicts = predictCounts[0] + predictCounts[1];
                                        const totalPredicts = predictCounts[0] + predictCounts[1] + predictCounts[2];


                                        return totalPredicts > 0 ? (
                                            <Box
                                                key={`predict-${sectionId}-${totalPredicts}`}
                                                sx={{
                                                    transition: 'all 0.5s ease-in-out',
                                                    '@keyframes predictPulse': {
                                                        '0%': { boxShadow: '0 0 0 0 rgba(156, 39, 176, 0.4)' },
                                                        '70%': { boxShadow: '0 0 0 10px rgba(156, 39, 176, 0)' },
                                                        '100%': { boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)' }
                                                    },
                                                    animation: sectionLastUpdated[sectionId] &&
                                                    (Date.now() - sectionLastUpdated[sectionId].getTime()) < 2000 ?
                                                        'predictPulse 1s ease-out' : 'none'
                                                }}
                                            >
                                                <PieChart
                                                    series={[
                                                        {
                                                            data: predictData,
                                                            highlightScope: { fade: 'global', highlight: 'item' },
                                                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                                        },
                                                    ]}
                                                    height={180}
                                                    colors={['#ff5722', '#ffc107', '#4caf50']} // 0: オレンジ, 1: グリーン
                                                />
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    総予測数: {totalPredicts}件
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                予測データがありません
                                            </Typography>
                                        );
                                    })()}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    将来の機能用スペース
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box sx={{py: 4, textAlign: 'center'}}>
                <CircularProgress/>
                <Typography variant="body2" sx={{mt: 2}}>
                    統計データを読み込んでいます...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{py: 4}}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!statistics || statistics.totalQuestions === 0) {
        return (
            <Box sx={{py: 4}}>
                <Typography variant="h6" sx={{mb: 3, fontWeight: 600}}>
                    アンケート統計
                </Typography>
                <Paper sx={{p: 4, textAlign: 'center', borderRadius: 2}}>
                    <BarChartIcon sx={{fontSize: 60, color: '#ccc', mb: 2}}/>
                    <Typography variant="h6" color="text.secondary" sx={{mb: 1}}>
                        まだ質問がありません
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        質問を作成してアンケートを開始してください
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{
            py: 4,
            '& @keyframes shimmer': {
                '0%': {transform: 'translateX(-100%)'},
                '100%': {transform: 'translateX(100%)'}
            }
        }}>
            {/* ヘッダーエリア */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h6" sx={{fontWeight: 600}}>
                    アンケート統計
                </Typography>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    {lastUpdated && (
                        <Typography variant="body2" color="text.secondary">
                            最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
                        </Typography>
                    )}

                    <Tooltip title="データを最新に更新">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleRefreshData}
                            disabled={refreshing}
                            startIcon={
                                refreshing ? (
                                    <CircularProgress size={16}/>
                                ) : (
                                    <RefreshIcon/>
                                )
                            }
                            sx={{
                                minWidth: 100,
                                '& .MuiCircularProgress-root': {
                                    animation: 'spin 1s linear infinite',
                                },
                                '@keyframes spin': {
                                    '0%': {
                                        transform: 'rotate(0deg)',
                                    },
                                    '100%': {
                                        transform: 'rotate(360deg)',
                                    },
                                },
                            }}
                        >
                            {refreshing ? '更新中' : '更新'}
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            {/* リアルタイム更新の通知 */}
            {!loading && !error && (
                <Alert
                    severity={realtimeConnected ? "success" : realtimeError ? "warning" : "info"}
                    sx={{
                        mb: 3,
                        bgcolor: realtimeConnected ? '#e8f5e8' : realtimeError ? '#fff3e0' : '#e3f2fd',
                        borderLeft: `4px solid ${realtimeConnected ? '#4caf50' : realtimeError ? '#ff9800' : '#1976d2'}`
                    }}
                >
                    {realtimeConnected ? (
                        <> ✅ リアルタイム統計更新が有効です。新しい回答が追加されると自動的に統計が更新されます。</>
                    ) : realtimeError ? (
                        <>🟡 リアルタイム接続に問題があります。手動更新ボタンで最新データを取得してください。</>
                    ) : (
                        <>🔄 リアルタイム統計機能を初期化中です...</>
                    )}
                </Alert>
            )}

            {/* 概要統計 */}
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4}}>
                <Card sx={{
                    transition: 'all 0.3s ease',
                    // リアルタイム更新時の強調効果
                    '@keyframes highlight': {
                        '0%': { backgroundColor: 'background.paper' },
                        '50%': { backgroundColor: 'primary.light' },
                        '100%': { backgroundColor: 'background.paper' }
                    },
                    animation: lastUpdated && (Date.now() - lastUpdated.getTime()) < 3000 ?
                        'highlight 2s ease-in-out' : 'none'
                }}>
                    <CardContent sx={{textAlign: 'center'}}>
                        <PeopleIcon sx={{fontSize: 40, color: '#1976d2', mb: 1}}/>
                        <Typography
                            key={`total-responses-${statistics.totalResponses}`} // リアルタイム更新のキー
                            variant="h4"
                            color="primary.main"
                            sx={{
                                transition: 'all 0.4s ease-in-out',
                                '@keyframes countUp': {
                                    '0%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.15)' },
                                    '100%': { transform: 'scale(1)' }
                                },
                                animation: lastUpdated && (Date.now() - lastUpdated.getTime()) < 3000 ?
                                    'countUp 0.8s ease-in-out' : 'none'
                            }}
                        >
                            {statistics.totalResponses}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            回答者数
                        </Typography>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent sx={{textAlign: 'center'}}>
                        <QuestionAnswerIcon sx={{fontSize: 40, color: '#ff9800', mb: 1}}/>
                        <Typography variant="h4" color="primary.main">
                            {statistics.totalQuestions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            質問数
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    transition: 'all 0.3s ease',
                    // 回答率更新時の効果
                    animation: lastUpdated && (Date.now() - lastUpdated.getTime()) < 3000 ?
                        'highlight 2s ease-in-out' : 'none'
                }}>
                    <CardContent sx={{textAlign: 'center'}}>
                        <BarChartIcon sx={{fontSize: 40, color: '#4caf50', mb: 1}}/>
                        <Typography
                            key={`response-rate-${statistics.responseRate.toFixed(1)}`} // リアルタイム更新のキー
                            variant="h4"
                            color="primary.main"
                            sx={{
                                transition: 'all 0.4s ease-in-out',
                                animation: lastUpdated && (Date.now() - lastUpdated.getTime()) < 3000 ?
                                    'countUp 0.8s ease-in-out' : 'none'
                            }}
                        >
                            {statistics.responseRate.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            平均回答数/質問
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Divider sx={{mb: 4}}/>

            {/* 質問別統計 */}
            <Typography variant="h6" sx={{mb: 3, fontWeight: 600}}>
                質問別統計
            </Typography>

            {statistics.questionStats.length === 0 ? (
                <Paper sx={{p: 4, textAlign: 'center', borderRadius: 2}}>
                    <Typography variant="body1" color="text.secondary">
                        まだ回答がありません
                    </Typography>
                </Paper>
            ) : (
                statistics.questionStats.map(renderQuestionStatistics)
            )}
        </Box>
    );
}