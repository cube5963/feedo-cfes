"use client"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Section } from './types'
import { SectionEditor } from './SectionEditor'
import { 
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    IconButton,
    Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import StarIcon from '@mui/icons-material/Star'
import TuneIcon from '@mui/icons-material/Tune'
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown'

interface SortableSectionProps {
    section: Section
    onDelete: (id: string) => void
    onUpdate: (sectionId: string, updatedSection: Partial<Section>) => void
}

export function SortableSection({ section, onDelete, onUpdate }: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.SectionUUID! })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'radio': return <RadioButtonCheckedIcon sx={{ color: '#1976d2', fontSize: 20 }} />
            case 'checkbox': return <CheckBoxIcon sx={{ color: '#1976d2', fontSize: 20 }} />
            case 'text': return <TextFieldsIcon sx={{ color: '#1976d2', fontSize: 20 }} />
            case 'star': return <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
            case 'two_choice': return <ThumbsUpDownIcon sx={{ color: '#4caf50', fontSize: 20 }} />
            case 'slider': return <TuneIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
            default: return <TextFieldsIcon sx={{ color: '#757575', fontSize: 20 }} />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'radio': return 'ラジオボタン'
            case 'checkbox': return 'チェックボックス'
            case 'text': return '自由記述'
            case 'star': return '星評価'
            case 'two_choice': return '二択'
            case 'slider': return 'スライダー'
            default: return type
        }
    }

    return (
        <Accordion
            ref={setNodeRef}
            style={style}
            data-section-id={section.SectionUUID}
            sx={{ 
                mb: 2,
                border: isDragging ? '2px dashed #1976d2' : '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: isDragging ? '0 8px 32px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                '&:before': { display: 'none' },
                '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease-in-out',
                minHeight: 80, // 最小高さを設定してサイズを統一
                '& .MuiAccordion-region': {
                    // ドラッグ中もコンテンツ領域のサイズを維持
                    minHeight: isDragging ? 'auto' : 'unset'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                    {...attributes} 
                    {...listeners}
                    sx={{ 
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        mr: 1,
                        borderRadius: 1,
                        '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white'
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <DragIndicatorIcon />
                </Box>
                
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                        flex: 1,
                        minHeight: 80, // AccordionSummaryの最小高さを統一
                        '& .MuiAccordionSummary-content': { 
                            alignItems: 'center',
                            gap: 2,
                            py: 1,
                            my: 1 // 上下マージンで高さを確保
                        },
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            color: 'primary.main'
                        }
                    }}
                >
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            {getTypeIcon(section.SectionType)}
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {section.SectionName}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                                label={getTypeLabel(section.SectionType)}
                                size="small"
                                sx={{ 
                                    backgroundColor: 'primary.light',
                                    color: 'white',
                                    fontWeight: 500
                                }}
                            />
                            <Chip 
                                label={`順序: ${section.SectionOrder}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                            />
                        </Box>
                    </Box>
                </AccordionSummary>

                <IconButton 
                    color="error"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('この質問を削除しますか？')) {
                            onDelete(section.SectionUUID!)
                        }
                    }}
                    title="この質問を削除"
                    sx={{ 
                        mr: 2,
                        '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white'
                        }
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>

            <AccordionDetails sx={{ 
                backgroundColor: '#fafafa',
                borderTop: '1px solid #e0e0e0'
            }}>
                <SectionEditor 
                    section={section}
                    onUpdate={onUpdate}
                />
            </AccordionDetails>
        </Accordion>
    )
}
