"use client";
import {Box} from '@mui/material';
import React from 'react';
import Header from "@/app/_components/Header";

export default function NotFound() {
    return (
        <Box sx={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
            <Header showBackButton={false} showNavigation={true}/>

            {/* ヒーローセクション */}
            <Box　sx={{pt: 12, pb: 8}}
                 className="parallax-section">
                <h1>404 - Page Not Found</h1>
            </Box>
        </Box>
    );
}