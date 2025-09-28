import {NextRequest} from "next/server";
import {createServiceClient} from "@/utils/supabase/serviceClient";

export async function POST(req: NextRequest) {
    const { type } = await req.json();

    const supabase = createServiceClient()

    if (type === 'access'){
        const { data, error } = await supabase.from('metrics').select('num').eq('name', 'access').single();
        const num = Number(data?.num ?? 0);
        const { error: updateError } = await supabase.from('metrics').update({ num: num + 1 }).eq('name', 'access');
    } else if (type === 'answer') {
        const { data, error } = await supabase.from('metrics').select('num').eq('name', 'answer').single();
        const num = Number(data?.num ?? 0);
        const { error: updateError } = await supabase.from('metrics').update({ num: num + 1 }).eq('name', 'answer');
    }
}