import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '../api/auth'

export function useAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    user: data?.user,
    isLoading,
    error,
    isAuthenticated: !!data?.user
  }
}
