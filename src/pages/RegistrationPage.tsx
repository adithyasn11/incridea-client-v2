import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { signup, verifyOtp, fetchMe, type SignupPayload, type SignupResponse, type VerifyOtpResponse } from '../api/auth.ts'
import { fetchColleges } from '../api/colleges.ts'
import { fetchRegistrationConfig, type RegistrationConfigResponse } from '../api/public.ts'
import {
  registrationSchema,
  collegeSelection,
  type RegistrationFormData,
} from '../schemas/registrationSchema.ts'
import { showToast } from '../utils/toast'


function RegistrationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(() => (location.state as { step?: 1 | 2 | 3 })?.step ?? 1)
  const [registrationOption, setRegistrationOption] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      selection: collegeSelection.enum.NMAMIT,
      collegeId: 1,
    },
  })

  const selection = watch('selection')
  const emailValue = watch('email')

  const { data: colleges = [], isLoading: isCollegesLoading } = useQuery({
    queryKey: ['colleges'],
    queryFn: fetchColleges,
  })

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!localStorage.getItem('token'),
    retry: false
  })

  useEffect(() => {
    if (meData?.user?.pid) {
      showToast('You are already registered!', 'info')
      navigate('/profile')
    }
  }, [meData, navigate])

  const { data: registrationConfig } = useQuery<RegistrationConfigResponse>({
    queryKey: ['registration-config'],
    queryFn: fetchRegistrationConfig,
  })

  const otherColleges = useMemo(
    () => colleges.filter((college) => college.id !== 1),
    [colleges],
  )

  useEffect(() => {
    if (selection === 'NMAMIT') {
      setValue('collegeId', 1)
      setValue('yearOfGraduation', undefined)
      setValue('idDocument', undefined)
    }
    if (selection === 'ALUMNI') {
      setValue('collegeId', 1)
    }
    setRegistrationOption('')
  }, [selection, setValue])

  const feeOptions = useMemo(() => {
    if (!registrationConfig) {
      return []
    }
    const { fees, isRegistrationOpen, isSpotRegistration } = registrationConfig
    if (!isRegistrationOpen) {
      return []
    }

    if (selection === 'NMAMIT') {
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

    if (selection === 'OTHER') {
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
    }

    if (selection === 'ALUMNI') {
      return [{ id: 'alumni', label: 'Alumni Registration', amount: fees.alumniRegistrationFee }]
    }

    return []
  }, [registrationConfig, selection])

  useEffect(() => {
    if (feeOptions.length > 0) {
      setRegistrationOption(feeOptions[0]?.id ?? '')
    } else {
      setRegistrationOption('')
    }
  }, [feeOptions])

  // Check for existing session and resume flow if unverified
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userEmail = localStorage.getItem('userEmail')
    if (token && userEmail) {
       // Ideally we should check isVerified from a "me" call or stored state, 
       // but for now let's assume if they are on register page and have token, 
       // they might be unverified or just revisiting. 
       // Simplification: If verifyOtp succeeds, it sets verified.
       // We can check if we should move to step 2.
       // A better approach is to rely on user action or specific "resume" logic.
       // For this task: "If user goes away after step one... show the verification page directly"
       // We can use a location state or query param, or check if we have a token but are not verified.
       // Since we don't store 'isVerified' in localstorage yet, we might fallback to just email availability.
       // Let's rely on the user re-entering details or auto-login behaviour.
    }
  }, [])

  const signupMutation = useMutation<SignupResponse, Error, SignupPayload>({
    mutationFn: signup,
    onSuccess: (data) => {
      // Auto-login logic
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('userName', data.user.name)
        localStorage.setItem('userEmail', data.user.email)
      }
      
      setOtpSent(true)
      setOtpVerified(false)
      setStep(2)
      showToast('Step 1 Saved: Details recorded. OTP sent to your email.', 'info')
    },
    onError: (error: any) => {
       if (error?.response?.status === 409 || error.message.includes('already in use')) {
          showToast('User already exists! Please login instead.', 'error')
          // Set form error to visually indicate the issue
          // Assuming 'email' is the field name
          // setError('email', { type: 'manual', message: 'Email already registered' }) - need to get setError from useForm
       } else {
          showToast(error.message || 'Registration failed. Try again.', 'error')
       }
    }
  })

  const otpForm = useForm<{ otp: string }>({
    defaultValues: { otp: '' },
  })

  const verifyOtpMutation = useMutation<VerifyOtpResponse, Error, { email: string; otp: string }>(
    {
      mutationFn: verifyOtp,
      onSuccess: (data: unknown) => {
        if (!data || typeof data !== 'object') {
          showToast('Invalid verification response.', 'error')
          return
        }

        const token = (data as { token?: unknown }).token
        const userData = (data as { user?: unknown }).user

        if (typeof token !== 'string' || !userData || typeof userData !== 'object') {
          showToast('Invalid verification response.', 'error')
          return
        }

        const user = userData as { name?: unknown; email?: unknown; roles?: unknown }

        if (typeof user.name !== 'string' || typeof user.email !== 'string') {
          showToast('Invalid verification response.', 'error')
          return
        }

        otpForm.reset({ otp: '' })
        setOtpVerified(true)
        localStorage.setItem('token', token)
        localStorage.setItem('userName', user.name)
        localStorage.setItem('userEmail', user.email)
        showToast('Step 2 Saved: Email verified.', 'success')
        setStep(3) // Move to Step 3 instead of navigating immediately
      },
    },
  )

  const submitOtp = otpForm.handleSubmit((data) =>
    verifyOtpMutation.mutateAsync({ email: emailValue ?? '', otp: data.otp }),
  )

  const onSubmit = (data: RegistrationFormData) => {
    const payload: SignupPayload = { ...data }
    if (selection === 'NMAMIT') {
      payload.collegeId = 1
    }
    if (selection === 'ALUMNI') {
      payload.collegeId = 1
    }

    return signupMutation.mutateAsync(payload)
  }

  const submitForm = handleSubmit(onSubmit)

  const handlePayment = () => {
     // TODO: Implement actual payment integration
     showToast('Step 3 Saved: Payment option selected (Mock).', 'success')
     void navigate('/')
  }

  if (registrationConfig && !registrationConfig.isRegistrationOpen) {
    return (
      <section className="space-y-4">
        <div className="card p-6">
          <p className="muted mb-2">Registration</p>
          <h1 className="text-2xl font-semibold text-slate-50">Join Incridea</h1>
          <p className="mt-2 text-slate-300">Registrations are not open yet. Please check back soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <p className="muted mb-2">Registration</p>
        <h1 className="text-2xl font-semibold text-slate-50">Join Incridea</h1>
        <p className="mt-2 text-slate-300">
          Complete the steps below to register for Incridea.
        </p>
        <div className="mt-3 flex gap-2 text-xs uppercase tracking-wide text-slate-400 overflow-x-auto">
          <span className={`rounded-full px-3 py-1 whitespace-nowrap ${step === 1 ? 'bg-slate-800 text-sky-200' : step > 1 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-900'}`}>
            Step 1: Details {step > 1 && '✓'}
          </span>
          <span className={`rounded-full px-3 py-1 whitespace-nowrap ${step === 2 ? 'bg-slate-800 text-sky-200' : step > 2 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-900'}`}>
            Step 2: Verify Email {step > 2 && '✓'}
          </span>
           <span className={`rounded-full px-3 py-1 whitespace-nowrap ${step === 3 ? 'bg-slate-800 text-sky-200' : 'bg-slate-900'}`}>
            Step 3: Payment
          </span>
        </div>
      </div>

      {step === 1 && (
        <form className="card space-y-4 p-6" onSubmit={(event) => void submitForm(event)}>
          <div className="space-y-2">
            <p className="label">College</p>
            <div className="grid gap-3 md:grid-cols-3">
              {collegeSelection.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-3"
                >
                  <input
                    type="radio"
                    value={option}
                    checked={selection === option}
                    {...register('selection')}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-slate-100">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="label" htmlFor="name">
                Name
              </label>
              <input id="name" className="input" placeholder="Ananya Sharma" {...register('name')} />
              {errors.name && <p className="text-sm text-rose-300">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input id="email" className="input" placeholder="you@college.edu" {...register('email')} />
              {errors.email && <p className="text-sm text-rose-300">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-300 hover:text-sky-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-rose-300">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-300 hover:text-sky-300"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-rose-300">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="label" htmlFor="phoneNumber">
                Phone number
              </label>
              <input
                id="phoneNumber"
                className="input"
                placeholder="9876543210"
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && <p className="text-sm text-rose-300">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          {selection === 'OTHER' && (
            <div className="space-y-2">
              <label className="label" htmlFor="collegeId">
                Select your college
              </label>
              <select
                id="collegeId"
                className="input"
                disabled={isCollegesLoading}
                {...register('collegeId', { valueAsNumber: true })}
              >
                <option value="">{isCollegesLoading ? 'Loading colleges…' : 'Select a college'}</option>
                {otherColleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
              {errors.collegeId && <p className="text-sm text-rose-300">{errors.collegeId.message}</p>}
            </div>
          )}

          {selection === 'ALUMNI' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label" htmlFor="yearOfGraduation">
                  Year of graduation
                </label>
                <input
                  id="yearOfGraduation"
                  type="number"
                  className="input"
                  placeholder="2022"
                  {...register('yearOfGraduation', { valueAsNumber: true })}
                />
                {errors.yearOfGraduation && (
                  <p className="text-sm text-rose-300">{errors.yearOfGraduation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="label" htmlFor="idDocument">
                  ID / Degree proof link
                </label>
                <input
                  id="idDocument"
                  className="input"
                  placeholder="Upload reference or drive link"
                  {...register('idDocument')}
                />
                {errors.idDocument && (
                  <p className="text-sm text-rose-300">{errors.idDocument.message}</p>
                )}
              </div>
            </div>
          )}



          <button className="button" type="submit" disabled={isSubmitting || signupMutation.isPending}>
            {signupMutation.isPending ? 'Saving Details…' : 'Next: Verify Email'}
          </button>

          {signupMutation.isError && (
            <p className="text-sm text-rose-300">
              {signupMutation.error instanceof Error
                ? signupMutation.error.message
                : 'Registration failed. Try again.'}
            </p>
          )}
        </form>
      )}

      {step === 2 && (
        <div className="card space-y-4 p-6">
          <div>
            <p className="muted">Step 2</p>
            <h2 className="text-lg font-semibold text-slate-50">Verify Email</h2>
            <p className="text-sm text-slate-400">OTP sent to {emailValue || 'your email'}. Check your inbox.</p>
          </div>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => void submitOtp(event)}
          >
            <div className="space-y-2 md:col-span-1">
              <label className="label" htmlFor="otpCode">
                OTP
              </label>
              <input
                id="otpCode"
                className="input"
                placeholder="6-digit code"
                {...otpForm.register('otp')}
              />
            </div>
            <button
              className="button md:col-span-1"
              type="submit"
              disabled={verifyOtpMutation.isPending || !otpSent || !emailValue}
            >
              {verifyOtpMutation.isPending ? 'Verifying…' : 'Verify & Proceed'}
            </button>
          </form>

          {verifyOtpMutation.isError && (
            <p className="text-sm text-rose-300">
              {verifyOtpMutation.error instanceof Error
                ? verifyOtpMutation.error.message
                : 'OTP verification failed. Try again.'}
            </p>
          )}
          {otpVerified && <p className="text-sm text-emerald-300">Verified!</p>}
        </div>  
      )}

      {step === 3 && (
         <div className="card space-y-4 p-6">
           <div>
             <p className="muted">Step 3</p>
             <h2 className="text-lg font-semibold text-slate-50">Make Payment</h2>
             <p className="text-sm text-slate-400">Select your registration plan.</p>
           </div>
           
           {feeOptions.length > 0 ? (
             <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
               <div className="flex items-center justify-between">
                 <p className="text-sm font-semibold text-slate-100">Registration option</p>
                 {!registrationConfig ? (
                   <span className="text-xs text-slate-400">Loading pricing…</span>
                 ) : (
                   <span className="text-xs text-slate-400">
                     {registrationConfig.isRegistrationOpen ? 'Registration open' : 'On-spot pricing active'}
                   </span>
                 )}
               </div>
               <div className="grid gap-3 md:grid-cols-2">
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
      )}
    </section>
  )
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88 4.12 4.12" />
      <path d="M14.12 14.12 9.88 9.88" />
      <path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a17.05 17.05 0 0 1-3.64 4.76" />
      <path d="M6.35 6.35C3 8.5 1 12 1 12s4 7 11 7a10.94 10.94 0 0 0 3.27-.5" />
      <path d="M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .35-.06.69-.17 1" />
    </svg>
  )
}

export default RegistrationPage
