"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Link as LinkIcon, Copy, Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function URLEncoderPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      setError("")
    } catch (err) {
      setError("ไม่สามารถเข้ารหัสได้")
      setOutput("")
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      setError("")
    } catch (err) {
      setError("URL ไม่ถูกต้อง หรือไม่ได้เข้ารหัส")
      setOutput("")
    }
  }

  const process = () => {
    if (mode === 'encode') {
      handleEncode()
    } else {
      handleDecode()
    }
  }

  const copyToClipboard = async () => {
    if (!output) return
    
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput("")
    setError("")
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  // Example URLs
  const examples = [
    { label: 'URL พร้อม Query', value: 'https://example.com/search?q=ภาษาไทย&page=1' },
    { label: 'Email', value: 'user@example.com?subject=สวัสดี' },
    { label: 'ข้อความพิเศษ', value: 'Hello World! #123 @user 100%' },
  ]

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-6xl">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                URL Encoder/Decoder
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                เข้ารหัสและถอดรหัส URL
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex rounded-xl glass border border-[var(--glass-border)] p-1">
            <button
              onClick={() => { setMode('encode'); setOutput(""); setError(""); }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'encode'
                  ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🔒 Encode (เข้ารหัส)
            </button>
            <button
              onClick={() => { setMode('decode'); setOutput(""); setError(""); }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'decode'
                  ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🔓 Decode (ถอดรหัส)
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{mode === 'encode' ? 'Text/URL' : 'Encoded URL'} Input</span>
                  <button
                    onClick={clear}
                    className="text-xs px-3 py-1.5 rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--error)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                  >
                    ล้าง
                  </button>
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'ข้อความหรือ URL ที่ต้องการเข้ารหัส' : 'URL ที่ต้องการถอดรหัส'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? 'กรอก URL หรือข้อความ...' : 'วาง URL ที่เข้ารหัสแล้ว...'}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none font-mono text-sm"
                />

                {/* Examples */}
                {mode === 'encode' && !input && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">ตัวอย่าง:</p>
                    <div className="space-y-2">
                      {examples.map((ex) => (
                        <button
                          key={ex.label}
                          onClick={() => setInput(ex.value)}
                          className="w-full text-left p-2 rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] text-xs transition-colors"
                        >
                          <span className="font-semibold text-[var(--text-primary)]">{ex.label}:</span>
                          <br />
                          <span className="text-[var(--text-muted)] font-mono">{ex.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={process}
                    disabled={!input.trim()}
                    className="flex-1 h-12"
                  >
                    <ArrowRight className="w-5 h-5" />
                    {mode === 'encode' ? 'Encode' : 'Decode'}
                  </Button>
                  {output && (
                    <Button
                      onClick={switchMode}
                      variant="secondary"
                      className="h-12"
                    >
                      🔄 สลับ
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20">
                    <p className="text-sm text-[var(--error)]">
                      ❌ {error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{mode === 'encode' ? 'Encoded URL' : 'Decoded Text/URL'} Output</span>
                  {output && (
                    <Button
                      onClick={copyToClipboard}
                      variant="ghost"
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-500">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          คัดลอก
                        </>
                      )}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'URL ที่เข้ารหัสแล้ว' : 'ข้อความที่ถอดรหัสแล้ว'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {output ? (
                  <div className="space-y-4">
                    <textarea
                      value={output}
                      readOnly
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none font-mono text-sm"
                    />

                    <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                      <span>ความยาว: {output.length} ตัวอักษร</span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {mode === 'encode' ? 'เข้ารหัส' : 'ถอดรหัส'}สำเร็จ!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                      <LinkIcon className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                      ยังไม่มีผลลัพธ์
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      กรอกข้อมูลและกดปุ่ม {mode === 'encode' ? 'Encode' : 'Decode'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl glass border border-[var(--glass-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
            URL Encoding คืออะไร?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            URL Encoding เป็นการแปลงอักขระพิเศษใน URL ให้อยู่ในรูปแบบที่ปลอดภัย เช่น ภาษาไทย ช่องว่าง สัญลักษณ์พิเศษ 
            เพื่อให้สามารถส่งผ่านอินเทอร์เน็ตได้อย่างถูกต้อง
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-1">ตัวอย่างการเข้ารหัส:</p>
              <p className="text-[var(--text-muted)] font-mono">ภาษาไทย → %E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B9%84%E0%B8%97%E0%B8%A2</p>
              <p className="text-[var(--text-muted)] font-mono">Hello World → Hello%20World</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-1">ใช้งานเมื่อไหร่:</p>
              <p className="text-[var(--text-muted)]">• ส่ง URL ที่มีภาษาไทย</p>
              <p className="text-[var(--text-muted)]">• Query parameters ใน API</p>
              <p className="text-[var(--text-muted)]">• แชร์ลิงก์ที่มีตัวอักษรพิเศษ</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



