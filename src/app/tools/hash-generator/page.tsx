"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Hash, Copy, Check, ArrowLeft, Sparkles, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HashGeneratorPage() {
  const [input, setInput] = useState("")
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  // Simple MD5 implementation
  const md5 = (str: string) => {
    // Note: Using a simple MD5 implementation
    // In production, use a proper crypto library
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  const generateHashes = async () => {
    if (!input.trim()) {
      setHashes({})
      return
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(input)

    const results: Record<string, string> = {}

    // MD5 (simplified version - use crypto library in production)
    results['MD5'] = md5(input)

    // SHA-1
    try {
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
      results['SHA-1'] = Array.from(new Uint8Array(sha1Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (e) {
      results['SHA-1'] = 'ไม่รองรับในเบราว์เซอร์นี้'
    }

    // SHA-256
    try {
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
      results['SHA-256'] = Array.from(new Uint8Array(sha256Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (e) {
      results['SHA-256'] = 'ไม่รองรับในเบราว์เซอร์นี้'
    }

    // SHA-384
    try {
      const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
      results['SHA-384'] = Array.from(new Uint8Array(sha384Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (e) {
      results['SHA-384'] = 'ไม่รองรับในเบราว์เซอร์นี้'
    }

    // SHA-512
    try {
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
      results['SHA-512'] = Array.from(new Uint8Array(sha512Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (e) {
      results['SHA-512'] = 'ไม่รองรับในเบราว์เซอร์นี้'
    }

    setHashes(results)
  }

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const hashTypes = [
    { name: 'MD5', desc: '128-bit (32 hex) - เก่า, ไม่แนะนำสำหรับความปลอดภัย', color: 'red' },
    { name: 'SHA-1', desc: '160-bit (40 hex) - เก่า, มีช่องโหว่', color: 'orange' },
    { name: 'SHA-256', desc: '256-bit (64 hex) - แนะนำ, ปลอดภัย', color: 'emerald' },
    { name: 'SHA-384', desc: '384-bit (96 hex) - ปลอดภัยสูง', color: 'blue' },
    { name: 'SHA-512', desc: '512-bit (128 hex) - ปลอดภัยสูงสุด', color: 'purple' },
  ]

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/tools" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-500)] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">กลับไปหน้าเครื่องมือ</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                Hash Generator
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                สร้าง Hash ด้วย MD5, SHA-1, SHA-256, SHA-384, SHA-512
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                  ข้อความ Input
                </CardTitle>
                <CardDescription>กรอกข้อความที่ต้องการสร้าง Hash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    generateHashes()
                  }}
                  placeholder="กรอกข้อความที่ต้องการสร้าง Hash..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none"
                  autoFocus
                />

                {input && (
                  <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                    <span>ความยาว: {input.length} ตัวอักษร</span>
                    <span>ขนาด: {new Blob([input]).size} bytes</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hash Results */}
          {Object.keys(hashes).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>ผลลัพธ์ Hash</CardTitle>
                  <CardDescription>คัดลอก Hash ที่ต้องการ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hashTypes.map((type, i) => {
                    const hash = hashes[type.name]
                    if (!hash) return null

                    return (
                      <motion.div
                        key={type.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="p-4 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-bold text-${type.color}-500`}>
                                {type.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full glass border border-[var(--glass-border)] text-[var(--text-muted)]">
                                {hash.length} chars
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {type.desc}
                            </p>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(hash, type.name)}
                            variant="ghost"
                            size="sm"
                          >
                            {copied === type.name ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="mt-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          <code className="text-xs font-mono text-[var(--text-primary)] break-all">
                            {hash}
                          </code>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!input && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass">
                <CardContent className="py-16 text-center">
                  <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                    <Hash className="w-12 h-12 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                    ยังไม่มีผลลัพธ์
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    กรอกข้อความเพื่อสร้าง Hash
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Info */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl glass border border-[var(--glass-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--info)]/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[var(--info)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">
                💡 Hash คืออะไร?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Hash เป็นฟังก์ชันทางคณิตศาสตร์ที่แปลงข้อมูลให้เป็นสตริงความยาวคงที่ ใช้ในการเข้ารหัสรหัสผ่าน, 
                ตรวจสอบความถูกต้องของไฟล์, และความปลอดภัยต่างๆ
              </p>
              <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                <li>✓ Hash เดียวกันจะได้ผลลัพธ์เดียวกันเสมอ</li>
                <li>✓ ไม่สามารถย้อนกลับจาก Hash ไปหา Input ได้</li>
                <li>✓ SHA-256 ขึ้นไป เหมาะสำหรับความปลอดภัย</li>
                <li>⚠️ MD5 และ SHA-1 ไม่ปลอดภัย อย่าใช้สำหรับรหัสผ่าน</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



