import apiClient from './client'

export interface TeamMember {
  id: number
  pidId: number
  teamId: number
  PID?: {
    User: {
      id: number
      name: string
      email: string
    }
  }
}

export interface Team {
  id: number
  name: string
  eventId: number
  leaderId: number
  confirmed: boolean
  TeamMembers: TeamMember[]
  Leader?: {
    User: {
      id: number
      name: string
      email: string
    }
  }
}

export async function registerSoloEvent(eventId: number) {
  const { data } = await apiClient.post<Team>('/registration/solo', { eventId })
  return data
}

export async function createTeam(eventId: number, name: string) {
  const { data } = await apiClient.post<Team>('/registration/create-team', { eventId, name })
  return data
}

export async function joinTeam(teamId: number) {
  const { data } = await apiClient.post<TeamMember>('/registration/join-team', { teamId })
  return data
}

export async function getMyTeam(eventId: number) {
  const { data } = await apiClient.get<{ team: Team | null }>(`/registration/my-team/${eventId}`)
  return data.team
}

export async function confirmTeam(teamId: number) {
  const { data } = await apiClient.post<Team>('/registration/confirm-team', { teamId })
  return data
}

export async function leaveTeam(teamId: number) {
    const { data } = await apiClient.post<{ count: number }>('/registration/leave-team', { teamId })
    return data
}

export async function deleteTeam(teamId: number) {
    const { data } = await apiClient.post<Team>('/registration/delete-team', { teamId })
    return data
}

export interface PaymentInitiateResponse {
  orderId: string
  amount: number
  currency: string
  key: string
  name: string
  description: string
  prefill?: any
}

export async function initiatePayment(registrationId: string) {
  const { data } = await apiClient.post<PaymentInitiateResponse>('/payment/initiate', { registrationId })
  return data
}


export async function verifyPaymentSignature(response: any) {
  const { data } = await apiClient.post<any>('/payment/verify', response)
  return data
}

export async function getPaymentStatus() {
  try {
     const { data } = await apiClient.get<any>('/payment/my-status')
     if (data.status === 'success' && data.pid && data.receipt) {
         return { 
           status: 'success', 
           message: 'Payment verified', 
           pid: data.pid, 
           receipt: data.receipt, 
           processingStep: 'COMPLETED'
         }
     }
     if (data.status === 'processing' || data.status === 'pending') {
        return {
          status: 'pending',
          message: data.message || 'Processing...',
          processingStep: data.processingStep,
          receipt: data.receipt,
          pid: data.pid
        }
     }
     if (data.status === 'failed') {
         return {
             status: 'failed',
             message: data.message || 'Payment Verification Failed',
             processingStep: null
         }
     }
  } catch (e) {
    // Ignore error
  }
  return { status: 'pending', message: 'Payment verification pending', processingStep: null }
}
