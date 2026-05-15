import { NextRequest, NextResponse } from 'next/server';

const LANG_STYLE: Record<string, string> = {
  ja: '일본어 (정중한 です/ます체, 처음 만나는 사람에게 쓰는 격식체)',
  en: 'English (formal and polite, suitable for speaking to strangers)',
  zh: '중국어 (정중하고 격식 있는 표현, 처음 보는 사람에게 어울리는 말투)',
};

export async function POST(req: NextRequest) {
  try {
    const { text, langCode } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: '텍스트를 입력해주세요.' }, { status: 400 });
    }

    const style = LANG_STYLE[langCode] ?? langCode;
    const prompt = `다음 한국어 문장을 ${style}로 번역해줘. 번역된 문장만 출력하고, 설명이나 부가 내용은 절대 포함하지 마.\n\n${text.trim()}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const detail = data?.error?.message ?? JSON.stringify(data);
      console.error('[translate] Gemini error', detail);
      return NextResponse.json({ error: detail }, { status: 500 });
    }

    const translated: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    return NextResponse.json({ translated });
  } catch (err) {
    console.error('[translate]', err);
    return NextResponse.json({ error: '번역 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
