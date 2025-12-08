"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Hash, Copy, Check, RefreshCw, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function UUIDGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<'v4' | 'v1'>('v4')
  const [uppercase, setUppercase] = useState(false)
  const [noDashes, setNoDashes] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Generate UUID v4
  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Generate UUID v1 (timestamp-based, simplified)
  const generateUUIDv1 = () => {
    const timestamp = Date.now()
    const randomPart = Math.random().toString(16).substring(2, 14)
    return `${timestamp.toString(16).padStart(12, '0')}-1xxx-${randomPart}`.replace(/x/g, () => 
      Math.floor(Math.random() * 16).toString(16)
    )
  }

  const generateUUIDs = () => {
    const newUuids: string[] = []
    for (let i = 0; i < count; i++) {
      let uuid = version === 'v4' ? generateUUIDv4() : generateUUIDv1()
      
      if (noDashes) {
        uuid = uuid.replace(/-/g, '')
      }
      
      if (uppercase) {
        uuid = uuid.toUpperCase()
      }
      
      newUuids.push(uuid)
    }
    setUuids(newUuids)
  }

  const copyToClipboard = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid)
      setCopied(uuid)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(uuids.join('\n'))
      setCopied('all')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                UUID Generator
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                สร้าง UUID (Universally Unique Identifier)
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <motion.div
            className="space-y-6"
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
                <CardDescription>กำหนดรูปแบบ UUID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Version */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    เวอร์ชัน
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'v4', label: 'UUID v4', desc: 'สุ่มเต็มรูปแบบ (แนะนำ)' },
                      { value: 'v1', label: 'UUID v1', desc: 'มี timestamp' },
                    ].map((v) => (
                      <label
                        key={v.value}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                          ${version === v.value
                            ? 'bg-[var(--primary-500)]/10 border-2 border-[var(--primary-500)]'
                            : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="version"
                          value={v.value}
                          checked={version === v.value}
                          onChange={() => setVersion(v.value as any)}
                          className="w-4 h-4 accent-[var(--primary-500)]"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[var(--text-primary)]">
                            {v.label}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {v.desc}
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
                    max="50"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(count / 50) * 100}%, var(--bg-elevated) ${(count / 50) * 100}%, var(--bg-elevated) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    ตัวเลือก
                  </p>
                  
                  <label className="flex items-center gap-3 p-3 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="w-4 h-4 accent-[var(--primary-500)] rounded"
                    />
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">
                        ตัวพิมพ์ใหญ่
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        A-F แทน a-f
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={noDashes}
                      onChange={(e) => setNoDashes(e.target.checked)}
                      className="w-4 h-4 accent-[var(--primary-500)] rounded"
                    />
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">
                        ไม่มีเส้นขีด (-)
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        เอา - ออกทั้งหมด
                      </p>
                    </div>
                  </label>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateUUIDs}
                  className="w-full h-12"
                >
                  <RefreshCw className="w-5 h-5" />
                  สร้าง UUID
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
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
                      {uuids.length > 0 ? `สร้าง ${uuids.length} UUID แล้ว` : 'กดปุ่ม "สร้าง UUID" เพื่อเริ่มต้น'}
                    </CardDescription>
                  </div>
                  {uuids.length > 1 && (
                    <Button
                      onClick={copyAll}
                      variant="ghost"
                      size="sm"
                    >
                      {copied === 'all' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-500">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          คัดลอกทั้งหมด
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {uuids.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {uuids.map((uuid, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center gap-3 p-3 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-colors group"
                      >
                        <div className="flex-1 overflow-hidden">
                          <code className="text-sm font-mono text-[var(--text-primary)] break-all">
                            {uuid}
                          </code>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(uuid)}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied === uuid ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                      <Hash className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                      ยังไม่มี UUID
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      กดปุ่ม "สร้าง UUID" เพื่อเริ่มต้น
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
            💡 UUID คืออะไร?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            UUID (Universally Unique Identifier) เป็นเลขประจำตัวที่ไม่ซ้ำกัน ใช้สำหรับระบุข้อมูล, ไฟล์, หรือ object ต่างๆ 
            โดยมีโอกาสซ้ำกันน้อยมากจนแทบเป็นศูนย์
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-1">UUID v4:</p>
              <p className="text-[var(--text-muted)]">• สุ่มเต็มรูปแบบ</p>
              <p className="text-[var(--text-muted)]">• เหมาะกับทั่วไป</p>
              <p className="text-[var(--text-muted)]">• ไม่มีข้อมูล metadata</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-1">UUID v1:</p>
              <p className="text-[var(--text-muted)]">• มี timestamp</p>
              <p className="text-[var(--text-muted)]">• เรียงลำดับได้</p>
              <p className="text-[var(--text-muted)]">• อาจมีข้อมูลเครื่อง</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



