import { api } from '@/lib/axios'
import type { ChatMessageResponse, ConversationResponse } from '@/types'
import { Client } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_WS_URL as string

type Listener = (m: ChatMessageResponse) => void
const listeners = new Set<Listener>()

export const onChatMessage = (fn: Listener) => {
    listeners.add(fn)
    return () => {
        listeners.delete(fn)
    }
}

let client: Client | null = null

export const connectChat = () => {
    if (client?.active) return

    client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 5000,
        // debug: (s) => console.debug('[stomp]', s),
        // onStompError: (f) =>
        //     console.error('STOMP error:', f.headers['message'], f.body),
        // onWebSocketClose: (e) => console.warn('WS closed', e.code, e.reason),
        beforeConnect: async () => {
            await api.post('/auth/refresh-token').catch(() => {})
        },
        onConnect: () => {
            client!.subscribe('/user/queue/messages', (f) => {
                const msg: ChatMessageResponse = JSON.parse(f.body)
                listeners.forEach((l) => l(msg))
            })
            client!.subscribe('/user/queue/errors', (f) =>
                console.error(f.body)
            )
        },
    })
    client.activate()
}

export const disconnectChat = () => {
    client?.deactivate()
    client = null
}

export const sendMessage = (recipientId: string, content: string) => {
    if (!client?.connected) throw new Error('Chat is not connected')
    client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ recipientId, content }),
    })
}

export const getConversations = async (): Promise<ConversationResponse[]> => {
    const req = await api.get('/chat/conversations')
    return req.data
}

export const getChatMessages = async (
    userId: string,
    before?: string,
    size = 30
): Promise<ChatMessageResponse[]> => {
    const req = await api.get(`/chat/${userId}/messages`, {
        params: { before, size },
    })
    return req.data
}
