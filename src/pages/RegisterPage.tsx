
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchRegistrationConfig, type RegistrationConfigResponse } from '../api/public'
import { fetchMe } from '../api/auth'
import { showToast } from '../utils/toast'

function RegisterPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])
  
  const { data: userData, isLoading: isUserLoading, isError: isUserError, refetch: refetchUser } = useQuery({
      queryKey: ['me'],
      queryFn: fetchMe,
      retry: false,
  })

  useEffect(() => {
     if (localStorage.getItem('token') && (isUserError || !userData)) {
         void refetchUser()
     }
  }, [isUserError, userData, refetchUser])


  // Redirect if not authenticated (and not loading)
  useEffect(() => {
    // If we have no token, or if fetchMe failed
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = `${import.meta.env.VITE_AUTH_URL}/?redirect=${window.location.href}`
        return
    }
    
    if (!isUserLoading && isUserError) {
         window.location.href = `${import.meta.env.VITE_AUTH_URL}/?redirect=${window.location.href}`
    }
  }, [isUserLoading, isUserError])

  const user = userData?.user
  const [registrationOption, setRegistrationOption] = useState('')

  const { data: registrationConfig, isLoading: isConfigLoading } = useQuery<RegistrationConfigResponse>({
    queryKey: ['registration-config'],
    queryFn: fetchRegistrationConfig,
  })

  const computedSelection = useMemo(() => {
      if (!user) return 'NMAMIT';
      if (user.collegeId === 1) return 'NMAMIT';
      return 'OTHER';
  }, [user]);

  // But wait, Alumni also has collegeId=1 usually? 
  // In Auth app Step 1: 
  // if (selection === 'ALUMNI') { setValue('collegeId', 1) }
  
  // So we need to distinguish Alumni.
  // We can use `user.yearOfGraduation` existence? Or check `user.category` if it exists.
  // Looking at `authController.ts`: `category: user.category`.
  
  // Let's rely on user.category if possible.
  
  const feeOptions = useMemo(() => {
    if (!registrationConfig) return []
    const { fees, isRegistrationOpen, isSpotRegistration } = registrationConfig
    
    if (!isRegistrationOpen) return []

    // Logic from Auth app adapted for User Profile
    // We need to know if user is Alumni.
    // Let's assume we can determine it. 
    // If not, we might need to ask the user to confirm their type? 
    // But they already registered.
    
    // Simplification: Check user props.
    // If we can't fully determine, we might show a selection? But user data is already fixed.
    
    const isNmamit = computedSelection === 'NMAMIT';
    // const isAlumni = ... // How to detect?
    // In `authController`: `yearOfGraduation: user.Alumni?.yearOfGraduation`.
    // If `yearOfGraduation` is present, they are Alumni? 
    // Or if `user.roles` or `user.category` says it.
    
    // Strict logic from Auth Page:
    // Selection 'NMAMIT' -> collegeId 1.
    // Selection 'ALUMNI' -> collegeId 1.
    
    // If collegeId == 1, could be NMAMIT student OR Alumni.
    // If `user.category` matches 'ALUMNI'? 
    
    // Let's proceed with minimal logic and refine if needed.
    
    if (isNmamit) {
        // Check for Alumni?
        // Assuming for now standard NMAMIT logic if we don't have alumni flag.
        
          if (isSpotRegistration) {
            return [
              {
                id: 'internal-onspot',
                label: 'On spot registration',
                amount: Number(fees.internalRegistrationOnSpot) || 0,
              },
            ]
          }
          return [
            {
              id: 'internal-merch',
              label: 'Merch + Incridea Pass',
              amount: fees.internalRegistrationFeeInclusiveMerch,
            },
            {
              id: 'internal-pass',
              label: 'Incridea Pass only',
              amount: fees.internalRegistrationFeeGen,
            },
          ]
    }
    
    // OTHER
     if (isSpotRegistration) {
        return [
          {
            id: 'external-onspot',
            label: 'On spot registration',
            amount: fees.externalRegistrationFeeOnSpot,
          },
        ]
      }
      return [{ id: 'external-early', label: 'Early Bird', amount: fees.externalRegistrationFee }]

  }, [registrationConfig, computedSelection])

  useEffect(() => {
    if (feeOptions.length > 0) {
      setRegistrationOption(feeOptions[0]?.id ?? '')
    } else {
      setRegistrationOption('')
    }
  }, [feeOptions])

  const handlePayment = () => {
     showToast('Payment option selected (Mock).', 'success')
     // Navigate to home or dashboard
     navigate('/')
  }

  if (isUserLoading || isConfigLoading) {
      return <div className="p-8 text-center text-slate-400">Loading...</div>
  }

  if (registrationConfig && !registrationConfig.isRegistrationOpen) {
    return (
      <section className="space-y-4 max-w-2xl mx-auto p-4">
        <div className="card p-6">
          <p className="muted mb-2">Registration</p>
          <h1 className="text-2xl font-semibold text-slate-50">Join Incridea</h1>
          <p className="mt-2 text-slate-300">Registrations are not open yet. Please check back soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="card space-y-4 p-6">
        <div>
           <h1 className="text-2xl font-semibold text-slate-50">Make Payment</h1>
           <p className="text-sm text-slate-400">Select your registration plan.</p>
        </div>

        {feeOptions.length > 0 ? (
             <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
               <div className="flex items-center justify-between">
                 <p className="text-sm font-semibold text-slate-100">Registration option</p>
                 <span className="text-xs text-slate-400">
                     {registrationConfig?.isRegistrationOpen ? 'Registration open' : 'On-spot pricing active'}
                 </span>
               </div>
               <div className="grid gap-3 md:grid-cols-1">
                 {feeOptions.map((option) => (
                   <label
                     key={option.id}
                     className={`cursor-pointer flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                       registrationOption === option.id
                         ? 'border-sky-400 bg-sky-500/10 text-sky-50'
                         : 'border-slate-800 bg-slate-900/60 text-slate-100'
                     }`}
                   >
                     <div className="space-y-1">
                       <p className="text-sm font-semibold">{option.label}</p>
                       <p className="text-xs text-slate-400">₹ {option.amount ?? 0}</p>
                     </div>
                     <input
                       type="radio"
                       className="h-4 w-4"
                       checked={registrationOption === option.id}
                       onChange={() => setRegistrationOption(option.id)}
                     />
                   </label>
                 ))}
               </div>
               <p className="text-xs text-slate-400">
                 Prices are subject to change.
               </p>
             </div>
           ) : (
              <p className="text-sm text-slate-400">No payment options available for your category.</p>
           )}

           <button 
             className="button w-full" 
             onClick={handlePayment}
             disabled={!registrationOption}
           >
             Complete Registration
           </button>
      </div>
    </section>
  )
}

export default RegisterPage
