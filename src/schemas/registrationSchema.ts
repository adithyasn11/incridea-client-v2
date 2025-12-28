import { z } from 'zod'

export const collegeSelection = z.enum(['NMAMIT', 'OTHER', 'ALUMNI'])

export const registrationSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
    phoneNumber: z.string().min(7, 'Phone number is required'),
    selection: collegeSelection,
    collegeId: z.number().int().positive().optional(),
    yearOfGraduation: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
    idDocument: z.string().min(1).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.selection === 'OTHER') {
      if (!data.collegeId || data.collegeId === 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Select a college other than NMAMIT',
          path: ['collegeId'],
        })
      }
    }

    if (data.selection === 'ALUMNI') {
      if (!data.yearOfGraduation) {
        ctx.addIssue({
          code: 'custom',
          message: 'Year of graduation is required',
          path: ['yearOfGraduation'],
        })
      }
      if (!data.idDocument) {
        ctx.addIssue({
          code: 'custom',
          message: 'ID document link is required',
          path: ['idDocument'],
        })
      }
    }
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>
