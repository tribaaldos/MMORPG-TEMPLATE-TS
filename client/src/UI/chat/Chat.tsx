import { useEffect, useRef, useState } from 'react'
import './Chat.css'
import { socket } from '../../socket/SocketManager'
import { useCharacterStore } from '../../store/useCharacterStore'

type ChatMessage = {
    id: string
    name: string
    message: string
    t: number
}

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const name = useCharacterStore((s) => s.name) ?? 'Player'
    const scrollRef = useRef<HTMLDivElement | null>(null)

    const selfId = socket.id
    const isEmpty = messages.length === 0

    useEffect(() => {
        const onHistory = (history: ChatMessage[]) => {
            setMessages(history ?? [])
        }

        const onMessage = (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg])
        }

        socket.on('chatHistory', onHistory)
        socket.on('chatMessage', onMessage)

        return () => {
            socket.off('chatHistory', onHistory)
            socket.off('chatMessage', onMessage)
        }
    }, [])

    useEffect(() => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages])

    const canSend = input.trim().length > 0

    const sendMessage = () => {
        if (!canSend) return
        const payload: ChatMessage = {
            id: socket.id ?? 'local-fallback',
            name,
            message: input.trim().slice(0, 280),
            t: Date.now(),
        }
        socket.emit('chatMessage', payload)
        setInput('')
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage()
    }

    return (
        <div className="chat-ui">
            <div className="messages-scroll" ref={scrollRef}>
                {isEmpty ? (
                    <div className="chat-empty">No hay mensajes todavía</div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={`${msg.t}-${idx}`}
                            className={`chat-message ${msg.id === selfId ? 'chat-message--self' : ''}`}
                        >
                            <div className="chat-meta">
                                <span className="chat-name">{msg.name}</span>
                                <span className="chat-time">
                                    {new Date(msg.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="chat-text">{msg.message}</div>
                        </div>
                    ))
                )}
            </div>
            <div className="sending-message">
                <input
                    className="chat-input"
                    placeholder="Escribe un mensaje..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    maxLength={280}
                />
                <button className="chat-send" onClick={sendMessage} disabled={!canSend}>
                    Enviar
                </button>
            </div>
        </div>
    )
}