"use client";

import {AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Stack, Toolbar} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function WebNavi() {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const navigationItems = [
        {label: '機能', href: '/features'},
        {label: 'AI作成', href: '/ai'},
        {label: 'プラン', href: '/plans'}
    ];

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e0e0e0',
                zIndex: 1100
            }}
        >
            <Container maxWidth="lg">
                <Toolbar sx={{
                    justifyContent: 'space-between',
                    px: {xs: 0, sm: 2},
                    py: 1
                }}>
                    {/* ロゴ */}
                    <Button
                        onClick={() => router.push('/')}
                        sx={{
                            color: '#000',
                            fontWeight: 900,
                            fontSize: '1.8rem',
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': {
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        Feedo
                    </Button>

                    {/* デスクトップナビゲーション */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{display: {xs: 'none', md: 'flex'}}}
                    >
                        {navigationItems.map((item, index) => (
                            <Button
                                key={index}
                                onClick={() => router.push(item.href)}
                                sx={{
                                    color: '#666',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    '&:hover': {
                                        color: '#000',
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Stack>

                    {/* 右側のボタン */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {/* デスクトップ用ボタン */}
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{display: {xs: 'none', sm: 'flex'}}}
                        >
                            <Button
                                onClick={() => router.push('/account/signin')}
                                sx={{
                                    color: '#000',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                            >
                                ログイン
                            </Button>
                            <Button
                                onClick={() => router.push('/account/signup')}
                                sx={{
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    '&:hover': {
                                        backgroundColor: '#333'
                                    }
                                }}
                            >
                                始める
                            </Button>
                        </Stack>

                        {/* モバイル用メニューボタン */}
                        <IconButton
                            onClick={handleMenuOpen}
                            sx={{
                                display: {xs: 'block', md: 'none'},
                                color: '#000'
                            }}
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>

            {/* モバイルメニュー */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                sx={{
                    display: {xs: 'block', md: 'none'},
                    '& .MuiPaper-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mt: 1
                    }
                }}
            >
                {navigationItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            router.push(item.href);
                            handleMenuClose();
                        }}
                        sx={{
                            color: '#000',
                            fontWeight: 500,
                            px: 3,
                            py: 1.5
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
                <Box sx={{px: 2, py: 1, borderTop: '1px solid #e0e0e0'}}>
                    <Stack spacing={1}>
                        <Button
                            onClick={() => {
                                router.push('/account/signin');
                                handleMenuClose();
                            }}
                            fullWidth
                            sx={{
                                color: '#000',
                                fontWeight: 500,
                                textTransform: 'none',
                                justifyContent: 'flex-start',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            ログイン
                        </Button>
                        <Button
                            onClick={() => {
                                router.push('/account/signup');
                                handleMenuClose();
                            }}
                            fullWidth
                            sx={{
                                backgroundColor: '#000',
                                color: '#fff',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#333'
                                }
                            }}
                        >
                            始める
                        </Button>
                    </Stack>
                </Box>
            </Menu>
        </AppBar>
    );
}