import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import FormField from '#/components/ui/FormField'
import { useAuth } from '#/hooks/useAuth'
import styles from './style.module.scss'

interface LoginFormProps {
  onSuccess: () => void
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
      onSuccess()
      navigate({ to: '/welcome' })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      const message = axiosError?.response?.data?.message
      setError(message ?? 'Nieprawidłowy email lub hasło')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormField
        label="Hasło"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        required
      />

      <button type="button" className={styles.resetLink}>
        link do resetu hasła
      </button>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <button type="submit" className={styles.submit} disabled={isLoading}>
        {isLoading ? 'Logowanie...' : 'ZALOGUJ SIĘ'}
      </button>
    </form>
  )
}

export default LoginForm
