"use client"

import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Alert, Box, CircularProgress, Typography} from '@mui/material';
import {createAnswerClient} from '@/utils/supabase/answerClient';
import {Section} from '@/app/_components/forms/types';
import QuestionComponent from '@/app/preview/_components/QuestionComponent';
import ProgressBar from '@/app/preview/_components/ProgressBar';
import AnswerNavigationButtons from '@/app/answer/_components/AnswerNavigationButtons';
import Header from '@/app/_components/Header';
import {Turnstile} from '@marsidev/react-turnstile';

interface FormData {
    FormUUID: string;
    FormName: string;
}

export default function AnswerQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectid as string;
    const questionId = params.questionid as string;

    const [formData, setFormData] = useState<FormData | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answerUUID, setAnswerUUID] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

    const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY

    useEffect(() => {
        // 履歴を1つだけにする
        router.replace(`/answer/${projectId}/${questionId}?answerUUID=${answerUUID}`);
        // pushStateで履歴を1つに固定
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            router.push('/404');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [projectId, questionId, answerUUID, router]);

    useEffect(() => {
        fetchData();
    }, [projectId, questionId]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlAnswerUUID = searchParams.get('answerUUID');

        if (urlAnswerUUID) {
            setAnswerUUID(urlAnswerUUID);
        } else if (currentIndex === 0 && !answerUUID) {
            const uuid = crypto.randomUUID();
            setAnswerUUID(uuid);
        }
    }, [currentIndex]);

    const verifyTurnstile = async (token: string) => {
        const res = await fetch('/api/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        const data = await res.json();
        return data.success;
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const supabase = createAnswerClient(); // 回答専用クライアント使用

            // フォーム情報を取得
            const {data: formData, error: formError} = await supabase
                .from('Form')
                .select('FormUUID, FormName')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .single();

            if (formError) {
                setError('フォームが見つかりません');
                return;
            }

            setFormData(formData);

            // セクション一覧を取得
            const redisRes = await fetch(`/api/sections?projectId=${projectId}`);
            const redisJson = await redisRes.json();

            let sectionsData: Section[] | null = null;

            if (redisJson.GET) {
                //console.log("found data in redis")
                sectionsData = JSON.parse(redisJson.GET);
            } else {
                //console.log("not found data in redis")
                const {data, error} = await supabase
                    .from('Section')
                    .select('*')
                    .eq('FormUUID', projectId)
                    .eq('Delete', false)
                    .order('SectionOrder', {ascending: true})

                if (error) throw error;
                sectionsData = data || [];

                await fetch('/api/sections', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({projectId, sectionsData}),
                });
            }
            setSections(sectionsData || []);

            // 現在の質問を特定
            const currentSectionData = sectionsData?.find((s: Section) => s.SectionUUID === questionId);
            if (!currentSectionData) {
                setError('指定された質問が見つかりません');
                return;
            }

            setCurrentSection(currentSectionData);

            // 現在の質問のインデックスを取得
            const index = sectionsData?.findIndex((s: Section) => s.SectionUUID === questionId) ?? 0;
            setCurrentIndex(index);

        } catch (error) {
            console.error('データ取得エラー:', error);
            setError('データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (answer: any) => {
        if (currentSection) {
            setAnswers(prev => ({
                ...prev,
                [currentSection.SectionUUID!]: answer
            }));
        }
    };

    // 常に新規回答をinsertする
    const saveAnswer = async (sectionUUID: string, answerData: any) => {
        try {
            const supabase = createAnswerClient(); // 回答専用クライアント使用
            const answerPayload = {
                FormUUID: projectId,
                SectionUUID: sectionUUID,
                AnswerUUID: answerUUID,
                Answer: JSON.stringify({text: answerData, predict: ""})
            };
            const {data, error} = await supabase
                .from('Answer')
                .insert([answerPayload])
                .select();
            //console.log(data);
            if (error) {
                console.error('回答保存エラー:', JSON.stringify(error));
            } else {
                const section = sections.find(s => s.SectionUUID === sectionUUID);
                const answerSectionUUID = data[0].AnswerSectionUUID;
                if (section && section.SectionType === "text") {
                    await fetch(process.env.NEXT_PUBLIC_AI_API_URL as string + "emotions", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            type: 'predict',
                            payload: {
                                answer_id: answerSectionUUID
                            }
                        })
                    });
                }
            }
        } catch (error) {
            console.error('回答保存処理エラー:', JSON.stringify(error));
        }
    };

    const handlePrevious = async () => {
        // 現在の回答を保存してから移動
        if (currentSection && answers[currentSection.SectionUUID!] !== undefined) {
            setIsSubmitting(true);
            await saveAnswer(currentSection.SectionUUID!, answers[currentSection.SectionUUID!]);
            setIsSubmitting(false);
        }

        if (currentIndex > 0) {
            const prevSection = sections[currentIndex - 1];
            router.push(`/answer/${projectId}/${prevSection.SectionUUID}?answerUUID=${answerUUID}`);
        }
    };

    const handleNext = async () => {
        /*
        if (!turnstileToken) {
            setError('認証を完了してください')
            return
        }

        const isValid = await verifyTurnstile(turnstileToken);
        if (!isValid) {
            setError('認証に失敗しました。再度お試しください');
            setTurnstileToken(null);
            return;
        }
         */

        // 現在の回答を保存してから移動
        if (currentSection && answers[currentSection.SectionUUID!] !== undefined) {
            setIsSubmitting(true);
            await saveAnswer(currentSection.SectionUUID!, answers[currentSection.SectionUUID!]);
            setIsSubmitting(false);
        }

        if (currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            router.push(`/answer/${projectId}/${nextSection.SectionUUID}?answerUUID=${answerUUID}`);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);

        /*
        if (!turnstileToken) {
            setError('認証を完了してください');
            setIsSubmitting(false);
            return;
        }
        // Turnstile検証
        const isValid = await verifyTurnstile(turnstileToken);
        if (!isValid) {
            setError('認証に失敗しました。再度お試しください');
            setTurnstileToken(null);
            setIsSubmitting(false);
            return;
        }
         */

        // 最後の回答を保存
        if (currentSection && answers[currentSection.SectionUUID!] !== undefined) {
            await saveAnswer(currentSection.SectionUUID!, answers[currentSection.SectionUUID!]);
        }

        setIsSubmitting(false);

        router.push(`/answer/${projectId}/complete`);
    };

    const handleBack = () => {
        router.push(`/project/${projectId}`);
    };

    const isAnswered = currentSection ?
        answers[currentSection.SectionUUID!] !== undefined : false;

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                maxWidth: 480,
                mx: 'auto',
                backgroundColor: '#f8f9fa'
            }}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                maxWidth: 480,
                mx: 'auto',
                p: 2,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Alert severity="error" sx={{width: '100%'}}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!currentSection || !formData) {
        return (
            <Box sx={{
                maxWidth: 480,
                mx: 'auto',
                p: 2,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Alert severity="warning" sx={{width: '100%'}}>
                    質問データが見つかりません
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 480,  // スマホサイズに制限
            mx: 'auto',     // 中央配置
            position: 'relative'
        }}>
            {/* ヘッダー */}
            <Header
                title="アンケート回答"
                onBack={handleBack}
                maxWidth={480}
                showBackButton={false}
            />

            {/* プログレスバー */}
            <Box sx={{mt: 8}}> {/* ヘッダーの高さ分のマージン */}
                <ProgressBar
                    current={currentIndex + 1}
                    total={sections.length}
                />
            </Box>

            {/* メインコンテンツ */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pt: 10, // プログレスバーの分
                pb: 2, // ナビゲーションボタンの分（浮いている分を考慮）
                px: 3,
                minHeight: 'calc(100vh - 200px)' // ヘッダー、プログレスバー、フッターを除いた高さ
            }}>
                {/* フォームタイトル */}
                <Typography
                    variant="h5"
                    align="center"
                    sx={{
                        mb: 4,
                        fontWeight: 600,
                        px: 2,
                        fontSize: '1.4rem',
                        color: '#333',
                        lineHeight: 1.3
                    }}
                >
                    {formData.FormName}
                </Typography>

                {/* 質問番号表示 */}
                <Typography
                    variant="body1"
                    align="center"
                    sx={{
                        mb: 3,
                        color: '#666',
                        fontSize: '1rem'
                    }}
                >
                    質問 {currentIndex + 1} / {sections.length}
                </Typography>

                {/* 質問コンポーネント */}
                <Box sx={{px: 1}}>
                    <QuestionComponent
                        section={currentSection}
                        onAnswer={handleAnswer}
                        isAnswered={isAnswered}
                    />
                </Box>
            </Box>

            {/*
            <Box sx={{px: 3, mb: 1, pb: 12, display: 'flex', justifyContent: 'center'}}>
                <Turnstile
                    siteKey={siteKey ?? ''}
                    onSuccess={setTurnstileToken}
                    options={{theme: 'light'}}
                    style={{width: 180, minHeight: 65}} // 幅を小さめに
                />
            </Box>
            */}

            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    maxWidth: 480,
                    mx: 'auto',
                    px: 3,
                    pb: 2,
                    backgroundColor: '#f8f9fa',
                    zIndex: 10,
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)'
                }}
            >
                <AnswerNavigationButtons
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onComplete={handleComplete}
                    isFirstQuestion={currentIndex === 0}
                    isLastQuestion={currentIndex === sections.length - 1}
                    isAnswered={isAnswered}
                    isSubmitting={isSubmitting}
                />
            </Box>
        </Box>
    );
}
