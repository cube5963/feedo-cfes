import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { calculateSectionStatistics } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const encoder = new TextEncoder();
  const { projectId } = await params;

  const customReadable = new ReadableStream({
    start(controller) {
      // 初期接続確認
      controller.enqueue(encoder.encode('data: {"type": "connected"}\n\n'));

      // Supabase リアルタイム購読を設定
      const supabase = createClient();
      
      const subscription = supabase
        .channel(`statistics-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Answer',
            filter: `FormUUID=eq.${projectId}`,
          },
          async (payload) => {
            try {
              // 新しい回答が追加されたセクションの統計を計算
              const sectionUUID = payload.new.SectionUUID;
              const statistics = await calculateSectionStatistics(projectId, sectionUUID);
              
              const data = {
                type: 'statistics_update',
                sectionUUID,
                statistics,
                timestamp: new Date().toISOString(),
              };

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            } catch (error) {
              console.error('統計計算エラー:', error);
            }
          }
        )
        .subscribe();

      // クリーンアップ
      request.signal.addEventListener('abort', () => {
        subscription.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
