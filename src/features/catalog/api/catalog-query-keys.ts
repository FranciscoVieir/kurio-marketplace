export const catalogQueryKeys = {
  all: ['catalog'] as const,

  lists: () => [...catalogQueryKeys.all, 'list'] as const,

  list: (params: Record<string, unknown>) =>
    [...catalogQueryKeys.lists(), params] as const,

  details: () => [...catalogQueryKeys.all, 'detail'] as const,

  detail: (nftId: string) =>
    [...catalogQueryKeys.details(), nftId] as const,
}