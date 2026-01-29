import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSocket } from '../hooks/useSocket'
import { IoCheckmarkCircle, IoClose, IoWarning } from 'react-icons/io5'
import { FaIdCard, FaSpinner } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getPaymentStatus } from '../api/registration'


interface PaymentProcessingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number | string | undefined
  completedPid?: string | null
  failed?: boolean
  paymentType?: 'FEST' | 'ACCOMMODATION'
}

type StepStatus = 'pending' | 'loading' | 'success' | 'error' | 'skipped'

const glassCardStyle = {
    borderRadius: "1.75rem",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    background: `linear-gradient(to top, rgba(0, 0, 0, 0.20), transparent 60%), rgba(21, 21, 21, 0.30)`,
    boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.22)`,
    backdropFilter: "brightness(1.1) blur(1px)",
    WebkitBackdropFilter: "brightness(1.1) blur(1px)",
}

export default function PaymentProcessingModal({ isOpen, onClose, userId, completedPid, failed, paymentType = 'FEST' }: PaymentProcessingModalProps) {
  const { socket } = useSocket()
  const navigate = useNavigate()

  
  const [steps, setSteps] = useState({
    payment: (failed ? 'error' : 'success') as StepStatus, 
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
        setSteps(prev => ({ ...prev, payment: 'error', pid: 'error' }))
    }
  }, [failed])

  // Watch for external PID (fallback or fast API response)
  useEffect(() => {
    if (completedPid && steps.pid !== 'success' && !finalPid) {
        setSteps({
            payment: 'success',
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
        setSteps(prev => ({ ...prev, payment: 'error', pid: 'error' }))
    }

    // Accommodation specific events
    const handleBookingConfirmed = () => {
        if (paymentType === 'ACCOMMODATION') {
            setSteps(prev => ({ ...prev, payment: 'success', pid: 'success' })) // Treat 'pid' step as 'booking' step internally
            setTimeout(() => {
                setShowSlotMachine(true)
            }, 500)
        }
    }

    const handlePaymentSuccess = () => {
         // Generic success, waiting for next step
         setSteps(prev => ({ ...prev, payment: 'success' }))
         if (paymentType === 'ACCOMMODATION') {
             // For accommodation, success payment usually means confirmed unless manual confirm step exists
             // But we wait for 'booking_confirmed' or just show success
         }
    }

    socket.on('generating_pid', handleGeneratingPid)
    socket.on('pid_generated', handlePidGenerated)
    socket.on('payment_failed', handlePaymentFailed)
    socket.on('payment_success', handlePaymentSuccess)
    socket.on('booking_confirmed', handleBookingConfirmed)
    
    // Initial Status Check
    const checkStatus = async () => {
        try {
            const apiType = paymentType === 'ACCOMMODATION' ? 'ACCOMMODATION' : 'FEST_REGISTRATION'
             // @ts-ignore
            const statusData = await getPaymentStatus(apiType)
            
            if (statusData.status === 'success') {
                if (paymentType === 'ACCOMMODATION') {
                     setSteps(prev => ({ ...prev, pid: 'success', payment: 'success' }))
                     setShowSlotMachine(true)
                } else if (statusData.pid) {
                     setSteps(prev => ({ ...prev, pid: 'success', payment: 'success' }))
                     setFinalPid(statusData.pid)
                     setShowSlotMachine(true)
                }
            } else if (statusData.processingStep === 'GENERATING_PID') {
                 setSteps(prev => ({ ...prev, pid: 'loading', payment: 'success' }))
            }
        } catch(e) { console.error(e) }
    }
    
    checkStatus()

    return () => {
        socket.off('generating_pid', handleGeneratingPid)
        socket.off('pid_generated', handlePidGenerated)
        socket.off('payment_failed', handlePaymentFailed)
        socket.off('payment_success', handlePaymentSuccess)
        socket.off('booking_confirmed', handleBookingConfirmed)
        socket.emit('leave-room', room)
    }
  }, [socket, userId, isOpen, paymentType])

  // Confetti Effect
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
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         style={glassCardStyle}
         className="w-full max-w-2xl p-8 relative overflow-hidden"
       >
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-sky-500 via-fuchsia-500 to-sky-500 animate-gradient-x" />

         <button
            onClick={() => {
                // If done, redirect to home
                if (steps.payment === 'success' && steps.pid === 'success') {
                  navigate('/')
                }
                onClose()
            }}
            className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors z-10"
          >
            <IoClose size={24} />
          </button>

          {!showSlotMachine ? (
              <div className="space-y-6 py-4">
                  <h2 className="text-2xl font-bold text-white text-center">Processing {paymentType === 'ACCOMMODATION' ? 'Booking' : 'Registration'}</h2>
                  
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
                            icon={<FaIdCard />} 
                            label={
                                paymentType === 'ACCOMMODATION' ? 
                                    (steps.pid === 'loading' ? 'Confirming Booking...' : steps.pid === 'success' ? 'Booking Confirmed' : 'Confirm Booking')
                                :
                                    (steps.pid === 'loading' ? "Generating PID..." : steps.pid === 'success' ? "PID Generated" : "Generate PID")
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
             paymentType === 'ACCOMMODATION' ? (
                 <BookingConfirmation onComplete={triggerConfetti} />
             ) : (
                 <PIDReveal 
                    pid={finalPid || "INC-0000"} 
                    onComplete={triggerConfetti} 
                 />
             )
          )}

       </motion.div>
    </div>,
    document.body
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

function BookingConfirmation({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        onComplete()
    }, [])

    return (
        <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
             <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
             >
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-3xl">
                    <IoCheckmarkCircle />
                </div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    Booking Confirmed!
                </h2>
                <p className="text-slate-400 mt-2">Your accommodation has been successfully booked.</p>
             </motion.div>

             <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-sm">
                 <p className="text-sm text-slate-300">
                     We have sent a confirmation email with the receipt to your registered email address.
                 </p>
             </div>
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
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-3xl">
                    <IoCheckmarkCircle />
                </div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    You're In!
                </h2>
                <p className="text-slate-400 mt-2">Here is your Incridea PID</p>
             </motion.div>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-2xl font-mono font-bold text-white">
                 <div className="flex gap-2">
                    {prefix.split('').map((char, i) => (
                        <div 
                           key={`prefix-${i}`} 
                           style={{ ...glassCardStyle, borderRadius: "0.8rem", width: "3rem", height: "4rem" }}
                           className="flex items-center justify-center"
                       >
                           <span className="text-sky-400">{char}</span>
                       </div>
                    ))}
                 </div>
                 
                 <div className="flex gap-2">
                     {digits.map((digit, i) => (
                         <div 
                            key={i} 
                            style={{ ...glassCardStyle, borderRadius: "0.8rem", width: "3rem", height: "4rem" }}
                            className="flex items-center justify-center"
                        >
                            <SlotDigit digit={digit} delay={i * 0.2} />
                         </div>
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


