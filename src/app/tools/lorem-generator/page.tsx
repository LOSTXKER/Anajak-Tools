"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Copy, Check, RefreshCw, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoremGeneratorPage() {
  const [text, setText] = useState("")
  const [type, setType] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs')
  const [count, setCount] = useState(3)
  const [copied, setCopied] = useState(false)

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ]

  const generateWords = (wordCount: number): string => {
    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
    }
    return words.join(' ')
  }

  const generateSentence = (): string => {
    const wordCount = Math.floor(Math.random() * 10) + 5 // 5-15 words
    const sentence = generateWords(wordCount)
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
  }

  const generateParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 5) + 3 // 3-8 sentences
    const sentences: string[] = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence())
    }
    return sentences.join(' ')
  }

  const generate = () => {
    let result = ''
    
    if (type === 'paragraphs') {
      const paragraphs: string[] = []
      for (let i = 0; i < count; i++) {
        paragraphs.push(generateParagraph())
      }
      result = paragraphs.join('\n\n')
    } else if (type === 'sentences') {
      const sentences: string[] = []
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence())
      }
      result = sentences.join(' ')
    } else {
      result = generateWords(count)
    }
    
    setText(result)
  }

  const copyToClipboard = async () => {
    if (!text) return
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const types = [
    { value: 'paragraphs', label: 'พารากราฟ', icon: '📝', max: 20 },
    { value: 'sentences', label: 'ประโยค', icon: '📄', max: 50 },
    { value: 'words', label: 'คำ', icon: '✍️', max: 500 },
  ] as const

  const currentMax = types.find(t => t.value === type)?.max || 20

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-5xl">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                Lorem Ipsum Generator
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                สร้างข้อความ Lorem Ipsum สำหรับ mockup
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                  ตั้งค่า
                </CardTitle>
                <CardDescription>เลือกรูปแบบและจำนวน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    ประเภท
                  </label>
                  <div className="space-y-2">
                    {types.map((t) => (
                      <label
                        key={t.value}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                          ${type === t.value
                            ? 'bg-[var(--primary-500)]/10 border-2 border-[var(--primary-500)]'
                            : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={t.value}
                          checked={type === t.value}
                          onChange={() => {
                            setType(t.value)
                            if (count > t.max) setCount(t.max)
                          }}
                          className="w-4 h-4 accent-[var(--primary-500)]"
                        />
                        <div className="text-2xl">{t.icon}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[var(--text-primary)]">
                            {t.label}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    จำนวน: <span className="text-[var(--primary-500)]">{count}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={currentMax}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(count / currentMax) * 100}%, var(--bg-elevated) ${(count / currentMax) * 100}%, var(--bg-elevated) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                    <span>1</span>
                    <span>{Math.floor(currentMax / 2)}</span>
                    <span>{currentMax}</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generate}
                  className="w-full h-12"
                >
                  <RefreshCw className="w-5 h-5" />
                  สร้างข้อความ
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ผลลัพธ์</CardTitle>
                    <CardDescription>
                      {text ? `สร้าง ${count} ${type === 'paragraphs' ? 'พารากราฟ' : type === 'sentences' ? 'ประโยค' : 'คำ'}` : 'กดปุ่ม "สร้างข้อความ" เพื่อเริ่มต้น'}
                    </CardDescription>
                  </div>
                  {text && (
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
                </div>
              </CardHeader>
              <CardContent>
                {text ? (
                  <div className="space-y-4">
                    <textarea
                      value={text}
                      readOnly
                      rows={18}
                      className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none leading-relaxed"
                    />

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">คำ</p>
                        <p className="font-bold text-[var(--text-primary)]">
                          {text.split(/\s+/).length}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">ตัวอักษร</p>
                        <p className="font-bold text-[var(--text-primary)]">
                          {text.length}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">พารากราฟ</p>
                        <p className="font-bold text-[var(--text-primary)]">
                          {text.split('\n\n').length}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                      ยังไม่มีข้อความ
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      กดปุ่ม "สร้างข้อความ" เพื่อเริ่มต้น
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
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-[var(--text-primary)] mb-3">
            💡 Lorem Ipsum คืออะไร?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Lorem Ipsum เป็นข้อความจำลองที่ใช้ในอุตสาหกรรมการพิมพ์และการออกแบบมานานกว่า 500 ปี 
            ใช้เป็นตัวอย่างข้อความเพื่อดูรูปแบบและเลย์เอาต์ของเว็บไซต์ หนังสือ หรือเอกสารต่างๆ 
            โดยไม่ต้องมีเนื้อหาจริง ทำให้มองเห็นภาพรวมของการออกแบบได้ชัดเจนขึ้น
          </p>
        </motion.div>
      </div>
    </div>
  )
}



