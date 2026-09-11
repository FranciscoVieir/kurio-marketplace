import {
  useQuery,
} from '@tanstack/react-query'

import {
  getOrder,
} from '../api/get-order'

export function useOrder(
  orderId: string,
) {
  return useQuery({
    queryKey: [
      'orders',
      orderId,
    ],

    queryFn: () =>
      getOrder(
        orderId,
      ),

    enabled:
      Boolean(
        orderId,
      ),

    /*
     * O Socket.IO continua sendo
     * responsável pela atualização
     * em tempo real.
     *
     * Porém, enquanto o pedido estiver
     * pending, fazemos também uma
     * reconciliação periódica via REST.
     *
     * Isso garante recuperação caso o
     * evento order.updated seja perdido
     * ou a conexão realtime esteja
     * indisponível.
     *
     * Assim que o backend devolver um
     * estado terminal, o polling para.
     */
    refetchInterval: (
      query,
    ) => {
      const order =
        query.state.data

      if (
        order?.status ===
        'pending'
      ) {
        return 1_000
      }

      return false
    },
  })
}