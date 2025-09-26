"use client"
import { Section } from './types'
import { SortableSection } from './SortableSection'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Typography, Box } from '@mui/material'

interface SectionListProps {
    sections: Section[]
    currentFormId: string | null
    onDelete: (id: string) => void
    onUpdate: (sectionId: string, updatedSection: Partial<Section>) => void
    onReorder: (event: any) => void
}

export function SectionList({ 
    sections, 
    currentFormId, 
    onDelete, 
    onUpdate, 
    onReorder 
}: SectionListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    return (
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                質問一覧
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ドラッグして順序を変更できます
            </Typography>
            {sections?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    まだ質問がありません。
                </Typography>
            ) : (
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onReorder}
                >
                    <SortableContext 
                        items={sections.map(s => s.SectionUUID!)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sections.map((section) => (
                            <SortableSection
                                key={section.SectionUUID}
                                section={section}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            )}
        </Box>
    )
}
