import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, type MutationFunction } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  resetPasswordConfirm,
  type ResetPasswordConfirmPayload,
  type ResetPasswordResponse,
} from '../api/auth'
import { showToast } from '../utils/toast'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token'), [searchParams])

  const form = useForm<Omit<ResetPasswordConfirmPayload, 'token'>>({
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
  const resetMutationFn: MutationFunction<ResetPasswordResponse, ResetPasswordConfirmPayload> = (
    payload,
  ) => resetPasswordConfirm(payload)
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

  const resetMutation = useMutation<ResetPasswordResponse, Error, ResetPasswordConfirmPayload>({
    mutationFn: resetMutationFn,
    onSuccess: () => {
      showToast('Password has been reset. You can now log in.', 'success')
      void navigate('/login')
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!token) {
      return
    }
    resetMutation.mutate({ ...values, token })
  })

  return (
    <section className="space-y-6">
      <div className="card space-y-4 p-6">
        <div>
          <p className="muted">Reset password</p>
          <h1 className="text-2xl font-semibold text-slate-50">Choose a new password</h1>
          {!token && (
            <p className="text-sm text-rose-300">Missing or invalid reset token. Check your link.</p>
          )}
        </div>
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <div className="space-y-2">
            <label className="label" htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              className="input"
              {...form.register('newPassword', { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="label" htmlFor="confirmNewPassword">Confirm new password</label>
            <input
              id="confirmNewPassword"
              type="password"
              className="input"
              {...form.register('confirmNewPassword', { required: true })}
            />
          </div>
          <button className="button" type="submit" disabled={!token || resetMutation.isPending}>
            {resetMutation.isPending ? 'Resetting…' : 'Reset password'}
          </button>
          {resetMutation.isError && (
            <p className="text-sm text-rose-300">
              {resetMutation.error instanceof Error
                ? resetMutation.error.message
                : 'Failed to reset password. Try again.'}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

export default ResetPasswordPage
