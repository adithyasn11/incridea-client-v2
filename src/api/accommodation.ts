import apiClient from './client'

// Add stats and booking types
export interface AccommodationStats {
    boys: { total: number; booked: number; available: number }
    girls: { total: number; booked: number; available: number }
}

export const getAccommodationStats = async () => {
  const { data } = await apiClient.get<AccommodationStats>('/accommodation/stats')
  return data
}

export const checkAvailability = async (gender: 'MALE' | 'FEMALE') => {
    const { data } = await apiClient.get<{ available: boolean; count: number }>(`/accommodation/check-availability?gender=${gender}`)
    return data
}

export const bookIndividual = async (payload: any) => {
    const { data } = await apiClient.post('/accommodation/book/individual', payload)
    return data
}

export const bookTeam = async (payload: any) => {
    const { data } = await apiClient.post('/accommodation/book/team', payload)
    return data
}


export const getBookings = async (params: any) => {
    const { data } = await apiClient.get('/accommodation/admin/bookings', { params })
    return data
}

export const getUserByPid = async (pid: string) => {
    const { data } = await apiClient.get(`/accommodation/user/${pid}`)
    return data
}
