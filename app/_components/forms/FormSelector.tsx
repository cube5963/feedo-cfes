"use client"
import { 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Button
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

interface FormSelectorProps {
    availableFormIds: string[]
    currentFormId: string | null
    onFormChange: (formId: string) => void
    onCreateNew: () => void
    loading: boolean
}

export function FormSelector({ 
    availableFormIds, 
    currentFormId, 
    onFormChange, 
    onCreateNew, 
    loading 
}: FormSelectorProps) {
    return (
        <>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>使用するフォーム</InputLabel>
                <Select
                    value={currentFormId || ''}
                    label="使用するフォーム"
                    onChange={(e) => onFormChange(e.target.value)}
                    disabled={availableFormIds.length === 0}
                >
                    {availableFormIds.map((formId) => (
                        <MenuItem key={formId} value={formId}>
                            Form ID: {formId}
                        </MenuItem>
                    ))}
                </Select>
                {availableFormIds.length === 0 && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        利用可能なフォームがありません。Supabaseダッシュボードでフォームを作成してください。
                    </Typography>
                )}
            </FormControl>

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Button 
                    variant="outlined" 
                    onClick={onCreateNew}
                    disabled={loading}
                    startIcon={<AddIcon />}
                    sx={{ minWidth: '200px' }}
                >
                    {loading ? '作成中...' : '新規フォーム作成'}
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    新しいフォームを作成して専用ページに移動します
                </Typography>
            </Box>
        </>
    )
}
