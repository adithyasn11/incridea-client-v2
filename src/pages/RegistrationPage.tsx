import { zodResolver } from '@hookform/resolvers/zod'
import { UploadButton } from '@uploadthing/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { signup, verifyOtp, type SignupPayload, type SignupResponse, type VerifyOtpResponse } from '../api/auth.ts'
import { fetchColleges } from '../api/colleges.ts'
import { fetchRegistrationConfig, type RegistrationConfigResponse } from '../api/public.ts'
import {
  registrationSchema,
  collegeSelection,
  type RegistrationFormData,
} from '../schemas/registrationSchema.ts'
import { showToast } from '../utils/toast'
import '@uploadthing/react/styles.css'

function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [showAccommodation, setShowAccommodation] = useState(false)
  const [accommodationDraft, setAccommodationDraft] = useState({
    gender: '',
    checkIn: '',
    checkOut: '',
    idProofUrl: '',
  })
  const [isUploadingIdProof, setIsUploadingIdProof] = useState(false)
  const [registrationOption, setRegistrationOption] = useState('')
  const navigate = useNavigate()
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
      setShowAccommodation(false)
    }
    if (selection === 'ALUMNI') {
      setValue('collegeId', 1)
    }
    if (selection === 'OTHER' || selection === 'ALUMNI') {
      // keep toggle state as is but ensure draft persists per selection
      setShowAccommodation((prev) => prev)
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

  const signupMutation = useMutation<SignupResponse, Error, SignupPayload>({
    mutationFn: signup,
    onSuccess: () => {
      setOtpSent(true)
      setOtpVerified(false)
      setStep(2)
      showToast('OTP sent to your email. Check your inbox.', 'info')
    },
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
        showToast('Email verified. You are now logged in!', 'success')
        void navigate('/')
      },
    },
  )

  const submitOtp = otpForm.handleSubmit((data) =>
    verifyOtpMutation.mutateAsync({ email: emailValue ?? '', otp: data.otp }),
  )

  const onSubmit = (data: RegistrationFormData) => {
    if (showAccommodation) {
      if (!accommodationDraft.gender || !accommodationDraft.idProofUrl) {
        showToast('Select gender and upload ID proof for accommodation.', 'error')
        return
      }
    }

    const payload: SignupPayload = { ...data }
    if (selection === 'NMAMIT') {
      payload.collegeId = 1
    }
    if (selection === 'ALUMNI') {
      payload.collegeId = 1
    }

    if (showAccommodation) {
      payload.accommodation = {
        gender: accommodationDraft.gender as 'MALE' | 'FEMALE' | 'OTHER',
        checkIn: accommodationDraft.checkIn || undefined,
        checkOut: accommodationDraft.checkOut || undefined,
        idProofUrl: accommodationDraft.idProofUrl,
      }
    }

    return signupMutation.mutateAsync(payload)
  }

  const submitForm = handleSubmit(onSubmit)

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
          Choose your category to see the required fields. NMAMIT users are marked as internal, other
          colleges as external, and alumni retain NMAMIT with graduation details.
        </p>
        <div className="mt-3 flex gap-2 text-xs uppercase tracking-wide text-slate-400">
          <span className={`rounded-full px-3 py-1 ${step === 1 ? 'bg-slate-800 text-sky-200' : 'bg-slate-900'}`}>
            Step 1: Details
          </span>
          <span className={`rounded-full px-3 py-1 ${step === 2 ? 'bg-slate-800 text-sky-200' : 'bg-slate-900'}`}>
            Step 2: Verify email
          </span>
        </div>
      </div>

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

        {feeOptions.length > 0 && (
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
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
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
              Prices are pulled from admin variables: internalRegistrationFeeGen, internalRegistrationFeeInclusiveMerch,
              externalRegistrationFee, externalRegistrationFeeOnSpot, alumniRegistrationFee.
            </p>
          </div>
        )}

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

        {(selection === 'OTHER' || selection === 'ALUMNI') && (
          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">Avail accommodation</p>
                <p className="text-xs text-slate-400">Available only for alumni and external students</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={showAccommodation}
                  onChange={(event) => setShowAccommodation(event.target.checked)}
                />
                <span>Yes</span>
              </label>
            </div>

            {showAccommodation && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="label" htmlFor="accommodationGender">
                    Gender
                  </label>
                  <select
                    id="accommodationGender"
                    className="input"
                    value={accommodationDraft.gender}
                    onChange={(event) =>
                      setAccommodationDraft((prev) => ({ ...prev, gender: event.target.value }))
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label" htmlFor="accommodationIdProof">
                    ID proof upload
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* UploadThing types expect a server FileRouter; suppress on client side usage */}
                    {/* @ts-expect-error UploadThing client typing simplified */}
                    <UploadButton
                      endpoint="accommodationIdProof"
                      onUploadBegin={() => setIsUploadingIdProof(true)}
                      onClientUploadComplete={(res: { url?: string; serverData?: { fileUrl?: string } }[] | undefined) => {
                        setIsUploadingIdProof(false)
                        const first = res?.[0]
                        const url = first?.serverData?.fileUrl ?? first?.url ?? ''
                        if (url) {
                          setAccommodationDraft((prev) => ({ ...prev, idProofUrl: url }))
                          showToast('ID proof uploaded', 'success')
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingIdProof(false)
                        showToast(error.message ?? 'Upload failed. Try again.', 'error')
                      }}
                    />
                    {isUploadingIdProof && <span className="text-xs text-slate-400">Uploading…</span>}
                    {!isUploadingIdProof && accommodationDraft.idProofUrl && (
                      <span className="text-xs text-emerald-300">Upload saved</span>
                    )}
                  </div>
                  <input
                    id="accommodationIdProof"
                    className="input"
                    placeholder="Upload or paste link"
                    value={accommodationDraft.idProofUrl}
                    onChange={(event) =>
                      setAccommodationDraft((prev) => ({ ...prev, idProofUrl: event.target.value }))
                    }
                  />
                  <p className="text-xs text-slate-400">
                    The uploaded file URL will be sent with your accommodation request.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="label" htmlFor="accommodationCheckIn">
                    Preferred check-in
                  </label>
                  <input
                    id="accommodationCheckIn"
                    className="input"
                    placeholder="e.g., 2025-02-25 10:00"
                    value={accommodationDraft.checkIn}
                    onChange={(event) =>
                      setAccommodationDraft((prev) => ({ ...prev, checkIn: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="label" htmlFor="accommodationCheckOut">
                    Preferred check-out
                  </label>
                  <input
                    id="accommodationCheckOut"
                    className="input"
                    placeholder="e.g., 2025-02-28 18:00"
                    value={accommodationDraft.checkOut}
                    onChange={(event) =>
                      setAccommodationDraft((prev) => ({ ...prev, checkOut: event.target.value }))
                    }
                  />
                </div>

                <p className="md:col-span-2 text-xs text-slate-400">
                  Note: Accommodation details are captured for coordination and will be confirmed by the team separately.
                </p>
              </div>
            )}
          </div>
        )}

        <button className="button" type="submit" disabled={isSubmitting || signupMutation.isPending}>
          {signupMutation.isPending ? 'Saving…' : step === 1 ? 'Next: Send OTP' : 'Resend OTP'}
        </button>

        {otpSent && !otpVerified && (
          <p className="text-sm text-emerald-300">OTP sent to {emailValue || 'your email'}.</p>
        )}
        {signupMutation.isError && (
          <p className="text-sm text-rose-300">
            {signupMutation.error instanceof Error
              ? signupMutation.error.message
              : 'Registration failed. Try again.'}
          </p>
        )}
      </form>

      {step === 2 && (
        <div className="card space-y-4 p-6">
          <div>
            <p className="muted">Verify email</p>
            <h2 className="text-lg font-semibold text-slate-50">Enter the OTP sent to your email</h2>
            <p className="text-sm text-slate-400">OTP is delivered only to the email provided above (never sent to your phone).</p>
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
              {verifyOtpMutation.isPending ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>

          {verifyOtpMutation.isSuccess && (
            <p className="text-sm text-emerald-300">Email verified and logged in!</p>
          )}
          {verifyOtpMutation.isError && (
            <p className="text-sm text-rose-300">
              {verifyOtpMutation.error instanceof Error
                ? verifyOtpMutation.error.message
                : 'OTP verification failed. Try again.'}
            </p>
          )}

          {otpVerified && (
            <button
              className="button"
              type="button"
              onClick={() => {
                showToast('Account created and session started!', 'success')
                void navigate('/')
              }}
            >
              Continue
            </button>
          )}
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
