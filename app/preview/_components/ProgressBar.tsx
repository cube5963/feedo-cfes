"use client"

import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 64, // ヘッダーの下に配置
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      zIndex: 1090, // ヘッダーより下
      backgroundColor: 'white',
      borderBottom: '1px solid #e0e0e0',
      p: 3,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <Box sx={{ 
        maxWidth: '100%', 
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        px: 1
      }}>
        <Typography variant="body2" color="text.primary" sx={{ minWidth: 'fit-content', fontWeight: 500 }}>
          {current} / {total}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            flex: 1,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#f0f0f0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
            }
          }} 
        />
        <Typography variant="body2" color="text.primary" sx={{ minWidth: 'fit-content', fontWeight: 500 }}>
          {Math.round(progress)}%
        </Typography>
      </Box>
    </Box>
  );
}
