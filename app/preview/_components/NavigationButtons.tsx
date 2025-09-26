"use client"

import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isAnswered?: boolean;
}

export default function NavigationButtons({ 
  onPrevious, 
  onNext, 
  onComplete,
  isFirstQuestion, 
  isLastQuestion,
  isAnswered = false 
}: NavigationButtonsProps) {
  return (
    <Box sx={{ 
      position: 'fixed',
      bottom: 20, // 下から少し上げる
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
        {/* 前へボタン */}
        <IconButton
          onClick={onPrevious}
          disabled={isFirstQuestion}
          sx={{ 
            minWidth: 48,
            minHeight: 48,
            backgroundColor: isFirstQuestion ? 'transparent' : '#f5f5f5',
            '&:hover': {
              backgroundColor: isFirstQuestion ? 'transparent' : '#e0e0e0'
            },
            opacity: isFirstQuestion ? 0.3 : 1
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* 中央のテキスト */}
        <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
          {isLastQuestion ? (
            <Button
              variant="contained"
              color="success"
              onClick={onComplete}
              startIcon={<CheckCircleIcon />}
              sx={{ 
                minWidth: 140, 
                minHeight: 48,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              アンケート完了
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onNext}
              disabled={!isAnswered}
              sx={{ 
                minWidth: 140,
                minHeight: 48,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: isAnswered ? '#1976d2' : '#e0e0e0',
                color: isAnswered ? 'white' : '#999',
                '&:hover': {
                  backgroundColor: isAnswered ? '#1565c0' : '#e0e0e0'
                }
              }}
            >
              次の質問へ
            </Button>
          )}
        </Box>

        {/* 退出ボタン */}
        <IconButton
          onClick={onComplete}
          sx={{ 
            minWidth: 48,
            minHeight: 48,
            backgroundColor: isAnswered ? '#f5f5f5' : 'transparent',
            '&:hover': {
              backgroundColor: isAnswered ? '#e0e0e0' : 'transparent'
            },
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
