import type { NextApiRequest, NextApiResponse } from 'next';

export async function POST(request: Request) {
    const { token } = await request.json();
    if (!token) {
        return new Response(JSON.stringify({ error: 'No token provided' }), { status: 400 });
    }

    const secretKey = process.env.CF_TURNSTILE_SECRET_KEY;
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const formData = new URLSearchParams();
    formData.append('secret', secretKey ?? '');
    formData.append('response', token);

    const response = await fetch(verifyUrl, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
}

