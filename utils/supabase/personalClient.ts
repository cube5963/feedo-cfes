'use client';

import { createBrowserClient } from "@supabase/ssr";

// 個人用クライアント（認証済みユーザー専用）
// フォームの作成・管理に使用
export const createPersonalClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );