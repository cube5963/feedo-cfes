import {NextRequest} from "next/server";
import {createServiceClient} from "@/utils/supabase/serviceClient";

export async function GET(req: NextRequest) {
    const form_id = req.nextUrl.searchParams.get('form_id');

    const supabase = createServiceClient()

    const { data, error } = await supabase.from('Section').select('*').eq('FormUUID', form_id).order('SectionOrder', {ascending: true})
    return new Response(JSON.stringify({ data, error }), { status: 200 });
}