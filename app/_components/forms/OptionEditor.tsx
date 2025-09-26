"use client"
import { useState } from 'react'
import { Section, FormType } from './types'
import { 
    TextField,
    Box,
    Button,
    IconButton,
    Typography,
    Chip,
    Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

interface OptionEditorProps {
    options: string[]
    onUpdate: (options: string[]) => void
    onSave: (newDesc: string) => void
    sectionType: FormType
}

export function OptionEditor({ options, onUpdate, onSave, sectionType }: OptionEditorProps) {
    const minOptions = sectionType === 'star' ? 3 : 2
    const maxOptions = 10

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        onUpdate(newOptions)
    }

    const addOption = async () => {
        if (options.length < maxOptions) {
            const newOptions = [...options, '']
            onUpdate(newOptions)
            
            const newDesc = JSON.stringify({ 
                options: newOptions.filter(opt => opt.trim() !== '') 
            })
            await onSave(newDesc)
        }
    }

    const removeOption = async (index: number) => {
        if (options.length > minOptions) {
            const newOptions = options.filter((_, i) => i !== index)
            onUpdate(newOptions)
            
            const newDesc = JSON.stringify({ 
                options: newOptions.filter(opt => opt.trim() !== '') 
            })
            await onSave(newDesc)
        }
    }

    const handleOptionBlur = async () => {
        const newDesc = JSON.stringify({ 
            options: options.filter(opt => opt.trim() !== '') 
        })
        await onSave(newDesc)
    }

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
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
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
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
                        onBlur={handleOptionBlur}
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
                        disabled={options.length <= minOptions}
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
                disabled={options.length >= maxOptions}
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
    )
}
