"use client";
import {Box} from '@mui/material';
import React from 'react';
import Header from "@/app/_components/Header";

export default function Home() {
    return (
        <Box sx={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
            <Header showBackButton={false} showNavigation={true}/>

            {/* ヒーローセクション */}
            <Box　sx={{pt: 12, pb: 8}}
                 className="parallax-section">
                <p>紹介ページ</p>
            </Box>
        </Box>
    );
}