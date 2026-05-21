import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: '#fffcef',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-2px',
            lineHeight: 1,
            paddingBottom: 4,
          }}
        >
          o
        </div>
      </div>
    ),
    { ...size },
  );
}
