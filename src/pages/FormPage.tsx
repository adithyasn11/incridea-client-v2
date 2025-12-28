import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { contactSchema, type ContactFormData } from '../schemas/contactSchema.ts'

function FormPage() {
  const [submitted, setSubmitted] = useState<ContactFormData | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = (data: ContactFormData) => {
    setSubmitted(data)
    reset()
  }

  const submitForm = handleSubmit(onSubmit)

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <p className="muted mb-2">Form demo</p>
        <h1 className="text-2xl font-semibold text-slate-50">React Hook Form + Zod</h1>
        <p className="mt-2 text-slate-300">
          Client-side validation is handled with Zod via the zodResolver. Submissions are captured locally.
        </p>
      </div>

      <form className="card space-y-4 p-6" onSubmit={(event) => void submitForm(event)}>
        <div className="space-y-2">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" className="input" placeholder="Arjun Mehta" {...register('name')} />
          {errors.name && <p className="text-sm text-rose-300">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" className="input" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-rose-300">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className="input min-h-[120px] resize-none"
            placeholder="Share your idea or question"
            {...register('message')}
          />
          {errors.message && <p className="text-sm text-rose-300">{errors.message.message}</p>}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
          {submitted && <p className="text-sm text-slate-300">Last submit: {submitted.name}</p>}
        </div>
      </form>

      {submitted && (
        <div className="card space-y-2 p-6">
          <p className="muted">Preview</p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900/80 p-4 text-xs text-slate-100">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </section>
  )
}

export default FormPage
