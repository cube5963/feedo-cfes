"use client"
import { useState } from 'react'
import { 
    TextField,
    Box,
    Typography,
    Divider
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'

interface StarEditorProps {
    starCount: number
    options: string[]
    onUpdate: (count: number, options: string[]) => void
    onSave: (newDesc: string) => void
}

export function StarEditor({ starCount, options, onUpdate, onSave }: StarEditorProps) {
    const handleStarCountChange = (newCount: number) => {
        onUpdate(newCount, options)
    }

    const handleStarCountBlur = async () => {
        const newDesc = JSON.stringify({ 
            maxStars: starCount,
            labels: options.filter(opt => opt.trim() !== '') 
        })
        await onSave(newDesc)
    }

    return (
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
                    onChange={(e) => handleStarCountChange(parseInt(e.target.value) || 5)}
                    onBlur={handleStarCountBlur}
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
                        <StarIcon 
                            key={index} 
                            sx={{ 
                                color: '#ffc107', 
                                fontSize: `${Math.max(24, Math.min(48, 320 / starCount))}px`, // 横幅320px基準で自動調整
                                transition: 'font-size 0.2s'
                            }} 
                        />
                    ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {starCount}段階評価
                </Typography>
            </Box>
        </Box>
    )
}
