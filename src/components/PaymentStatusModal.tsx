import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Check, X, Loader2 } from 'lucide-react'

interface PaymentStatusModalProps {
  isOpen: boolean
  onClose: () => void
  status: 'success' | 'failure' | 'loading'
  pid?: string | null
}

export default function PaymentStatusModal({
  isOpen,
  onClose,
  status,
  pid,
}: PaymentStatusModalProps) {
  useEffect(() => {
    if (isOpen && status === 'success') {
      const end = Date.now() + 3 * 1000

      const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

      ;(function frame() {
        if (!isOpen) return
        
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    }
  }, [isOpen, status])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  {status === 'loading' && (
                    <div className="rounded-full bg-slate-800 p-3">
                      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="rounded-full bg-green-500/10 p-3 ring-1 ring-green-500/50">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                  )}

                  {status === 'failure' && (
                    <div className="rounded-full bg-red-500/10 p-3 ring-1 ring-red-500/50">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                  )}

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    {status === 'loading' && 'Verifying Payment...'}
                    {status === 'success' && 'Welcome to Incridea!'}
                    {status === 'failure' && 'Payment Verification Failed'}
                  </Dialog.Title>

                  <div className="mt-2">
                    <p className="text-sm text-slate-400">
                      {status === 'loading' &&
                        'Please wait while we confirm your payment details.'}
                      {status === 'success' && (
                        <span>
                          Congratulations! You have successfully registered.
                          <br />
                          Your PID is <strong className="text-sky-400">{pid}</strong>
                        </span>
                      )}
                      {status === 'failure' &&
                        'Your payment might have failed or is still pending. If money was deducted, please wait for a few minutes or contact support.'}
                    </p>
                  </div>

                  <div className="mt-4 w-full">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      {status === 'success' ? 'Continue' : 'Close'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
