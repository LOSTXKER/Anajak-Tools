"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Zap, Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: "หน้าแรก", href: "/" },
    { name: "เครื่องมือทั้งหมด", href: "/tools" },
    { name: "ราคา", href: "/pricing" },
    { name: "เกี่ยวกับเรา", href: "/about" },
  ]

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "glass border-b border-[var(--glass-border)] py-3" 
          : "bg-transparent py-4"
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[var(--primary-500)]/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-base)] flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">AI</span>
              </div>
            </div>
            <div>
              <div className="font-bold text-xl bg-gradient-to-r from-[var(--primary-500)] to-[var(--cyan-500)] bg-clip-text text-transparent">
                Anajak Tools
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-medium -mt-0.5">
                อนาจักร ทูลส์
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-medium">
              เข้าสู่ระบบ
            </Button>
            <Link href="/tools">
              <Button size="sm" className="font-medium shadow-lg shadow-[var(--primary-500)]/20">
                <Zap className="w-4 h-4" />
                เริ่มใช้งานฟรี
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 rounded-xl glass border border-[var(--glass-border)] flex items-center justify-center hover:border-[var(--primary-500)] transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-[var(--border-default)] animate-slide-in-down">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--primary-500)] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border-default)]">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  เข้าสู่ระบบ
                </Button>
                <Link href="/tools" className="w-full">
                  <Button size="sm" className="w-full justify-center">
                    <Zap className="w-4 h-4" />
                    เริ่มใช้งานฟรี
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
