"use client"
import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {FormProps, Section} from './types'
import {FormSelector} from './FormSelector'
import {SectionCreator, SectionCreatorRef} from './SectionCreator'
import {SectionList} from './SectionList'
import {arrayMove} from '@dnd-kit/sortable'
import {Alert, Box} from '@mui/material'
import {createAnonClient} from "@/utils/supabase/anonClient";

export default function FormManager({initialSections = [], formId, hideFormSelector = false}: FormProps) {
    const router = useRouter()
    const sectionCreatorRef = useRef<SectionCreatorRef>(null)
    const [sections, setSections] = useState<Section[]>(initialSections)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [availableFormIds, setAvailableFormIds] = useState<string[]>([])
    const [currentFormId, setCurrentFormId] = useState<string | null>(formId || null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createAnonClient()

                const {data: formData, error: formError} = await supabase
                    .from('Form')
                    .select('FormUUID, FormName')
                    .eq('Delete', false)
                    .order('CreatedAt', {ascending: false})

                if (formError) {
                    setMessage('Formテーブルの取得に失敗しました')
                    return
                }

                if (formData && formData.length > 0) {
                    const formIds = formData.map(form => form.FormUUID)
                    setAvailableFormIds(formIds)

                    if (!currentFormId || !formIds.includes(currentFormId)) {
                        setCurrentFormId(formIds[0])
                    }
                } else {

                    const {data: newForm, error: createError} = await supabase
                        .from('Form')
                        .insert([{
                            FormName: 'デフォルトフォーム',
                            ImgID: '',
                            Delete: false
                        }])
                        .select()
                        .single()

                    if (createError) {
                        setMessage('フォームの作成に失敗しました。手動でFormテーブルにデータを追加してください。')
                        return
                    }

                    if (newForm) {
                        setAvailableFormIds([newForm.FormUUID])
                        setCurrentFormId(newForm.FormUUID)
                        setMessage('デフォルトフォームを自動作成しました。')
                    }
                }

                const formIdToUse = currentFormId || (formData.length > 0 ? formData[0].FormUUID : null)
                if (formIdToUse) {
                    const {data: sectionData, error: sectionError} = await supabase
                        .from('Section')
                        .select('*')
                        .eq('FormUUID', formIdToUse)
                        .eq('Delete', false)
                        .order('SectionOrder', {ascending: true})

                    if (sectionError) {
                        setMessage(`Sectionデータの取得に失敗しました: ${sectionError.message}`)
                    } else {
                        setSections(sectionData || [])
                    }
                }
            } catch (error: any) {
                setMessage(`データベース接続エラー: ${error?.message || 'Unknown error'}`)
            }
        }

        fetchData()
    }, [currentFormId])

    const handleSaveSection = async (sectionData: Omit<Section, 'SectionUUID' | 'CreatedAt' | 'UpdatedAt'>) => {
        setLoading(true)
        setMessage('')

        try {
            const supabase = createAnonClient()

            const {data, error} = await supabase
                .from('Section')
                .insert([sectionData])
                .select()

            if (error) {

                if (error.code === '23503') {
                    setMessage(`外部キー制約エラー: FormID ${currentFormId} が見つかりません。`)
                } else if (error.code === '42501' || error.message.includes('RLS')) {
                    setMessage('認証が必要です。RLSポリシーにより書き込みが制限されています。')
                } else {
                    setMessage(`保存エラー: ${error.message}`)
                }
                return
            }

            if (data && data.length > 0) {
                const newSection = data[0]

                setSections(prev => [...prev, newSection])
                setMessage('質問が正常に保存されました')

                if (currentFormId) {
                    await fetch(`/api/sections/redis?projectId=${currentFormId}`, {method: 'DELETE'})
                }

                // SectionCreatorをリセット
                if (sectionCreatorRef.current?.resetForm) {
                    sectionCreatorRef.current.resetForm()
                }
            }
        } catch (error: any) {
            console.error('質問保存エラー詳細:', error)
            setMessage(`質問の保存に失敗しました: ${error?.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('この質問を削除しますか？')) {
            return
        }

        setLoading(true)
        setMessage('')

        try {
            const supabase = createAnonClient()
            const {data: sessionData, error: sessionError} = await supabase.auth.getSession();

            console.log('Session Data:', sessionData);

            /*
            const {error} = await supabase
                .from('Section')
                .update({Delete: true, UpdatedAt: new Date().toISOString()})
                .eq('SectionUUID', sectionId)

             */

            const {error} = await supabase
                .from('Section')
                .delete()
                .eq('SectionUUID', sectionId)

            if (error) {
                setMessage(`削除に失敗しました: ${error.message}`)
                return
            }

            if (currentFormId) {
                await fetch(`/api/sections/redis?projectId=${currentFormId}`, {method: 'DELETE'})
            }

            setSections(prev => prev.filter(section => section.SectionUUID !== sectionId))
            setMessage('質問が正常に削除されました')

        } catch (error: any) {
            setMessage(`セクションの削除に失敗しました: ${error?.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSection = async (sectionId: string, updatedSection: Partial<Section>) => {
        try {
            const supabase = createAnonClient()

            const {error} = await supabase
                .from('Section')
                .update(updatedSection)
                .eq('SectionUUID', sectionId)

            if (currentFormId) {
                fetch(`/api/sections/redis?projectId=${currentFormId}`, {method: 'DELETE'})
            }

            if (error) {
                setMessage(`更新に失敗しました: ${error.message}`)
                throw error
            }

            setSections(prev => prev.map(section =>
                section.SectionUUID === sectionId
                    ? {...section, ...updatedSection}
                    : section
            ))

            await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error: any) {
            setMessage(`セクションの更新に失敗しました: ${error?.message || 'Unknown error'}`)
            throw error
        }
    }

    const handleDragEnd = async (event: any) => {
        const {active, over} = event

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex(section => section.SectionUUID === active.id)
            const newIndex = sections.findIndex(section => section.SectionUUID === over.id)

            const newSections = arrayMove(sections, oldIndex, newIndex)

            const updatedSections = newSections.map((section, index) => ({
                ...section,
                SectionOrder: index + 1
            }))

            setSections(updatedSections)

            try {
                const supabase = createAnonClient()

                for (const section of updatedSections) {
                    await supabase
                        .from('Section')
                        .update({SectionOrder: section.SectionOrder})
                        .eq('SectionUUID', section.SectionUUID)
                }

                if (currentFormId) {
                    fetch(`/api/sections/redis?projectId=${currentFormId}`, {method: 'DELETE'})
                }

                setMessage('質問の順序を更新しました')
            } catch (error) {
                setMessage('順序の更新に失敗しました')
            }
        }
    }

    const handleCreateNewForm = async () => {
        setLoading(true)
        setMessage('')

        try {
            const supabase = createAnonClient()

            const {data: newForm, error: createError} = await supabase
                .from('Form')
                .insert([{
                    FormName: `新しいフォーム ${new Date().toLocaleString('ja-JP')}`,
                    ImgID: '',
                    Delete: false
                }])
                .select()
                .single()

            if (createError) {
                setMessage(`フォームの作成に失敗しました: ${createError.message}`)
                return
            }

            if (newForm) {
                router.push(`/project/${newForm.FormUUID}`)
            }
        } catch (error: any) {
            setMessage(`フォームの作成に失敗しました: ${error?.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{
            width: '100%',
            position: 'relative'
        }}>
            {message && (
                <Alert severity={message.includes('失敗') ? 'error' : 'success'} sx={{mb: 2}}>
                    {message}
                </Alert>
            )}

            {!hideFormSelector && (
                <FormSelector
                    availableFormIds={availableFormIds}
                    currentFormId={currentFormId}
                    onFormChange={setCurrentFormId}
                    onCreateNew={handleCreateNewForm}
                    loading={loading}
                />
            )}

            {/* 質問一覧を上に移動 */}
            <SectionList
                sections={sections}
                currentFormId={currentFormId}
                onDelete={handleDeleteSection}
                onUpdate={handleUpdateSection}
                onReorder={handleDragEnd}
            />

            {/* 新しい質問作成 */}
            <Box sx={{mt: 3}} id="new-question-card">
                <SectionCreator
                    ref={sectionCreatorRef}
                    currentFormId={currentFormId}
                    onSave={handleSaveSection}
                    loading={loading}
                    sectionsCount={sections.length}
                    hideAddButton={true} // セクション追加ボタンを非表示
                />
            </Box>
        </Box>
    )
}
