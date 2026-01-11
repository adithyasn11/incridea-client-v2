import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, type MutationFunction } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  login,
  requestPasswordReset,
  type LoginPayload,
  type LoginResponse,
  type ResetPasswordRequestPayload,
  type ResetPasswordResponse,
} from '../api/auth'
import RegistrationPage from './RegistrationPage'
import { showToast } from '../utils/toast'

function LoginPage() {
  const navigate = useNavigate()
  const [showRegister, setShowRegister] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return sessionStorage.getItem('authView') === 'register'
  })
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const toErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback

  const requestResetMutationFn: MutationFunction<
    ResetPasswordResponse,
    ResetPasswordRequestPayload
  > = (payload) =>
    (requestPasswordReset as (
      input: ResetPasswordRequestPayload,
    ) => Promise<ResetPasswordResponse>)(payload)

  const form = useForm<LoginPayload>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutationFn: MutationFunction<LoginResponse, LoginPayload> = (payload) => login(payload)

  const loginMutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginMutationFn,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userName', data.user.name)
      localStorage.setItem('userEmail', data.user.email)

      if (!data.user.isVerified) {
        showToast('Please verify your email to continue.', 'info')
        // Navigate to register page with state to show step 2
        // We need to ensure RegistrationPage reads this state
        // For now, let's assume we can pass a query param or state?
        // Since RegistrationPage is rendered inside LoginPage when showRegister is true,
        // OR we might be navigating to the /register route if it exists?
        // Wait, LoginPage has "showRegister" toggle.
        // If the user uses the dedicated /register route, we should navigate there.
        // But the previous code suggests `RegistrationPage` is embedded or at `/register`.
        // Let's assume `/register` route exists as per standard practice, OR we toggle `setShowRegister(true)` if on same page.
        // However, `data` in onSuccess implies we "Logged in".
        // If we are at `/login` (which renders this component), and we want to go to "Step 2" of registration.
        // If `RegistrationPage` is a separate route component, `navigate('/register')`.
        // If it's the same component, we might just stay here?
        // Standard Auth: Login -> Redirect.
        // If unverified, we want them to go to the verification screen.
        // Let's navigate to `/register` and pass state.
        void navigate('/register', { state: { step: 2 } })
        return
      }

      const userLabel = data.user.name ?? data.user.email ?? 'user'
      showToast(`Welcome back, ${userLabel}!`, 'success')
      void navigate('/')
    },
  })

  const requestResetMutation = useMutation<
    ResetPasswordResponse,
    unknown,
    ResetPasswordRequestPayload
  >({
    mutationFn: requestResetMutationFn,
    onSuccess: () => {
      const message = 'If that email exists, a reset link was sent.'
      setResetMessage(message)
      showToast(message, 'info')
    },
    onError: (error: unknown) => {
      const message = toErrorMessage(error, 'Failed to send reset link.')
      setResetMessage(message)
      showToast(message, 'error')
    },
  })

  const onSubmit = form.handleSubmit((values) => loginMutation.mutate(values))

  const handleResetRequest = () => {
    const email: string = (form.watch('email') as string | undefined) ?? ''
    if (!email) {
      const message = 'Enter your email to request a reset link.'
      setResetMessage(message)
      showToast(message, 'error')
      return
    }
    setResetMessage(null)
    requestResetMutation.mutate({ email })
  }

  useEffect(() => {
    const existingToken = localStorage.getItem('token')
    if (existingToken) {
      void navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    sessionStorage.setItem('authView', showRegister ? 'register' : 'login')
  }, [showRegister])

  return (
    <section className="space-y-6">
      {!showRegister && (
        <div className="card space-y-4 p-6">
          <div>
            <p className="muted">Welcome back</p>
            <h1 className="text-2xl font-semibold text-slate-50">Login</h1>
            <p className="text-sm text-slate-400">Use your email and password to continue.</p>
          </div>
          <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
            <div className="space-y-2">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                {...form.register('email', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                {...form.register('password', { required: true })}
              />
            </div>
            <button className="button" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Logging in…' : 'Login'}
            </button>
            <button
              className="button secondary w-full"
              type="button"
              onClick={handleResetRequest}
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending ? 'Sending link…' : 'Forgot password? Send reset link'}
            </button>
            {loginMutation.isError && (
              <p className="text-sm text-rose-300">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Login failed. Try again.'}
              </p>
            )}
            {resetMessage && <p className="text-sm text-slate-300">{resetMessage}</p>}
          </form>
          <div className="text-sm text-slate-300">
            Not yet registered?{' '}
            <button
              type="button"
              className="text-sky-300 underline"
              onClick={() => setShowRegister(true)}
            >
              Register now!
            </button>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="card p-0">
          <RegistrationPage />
          <div className="border-t border-slate-800 px-6 py-4 text-sm text-slate-300">
            Already registered?{' '}
            <button
              type="button"
              className="text-sky-300 underline"
              onClick={() => setShowRegister(false)}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default LoginPage
