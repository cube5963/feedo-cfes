"use client"
import {useParams, useRouter} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'
import FormComponent from '@/app/_components/form'
import {
    Alert,
    Box,
    Button, Checkbox,
    Divider,
    FormControl,
    FormLabel,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Header from '@/app/_components/Header'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import StatisticsTab from '@/app/project/_components/StatisticsTab'
import {createAnonClient} from "@/utils/supabase/anonClient";

export default function ProjectPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string
    const [formTitle, setFormTitle] = useState("")
    const [formMessage, setFormMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [currentTab, setCurrentTab] = useState(0) // タブの状態を追加
    const [singleResponse, setSingleResponse] = useState(false)

    // フォーム終了メッセージを取得する関数
    const fetchFormMessage = async () => {
        try {
            const supabase = createAnonClient()
            const {data, error} = await supabase
                .from('Form')
                .select('FormMessage')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .single()

            if (error || !data) {
                console.error('フォームメッセージ取得エラー:', error)
                return
            }
            setFormMessage(data.FormMessage || '')
        } catch (error) {
            console.error('フォームメッセージ取得エラー:', error)
        }
    }

    // フォーム終了メッセージを更新する関数
    const updateFormMessage = async (newFormMessage: string) => {
        setLoading(true)
        try {
            const supabase = createAnonClient()
            const {error} = await supabase
                .from('Form')
                .update({FormMessage: newFormMessage, UpdatedAt: new Date().toISOString()})
                .eq('FormUUID', projectId)
                .eq('Delete', false)

            if (error) {
                console.error('フォームメッセージ更新エラー:', error)
                setMessage('アンケート終了メッセージの更新に失敗しました')
                return
            }
            setMessage('アンケート終了メッセージを更新しました')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('フォームメッセージ更新エラー:', error)
            setMessage('アンケート終了メッセージの更新に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue)
    }

    // アンケート回答ページに移動する関数
    const handleAnswer = async () => {
        try {
            const supabase = createAnonClient()

            // 最初の質問を取得
            const {data: sections, error} = await supabase
                .from('Section')
                .select('SectionUUID')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .order('SectionOrder', {ascending: true})
                .limit(1)

            if (error || !sections || sections.length === 0) {
                setMessage('質問が見つかりません。まず質問を作成してください。')
                return
            }

            // 最初の質問のアンケート回答ページに移動
            router.push(`/answer/${projectId}/${sections[0].SectionUUID}`)
        } catch (error) {
            console.error('アンケート回答エラー:', error)
            setMessage('アンケート回答ページの表示に失敗しました')
        }
    }

    // プレビューページに移動する関数
    const handlePreview = async () => {
        try {
            const supabase = createAnonClient()

            // 最初の質問を取得
            const {data: sections, error} = await supabase
                .from('Section')
                .select('SectionUUID')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .order('SectionOrder', {ascending: true})
                .limit(1)

            if (error || !sections || sections.length === 0) {
                setMessage('質問が見つかりません。まず質問を作成してください。')
                return
            }

            // 最初の質問のプレビューページを新しいタブで開く
            const previewUrl = `/preview/${projectId}/${sections[0].SectionUUID}`;
            window.open(previewUrl, '_blank');
        } catch (error) {
            console.error('プレビューエラー:', error)
            setMessage('プレビューの表示に失敗しました')
        }
    }

    // フォーム名を取得する関数
    const fetchFormName = async () => {
        try {
            const supabase = createAnonClient()
            const {data, error} = await supabase
                .from('Form')
                .select('FormName')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .single()

            if (error || !data) {
                console.error('フォーム名取得エラー:', error)
                router.push('/project')
                return
            }

            setFormTitle(data.FormName || '')
        } catch (error) {
            console.error('フォーム名取得エラー:', error)
            router.push('/project')
        }
    }

    // フォーム名を更新する関数
    const updateFormName = async (newFormName: string) => {
        if (!newFormName.trim()) return

        setLoading(true)
        try {
            const supabase = createAnonClient()
            const {error} = await supabase
                .from('Form')
                .update({FormName: newFormName, UpdatedAt: new Date().toISOString()})
                .eq('FormUUID', projectId)
                .eq('Delete', false)

            if (error) {
                console.error('フォーム名更新エラー:', error)
                setMessage('フォーム名の更新に失敗しました')
                return
            }

            setMessage('フォーム名を更新しました')
            setTimeout(() => setMessage(''), 3000) // 3秒後にメッセージを消す
        } catch (error) {
            console.error('フォーム名更新エラー:', error)
            setMessage('フォーム名の更新に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    function getNearestSize(value: number): number {
        const sizes = [64, 128, 256]
        return sizes.reduce((prev, curr) =>
            Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        )
    }

    // コンポーネントマウント時にフォーム名・メッセージを取得
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createAnonClient();
            const {data: sessionData, error: sessionError} = await supabase.auth.getSession();

            if (sessionError) {
                router.push('/account/signin');
                return;
            }

            const currentUser = sessionData?.session?.user;
            if (!currentUser) {
                router.push('/account/signin');
                return;
            }

            if (projectId) {
                fetchFormName();
                fetchFormMessage();
            }
        };
        checkSession();
    }, [projectId]);

    const fetchSingleResponse = async () => {
        try {
            const supabase = createAnonClient()
            const {data, error} = await supabase
                .from('Form')
                .select('singleResponse')
                .eq('FormUUID', projectId)
                .eq('Delete', false)
                .single()

            if (error || !data) {
                console.error('SingleResponse取得エラー:', error)
                return
            }
            setSingleResponse(data.singleResponse || false)
        } catch (error) {
            console.error('SingleResponse取得エラー:', error)
        }
    }

    const updateSingleResponse = async (newSingleResponse: boolean) => {
        setLoading(true)
        try {
            const supabase = createAnonClient()
            const {error} = await supabase
                .from('Form')
                .update({singleResponse: newSingleResponse, UpdatedAt: new Date().toISOString()})
                .eq('FormUUID', projectId)
                .eq('Delete', false)

            if (error) {
                console.error('SingleResponse更新エラー:', error)
                setMessage('回答の重複設定の更新に失敗しました')
                return
            }
            setMessage('回答の重複設定を更新しました')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('SingleResponse更新エラー:', error)
            setMessage('回答の重複設定の更新に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (projectId) {
            fetchSingleResponse();
        }
    }, [projectId]);

    useEffect(() => {
        const fetchImage = async () => {
            const supabase = createAnonClient()
            // 画像ファイル名が分かっている場合は指定、なければリスト取得
            const {data, error} = await supabase.storage
                .from('feedo')
                .list(`${projectId}/`, {limit: 1})
            if (data && data.length > 0) {
                const {data: urlData} = supabase.storage
                    .from('feedo')
                    .getPublicUrl(`feedo/${projectId}/${data[0].name}`)
                setImageUrl(urlData.publicUrl)
            }
        }
        fetchImage()
    }, [projectId])


    // 統計タブのコンテンツ
    const renderStatisticsTab = () => (
        <StatisticsTab projectId={projectId}/>
    )

    // 設定タブのレンダリング
    const renderSettingsTab = () => (
        <Box>
            <Typography variant="h6" sx={{mb: 3, fontWeight: 600}}>
                プロジェクト設定
            </Typography>


            {/* プロジェクト設定 */}
            <Paper
                elevation={2}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                }}
            >
                <Typography variant="subtitle1" sx={{mb: 3, fontWeight: 600}}>
                    基本設定
                </Typography>

                <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-end', mb: 3}}>
                    <TextField
                        label="プロジェクト名"
                        variant="outlined"
                        fullWidth
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        onBlur={() => updateFormName(formTitle)}
                        inputProps={{maxLength: 50}}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateFormName(formTitle)
                            }
                        }}
                        disabled={loading}
                        placeholder="わかりやすいプロジェクト名を入力してください"
                    />
                    <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon/>}
                        onClick={handlePreview}
                        sx={{
                            minWidth: 120,
                            height: 56  // TextFieldと同じ高さ
                        }}
                    >
                        プレビュー
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<QuestionAnswerIcon/>}
                        onClick={async () => {
                            try {
                                const supabase = createAnonClient()

                                // 最初の質問を取得
                                const {data: sections, error} = await supabase
                                    .from('Section')
                                    .select('SectionUUID')
                                    .eq('FormUUID', projectId)
                                    .eq('Delete', false)
                                    .order('SectionOrder', {ascending: true})
                                    .limit(1)

                                if (error || !sections || sections.length === 0) {
                                    setMessage('質問が見つかりません。まず質問を作成してください。')
                                    return
                                }

                                // 最初の質問のアンケート回答ページを新しいタブで開く
                                const answerUrl = `/answer/${projectId}/${sections[0].SectionUUID}`;
                                window.open(answerUrl, '_blank');
                            } catch (error) {
                                console.error('アンケート回答エラー:', error)
                                setMessage('アンケート回答ページの表示に失敗しました')
                            }
                        }}
                        sx={{
                            minWidth: 140,
                            height: 56  // TextFieldと同じ高さ
                        }}
                    >
                        アンケート回答
                    </Button>
                </Box>

                <Divider sx={{my: 3}}/>

                {/* 追加設定オプション */}
                <Typography variant="subtitle2" sx={{mb: 2, fontWeight: 600}}>
                    その他の設定
                </Typography>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <FormControl component="fieldset">
                        <FormLabel style={{fontWeight: 'bold', color: 'black'}}>アンケート終了後のメッセージ</FormLabel>
                        <Box sx={{mt: 1}}>
                            <Typography variant="body2" color="text.secondary">
                                アンケートが終了したときに表示されるメッセージを設定できます。
                            </Typography>
                            <TextField
                                variant="outlined"
                                fullWidth
                                multiline
                                minRows={2}
                                maxRows={4}
                                placeholder="例: ご協力ありがとうございました！"
                                sx={{mt: 1}}
                                value={formMessage}
                                onChange={(e) => setFormMessage(e.target.value)}
                                onBlur={() => updateFormMessage(formMessage)}
                                inputProps={{maxLength: 200}}
                                disabled={loading}
                            />
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset">
                        <FormLabel style={{fontWeight: 'bold', color: 'black'}}>複数回答</FormLabel>
                        <Box sx={{mt: 1, display: 'flex', alignItems: 'center'}}>
                            <Checkbox
                                checked={singleResponse}
                                onChange={async (e) => {
                                    const newValue = e.target.checked;
                                    setSingleResponse(newValue);
                                    await updateSingleResponse(newValue);
                                }}
                                disabled={loading}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ml: 1}}>
                                回答を１度のみにする
                            </Typography>
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset">
                        <FormLabel component="legend">回答の公開設定</FormLabel>
                        <Box sx={{mt: 1}}>
                            <Typography variant="body2" color="text.secondary">
                                回答結果の表示設定を選択してください
                            </Typography>
                        </Box>
                    </FormControl>

                    <FormControl component="fieldset">
                        <FormLabel component="legend">アクセス制限</FormLabel>
                        <Box sx={{mt: 1}}>
                            <Typography variant="body2" color="text.secondary">
                                プロジェクトへのアクセス権限を設定できます
                            </Typography>
                        </Box>
                    </FormControl>
                </Box>
            </Paper>
            {/* プロジェクト設定（デザインのみ） */}
        </Box>
    )

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#ffffff'
        }}>
            {/* ヘッダー */}
            <Header
                title="プロジェクト編集"
                onBack={() => router.push('/project')}
                showLoginButton = {false}
                showHomeButton = {false}
            />

            {/* メインコンテンツ */}
            <Box sx={{
                pt: 10, // ヘッダーの高さ分のマージン
                pb: 4,
                maxWidth: 800,
                mx: 'auto',
                px: 3,
                width: '100%'
            }}>
                {/* タブバー */}
                <Paper sx={{mb: 3, borderRadius: 2}}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 64,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none'
                            }
                        }}
                    >
                        <Tab
                            icon={<QuestionAnswerIcon/>}
                            label="質問"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<BarChartIcon/>}
                            label="統計"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<SettingsIcon/>}
                            label="設定"
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>

                {/* メッセージ表示 */}
                {message && (
                    <Alert
                        severity={message.includes('失敗') ? 'error' : 'success'}
                        sx={{
                            mb: 3,
                            borderRadius: 2
                        }}
                    >
                        {message}
                    </Alert>
                )}

                {/* タブコンテンツ */}
                {currentTab === 0 && (
                    <Box>
                        <FormComponent formId={projectId} hideFormSelector={true}/>
                    </Box>
                )}
                {currentTab === 1 && renderStatisticsTab()}
                {currentTab === 2 && renderSettingsTab()}
            </Box>
        </Box>
    )
}
