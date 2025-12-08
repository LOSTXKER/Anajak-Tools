"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Type, ArrowLeft, Sparkles, FileText, Hash, Timer } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function WordCounterPage() {
  const [text, setText] = useState("")

  const stats = useMemo(() => {
    const trimmedText = text.trim()
    
    // Count words
    const words = trimmedText
      ? trimmedText.split(/\s+/).filter(word => word.length > 0)
      : []
    
    // Count characters
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    
    // Count sentences (approximate)
    const sentences = trimmedText
      ? trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      : 0
    
    // Count paragraphs
    const paragraphs = trimmedText
      ? trimmedText.split(/\n\n+/).filter(p => p.trim().length > 0).length
      : 0
    
    // Count lines
    const lines = trimmedText
      ? trimmedText.split(/\n/).length
      : 0
    
    // Reading time (avg 200 words per minute)
    const readingTime = Math.ceil(words.length / 200)
    
    // Speaking time (avg 130 words per minute)
    const speakingTime = Math.ceil(words.length / 130)
    
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime
    }
  }, [text])

  const clear = () => setText("")

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Type className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                นับคำ
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                วิเคราะห์ข้อความ นับคำ ตัวอักษร และอื่นๆ
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                      ข้อความ
                    </CardTitle>
                    <CardDescription>พิมพ์หรือวางข้อความที่นี่</CardDescription>
                  </div>
                  {text && (
                    <Button
                      onClick={clear}
                      variant="ghost"
                      size="sm"
                    >
                      ล้างข้อความ
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="เริ่มพิมพ์ข้อความที่นี่... ระบบจะนับคำและวิเคราะห์อัตโนมัติ"
                  rows={18}
                  className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none"
                  autoFocus
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'คำ', value: stats.words.toLocaleString(), icon: Type, color: 'blue' },
                { label: 'ตัวอักษร', value: stats.characters.toLocaleString(), icon: Hash, color: 'purple' },
                { label: 'ประโยค', value: stats.sentences.toLocaleString(), icon: FileText, color: 'emerald' },
                { label: 'อ่าน (นาที)', value: stats.readingTime.toLocaleString(), icon: Timer, color: 'orange' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Card variant="glass" className="text-center">
                    <CardContent className="pt-5 pb-5">
                      <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-500`} />
                      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="sticky top-24">
              <CardHeader>
                <CardTitle>สถิติโดยละเอียด</CardTitle>
                <CardDescription>ข้อมูลวิเคราะห์ทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'คำทั้งหมด', value: stats.words, icon: '📝', color: 'blue' },
                  { label: 'ตัวอักษร (รวมช่องว่าง)', value: stats.characters, icon: '🔤' },
                  { label: 'ตัวอักษร (ไม่รวมช่องว่าง)', value: stats.charactersNoSpaces, icon: '✍️' },
                  { label: 'ประโยค', value: stats.sentences, icon: '📄' },
                  { label: 'พารากราฟ', value: stats.paragraphs, icon: '📰' },
                  { label: 'บรรทัด', value: stats.lines, icon: '📏' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                ))}

                {/* Reading Time */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📖</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      เวลาอ่าน
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ~{stats.readingTime} นาที
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    ที่ความเร็ว 200 คำ/นาที
                  </p>
                </div>

                {/* Speaking Time */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎤</span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      เวลาพูด
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ~{stats.speakingTime} นาที
                  </p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                    ที่ความเร็ว 130 คำ/นาที
                  </p>
                </div>
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
            💡 เคล็ดลับการใช้งาน
          </h3>
          <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
            <li>✓ ระบบนับคำและวิเคราะห์แบบเรียลไทม์</li>
            <li>✓ รองรับภาษาไทยและภาษาอังกฤษ</li>
            <li>✓ เหมาะสำหรับตรวจนับคำในรายงาน บทความ หรืองานเขียน</li>
            <li>✓ แสดงเวลาอ่านและเวลาพูดโดยประมาณ</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}



