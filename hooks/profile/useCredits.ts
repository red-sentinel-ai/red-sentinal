import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getCreditAssets,
  getUserClaims,
  submitCreditClaim,
  type ClaimCreditRequest,
  type ClaimCreditResponse,
} from '@/lib/credits-api'

/**
 * Profile Credits data hooks (WO-8). Identity comes from the session cookie;
 * the `userId` argument only scopes the react-query cache and gates the calls
 * on being logged in.
 */

export const useCreditAssets = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['credits', 'assets', userId],
    queryFn: () => getCreditAssets(),
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: false,
  })
}

export const useUserCreditClaims = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['credits', 'claims', userId],
    queryFn: () => getUserClaims(),
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: false,
  })
}

export const useClaimCredit = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation<ClaimCreditResponse, Error, ClaimCreditRequest>({
    mutationFn: request => submitCreditClaim(request),
    onSuccess: () => {
      // Refresh both the entitlement statuses and the claim/payout history.
      void queryClient.invalidateQueries({ queryKey: ['credits', 'assets', userId] })
      void queryClient.invalidateQueries({ queryKey: ['credits', 'claims', userId] })
    },
  })
}
