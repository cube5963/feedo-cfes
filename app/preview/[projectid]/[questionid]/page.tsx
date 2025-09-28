"use client"

import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Alert, Box, CircularProgress, Typography} from '@mui/material';
import {Section} from '@/app/_components/forms/types';
import QuestionComponent from '@/app/preview/_components/QuestionComponent';
import ProgressBar from '@/app/preview/_components/ProgressBar';
import NavigationButtons from '@/app/preview/_components/NavigationButtons';
import Header from '@/app/_components/Header';
import {createAnonClient} from "@/utils/supabase/anonClient";

interface FormData {
    FormUUID: string;
    FormName: string;
}

export default function PreviewQuestionPage() {
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

    useEffect(() => {
        fetchData();
    }, [projectId, questionId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const supabase = createAnonClient();

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
            const {data: sectionsData, error: sectionsError} = await supabase
                .from('Section')
                .select('*')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .order('SectionOrder', {ascending: true});

            if (sectionsError) {
                setError('質問の取得に失敗しました');
                return;
            }

            setSections(sectionsData || []);

            // 現在の質問を特定
            const currentSectionData = sectionsData?.find(s => s.SectionUUID === questionId);
            if (!currentSectionData) {
                setError('指定された質問が見つかりません');
                return;
            }

            setCurrentSection(currentSectionData);

            // 現在の質問のインデックスを取得
            const index = sectionsData?.findIndex(s => s.SectionUUID === questionId) ?? 0;
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

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevSection = sections[currentIndex - 1];
            router.push(`/preview/${projectId}/${prevSection.SectionUUID}`);
        }
    };

    const handleNext = () => {
        if (currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            router.push(`/preview/${projectId}/${nextSection.SectionUUID}`);
        }
    };

    const handleComplete = () => {
        // 完了処理（回答の保存など）
        router.push(`/preview/${projectId}/complete`);
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
                title="プレビュー"
                onBack={handleBack}
                maxWidth={480}
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
                pt: 8, // プログレスバーの分
                pb: 14, // ナビゲーションボタンの分（浮いている分を考慮）
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

            {/* ナビゲーションボタン */}
            <NavigationButtons
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={handleComplete}
                isFirstQuestion={currentIndex === 0}
                isLastQuestion={currentIndex === sections.length - 1}
                isAnswered={isAnswered}
            />
        </Box>
    );
}
