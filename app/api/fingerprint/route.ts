import {NextRequest} from "next/server";
import {createServiceClient} from "@/utils/supabase/serviceClient";
import { createHash } from "crypto";

export async function GET(req: NextRequest) {
    const form_id = req.nextUrl.searchParams.get('form_id');
    const fingerprint = req.nextUrl.searchParams.get('fingerprint');

    if (!form_id || !fingerprint) {
        return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    const combined = form_id + fingerprint;
    const hash = createHash('sha256').update(combined).digest('hex');

    const supabase = createServiceClient()

    const { data, error } = await supabase.from('FingerPrint').select('*').eq('hash', hash).single();

    if (!data) {
        return new Response(JSON.stringify({ result: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ result: true }), { status: 200 });
}

export async function POST(req: NextRequest) {
    const { form_id, fingerprint } = await req.json();
    const combined = form_id + fingerprint;
    const hash = createHash('sha256').update(combined).digest('hex');

    const supabase = createServiceClient()
    const { data, error } = await supabase.from('FingerPrint').upsert([{ FormUUID: form_id, fingerprint: fingerprint, hash: hash }]).select().single();

    return new Response(JSON.stringify({ data, error }), { status: 200 });
}