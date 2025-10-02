import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/serviceClient'

// フィンガープリント情報の型定義（シンプル版）
interface FingerprintData {
  fingerprint: string
  FormUUID: string
}

// GET: フィンガープリント情報を取得（重複チェック用）
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const fingerprint = searchParams.get('fingerprint')
    const FormUUID = searchParams.get('FormUUID')

    if (!fingerprint || !FormUUID) {
      return NextResponse.json(
        { error: 'フィンガープリントとFormUUIDが必要です' },
        { status: 400 }
      )
    }

    // 特定のフォームでの重複チェック
    const { data, error } = await supabase
      .from('FingerPrint')
      .select('*')
      .eq('fingerprint', fingerprint)
      .eq('FormUUID', FormUUID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない = 重複なし
        return NextResponse.json(
          { 
            exists: false,
            isDuplicate: false,
            message: 'フィンガープリントが見つかりません（新規回答者）' 
          },
          { status: 404 }
        )
      }
      console.error('フィンガープリント取得エラー:', error)
      return NextResponse.json(
        { error: 'フィンガープリントの取得に失敗しました' },
        { status: 500 }
      )
    }

    // レコードが見つかった = 重複あり
    return NextResponse.json({
      success: true,
      exists: true,
      isDuplicate: true,
      data: data,
      message: '既に回答済みです'
    })

  } catch (error) {
    console.error('フィンガープリント取得エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}




// POST: フィンガープリント情報を保存
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body: FingerprintData = await request.json()

    console.log('フィンガープリント保存API呼出:', body)

    // 必須フィールドの検証
    if (!body.fingerprint || !body.FormUUID) {
      console.log('必須フィールドエラー:', { fingerprint: !!body.fingerprint, FormUUID: !!body.FormUUID })
      return NextResponse.json(
        { error: 'フィンガープリントとFormUUIDは必須です' },
        { status: 400 }
      )
    }

    // 既存のレコードがあるかチェック
    const { data: existingRecord } = await supabase
      .from('FingerPrint')
      .select('*')
      .eq('fingerprint', body.fingerprint)
      .eq('FormUUID', body.FormUUID)
      .single()

    if (existingRecord) {
      // 既に存在する場合は重複として扱う（200で正常レスポンス）
      console.log('重複レコード検出:', existingRecord)
      return NextResponse.json({
        success: true,
        exists: true,
        isDuplicate: true,
        message: '既に記録済みのフィンガープリントです',
        data: existingRecord
      }, { status: 200 })
    }

    // 新しいレコードを作成
    console.log('新規レコード作成開始')
    const { data, error } = await supabase
      .from('FingerPrint')
      .insert({
        fingerprint: body.fingerprint,
        FormUUID: body.FormUUID
      })
      .select()
      .single()

    if (error) {
      console.error('フィンガープリント作成エラー:', error)
      return NextResponse.json(
        { error: 'フィンガープリントの作成に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    console.log('新規レコード作成成功:', data)
    return NextResponse.json({
      success: true,
      created: true,
      data: data,
      message: 'フィンガープリントを作成しました'
    })

  } catch (error) {
    console.error('フィンガープリント保存エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

