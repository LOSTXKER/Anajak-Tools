"use client"

import { Header } from "./Header"
import { Footer } from "./Footer"
import { ChatButton } from "@/components/ui/ChatButton"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <ChatButton />
    </>
  )
}



