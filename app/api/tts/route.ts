import { NextRequest, NextResponse } from 'next/server';

const VOICE_MAP: Record<string, string> = {
  ja: 'Kore',
  en: 'Achird',
  zh: 'Iapetus',
};

function buildWav(pcm: Buffer): Buffer {
  const channels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcm.length;

  const header = Buffer.alloc(44);
  let o = 0;
  header.write('RIFF', o);                        o += 4;
  header.writeUInt32LE(36 + dataSize, o);         o += 4;
  header.write('WAVE', o);                        o += 4;
  header.write('fmt ', o);                        o += 4;
  header.writeUInt32LE(16, o);                    o += 4;
  header.writeUInt16LE(1, o);                     o += 2;
  header.writeUInt16LE(channels, o);              o += 2;
  header.writeUInt32LE(sampleRate, o);            o += 4;
  header.writeUInt32LE(byteRate, o);              o += 4;
  header.writeUInt16LE(blockAlign, o);            o += 2;
  header.writeUInt16LE(bitsPerSample, o);         o += 2;
  header.write('data', o);                        o += 4;
  header.writeUInt32LE(dataSize, o);

  return Buffer.concat([header, pcm]);
}

export async function POST(req: NextRequest) {
  try {
    const { text, langCode } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: '텍스트를 입력해주세요.' }, { status: 400 });
    }

    const voiceName = VOICE_MAP[langCode] ?? 'Kore';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const detail = data?.error?.message ?? JSON.stringify(data);
      console.error('[tts] Gemini error', detail);
      return NextResponse.json({ error: detail }, { status: 500 });
    }

    const base64: string =
      data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? '';

    if (!base64) {
      return NextResponse.json({ error: '음성 생성 실패' }, { status: 500 });
    }

    const wav = buildWav(Buffer.from(base64, 'base64'));

    return new NextResponse(wav, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(wav.length),
      },
    });
  } catch (err) {
    console.error('[tts]', err);
    return NextResponse.json({ error: 'TTS 오류가 발생했습니다.' }, { status: 500 });
  }
}
