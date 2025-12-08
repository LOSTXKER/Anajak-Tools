"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Type, Copy, Check, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function CaseConverterPage() {
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const conversions = [
    {
      id: 'uppercase',
      label: 'UPPERCASE',
      desc: 'ตัวพิมพ์ใหญ่ทั้งหมด',
      icon: '🔤',
      convert: (text: string) => text.toUpperCase()
    },
    {
      id: 'lowercase',
      label: 'lowercase',
      desc: 'ตัวพิมพ์เล็กทั้งหมด',
      icon: '🔡',
      convert: (text: string) => text.toLowerCase()
    },
    {
      id: 'titlecase',
      label: 'Title Case',
      desc: 'ตัวแรกของแต่ละคำเป็นตัวใหญ่',
      icon: '📝',
      convert: (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase())
    },
    {
      id: 'sentencecase',
      label: 'Sentence case',
      desc: 'ตัวแรกของแต่ละประโยคเป็นตัวใหญ่',
      icon: '📄',
      convert: (text: string) => {
        return text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase())
      }
    },
    {
      id: 'camelcase',
      label: 'camelCase',
      desc: 'สำหรับการเขียนโค้ด',
      icon: '🐫',
      convert: (text: string) => {
        const words = text.toLowerCase().split(/[\s_-]+/)
        return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
      }
    },
    {
      id: 'pascalcase',
      label: 'PascalCase',
      desc: 'สำหรับการเขียนโค้ด (Class)',
      icon: '🏛️',
      convert: (text: string) => {
        return text.toLowerCase().split(/[\s_-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
      }
    },
    {
      id: 'snakecase',
      label: 'snake_case',
      desc: 'คำต่อกันด้วย underscore',
      icon: '🐍',
      convert: (text: string) => {
        return text.toLowerCase().replace(/[\s-]+/g, '_')
      }
    },
    {
      id: 'kebabcase',
      label: 'kebab-case',
      desc: 'คำต่อกันด้วย hyphen',
      icon: '�串',
      convert: (text: string) => {
        return text.toLowerCase().replace(/[\s_]+/g, '-')
      }
    },
    {
      id: 'dotcase',
      label: 'dot.case',
      desc: 'คำต่อกันด้วยจุด',
      icon: '•',
      convert: (text: string) => {
        return text.toLowerCase().replace(/[\s_-]+/g, '.')
      }
    },
    {
      id: 'reverse',
      label: 'esreveR',
      desc: 'กลับข้อความทั้งหมด',
      icon: '🔄',
      convert: (text: string) => text.split('').reverse().join('')
    },
  ]

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Type className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                Case Converter
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                แปลงรูปแบบตัวพิมพ์ (Case) ต่างๆ
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
                <CardDescription>กรอกข้อความที่ต้องการแปลง</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="กรอกข้อความที่นี่... เช่น Hello World"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none"
                  autoFocus
                />
                {input && (
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {input.length} ตัวอักษร, {input.split(/\s+/).filter(w => w).length} คำ
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Conversions */}
          {input && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>ผลลัพธ์</CardTitle>
                  <CardDescription>คลิกเพื่อคัดลอก</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conversions.map((conversion, index) => {
                    const converted = conversion.convert(input)
                    return (
                      <motion.div
                        key={conversion.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.03 }}
                        className="p-4 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-all group cursor-pointer"
                        onClick={() => copyToClipboard(converted, conversion.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{conversion.icon}</span>
                            <div>
                              <p className="font-bold text-sm text-[var(--text-primary)]">
                                {conversion.label}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {conversion.desc}
                              </p>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {copied === conversion.id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                          </div>
                        </div>
                        <div className="mt-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          <code className="text-sm text-[var(--text-primary)] break-all">
                            {converted}
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
                    <Type className="w-12 h-12 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                    ยังไม่มีข้อความ
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    กรอกข้อความด้านบนเพื่อดูผลลัพธ์
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
          <h3 className="font-bold text-[var(--text-primary)] mb-3">
            💡 เคล็ดลับการใช้งาน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-[var(--text-primary)] mb-2">สำหรับการเขียนโค้ด:</p>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                <li>• <strong>camelCase</strong> - ตัวแปร JavaScript, Java</li>
                <li>• <strong>PascalCase</strong> - Class, Component</li>
                <li>• <strong>snake_case</strong> - Python, Database</li>
                <li>• <strong>kebab-case</strong> - CSS, URL</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] mb-2">สำหรับการเขียนทั่วไป:</p>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                <li>• <strong>Title Case</strong> - หัวข้อ, ชื่อเรื่อง</li>
                <li>• <strong>Sentence case</strong> - เนื้อหาทั่วไป</li>
                <li>• <strong>UPPERCASE</strong> - เน้นย้ำ, ป้าย</li>
                <li>• <strong>lowercase</strong> - email, username</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



