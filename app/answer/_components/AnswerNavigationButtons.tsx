"use client"

import React from 'react';
import {Box, Button, CircularProgress, IconButton} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AnswerNavigationButtonsProps {
    onPrevious?: () => void;
    onNext?: () => void;
    onComplete?: () => void;
    isFirstQuestion: boolean;
    isLastQuestion: boolean;
    isAnswered?: boolean;
    isSubmitting?: boolean;
}

export default function AnswerNavigationButtons({
                                                    onPrevious,
                                                    onNext,
                                                    onComplete,
                                                    isFirstQuestion,
                                                    isLastQuestion,
                                                    isAnswered = false,
                                                    isSubmitting = false
                                                }: AnswerNavigationButtonsProps) {
    return (
        <Box sx={{
            position: 'fixed',
            bottom: 5, // 下から少し上げる
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            zIndex: 1100,
            px: 2 // 左右のパディングを追加
        }}>
            <Box sx={{
                backgroundColor: 'white',
                borderRadius: 3, // 角を丸くする
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', // より強いシャドウ
                border: '1px solid #e0e0e0',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>

                <Box sx={{ width: 48 }} />

                {/* 中央のテキスト */}
                <Box sx={{ minWidth: 140, textAlign: 'center', mx: 'auto' }}>
                    {isLastQuestion ? (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={onComplete}
                            disabled={isSubmitting}
                            startIcon={
                                isSubmitting ? <CircularProgress size={20} color="inherit"/> : <CheckCircleIcon/>
                            }
                            sx={{
                                minWidth: 140,
                                minHeight: 48,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            {isSubmitting ? '送信中...' : 'アンケート完了'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={onNext}
                            disabled={!isAnswered || isSubmitting}
                            startIcon={
                                isSubmitting ? <CircularProgress size={20} color="inherit"/> : null
                            }
                            sx={{
                                minWidth: 140,
                                minHeight: 48,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                backgroundColor: (isAnswered && !isSubmitting) ? '#1976d2' : '#e0e0e0',
                                color: (isAnswered && !isSubmitting) ? 'white' : '#999',
                                '&:hover': {
                                    backgroundColor: (isAnswered && !isSubmitting) ? '#1565c0' : '#e0e0e0'
                                }
                            }}
                        >
                            {isSubmitting ? '保存中...' : '次の質問へ'}
                        </Button>
                    )}
                </Box>

                {/* 退出ボタン */}
                <IconButton
                    onClick={onComplete}
                    sx={{
                        minWidth: 48,
                        minHeight: 48,
                        backgroundColor: (isAnswered && !isSubmitting) ? '#f5f5f5' : 'transparent',
                        '&:hover': {
                            backgroundColor: (isAnswered && !isSubmitting) ? '#e0e0e0' : 'transparent'
                        },
                    }}
                >
                    <LogoutIcon />
                </IconButton>
            </Box>
        </Box>
    );
}
