"use client"

import React, {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {AppBar, Box, Button, IconButton, Toolbar, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

interface HeaderProps {
    title?: string;
    onBack?: () => void;
    showBackButton?: boolean;
    showNavigation?: boolean;
    showLoginButton?: boolean;
    maxWidth?: number;
}

export default function Header({
                                   title,
                                   onBack,
                                   showBackButton = true,
                                   showNavigation = false,
                                   showLoginButton = true,
                                   maxWidth = 1200,
                               }: HeaderProps) {
    const router = useRouter();

    useEffect(() => {

        const accessCount = async () => {
            await fetch('/api/metrics', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({type: 'access'})
            });
        };

        accessCount();
    }, []);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: 'none',
                zIndex: 1100,
                width: '100vw',
                left: 0,
                right: 0,
                overflowX: 'hidden'
            }}
        >
            <Toolbar sx={{
                width: '100%',
                minWidth: 0,
                maxWidth: '100vw',
                mx: 0,
                justifyContent: 'space-between',
                px: {xs: 2, sm: 4},
                py: 1,
                overflowX: 'hidden'
            }}>
                {/* 左側: 戻るボタンまたはロゴ */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    {showBackButton ? (
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                color: '#000',
                                backgroundColor: 'transparent',
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    borderColor: '#000'
                                }
                            }}
                        >
                            <ArrowBackIcon sx={{fontSize: 20}}/>
                        </IconButton>
                    ) : (
                        <Button
                            onClick={() => router.push('/')}
                            sx={{
                                color: '#000',
                                fontWeight: 900,
                                fontSize: '1.5rem',
                                textTransform: 'none',
                                p: 0,
                                minWidth: 'auto',
                                '&:hover': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            <span style={{display: 'flex', alignItems: 'flex-end'}}>
                            Feedo
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 400,
                                    marginLeft: 4,
                                    marginBottom: 2,
                                    color: '#666'
                                }}>
                                for
                                    <span style={{
                                        color: '#84B9CB'
                                    }}>
                                        蒼穹祭
                                    </span>
                                </span>
                            </span>
                        </Button>
                    )}
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                    {/* タイトル */}
                    {title && (
                        <Typography
                        variant="h6"
                        sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#000',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        }}
                    >
                        {title}
                    </Typography>
                    )}
                    </Box>


                {/* 右側: アクションボタン */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 1, overflow: 'hidden', justifyContent: 'flex-end', pr: 8}}>
                    {showLoginButton ? (
                        <>
                            <Button
                                onClick={() => router.push('/account/signin')}
                                sx={{
                                    color: '#000',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    display: 'block',
                                    minWidth: 80,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                            >
                                ログイン
                            </Button>
                        </>
                    ): null}

                    {/* ホームボタン（戻るボタンがある場合） */}
                    {showBackButton && (
                        <IconButton
                            onClick={() => router.push('/')}
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    color: '#000',
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <HomeIcon sx={{fontSize: 20}}/>
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
