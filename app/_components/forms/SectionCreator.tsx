"use client"
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { FormType, Section, SliderSettings } from './types'
import { 
    TextField,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    IconButton,
    Divider,
    Paper
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import StarIcon from '@mui/icons-material/Star'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import TuneIcon from '@mui/icons-material/Tune'
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown'


interface SectionCreatorProps {
    currentFormId: string | null
    onSave: (sectionData: Omit<Section, 'SectionUUID' | 'CreatedAt' | 'UpdatedAt'>) => Promise<void>
    loading: boolean
    sectionsCount: number
    hideAddButton?: boolean
}

export interface SectionCreatorRef {
    resetForm: () => void
}

export const SectionCreator = forwardRef<SectionCreatorRef, SectionCreatorProps>(
    ({ currentFormId, onSave, loading, sectionsCount, hideAddButton = false }, ref) => {
    const [sectionName, setSectionName] = useState('')
    const [sectionType, setSectionType] = useState<FormType>('text')
    const [options, setOptions] = useState<string[]>(['選択肢1', '選択肢2'])
    const [starCount, setStarCount] = useState(5)
    const [sliderSettings, setSliderSettings] = useState<SliderSettings>({
        min: 0,
        max: 10,
        divisions: 5,
        labels: { min: '最小', max: '最大' }
    })

    // refを通じてresetForm関数を公開
    useImperativeHandle(ref, () => ({
        resetForm: () => {
            setSectionName('')
            setSectionType('text')
            setOptions(['選択肢1', '選択肢2'])
            setStarCount(5)
            setSliderSettings({
                min: 0,
                max: 10,
                divisions: 5,
                labels: { min: '最小', max: '最大' }
            })
        }
    }))

    // セクションタイプが変更されたときの処理
    useEffect(() => {
        if (sectionType === 'radio' || sectionType === 'checkbox') {
            setOptions(['選択肢1', '選択肢2'])
        } else if (sectionType === 'star') {
            setStarCount(5)
        } else if (sectionType === 'slider') {
            setSliderSettings({
                min: 0,
                max: 10,
                divisions: 5,
                labels: { min: '最小', max: '最大' }
            })
        }
    }, [sectionType])

    const addOption = () => {
        const maxOptions = sectionType === 'star' ? 10 : 10
        if (options.length < maxOptions) {
            setOptions([...options, ''])
        }
    }

    const removeOption = (index: number) => {
        const minOptions = sectionType === 'star' ? 3 : 2
        if (options.length > minOptions) {
            setOptions(options.filter((_, i) => i !== index))
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const generateSectionDesc = () => {
        switch (sectionType) {
            case 'radio':
            case 'checkbox':
                return JSON.stringify({ 
                    options: options.filter(opt => opt.trim() !== '') 
                })
            case 'star':
                return JSON.stringify({ 
                    maxStars: starCount,
                    labels: options.filter(opt => opt.trim() !== '') 
                })
            case 'slider':
                return JSON.stringify(sliderSettings)
            default:
                return '{}'
        }
    }

    const handleSave = async () => {
        if (!sectionName.trim() || !currentFormId) return

        // バリデーション
        if ((sectionType === 'radio' || sectionType === 'checkbox') && 
            options.filter(opt => opt.trim() !== '').length < 2) {
            return
        }

        if (sectionType === 'star' && starCount < 3) {
            return
        }

        const newSection = {
            FormUUID: currentFormId,
            SectionName: sectionName,
            SectionOrder: sectionsCount + 1,
            SectionType: sectionType,
            SectionDesc: generateSectionDesc(),
            Delete: false
        }

        await onSave(newSection)
        
        // フォームリセット
        setSectionName('')
        setOptions(['選択肢1', '選択肢2'])
        setStarCount(5)
        setSliderSettings({
            min: 0,
            max: 10,
            divisions: 5,
            labels: { min: '最小', max: '最大' }
        })
    }

    return (
        <Paper 
            elevation={2}
            sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: 3,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e3f2fd',
                maxWidth: '100%',
                mx: 'auto'
            }}
        >
            <Box sx={{ mb: 3 }}>
                <TextField
                    label="質問内容"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="例：この商品についてどう思いますか？"
                    sx={{ 
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: 'primary.main',
                            },
                        }
                    }}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>質問タイプ</InputLabel>
                    <Select
                        value={sectionType}
                        label="質問タイプ"
                        onChange={(e) => setSectionType(e.target.value as FormType)}
                        sx={{ 
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: 2,
                            }
                        }}
                    >
                        <MenuItem value="radio">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RadioButtonCheckedIcon sx={{ color: '#1976d2', fontSize: 16 }} />
                                ラジオボタン（単一選択）
                            </Box>
                        </MenuItem>
                        <MenuItem value="checkbox">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckBoxIcon sx={{ color: '#1976d2', fontSize: 16 }} />
                                チェックボックス（複数選択）
                            </Box>
                        </MenuItem>
                        <MenuItem value="text">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextFieldsIcon sx={{ color: '#1976d2', fontSize: 16 }} />
                                自由記述
                            </Box>
                        </MenuItem>
                        <MenuItem value="star">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarIcon sx={{ color: '#ffc107', fontSize: 16 }} />
                                星評価
                            </Box>
                        </MenuItem>
                        <MenuItem value="two_choice">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ThumbsUpDownIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                                二択
                            </Box>
                        </MenuItem>
                        <MenuItem value="slider">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TuneIcon sx={{ color: '#9c27b0', fontSize: 16 }} />
                                スライダー
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* セクションタイプに応じた設定 */}
            <Accordion 
                expanded={true} 
                sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px 8px 0 0',
                        minHeight: 56,
                    }
                }}
            >
                <AccordionSummary sx={{ cursor: 'default !important' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {sectionType === 'radio' && 'ラジオボタンの設定'}
                        {sectionType === 'checkbox' && 'チェックボックスの設定'}
                        {sectionType === 'star' && '星評価の設定'}
                        {sectionType === 'slider' && 'スライダーの設定'}
                        {sectionType === 'text' && '自由記述の設定'}
                        {sectionType === 'two_choice' && '二択の設定'}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3, backgroundColor: '#fafafa' }}>
                    {/* ラジオボタン・チェックボックスの設定 */}
                    {(sectionType === 'radio' || sectionType === 'checkbox') && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                                選択肢を設定してください (2-10個)
                            </Typography>
                            {options.map((option, index) => (
                                <Box key={index} sx={{ 
                                    display: 'flex', 
                                    mb: 2, 
                                    alignItems: 'center',
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            minWidth: 24, 
                                            mr: 2, 
                                            fontWeight: 500,
                                            color: 'primary.main'
                                        }}
                                    >
                                        {index + 1}.
                                    </Typography>
                                    <TextField
                                        label={`選択肢 ${index + 1}`}
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        fullWidth
                                        size="small"
                                        sx={{ 
                                            mr: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5,
                                            }
                                        }}
                                    />
                                    <IconButton 
                                        color="error"
                                        onClick={() => removeOption(index)}
                                        disabled={options.length <= 2}
                                        size="small"
                                        sx={{ 
                                            ml: 1,
                                            '&:hover': {
                                                backgroundColor: 'error.light',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button 
                                startIcon={<AddIcon />}
                                variant="outlined" 
                                onClick={addOption}
                                disabled={options.length >= 10}
                                sx={{ 
                                    mt: 1,
                                    borderRadius: 2,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    py: 1.5,
                                    '&:hover': {
                                        borderStyle: 'solid',
                                        backgroundColor: 'primary.light',
                                        color: 'white'
                                    }
                                }}
                            >
                                選択肢を追加
                            </Button>
                            
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                                プレビュー:
                            </Typography>
                            <Box sx={{ 
                                p: 2, 
                                backgroundColor: 'white', 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                {options.filter(opt => opt.trim()).map((option, index) => (
                                    <Chip 
                                        key={index} 
                                        label={option} 
                                        sx={{ 
                                            mr: 1, 
                                            mb: 1,
                                            backgroundColor: 'primary.light',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.main'
                                            }
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* 星評価の設定 */}
                    {sectionType === 'star' && (
                        <Box>
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'white', 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <TextField
                                    label="星の数"
                                    type="number"
                                    value={starCount}
                                    onChange={(e) => setStarCount(parseInt(e.target.value) || 5)}
                                    inputProps={{ min: 3, max: 10 }}
                                    sx={{ 
                                        mb: 2, 
                                        width: '200px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                    helperText="3-10個まで設定可能"
                                />
                            </Box>                      
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                                プレビュー:
                            </Typography>
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'white', 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                textAlign: 'center'
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                    {Array.from({ length: starCount }, (_, index) => (
                                        <StarIcon key={index} sx={{ color: '#ffc107', fontSize: 32 }} />
                                    ))}
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {starCount}段階評価
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* スライダーの設定 */}
                    {sectionType === 'slider' && (
                        <Box>
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'white', 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        label="最小値"
                                        type="number"
                                        value={sliderSettings.min}
                                        onChange={(e) => setSliderSettings(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                        inputProps={{ min: 0, max: sliderSettings.max - 1 }}
                                    />
                                    <TextField
                                        label="最大値"
                                        type="number"
                                        value={sliderSettings.max}
                                        onChange={(e) => setSliderSettings(prev => ({ ...prev, max: parseInt(e.target.value) || 10 }))}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                        inputProps={{ min: sliderSettings.min + 1, max: 100 }}
                                    />
                                    <TextField
                                        label="区分数"
                                        type="number"
                                        value={sliderSettings.divisions}
                                        onChange={(e) => setSliderSettings(prev => ({ ...prev, divisions: parseInt(e.target.value) || 5 }))}
                                        inputProps={{ min: 2, max: sliderSettings.max + 1 }}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        label="最小値のラベル"
                                        value={sliderSettings.labels.min}
                                        onChange={(e) => setSliderSettings(prev => ({ ...prev, labels: { ...prev.labels, min: e.target.value } }))}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="最大値のラベル"
                                        value={sliderSettings.labels.max}
                                        onChange={(e) => setSliderSettings(prev => ({ ...prev, labels: { ...prev.labels, max: e.target.value } }))}
                                        sx={{ 
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                            
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                                プレビュー:
                            </Typography>
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'white', 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {sliderSettings.labels.min} ({sliderSettings.min})
                                    </Typography>
                                    <Box sx={{ 
                                        flex: 1, 
                                        mx: 2, 
                                        height: 4, 
                                        backgroundColor: 'primary.main', 
                                        borderRadius: 2,
                                        position: 'relative'
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: 16,
                                            height: 16,
                                            backgroundColor: 'primary.main',
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {sliderSettings.labels.max} ({sliderSettings.max})
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                                    {sliderSettings.divisions}段階
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* テキスト入力・二択の設定 */}
                    {(sectionType === 'text' || sectionType === 'two_choice') && (
                        <Alert 
                            severity="info" 
                            sx={{ 
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem'
                                }
                            }}
                        >
                            {sectionType === 'text' 
                                ? '自由記述では追加設定は不要です。回答者は自由にテキストを入力できます。'
                                : '二択タイプでは追加設定は不要です。「はい/いいえ」または「賛成/反対」形式で表示されます。'
                            }
                        </Alert>
                    )}
                </AccordionDetails>
            </Accordion>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                    variant="contained" 
                    onClick={handleSave}
                    disabled={loading || !sectionName.trim() || !currentFormId}
                    size="large"
                    sx={{ 
                        px: 6,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                            backgroundColor: '#e0e0e0',
                            color: '#9e9e9e'
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    {loading ? '保存中...' : (hideAddButton ? '質問を保存' : 'セクションを追加')}
                </Button>
            </Box>
        </Paper>
    )
})

SectionCreator.displayName = 'SectionCreator'

