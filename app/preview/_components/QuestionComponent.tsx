"use client"

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
  Slider,
  Rating,
  Button,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import { Section } from '@/app/_components/forms/types';

interface QuestionComponentProps {
  section: Section;
  onAnswer?: (answer: any) => void;
  isAnswered?: boolean;
}

export default function QuestionComponent({ section, onAnswer, isAnswered = false }: QuestionComponentProps) {
  const [answer, setAnswer] = useState<any>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleRadioChange = (value: string) => {
    setAnswer(value);
    onAnswer?.(value);
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedOptions, option]
      : selectedOptions.filter(item => item !== option);
    setSelectedOptions(newSelected);
    onAnswer?.(newSelected);
  };

  const handleTextChange = (value: string) => {
    setAnswer(value);
    onAnswer?.(value);
  };

  const handleSliderChange = (value: number) => {
    setAnswer(value);
    onAnswer?.(value);
  };

  const handleRatingChange = (value: number | null) => {
    setAnswer(value);
    onAnswer?.(value);
  };

  // 質問の説明文を取得する関数（JSONデータを除外）
  const getQuestionDescription = (desc: string): string => {
    try {
      // 空文字列や無効な文字列の場合のチェック
      if (!desc || desc.trim() === '' || desc.trim() === '{}') {
        return ''
      }
      
      // JSONフォーマットの場合は空文字を返す
      if (desc.startsWith('{') && desc.endsWith('}')) {
        return ''
      }
    } catch (e) {
      console.warn('説明文解析エラー:', e)
    }
    
    // 最初の行のみを返す（JSONデータが含まれていない場合）
    const firstLine = desc.split('\n')[0]
    return firstLine.includes('{') || firstLine.includes('}') ? '' : firstLine
  };

  const renderQuestionContent = () => {
    // SectionDescから選択肢を抽出する関数を改善
    const parseOptionsFromDesc = (desc: string): string[] => {
      try {
        // 空文字列や無効な文字列の場合のチェック
        if (!desc || desc.trim() === '' || desc.trim() === '{}') {
          return ['選択肢1', '選択肢2']
        }
        
        // JSONフォーマットかチェック
        if (desc.startsWith('{') && desc.endsWith('}')) {
          const parsed = JSON.parse(desc)
          if (parsed.labels && Array.isArray(parsed.labels)) {
            return parsed.labels
          }
          if (parsed.options && Array.isArray(parsed.options)) {
            return parsed.options
          }
        }
      } catch (e) {
        console.warn('JSON解析エラー、改行区切りで処理:', e)
      }
      
      // 改行で分割して選択肢を取得
      const lines = desc.split('\n').filter(line => line.trim() && !line.includes('{') && !line.includes('}'))
      return lines.length > 0 ? lines : ['選択肢1', '選択肢2']
    };

    // 星評価の最大値を取得する関数
    const getMaxStars = (desc: string): number => {
      try {
        // 空文字列や無効な文字列の場合のチェック
        if (!desc || desc.trim() === '' || desc.trim() === '{}') {
          return 5
        }
        
        if (desc.startsWith('{') && desc.endsWith('}')) {
          const parsed = JSON.parse(desc)
          if (parsed.maxStars && typeof parsed.maxStars === 'number') {
            return parsed.maxStars
          }
        }
      } catch (e) {
        console.warn('JSON解析エラー、デフォルト値を使用:', e)
      }
      return 5 // デフォルトは5つ星
    };

      // 質問の説明文を取得する関数（JSONデータを除外）
      const getQuestionDescription = (desc: string): string => {
        try {
          // JSONフォーマットの場合は空文字を返す
          if (desc.startsWith('{') && desc.endsWith('}')) {
            return '';
          }
        } catch (e) {
          // JSON解析失敗時はそのまま返す
        }
        
        // 最初の行のみを返す（JSONデータが含まれていない場合）
        const firstLine = desc.split('\n')[0];
        return firstLine.includes('{') || firstLine.includes('}') ? '' : firstLine;
      };

    switch (section.SectionType) {
      case 'radio':
        const radioOptions = parseOptionsFromDesc(section.SectionDesc);
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <RadioGroup value={answer} onChange={(e) => handleRadioChange(e.target.value)}>
              {radioOptions.map((option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio size="medium" />}
                  label={
                    <Typography sx={{ fontSize: '1rem', ml: 1 }}>
                      {option}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </Box>
        );

      case 'checkbox':
        const checkboxOptions = parseOptionsFromDesc(section.SectionDesc);
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FormGroup>
              {checkboxOptions.map((option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedOptions.includes(option)}
                      onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                      size="medium"
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1rem', ml: 1 }}>
                      {option}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                />
              ))}
            </FormGroup>
          </Box>
        );

      case 'text':
        return (
          <Box sx={{ width: '100%', px: 1 }}>
            <Typography variant="body1" color="text.primary" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
              自由にご記入ください
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={answer}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="こちらにご回答ください..."
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '1rem',
                  backgroundColor: '#f8f9fa',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '16px',
                  lineHeight: 1.6
                }
              }}
            />
          </Box>
        );

      case 'star':
        const maxStars = getMaxStars(section.SectionDesc);
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.primary" sx={{ mb: 4, fontWeight: 500 }}>
              星の数で評価してください
            </Typography>
            <Box sx={{ 
              backgroundColor: '#f8f9fa',
              borderRadius: 3,
              p: 4,
              border: '1px solid #e0e0e0',
              display: 'inline-block'
            }}>
              <Rating
                value={answer || 0}
                onChange={(event, newValue) => handleRatingChange(newValue)}
                max={maxStars}
                size="large"
                sx={{ 
                  fontSize: '3.5rem',
                  '& .MuiRating-iconFilled': {
                    color: '#ffa726',
                    filter: 'drop-shadow(0 2px 4px rgba(255, 167, 38, 0.3))'
                  },
                  '& .MuiRating-iconEmpty': {
                    color: '#e0e0e0'
                  },
                  '& .MuiRating-iconHover': {
                    color: '#ffb74d'
                  }
                }}
              />
              {answer > 0 && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 2, 
                    color: '#ffa726',
                    fontWeight: 600
                  }}
                >
                  {answer} / {maxStars}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'two_choice':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', px: 2 }}>
            <Button
              variant={answer === 'はい' ? 'contained' : 'outlined'}
              onClick={() => handleRadioChange('はい')}
              fullWidth
              size="large"
              sx={{ 
                minHeight: 70,
                borderRadius: 4,
                fontSize: '1.3rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: answer === 'はい' ? '0 6px 20px rgba(76, 175, 80, 0.3)' : 'none',
                backgroundColor: answer === 'はい' ? '#4caf50' : 'transparent',
                borderColor: '#4caf50',
                color: answer === 'はい' ? 'white' : '#4caf50',
                border: '2px solid #4caf50',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                  backgroundColor: answer === 'はい' ? '#45a049' : 'rgba(76, 175, 80, 0.05)'
                }
              }}
            >
              ✓ はい
            </Button>
            <Button
              variant={answer === 'いいえ' ? 'contained' : 'outlined'}
              onClick={() => handleRadioChange('いいえ')}
              fullWidth
              size="large"
              sx={{ 
                minHeight: 70,
                borderRadius: 4,
                fontSize: '1.3rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: answer === 'いいえ' ? '0 6px 20px rgba(244, 67, 54, 0.3)' : 'none',
                backgroundColor: answer === 'いいえ' ? '#f44336' : 'transparent',
                borderColor: '#f44336',
                color: answer === 'いいえ' ? 'white' : '#f44336',
                border: '2px solid #f44336',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4)',
                  backgroundColor: answer === 'いいえ' ? '#e53935' : 'rgba(244, 67, 54, 0.05)'
                }
              }}
            >
              ✗ いいえ
            </Button>
          </Box>
        );

      case 'slider':
        // スライダー設定を取得する関数
        const getSliderSettings = (desc: string) => {
          try {
            if (!desc || desc.trim() === '' || desc.trim() === '{}') {
              return { min: 0, max: 10, divisions: 5, labels: { min: '最小', max: '最大' } };
            }
            if (desc.startsWith('{') && desc.endsWith('}')) {
              const parsed = JSON.parse(desc);
              return {
                min: parsed.min || 0,
                max: parsed.max || 10,
                divisions: parsed.divisions || 5,
                labels: parsed.labels || { min: '最小', max: '最大' }
              };
            }
          } catch (e) {
            console.warn('スライダー設定解析エラー:', e);
          }
          return { min: 0, max: 10, divisions: 5, labels: { min: '最小', max: '最大' } };
        };

        const sliderSettings = getSliderSettings(section.SectionDesc);
        const step = (sliderSettings.max - sliderSettings.min) / sliderSettings.divisions;

        return (
          <Box sx={{ py: 4, px: 3 }}>
            <Typography variant="body1" color="text.primary" sx={{ mb: 2, textAlign: 'center' }}>
              スライダーで評価してください
            </Typography>
            <Slider
              value={answer || sliderSettings.min}
              onChange={(event, newValue) => handleSliderChange(newValue as number)}
              min={sliderSettings.min}
              max={sliderSettings.max}
              step={step}
              marks={Array.from({ length: sliderSettings.divisions + 1 }, (_, i) => ({
                value: sliderSettings.min + (i * step),
                label: i === 0 ? sliderSettings.labels.min : 
                       i === sliderSettings.divisions ? sliderSettings.labels.max : ''
              }))}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {sliderSettings.min}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sliderSettings.max}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return (
          <Typography color="text.secondary">
            サポートされていない質問タイプです
          </Typography>
        );
    }
  };

  return (
    <Card sx={{ 
      width: '100%', 
      maxWidth: '100%', 
      mx: 'auto',
      borderRadius: 3,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      minHeight: 400, // 最小高さを設定してサイズを統一
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ 
        p: 4, 
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        {/* 質問タイトル部分 */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontSize: '1.25rem',
              fontWeight: 600,
              lineHeight: 1.5,
              color: '#333',
              textAlign: 'center'
            }}
          >
            {section.SectionName}
          </Typography>
          
          {section.SectionDesc && section.SectionDesc !== section.SectionName && 
           !section.SectionDesc.startsWith('{') && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                lineHeight: 1.6,
                textAlign: 'center',
                fontSize: '0.95rem'
              }}
            >
              {getQuestionDescription(section.SectionDesc)}
            </Typography>
          )}
        </Box>
        
        {/* 回答部分 - 中央に配置 */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          minHeight: 200 // 回答エリアの最小高さ
        }}>
          {renderQuestionContent()}
        </Box>
      </CardContent>
    </Card>
  );
}
