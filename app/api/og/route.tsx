import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          {/* Ghost Icon */}
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
            <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
          </svg>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1,
              }}
            >
              GhostSwap
            </div>
            <div
              style={{
                fontSize: '28px',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Organiza tu Amigo Secreto Online
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '40px',
            fontSize: '22px',
            color: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            gap: '24px',
          }}
        >
          <span>Sorteos automáticos</span>
          <span>•</span>
          <span>Listas de deseos</span>
          <span>•</span>
          <span>100% Gratis</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
