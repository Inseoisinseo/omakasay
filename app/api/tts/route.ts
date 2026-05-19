import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: '텍스트를 입력해주세요.' }, { status: 400 });
    }

    // 패스권 서버 재검증
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) =>
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: passes } = await supabase
      .from('passes')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (!passes || passes.length === 0) {
      return NextResponse.json({ error: '패스권이 필요합니다.' }, { status: 403 });
    }

    // OpenAI TTS 호출
    const openaiRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text.trim(),
        voice: 'nova',
        response_format: 'mp3',
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error('[tts] OpenAI error', err);
      return NextResponse.json({ error: err?.error?.message ?? 'TTS 변환 실패' }, { status: 500 });
    }

    const audioBuffer = await openaiRes.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[tts]', err);
    return NextResponse.json({ error: 'TTS 오류가 발생했습니다.' }, { status: 500 });
  }
}
