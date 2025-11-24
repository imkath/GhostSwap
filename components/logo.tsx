import { Ghost } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  linkToHome?: boolean
}

export function Logo({ size = "md", linkToHome = true }: LogoProps) {
  const sizes = {
    sm: { icon: "w-5 h-5", text: "text-lg" },
    md: { icon: "w-6 h-6", text: "text-xl" },
    lg: { icon: "w-8 h-8", text: "text-2xl" },
  }

  const content = (
    <div className={`flex items-center gap-2 font-bold ${sizes[size].text} text-indigo-600`}>
      <Ghost className={sizes[size].icon} />
      <span>GhostSwap</span>
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
