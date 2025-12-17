import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SafeWander - Caregiver Dashboard",
  description:
    "Professional-grade caregiver dashboard for dementia wandering prevention. Real-time monitoring, intelligent alerts, and emergency response tools.",
  generator: "SafeWander",
}

export const viewport: Viewport = {
  themeColor: "#0a0f14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" theme="dark" richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}
