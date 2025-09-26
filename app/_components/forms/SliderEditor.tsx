"use client"
import { SliderSettings } from './types'
import { 
    TextField,
    Box,
    Typography,
    Divider
} from '@mui/material'

interface SliderEditorProps {
    settings: SliderSettings
    onUpdate: (settings: SliderSettings) => void
    onSave: (newDesc: string) => void
}

export function SliderEditor({ settings, onUpdate, onSave }: SliderEditorProps) {
    const handleSliderChange = (field: string, value: any) => {
        const newSettings = { ...settings, [field]: value }
        onUpdate(newSettings)
    }

    const handleSliderLabelChange = (type: 'min' | 'max', value: string) => {
        const newSettings = { 
            ...settings, 
            labels: { ...settings.labels, [type]: value }
        }
        onUpdate(newSettings)
    }

    const handleSliderBlur = async () => {
        const newDesc = JSON.stringify(settings)
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
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="最小値"
                        type="number"
                        value={settings.min}
                        onChange={(e) => handleSliderChange('min', parseInt(e.target.value) || 0)}
                        onBlur={handleSliderBlur}
                        sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                    <TextField
                        label="最大値"
                        type="number"
                        value={settings.max}
                        onChange={(e) => handleSliderChange('max', parseInt(e.target.value) || 10)}
                        onBlur={handleSliderBlur}
                        sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                    <TextField
                        label="区分数"
                        type="number"
                        value={settings.divisions}
                        onChange={(e) => handleSliderChange('divisions', parseInt(e.target.value) || 5)}
                        onBlur={handleSliderBlur}
                        sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="最小値のラベル"
                        value={settings.labels.min}
                        onChange={(e) => handleSliderLabelChange('min', e.target.value)}
                        onBlur={handleSliderBlur}
                        sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                    <TextField
                        label="最大値のラベル"
                        value={settings.labels.max}
                        onChange={(e) => handleSliderLabelChange('max', e.target.value)}
                        onBlur={handleSliderBlur}
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
                        {settings.labels.min} ({settings.min})
                    </Typography>
                    <Box sx={{ 
                        flex: 1, 
                        mx: 2, 
                        height: 24, 
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            width: '100%',
                            height: 4,
                            backgroundColor: 'primary.main',
                            borderRadius: 2,
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            transform: 'translateY(-50%)'
                        }} />
                        {/* 区分数に応じた目盛り */}
                        {Array.from({ length: settings.divisions + 1 }, (_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    left: `${(i / settings.divisions) * 100}%`,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 8,
                                    height: 16,
                                    backgroundColor: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    zIndex: 2
                                }}
                            />
                        ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {settings.labels.max} ({settings.max})
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                    {settings.divisions}段階
                </Typography>
            </Box>
        </Box>
    )
}
