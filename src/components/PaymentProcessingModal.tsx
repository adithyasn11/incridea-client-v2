import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSocket } from '../hooks/useSocket'
import { IoCheckmarkCircle, IoClose, IoWarning } from 'react-icons/io5'
import { FaFileInvoice, FaIdCard, FaSpinner } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getPaymentStatus } from '../api/registration'

interface PaymentProcessingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number | string | undefined
  completedPid?: string | null
  failed?: boolean
}

type StepStatus = 'pending' | 'loading' | 'success' | 'error' | 'skipped'

export default function PaymentProcessingModal({ isOpen, onClose, userId, completedPid, failed }: PaymentProcessingModalProps) {
  const { socket } = useSocket()
  const navigate = useNavigate()
  
  const [steps, setSteps] = useState({
    payment: (failed ? 'error' : 'success') as StepStatus, 
    receipt: (failed ? 'error' : 'pending') as StepStatus,
    pid: (failed ? 'error' : 'pending') as StepStatus,
  })

  // PID Reveal State
  const [finalPid, setFinalPid] = useState<string | null>(null)
  const [showSlotMachine, setShowSlotMachine] = useState(false)
  
  // Confetti trigger
  const hasTriggeredConfetti = useRef(false)

  // Watch for failed prop
  useEffect(() => {
    if (failed) {
        setSteps(prev => ({ ...prev, payment: 'error', receipt: 'error', pid: 'error' }))
    }
  }, [failed])

  // Watch for external PID (fallback or fast API response)
  useEffect(() => {
    if (completedPid && steps.pid !== 'success' && !finalPid) {
        setSteps({
            payment: 'success',
            receipt: 'success', // Assume receipt done if PID exists
            pid: 'success'
        })
        setFinalPid(completedPid)
        setShowSlotMachine(true)
    }
  }, [completedPid, steps.pid, finalPid])

  useEffect(() => {
    if (!socket || !userId || !isOpen) return

    const room = `user-${userId}`
    socket.emit('join-room', room)

    const handleGeneratingReceipt = () => {
        setSteps(prev => ({ ...prev, receipt: 'loading' }))
    }

    const handleReceiptGenerated = () => {
        setSteps(prev => ({ ...prev, receipt: 'success' }))
    }
    
    const handleReceiptFailed = () => {
         setSteps(prev => ({ ...prev, receipt: 'skipped' })) // or error
    }

    const handleGeneratingPid = () => {
        setSteps(prev => ({ ...prev, pid: 'loading' }))
    }

    const handlePidGenerated = ({ pid }: { pid: string }) => {
        setSteps(prev => ({ ...prev, pid: 'success' }))
        setFinalPid(pid)
        setTimeout(() => {
            setShowSlotMachine(true)
        }, 500)
    }

    const handlePaymentFailed = () => {
        setSteps(prev => ({ ...prev, payment: 'error', receipt: 'error', pid: 'error' }))
    }

    socket.on('generating_receipt', handleGeneratingReceipt)
    socket.on('receipt_generated', handleReceiptGenerated)
    socket.on('receipt_failed', handleReceiptFailed)
    socket.on('generating_pid', handleGeneratingPid)
    socket.on('pid_generated', handlePidGenerated)
    socket.on('payment_failed', handlePaymentFailed)
    
    // Initial Status Check
    const checkStatus = async () => {
        try {
            const statusData = await getPaymentStatus()
            if (statusData.receipt) {
                setSteps(prev => ({ ...prev, receipt: 'success', payment: 'success' }))
            }
            if (statusData.pid) {
                 setSteps(prev => ({ ...prev, pid: 'success', receipt: 'success', payment: 'success' }))
                 setFinalPid(statusData.pid)
                 setShowSlotMachine(true)
            } else if (statusData.processingStep === 'GENERATING_PID') {
                 setSteps(prev => ({ ...prev, receipt: 'success', pid: 'loading', payment: 'success' }))
            } else if (statusData.processingStep === 'GENERATING_RECEIPT') {
                 // Assume this means payment is done
                 setSteps(prev => ({ ...prev, payment: 'success', receipt: 'loading' }))
            }
        } catch(e) { console.error(e) }
    }
    
    checkStatus()

    return () => {
        socket.off('generating_receipt', handleGeneratingReceipt)
        socket.off('receipt_generated', handleReceiptGenerated)
        socket.off('receipt_failed', handleReceiptFailed)
        socket.off('generating_pid', handleGeneratingPid)
        socket.off('pid_generated', handlePidGenerated)
        socket.off('payment_failed', handlePaymentFailed)
        socket.emit('leave-room', room)
    }
  }, [socket, userId, isOpen])

  // Confetti Effect when Slot Machine finishes (simulated delay or pure visual)
  const triggerConfetti = () => {
      if (hasTriggeredConfetti.current) return
      hasTriggeredConfetti.current = true
      
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0ea5e9', '#ec4899', '#a855f7']
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0ea5e9', '#ec4899', '#a855f7']
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-6 relative overflow-hidden"
       >
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-sky-500 via-fuchsia-500 to-sky-500 animate-gradient-x" />

         <button
            onClick={() => {
                if(finalPid) navigate('/') // Redirect home on close if done
                onClose()
            }}
            className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors z-10"
          >
            <IoClose size={24} />
          </button>

          {!showSlotMachine ? (
              <div className="space-y-6 py-4">
                  <h2 className="text-2xl font-bold text-white text-center">Processing Registration</h2>
                  
                  <div className="space-y-4">
                      {/* Step 1: Payment Verification */}
                      <StepItem 
                        icon={<IoCheckmarkCircle />} 
                        label="Payment Verified" 
                        status={steps.payment} 
                      />

                      {/* Step 2 & 3 Only if payment is not failed */}
                      {steps.payment !== 'error' && (
                        <>
                          <StepItem 
                            icon={<FaFileInvoice />} 
                            label={
                                steps.receipt === 'loading' ? "Generating Invoice..." : 
                                steps.receipt === 'success' ? "Invoice Generated" :
                                steps.receipt === 'skipped' ? "Invoice Generation Skipped" :
                                "Generate Invoice"
                            }
                            status={steps.receipt} 
                          />

                          <StepItem 
                            icon={<FaIdCard />} 
                            label={
                                steps.pid === 'loading' ? "Generating PID..." : 
                                steps.pid === 'success' ? "PID Generated" :
                                "Generate PID"
                            }
                            status={steps.pid} 
                          />
                        </>
                      )}
                  </div>
                  
                  {steps.payment === 'error' && (
                      <div className="text-center text-red-400 mt-4 text-sm font-medium px-4">
                          Your payment has failed. If your money is deducted, it will be refunded by the bank within 5-7 business days.
                      </div>
                  )}
              </div>
          ) : (
             <PIDReveal 
                pid={finalPid || "INC-0000"} 
                onComplete={triggerConfetti} 
             />
          )}

       </motion.div>
    </div>
  )
}

