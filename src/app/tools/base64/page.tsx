"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Code, Copy, Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Base64Page() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      setError("")
    } catch (err) {
      setError("ไม่สามารถเข้ารหัสได้")
      setOutput("")
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
      setError("")
    } catch (err) {
      setError("ข้อมูล Base64 ไม่ถูกต้อง")
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                Base64 Encoder/Decoder
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                เข้ารหัสและถอดรหัส Base64
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
                  <span>{mode === 'encode' ? 'Text' : 'Base64'} Input</span>
                  <button
                    onClick={clear}
                    className="text-xs px-3 py-1.5 rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--error)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                  >
                    ล้าง
                  </button>
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'ข้อความที่ต้องการเข้ารหัส' : 'ข้อมูล Base64 ที่ต้องการถอดรหัส'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? 'กรอกข้อความที่นี่...' : 'วาง Base64 ที่นี่...'}
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none font-mono text-sm"
                />

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
                  <span>{mode === 'encode' ? 'Base64' : 'Text'} Output</span>
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
                  {mode === 'encode' ? 'ข้อความที่เข้ารหัสแล้ว' : 'ข้อความที่ถอดรหัสแล้ว'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {output ? (
                  <div className="space-y-4">
                    <textarea
                      value={output}
                      readOnly
                      rows={12}
                      className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none font-mono text-sm"
                    />

                    <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                      <span>ความยาว: {output.length} ตัวอักษร</span>
                      <span>ขนาด: {new Blob([output]).size} bytes</span>
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
                      <Code className="w-12 h-12 text-[var(--text-muted)]" />
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
            Base64 คืออะไร?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Base64 เป็นวิธีการเข้ารหัสข้อมูลไบนารีให้อยู่ในรูปแบบข้อความ ASCII ใช้กันอย่างแพร่หลายในการส่งข้อมูลผ่านอีเมล, 
            การฝังรูปภาพใน HTML/CSS, และการส่งข้อมูลผ่าน API
          </p>
        </motion.div>
      </div>
    </div>
  )
}



