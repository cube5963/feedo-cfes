import { NextRequest } from 'next/server';
import { getFormStatistics } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const result = await getFormStatistics(projectId);
    return Response.json(result);
  } catch (error) {
    console.error('統計取得エラー:', error);
    
    if (error instanceof Error && error.message === 'フォームが見つかりません') {
      return Response.json(
        { error: 'フォームが見つかりません' },
        { status: 404 }
      );
    }
    
    return Response.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
