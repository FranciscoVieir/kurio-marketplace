export const cartQueryKeys = {
  all: ['cart'] as const,

  owner: (
    ownerId: string,
  ) =>
    [
      ...cartQueryKeys.all,
      ownerId,
    ] as const,
}
