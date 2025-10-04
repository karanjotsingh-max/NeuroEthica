import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { SidebarNav } from "@/components/sidebar"

export const metadata: Metadata = {
  title: "NASA Bioscience Research Platform",
  description: "AI-powered platform for NASA bioscience research, neural data analysis, and scientific collaboration",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <SidebarNav />
          <main className="md:ml-64 min-h-screen">{children}</main>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
