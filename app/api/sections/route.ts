import { NextRequest, NextResponse } from 'next/server';
import { getJWTToken } from '@/utils/backend/jwt';
import { isValidFormId } from "@/utils/valid/formid";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


export async function GET(req: NextRequest) {
    const projectId = req.nextUrl.searchParams.get('projectId');
    if (!projectId) {
        return NextResponse.json({ error: 'projectId is required' }, { status: 400 } as ResponseInit);
    }
    if (!isValidFormId(projectId)) {
        return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 } as ResponseInit);
    }

    const cachekey = `sections:${projectId}`;
    const res = await fetch(`${process.env.REDIS_URL}/GET/${cachekey}`, {
        headers: {
            'Authorization': `Bearer ${getJWTToken()}`,
        }
    });
    const text = await res.text();
    try {
        const data = JSON.parse(text);
        return NextResponse.json(data);
    } catch (e) {
        console.error('Redisレスポンス:', text);
        return NextResponse.json({ error: 'Invalid response from Redis', detail: text }, { status: 502 });
    }
}

// セット用
export async function POST(req: NextRequest) {
    const { projectId, sectionsData } = await req.json();
    if (!projectId || !sectionsData) {
        return NextResponse.json({ error: 'projectId and sectionsData are required' }, { status: 400 } as ResponseInit);
    }
    if (!isValidFormId(projectId)) {
        return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 } as ResponseInit);
    }

    const cachekey = `sections:${projectId}`;
    const res = await fetch(
        `${process.env.REDIS_URL}/SETEX/${cachekey}/3600/${encodeURIComponent(JSON.stringify(sectionsData))}`,
        {
            headers: {
                'Authorization': `Bearer ${getJWTToken()}`,
            }
        }
    );
    const data = await res.json();
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const projectId = req.nextUrl.searchParams.get('projectId');
    if (!projectId) {
        return NextResponse.json({ error: 'projectId is required' }, { status: 400 } as ResponseInit);
    }
    if (!isValidFormId(projectId)) {
        return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 } as ResponseInit);
    }

    const cachekey = `sections:${projectId}`;
    const res = await fetch(
        `${process.env.REDIS_URL}/DEL/${cachekey}`,
        {
            headers: {
                'Authorization': `Bearer ${getJWTToken()}`,
            }
        }
    );
    const data = await res.json();
    return NextResponse.json(data);
}

