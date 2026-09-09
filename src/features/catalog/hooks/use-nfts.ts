import { useQuery } from '@tanstack/react-query'
import { getNfts } from '../api/get-nfts'

export function useNfts() {
  return useQuery({
    queryKey: ['nfts'],
    queryFn: getNfts,
  })
}