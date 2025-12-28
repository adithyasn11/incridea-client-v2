import { toast, type ToastOptions } from 'react-toastify'

export type ToastVariant = 'info' | 'success' | 'error'

export function showToast(message: string, variant: ToastVariant = 'info', options?: ToastOptions) {
  const fn = variant === 'success' ? toast.success : variant === 'error' ? toast.error : toast.info
  fn(message, options)
}
