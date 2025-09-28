import {NextRequest} from "next/server";
import {createServiceClient} from "@/utils/supabase/serviceClient";

export async function POST(req: NextRequest) {
    const { form_id, section_id, answer_id, answer_data } = await req.json();
    const answerPayload = {
        FormUUID: form_id,
        SectionUUID: section_id,
        AnswerUUID: answer_id,
        Answer: answer_data
    };

    const supabase = createServiceClient()

    const { data, error } = await supabase.from('Answer').insert([answerPayload]).select().select();

    return new Response(JSON.stringify({ data, error }), { status: 200 });
}