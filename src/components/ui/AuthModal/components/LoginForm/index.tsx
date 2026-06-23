import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import FormField from '#/components/ui/FormField'
import { useAuth } from '#/hooks/useAuth'
import styles from './style.module.scss'

interface LoginFormProps {
  onSuccess: () => void
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { t } = useTranslation('common')
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
      setError(message ?? t('auth.form.errorFallback'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <FormField
        label={t('auth.form.email')}
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormField
        label={t('auth.form.password')}
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        required
      />

      <button type="button" className={styles.resetLink}>
        {t('auth.form.resetLink')}
      </button>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <button type="submit" className={styles.submit} disabled={isLoading}>
        {isLoading ? t('auth.form.submitting') : t('auth.form.submit')}
      </button>
    </form>
  )
}

export default LoginForm