function StepItem({ icon, label, status }: { icon: any, label: string, status: StepStatus }) {
    return (
        <div className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
            status === 'pending' ? 'border-white/5 bg-white/5 text-slate-400' :
            status === 'loading' ? 'border-sky-500/30 bg-sky-500/10 text-sky-400' :
            status === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
            status === 'skipped' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
            'border-red-500/30 bg-red-500/10 text-red-400'
        }`}>
            <div className={`text-xl ${status === 'loading' ? 'animate-spin' : ''}`}>
               {status === 'loading' ? <FaSpinner /> : 
                status === 'success' ? <IoCheckmarkCircle /> :
                status === 'error' ? <IoClose /> :
                status === 'skipped' ? <IoWarning /> :
                icon} 
            </div>
            <span className="font-medium">{label}</span>
        </div>
    )
}

function PIDReveal({ pid, onComplete }: { pid: string, onComplete: () => void }) {
    // PID Format usually INC-xxxx or similar. We want to slot machine the numbers.
    // Assuming PID is like "INC-1234"
    const [prefix, ...rest] = pid.split('-')
    const numberPart = rest.join('-') // Handle cases if multiple dashes, though unlikely
    
    // Split number into digits
    const digits = numberPart.split('')
    
    useEffect(() => {
        // Trigger complete after animation duration
        const timer = setTimeout(() => {
            onComplete()
        }, 1500 + (digits.length * 200)) // Approximate duration
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
             <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
             >
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-4xl">
                    <IoCheckmarkCircle />
                </div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    You're In!
                </h2>
                <p className="text-slate-400 mt-2">Here is your Incridea PID</p>
             </motion.div>

             <div className="flex items-center justify-center gap-2 text-4xl font-mono font-bold text-white bg-slate-800/50 p-6 rounded-2xl border border-white/10 shadow-inner">
                 <span className="text-sky-400">{prefix}</span>
                 <span className="text-slate-600">-</span>
                 <div className="flex gap-1">
                     {digits.map((digit, i) => (
                         <SlotDigit key={i} digit={digit} delay={i * 0.2} />
                     ))}
                 </div>
             </div>

             <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-sm text-slate-500"
             >
                Check your email for the invoice.
             </motion.p>
        </div>
    )
}

function SlotDigit({ digit, delay }: { digit: string, delay: number }) {
    const [current, setCurrent] = useState('0')
    
    useEffect(() => {
        const duration = 1500
        const interval = 50 // ms per flip
        const steps = duration / interval
        
        let step = 0
        
        // Start after delay
        const startTimeout = setTimeout(() => {
            const timer = setInterval(() => {
                step++
                // Random digit during spin
                setCurrent(Math.floor(Math.random() * 10).toString())
                
                if (step >= steps) {
                    clearInterval(timer)
                    setCurrent(digit)
                }
            }, interval)
        }, delay * 1000)

        return () => clearTimeout(startTimeout)
    }, [digit, delay])

    return (
        <motion.span 
            className="w-8 inline-block text-center"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            {current}
        </motion.span>
    )
}
