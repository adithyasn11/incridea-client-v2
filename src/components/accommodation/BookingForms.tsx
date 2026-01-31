import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UploadButton } from '../../utils/uploadthing'
import { toast } from 'react-toastify'
import { bookIndividual } from '../../api/accommodation'
import { Loader2, X, FileText } from 'lucide-react'

// Schemas
const individualSchema = z.object({

  checkIn: z.string().min(1, 'Check-in time is required'),
  checkOut: z.string().min(1, 'Check-out time is required'),
  idCard: z.string({ message: 'Please upload your college id photo' }).url('ID Card image is required'),
})

type IndividualForm = z.infer<typeof individualSchema>


import PaymentProcessingModal from '../PaymentProcessingModal'
import { useAuth } from '../../hooks/useAuth'

export const IndividualBookingForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false)
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<IndividualForm>({
    resolver: zodResolver(individualSchema),
    defaultValues: {

    }
  })

  // Watch ID Card to show preview or status
  const idCard = watch('idCard')

  const onSubmit = async (data: IndividualForm) => {
    setLoading(true)
    try {
      const response = await bookIndividual({
        ...data,
        checkIn: new Date(data.checkIn).toISOString(),
        checkOut: new Date(data.checkOut).toISOString()
      })
      
      const { payment } = response
      
      const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
      }

      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (!res) {
          toast.error('Razorpay SDK failed to load')
          setLoading(false)
          return
      }

      const options = {
          key: payment.key,
          amount: payment.amount,
          currency: payment.currency,
          name: "Incridea",
          description: "Accommodation Booking",
          order_id: payment.orderId,
          handler: function (_response: any) {
             // Open Modal to track status
             setPaymentModalOpen(true)
             // onSuccess() // Do not call immediate onSuccess, let modal handle it
          },
          prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phoneNumber
          },
          theme: {
              color: '#3399cc'
          }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
          toast.error(response.error.description || 'Payment Failed')
      })
      rzp.open()

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


        <div>
           {/* Date pickers - simple datetime-local for now */}
           <label className="block text-sm font-medium mb-1">Check In</label>
           <input type="datetime-local" {...register('checkIn')} className="w-full bg-white/10 border border-white/20 rounded p-2 focus:outline-none" />
           {errors.checkIn && <p className="text-red-400 text-xs mt-1">{errors.checkIn.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Check Out</label>
           <input type="datetime-local" {...register('checkOut')} className="w-full bg-white/10 border border-white/20 rounded p-2 focus:outline-none" />
           {errors.checkOut && <p className="text-red-400 text-xs mt-1">{errors.checkOut.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ID Card (College ID)</label>
        <div className="border border-white/20 border-dashed rounded p-4 flex flex-col items-center justify-center bg-white/5">
            {idCard ? (
                <div className="relative w-full h-48 group">
                    {idCard.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 text-white rounded-md p-4">
                            <FileText className="w-12 h-12 mb-2 text-white/70" />
                            <span className="text-xs text-white/70 break-all text-center max-w-full truncate px-2">
                                {idCard.split('/').pop()}
                            </span>
                        </div>
                    ) : (
                        <img 
                          src={idCard} 
                          alt="ID Card" 
                          className="w-full h-full object-contain rounded-md" 
                        />
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 rounded-md transition-opacity">
                        <button
                            type="button"
                            onClick={() => setValue('idCard', '')}
                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-sm"
                            title="Remove Image"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <UploadButton
                    endpoint="accommodationIdProof"
                    onClientUploadComplete={(res) => {
                        console.log('Upload response:', res)
                        const file = res?.[0]
                        const url = file?.serverData?.fileUrl || file?.url
                        if (url) {
                            setValue('idCard', url)
                            toast.success('Upload complete')
                        } else {
                            console.error('Upload successful but no URL found:', file)
                            toast.error('Upload complete but URL missing')
                        }
                    }}
                    onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`)
                    }}
                />
            )}
        </div>
        {errors.idCard && <p className="text-red-400 text-xs mt-1">{errors.idCard.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex justify-center items-center">
        {loading ? <Loader2 className="animate-spin" /> : 'Book & Pay'}
      </button>
    </form>
    
    <PaymentProcessingModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => {
            setPaymentModalOpen(false)
            onSuccess() // Refresh or cleanup on close
        }}
        userId={user?.id}
        paymentType='ACCOMMODATION'
    />
    </>
  )
}



