# Change Proposal: Real-Time Notification System

## Intent
Implementar un sistema de notificaciones en tiempo real que informe al usuario cuando:
- Alguien le da **like** a su publicación
- Alguien lo empieza a **seguir**
- Alguien **comenta** en su publicación

Con un dropdown en el Navbar (estilo Instagram) que muestre las notificaciones, marque como leídas al abrir, y tenga un badge indicador de no leídas.

## Problem
Actualmente el usuario no recibe ningún feedback cuando interactúan con su contenido. Tiene que revisar manualmente cada publicación o perfil para ver si hay nuevas interacciones.

## Scope

### In scope
- Nuevo modelo `Notification` en Prisma
- Server action para crear notificaciones (trigger desde like, follow, comment)
- Server action para obtener y marcar notificaciones como leídas
- API Route Handler con Pusher para notificaciones en tiempo real (client-side)
- Componente `NotificationDropdown` en el Navbar (ícono de corazón con badge)
- Pusher client-side para recibir notificaciones en vivo
- Filtro: no notificar acciones propias (self-likes, self-follows, self-comments)
- Persistencia indefinida en DB

### Out of scope
- Página dedicada `/notifications` (solo dropdown por ahora)
- Notificaciones push del navegador
- Notificaciones por email
- Agrupación de notificaciones (ej: "X y 5 más le dieron like")
- Expiración de notificaciones
- Notificaciones de menciones o mensajes directos

## Approach

### Real-time: Pusher
Pusher tiene integración limpia con Next.js a través de Route Handlers (`/api/pusher/auth` y `/api/pusher/trigger`). No requiere servidor WebSocket separado. El plan free es suficiente para este proyecto.

Alternativa considerada: SSE nativo. Rechazada porque Next.js no maneja bien conexiones largas en serverless/Edge, y requeriría un servidor dedicado.

### DB: Modelo Notification
Nuevo modelo con:
- `id`, `type` (LIKE, FOLLOW, COMMENT), `userId` (destinatario), `actorId` (quien generó la acción)
- Relaciones opcionales: `postId`, `commentId`
- `read` (boolean), `createdAt`

### Server Actions
- `createNotification()` — interna, llamada desde toggleLike, toggleFollow, addComment
- `getNotifications()` — obtiene las N más recientes del usuario logueado
- `markNotificationsAsRead()` — marca todas como leídas

### UI
- Ícono de corazón (`Heart` de lucide-react) en el Navbar entre el SearchBar y el Avatar
- Badge rojo con contador de no leídas
- Dropdown con lista de notificaciones, avatar del actor, texto descriptivo, y tiempo relativo
- Al abrir el dropdown: se marcan como leídas y se limpia el badge

## Risks
- Pusher requiere una cuenta y variables de entorno adicionales (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER)
- El plan free de Pusher tiene límite de 100 conexiones concurrentes y 200K mensajes/día — suficiente para este proyecto
- Las notificaciones en tiempo real solo funcionan cuando el usuario tiene la app abierta en el navegador
