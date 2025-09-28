"use client"
import {useEffect, useState} from 'react'
import {FormType, Section, SliderSettings} from './types'
import {OptionEditor} from './OptionEditor'
import {StarEditor} from './StarEditor'
import {SliderEditor} from './SliderEditor'
import {
    Alert,
    Box,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import StarIcon from '@mui/icons-material/Star'
import TuneIcon from '@mui/icons-material/Tune'
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown'

interface SectionEditorProps {
    section: Section
    onUpdate: (sectionId: string, updatedSection: Partial<Section>) => void
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
    const [localSection, setLocalSection] = useState<Section>(section)
    const [editedOptions, setEditedOptions] = useState<string[]>([])
    const [editedSliderSettings, setEditedSliderSettings] = useState<SliderSettings>({
        min: 0,
        max: 10,
        divisions: 5,
        labels: { min: '最小', max: '最大' }
    })
    const [editedStarCount, setEditedStarCount] = useState(5)

    useEffect(() => {
        setLocalSection(section)
        
        // SectionDescを安全に解析する関数
        const parseJsonSafely = (jsonString: string) => {
            try {
                //console.log('解析しようとするJSON文字列:', JSON.stringify(jsonString))
                
                // 空文字列や無効な文字列の場合のチェック
                if (!jsonString || jsonString.trim() === '' || jsonString.trim() === '{}') {
                    //console.log('空のJSON文字列、デフォルト値を使用')
                    return {}
                }
                
                // JSONかどうかをチェック
                if (jsonString.startsWith('{') && jsonString.endsWith('}')) {
                    //console.log('JSON解析成功:', result)
                    return JSON.parse(jsonString)
                }
                
                // JSONでない場合は空オブジェクトを返す
                //console.log('JSON形式ではない、空オブジェクトを返す')
                return {}
            } catch (error) {
                console.warn('JSON解析エラー、デフォルト値を使用:', error)
                console.warn('問題のある文字列:', JSON.stringify(jsonString))
                return {}
            }
        }
        
        const sectionDesc = parseJsonSafely(section.SectionDesc || '')
        
        if (section.SectionType === 'radio' || section.SectionType === 'checkbox') {
            setEditedOptions(sectionDesc.options || sectionDesc.labels || ['選択肢1', '選択肢2'])
        } else if (section.SectionType === 'star') {
            setEditedStarCount(sectionDesc.maxStars || 5)
            setEditedOptions(sectionDesc.labels || [])
        } else if (section.SectionType === 'slider') {
            setEditedSliderSettings({
                min: sectionDesc.min || 0,
                max: sectionDesc.max || 10,
                divisions: sectionDesc.divisions || 5,
                labels: sectionDesc.labels || { min: '最小', max: '最大' }
            })
        }
    }, [section])

    const saveToDatabase = async (updatedData: Partial<Section>) => {
        try {
            await onUpdate(section.SectionUUID!, updatedData)
        } catch (error) {
            console.error('データベース保存エラー:', error)
            setLocalSection(section)
        }

        //キャッシュを削除
    }

    const handleNameChange = (newName: string) => {
        const updatedSection = { ...localSection, SectionName: newName }
        setLocalSection(updatedSection)
    }

    const handleNameBlur = () => {
        if (localSection.SectionName !== section.SectionName) {
            saveToDatabase({ SectionName: localSection.SectionName })
        }
    }

    const handleTypeChange = async (newType: FormType) => {
        const updatedSection = { ...localSection, SectionType: newType }
        setLocalSection(updatedSection)
        
        let newOptions = editedOptions
        let newStarCount = editedStarCount
        let newSliderSettings = editedSliderSettings
        
        if (newType === 'radio' || newType === 'checkbox') {
            newOptions = ['選択肢1', '選択肢2']
            setEditedOptions(newOptions)
        } else if (newType === 'star') {
            newStarCount = 5
            newOptions = []
            setEditedStarCount(newStarCount)
            setEditedOptions(newOptions)
        } else if (newType === 'slider') {
            newSliderSettings = {
                min: 0,
                max: 10,
                divisions: 5,
                labels: { min: '最小', max: '最大' }
            }
            setEditedSliderSettings(newSliderSettings)
        }
        
        let newDesc = '{}'
        if (newType === 'radio' || newType === 'checkbox') {
            newDesc = JSON.stringify({ options: newOptions.filter(opt => opt.trim() !== '') })
        } else if (newType === 'star') {
            newDesc = JSON.stringify({ maxStars: newStarCount, labels: newOptions.filter(opt => opt.trim() !== '') })
        } else if (newType === 'slider') {
            newDesc = JSON.stringify(newSliderSettings)
        }
        
        await saveToDatabase({ 
            SectionType: newType,
            SectionDesc: newDesc
        })
    }

    return (
        <Paper 
            elevation={1}
            sx={{ 
                p: 3, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e3f2fd'
            }}
        >
            <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                質問を編集
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    label="質問内容"
                    value={localSection.SectionName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={handleNameBlur}
                    fullWidth
                    variant="outlined"
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
                        value={localSection.SectionType}
                        label="質問タイプ"
                        onChange={(e) => handleTypeChange(e.target.value as FormType)}
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

            <Divider sx={{ mb: 3 }} />

            {(localSection.SectionType === 'radio' || localSection.SectionType === 'checkbox') && (
                <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                        選択肢の設定
                    </Typography>
                    <OptionEditor 
                        options={editedOptions}
                        onUpdate={setEditedOptions}
                        onSave={(newDesc) => saveToDatabase({ SectionDesc: newDesc })}
                        sectionType={localSection.SectionType}
                    />
                </Box>
            )}

            {localSection.SectionType === 'star' && (
                <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                        星評価の設定
                    </Typography>
                    <StarEditor 
                        starCount={editedStarCount}
                        options={editedOptions}
                        onUpdate={(count, options) => {
                            setEditedStarCount(count)
                            setEditedOptions(options)
                        }}
                        onSave={(newDesc) => saveToDatabase({ SectionDesc: newDesc })}
                    />
                </Box>
            )}

            {localSection.SectionType === 'slider' && (
                <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                        スライダーの設定
                    </Typography>
                    <SliderEditor 
                        settings={editedSliderSettings}
                        onUpdate={setEditedSliderSettings}
                        onSave={(newDesc) => saveToDatabase({ SectionDesc: newDesc })}
                    />
                </Box>
            )}

            {(localSection.SectionType === 'text' || localSection.SectionType === 'two_choice') && (
                <Alert 
                    severity="info" 
                    sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                        }
                    }}
                >
                    {localSection.SectionType === 'text' 
                        ? '自由記述では追加設定は不要です。回答者は自由にテキストを入力できます。'
                        : '二択タイプでは追加設定は不要です。「はい/いいえ」または「賛成/反対」形式で表示されます。'
                    }
                </Alert>
            )}
        </Paper>
    )
}
