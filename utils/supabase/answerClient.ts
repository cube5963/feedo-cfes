'use client';

import { createBrowserClient } from "@supabase/ssr";

// パブリッククライアント（回答専用）
// フォームへの回答送信・表示に使用
// RLS（Row Level Security）でアクセス制御
export const createAnswerClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );