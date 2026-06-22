import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/$')({ component: NotFoundPage })

function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#e2000f', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
        Ta strona jest jeszcze w budowie
      </p>
      <p style={{ color: 'var(--text)', opacity: 0.6 }}>Wróć wkrótce!</p>
    </div>
  )
}
