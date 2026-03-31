'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, Loader2, Ghost } from 'lucide-react'
import { sendAnonymousMessage, getGiverMessages, getReceiverMessages } from '@/app/actions/messages'
import { toast } from 'sonner'

interface Message {
  message_id: string
  match_id: string
  sender_role: string
  content: string
  created_at: string
}

interface AnonymousChatProps {
  matchId: string | null
  groupId: string
  role: 'giver' | 'receiver'
  receiverName?: string
}

export function AnonymousChat({ matchId, groupId, role, receiverName }: AnonymousChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [resolvedMatchId, setResolvedMatchId] = useState<string | null>(matchId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
  }, [matchId, groupId, role])

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isExpanded])

  const loadMessages = async () => {
    setIsLoading(true)

    if (role === 'giver' && matchId) {
      const result = await getGiverMessages(matchId)
      if (result.success) {
        setMessages(result.messages)
      }
      setResolvedMatchId(matchId)
    } else if (role === 'receiver') {
      const result = await getReceiverMessages(groupId)
      if (result.success) {
        setMessages(result.messages)
        setResolvedMatchId(result.matchId)
      }
    }

    setIsLoading(false)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !resolvedMatchId) return

    setIsSending(true)
    const result = await sendAnonymousMessage(resolvedMatchId, newMessage.trim(), role)

    if (result.success) {
      setNewMessage('')
      await loadMessages()
    } else {
      toast.error(result.error || 'Error al enviar')
    }

    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // For receiver: if no one has sent them a message yet, show nothing
  if (role === 'receiver' && !isLoading && messages.length === 0 && !resolvedMatchId) {
    return null
  }

  const hasMessages = messages.length > 0
  const unreadCount =
    role === 'receiver'
      ? messages.filter((m) => m.sender_role === 'giver').length
      : messages.filter((m) => m.sender_role === 'receiver').length

  return (
    <Card className="border-slate-200">
      <CardHeader className="cursor-pointer pb-3" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-indigo-600" />
            {role === 'giver' ? (
              <span>Preguntas anónimas a {receiverName || 'tu amigo secreto'}</span>
            ) : (
              <span>Tu admirador secreto te escribió</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasMessages && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                {messages.length}
              </span>
            )}
            <span className="text-xs text-slate-400">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Hint */}
              <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                {role === 'giver' ? (
                  <>
                    <Ghost className="mb-1 inline h-3 w-3" /> Pregunta lo que necesites para elegir
                    el regalo perfecto. Tu identidad no se revela.
                  </>
                ) : (
                  <>
                    <Ghost className="mb-1 inline h-3 w-3" /> Alguien del grupo te hizo preguntas
                    para elegir tu regalo. No sabes quién es.
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
                {messages.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400">
                    {role === 'giver' ? 'Envía tu primera pregunta anónima' : 'No hay mensajes aún'}
                  </p>
                )}
                {messages.map((msg) => {
                  const isMe =
                    (role === 'giver' && msg.sender_role === 'giver') ||
                    (role === 'receiver' && msg.sender_role === 'receiver')

                  return (
                    <div
                      key={msg.message_id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMe ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={role === 'giver' ? '¿Qué talla usas?' : 'Responder...'}
                  maxLength={500}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
