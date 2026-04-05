import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

/**
 * Cliente de Servidor (Solo usar en API Routes o Server Actions)
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

let pusherClientInstance: PusherClient | null = null;

/**
 * Cliente Frontend (Solo usar en Componentes de Cliente "use client")
 */
export const getPusherClient = () => {
  if (typeof window === "undefined") {
    // Si se llama por error en el servidor o durante SSR, no instanciar.
    return null;
  }
  
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax',
      },
    })
  }

  return pusherClientInstance;
}
