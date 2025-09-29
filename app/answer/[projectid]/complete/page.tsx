"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Alert, Box, CircularProgress, Typography,Button} from "@mui/material";
import Header from "@/app/_components/Header";
import {createAnonClient} from "@/utils/supabase/anonClient";

export default function AnswerCompletePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectid as string;
    const [formData, setFormData] = useState<{ FormMessage?: string; FormName?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForm = async () => {
            setLoading(true);
            try {
                const supabase = createAnonClient();
                const {data, error} = await supabase
                    .from("Form")
                    .select("FormMessage, FormName")
                    .eq("FormUUID", projectId)
                    .eq("Delete", false)
                    .single();
                if (error || !data) {
                    setError("フォーム情報の取得に失敗しました");
                    return;
                }
                setFormData(data);
            } catch (e) {
                setError("フォーム情報の取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        const accessCount = async () => {
            await fetch('/api/metrics', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ type: 'answer' })
            });
        };

        if (projectId) fetchForm();
        accessCount();
    }, [projectId]);

    if (loading) {
        return (
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
                <CircularProgress/>
            </Box>
        );
    }
    if (error) {
        return (
            <Box sx={{maxWidth: 480, mx: "auto", p: 2, minHeight: "100vh", display: "flex", alignItems: "center"}}>
                <Alert severity="error" sx={{width: "100%"}}>{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            display: "flex",
            flexDirection: "column",
            maxWidth: 480,
            mx: "auto",
            position: "relative"
        }}>
            <Header title="アンケート完了" maxWidth={480} showBackButton={false}/>
            <Box sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                pt: 10,
                px: 3
            }}>
                <Typography variant="h5" align="center" sx={{mb: 3, fontWeight: 600, color: '#333'}}>
                    {formData?.FormMessage ? `${formData.FormMessage} ` : "ご協力ありがとうございました！"}
                </Typography>
                <Button onClick={() => router.push('/')}>FEEDOの紹介へ</Button>
            </Box>
        </Box>
    );
}