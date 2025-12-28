import apiClient from './client'

export interface College {
  id: number
  name: string
  details?: string | null
  championshipPoints: number
  type: string
}

export async function fetchColleges() {
  const { data } = await apiClient.get<{ colleges: College[] }>('/colleges')
  return data.colleges
}
