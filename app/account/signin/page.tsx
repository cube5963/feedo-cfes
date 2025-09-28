"use client";
import {Alert, Box, Button, Paper, TextField, Typography} from "@mui/material";
import React, {useEffect, useState} from 'react';
import Header from "@/app/_components/Header";
import {createAnonClient} from "@/utils/supabase/anonClient";

export default function SignIn() {
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createAnonClient();
            const {data} = await supabase.auth.getUser();
            if (data.user) {
                window.location.href = '/project';
            }
        };
        checkAuth();
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const {email, password} = formValues;
        if (!email || !password) {
            setError("メールアドレスとパスワードを入力してください。");
            setLoading(false);
            return;
        }

        const supabase = createAnonClient();
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);
        if (error) {
            setError(`エラーが発生しました: ${error.message}`);
        } else {
            window.location.href = '/project';
        }
    }

    const google_signin = async (e: React.MouseEvent) => {
        e.preventDefault();
        setError(null);

        const supabase = createAnonClient();
        const {data, error} = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
            },
        });

        if (error) {
            setError(`エラーが発生しました: ${error.message}`);
        }
    }

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
            <Header showBackButton={false} showNavigation={true}/>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 80px)',
                    padding: 2,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        padding: 4,
                        borderRadius: 3,
                    }}
                >
                    <Box sx={{textAlign: 'center', mb: 3}}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
                            サインイン
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            アカウントにサインインしてください
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={submit} sx={{mb: 3}}>
                        <TextField
                            fullWidth
                            label="メールアドレス"
                            type="email"
                            variant="outlined"
                            value={formValues.email}
                            onChange={(e) => setFormValues({...formValues, email: e.target.value})}
                            sx={{mb: 2}}
                            required
                        />
                        <TextField
                            fullWidth
                            label="パスワード"
                            type="password"
                            variant="outlined"
                            value={formValues.password}
                            onChange={(e) => setFormValues({...formValues, password: e.target.value})}
                            sx={{mb: 3}}
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                mb: 2,
                                backgroundColor: '#000',
                                '&:hover': {
                                    backgroundColor: '#333',
                                },
                            }}
                        >
                            {loading ? 'サインイン中...' : 'サインイン'}
                        </Button>
                    </Box>

                </Paper>
            </Box>
        </div>
    );
}