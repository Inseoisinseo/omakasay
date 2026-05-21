import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#fffcef',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.5px',
            lineHeight: 1,
            paddingBottom: 1,
          }}
        >
          o
        </div>
      </div>
    ),
    { ...size },
  );
}
