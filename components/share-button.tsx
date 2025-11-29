"use client"

import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface ShareButtonProps {
  groupId: string
  groupName: string
  className?: string
}

export function ShareButton({ groupId, groupName, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?group=${groupId}`
    : ''

  const handleShare = async () => {
    const shareData = {
      title: `Únete a ${groupName}`,
      text: `¡Te han invitado al intercambio de regalos "${groupName}"!`,
      url: inviteUrl,
    }

    // Try Web Share API first (mobile/supported browsers)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if ((err as Error).name === 'AbortError') {
          return // User cancelled, don't copy
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      onClick={handleShare}
      className={className}
      variant={copied ? "outline" : "default"}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          ¡Copiado!
        </>
      ) : (
        <>
          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <Share2 className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copiar Link de Invitación
        </>
      )}
    </Button>
  )
}
