import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getCreditAssets,
  getUserClaims,
  submitCreditClaim,
  type ClaimCreditRequest,
  type ClaimCreditResponse,
} from '@/lib/credits-api'

/**
 * Profile Credits data hooks (WO-8). Identity comes from the authenticated
 * `ss_users` id (`useAuth().user.id`); every call carries the session cookie
 * plus the `x-user-id` header expected by the backend.
 */

export const useCreditAssets = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['credits', 'assets', userId],
    queryFn: () => getCreditAssets(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: false,
  })
}

export const useUserCreditClaims = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['credits', 'claims', userId],
    queryFn: () => getUserClaims(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: false,
  })
}

export const useClaimCredit = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation<ClaimCreditResponse, Error, ClaimCreditRequest>({
    mutationFn: request => submitCreditClaim(userId as string, request),
    onSuccess: () => {
      // Refresh both the entitlement statuses and the claim/payout history.
      void queryClient.invalidateQueries({ queryKey: ['credits', 'assets', userId] })
      void queryClient.invalidateQueries({ queryKey: ['credits', 'claims', userId] })
    },
  })
}
